import Chess from "../node_modules/chess.js/chess"
import React from "react"
import Chessboard from "chessboardjsx"
import PromotePanel from "./PromotePanel"
import Countdown from "react-countdown"
import {Alert, Col, Row} from "react-bootstrap"
import MoveList from "./MoveList"
import ConcedeAndReplayButtons from "./ConcedeAndReplayButtons"
import "./css/Clock.css"


class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fen: 'start',
            styledSquares: {},           //Caselle ultima mossa con stile allegato
            pendingPromotion: null,
            noGame: false,
            noOpponent: false,
            ended: false,
            showNoSocketAlert: false
        }
        this.whiteTime = 1000    //il tempo viene settato dopo
        this.blackTime = 1000
        this.game = new Chess()
        this.socket = null
        this.blackCountdownApi = null
        this.whiteCountdownApi = null
    }

    componentDidMount() {
        const state = {
            allowAlert: true
        }
        this.setState(state, this.wsOpen)
    }

    wsOpen = () => {
        if (!this.state.ended) {
            const location = window.location;
            let ws_protocol = 'ws://';
            if (location.protocol === 'https:') {//Se siamo in produzione, non usiamo http ma https e quindi usiamo wss e non ws
                ws_protocol = 'wss://'
            }
            const endpoint = ws_protocol + location.host + location.pathname;
            this.socket = new WebSocket(endpoint)
            const state = {
                allowAlert: false
            }
            this.setState(state)
            this.socket.onmessage = this.receive
            this.socket.onclose = () => {
                if (!this.state.ended) {
                    this.socket = null
                    setTimeout(this.wsOpen, 10000)
                    const state = {
                        allowAlert: true
                    }
                    this.setState(state)
                }
            }
        }
    }

    receive = (message) => {
        const content = JSON.parse(message.data)
        const type = content['type']
        let state = null
        if (type === 'game') {
            this.game.load_pgn(content['pgn'])
            this.blackTime = content['blackTime'] <= 0 ? 0 : content['blackTime']
            this.whiteTime = content['whiteTime'] <= 0 ? 0 : content['whiteTime']
            state = {
                fen: content['pgn'] ? this.game.fen() : 'start',
                styledSquares: this.highlightSquare()
            }
        }
        if (type === 'noGame') {
            state = {
                ended: true,
                noGame: true
            }
        }
        if (type === 'move') {
            this.game.load_pgn(content['pgn'])
            this.blackTime = content['blackTime'] <= 0 ? 0 : content['blackTime']
            this.whiteTime = content['whiteTime'] <= 0 ? 0 : content['whiteTime']
            state = {
                fen: this.game.fen(),
                styledSquares: this.highlightSquare()
            }
        }
        if (type === 'results') {
            if (content['blackTime'] !== undefined && content['whiteTime'] !== undefined) {
                this.blackTime = content['blackTime']
                this.whiteTime = content['whiteTime']
            }
            this.whiteCountdownApi.stop()
            this.blackCountdownApi.stop()
            state = {
                ended: true
            }
            this.props.gameResult(content['subtype'], content['winner'], content['new_elo_white'], content['new_elo_black'])
            this.socket = null
        }
        if (type === 'invalidMove') {
            this.blackTime = content['blackTime']
            this.whiteTime = content['whiteTime']
            this.game.undo()
            state = {
                fen: this.game.fen(),
                styledSquares: this.highlightSquare()
            }
        }
        if (type === 'joinTimeout') {
            this.socket = null
            state = {
                ended: true,
                noOpponent: true
            }
        }
        if (state) {
            this.setState(state)
        }

    }

    sendMove = (san) => {
        const message = {
            "type": "move",
            "color": this.props.color,
            "san": san
        }
        this.socket.send(JSON.stringify(message))
    }

    onChoice = (choice) => {
        this.onDrop(this.state.pendingPromotion, choice.target.id)
    }

    onDrop = ({sourceSquare, targetSquare}, promoteTo) => {
        if (this.state.ended || !this.props.color.startsWith(this.game.turn()))
            return null
        let move
        let pendingPromotion = null
        let state = {}

        if (!promoteTo) { //Non sappiamo se la mossa è una promozione o no
            if ((move = this.game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' //promozione temporanea
            })) === null)
                return null;

            //Controlliamo se la mossa effettuata è una promozione. Se è così annulliamo la mossa e salviamo che è in corso una promozione
            if (move.flags.includes("p")) {
                this.game.undo();
                pendingPromotion = {
                    sourceSquare: sourceSquare,
                    targetSquare: targetSquare
                }
            }
        } else { //se la mossa è una promozione e l'utente ha scelto il pezzo effettuiamo la mossa con la promozione voluta
            move = this.game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: promoteTo
            })
        }
        if (!pendingPromotion) {
            state = {
                fen: this.game.fen(),
                styledSquares: this.highlightSquare(),
                pendingPromotion: pendingPromotion,
            }
            this.setState(state, () => {
                this.sendMove(move.san)
            })
        } else {
            state = {
                pendingPromotion: pendingPromotion,
            }
            this.setState(state)
        }
    }

    shouldComponentUpdate(nextState) {
        return this.state !== nextState
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.ended) {
            this.blackCountdownApi.stop()
            this.whiteCountdownApi.stop()
        } else if (this.state.fen !== 'start') { //i timer non partono ne si fermano se la partita non è cominciata
            if (this.game.turn() === 'b') {
                this.blackCountdownApi.start()
                this.whiteCountdownApi.stop()
            } else if (this.game.turn() === 'w') {
                this.whiteCountdownApi.start()
                this.blackCountdownApi.stop()
            }
        }

    }

    setWhiteCountdownRef = (countdown) => {
        if (countdown)
            this.whiteCountdownApi = countdown.getApi()
    }

    setBlackCountdownRef = (countdown) => {
        if (countdown)
            this.blackCountdownApi = countdown.getApi()
    }

    onTimeFinished = () => {
        if (this.props.color.startsWith(this.game.turn()) && !this.state.ended) {
            const message = {
                "type": "time_finished",
                "color": this.props.color === 'white' ? 'black' : 'white',  //chi ha vinto
            }
            this.socket.send(JSON.stringify(message))
        }
    }
    concede = () => {
        if (this.state.ended)
            return null
        const message = {
            "type": "concede",
            "color": this.props.color === 'white' ? 'black' : 'white',     //chi ha vinto
        }
        this.socket.send(JSON.stringify(message))
    }

    render() {
        let countdownTop
        let countdownBottom

        if (this.props.color === 'white') {
            countdownTop = <Countdown
                date={Date.now() + this.blackTime}
                autoStart={false}
                daysInHours={true}
                onComplete={this.onTimeFinished}
                ref={this.setBlackCountdownRef}
            />
            countdownBottom = <Countdown
                date={Date.now() + this.whiteTime}
                autoStart={false}
                daysInHours={true}
                onComplete={this.onTimeFinished}
                ref={this.setWhiteCountdownRef}
            />
        } else {
            countdownBottom = <Countdown
                date={Date.now() + this.blackTime}
                autoStart={false}
                daysInHours={true}
                onComplete={this.onTimeFinished}
                ref={this.setBlackCountdownRef}
            />
            countdownTop = <Countdown
                date={Date.now() + this.whiteTime}
                autoStart={false}
                daysInHours={true}
                onComplete={this.onTimeFinished}
                ref={this.setWhiteCountdownRef}
            />
        }

        return (
            <>
                <Alert show={this.state.noGame} variant={'danger'}>
                    You have requested a match that does not exist or has already ended. Use {' '}
                    <Alert.Link href={location.origin + '/game/lobby'}>this link </Alert.Link>
                    to return to the lobby.
                </Alert>
                <Alert show={!this.state.ended && this.state.showNoSocketAlert} variant={'danger'}>
                    You have lost the connection with the server.Reconnect will be attempted in 10 second.
                </Alert>
                <Alert show={this.state.ended && this.state.noOpponent} variant={'danger'}>
                    Your opponent has not connected. The game is canceled. Use {' '}
                    <Alert.Link href={location.origin + '/game/lobby'}>this link </Alert.Link>
                    to return to the lobby.
                </Alert>

                <PromotePanel show={this.state.pendingPromotion} color={this.props.color} onClick={this.onChoice}/>
                <Row>
                    <Col>
                        <Chessboard
                            width={500}
                            position={this.state.fen}
                            onDrop={this.onDrop}
                            boardStyle={{
                                borderRadius: "5px",
                                boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
                            }}
                            dropSquareStyle={{boxShadow: "inset 0 0 1px 4px rgb(255, 255, 0)"}}  //Stile quadrato su cui il pezzo sta passando
                            squareStyles={this.state.styledSquares}
                            orientation={this.props.color}
                        />
                    </Col>
                    <Col style={{display: "flex", flexDirection: "column"}}>
                        <div className={"clock"}>
                            {countdownTop}
                        </div>
                        <MoveList pgn={this.game.pgn()}/>
                        <ConcedeAndReplayButtons concede={this.concede} showReplay={this.state.ended}/>
                        <div className={"clock"} style={{marginTop: "auto"}}>
                            {countdownBottom}
                        </div>
                    </Col>
                </Row>
            </>
        )
    }

    highlightSquare = () => {
        //Evidenzia le caselle dell'ultima mossa e quella del re se in scacco

        const history = this.game.history({verbose: true})
        if (history.length === 0)
            return {}
        const lastMove = history[history.length - 1]
        const sourceSquare = lastMove.from;
        const targetSquare = lastMove.to;
        let kingSquare
        if (this.game.in_checkmate() || this.game.in_check()) {
            kingSquare = [].concat(...this.game.board()).map((p, index) => {
                if (p !== null && p.type === 'k' && p.color === this.game.turn()) {
                    return index
                }
            }).filter(Number.isInteger).map((piece_index) => {
                const row = 'abcdefgh'[piece_index % 8]
                const column = Math.ceil((64 - piece_index) / 8)
                return row + column
            })
        }
        return {
            //Le quadre servono per computed notations (ES6). Computano la variabile passata e il risultato viene usato come
            //nome della proprietà dell'oggetto. Serve per dare nomi in maniera dinamica.
            [sourceSquare]: {backgroundColor: "rgb(255, 210, 80)"},
            [targetSquare]: {backgroundColor: "rgb(255, 255, 0)"},
            [kingSquare]: {backgroundColor: "rgb(255, 0, 0)"}
        }
    }
}

export default Game;
