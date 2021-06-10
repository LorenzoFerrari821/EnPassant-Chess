import React, {Component} from 'react'
import {Image, View, Dimensions} from 'react-native'
import {StatusBar} from "expo-status-bar";
import {Button, Portal, Dialog, Provider, Headline} from 'react-native-paper'
import GLOBAL from '../Global.js'
import {TouchableOpacity} from "react-native-gesture-handler"
import {CommonActions} from "@react-navigation/native"

import Countdown from "react-countdown"
import Chess from "chess.js"
import Chessboard from "chessboardjsx"


class Game extends Component {
    constructor(props) {
        super(props)
        this.state = {
            allowRender: false,
            ended: false,
            fen: 'start',
            styledSquares: {},
            pendingPromotion: null,
            noOpponent: false,
            endGameMessage: null,
            myEloDifference: null,
            opponentEloDifference: null
        }
        this.me = null
        this.opponent = null
        this.color = null
        this.game = new Chess()
        this.whiteTime = 100000    //il tempo viene settato dopo
        this.blackTime = 100000
        this.blackCountdownApi = null
        this.whiteCountdownApi = null
        this.game_id = this.props.route.params.game_id
        this.socket = null

        this.apiFetch()

    }

    componentDidMount() {
        this.wsOpen()
    }

    wsOpen = () => {
        const endpoint = "ws://127.0.0.1:8000/mobile/game/" + this.game_id + "/?token=" + GLOBAL.user.token
        this.socket = new WebSocket(endpoint)
        this.socket.onmessage = this.receive
    }
    apiFetch = () => {
        fetch('http://127.0.0.1:8000/mobile/game/' + this.game_id, {
            method: "GET",
            headers: {
                Accept: 'application/json', 'content-Type': 'application/json',
                Authorization: "Token " + GLOBAL.user.token
            }
        })
            .then((response) => {
                if (response["status"] !== 200) {
                    this.props.navigation.dispatch(CommonActions.reset({index: 0, routes: [{name: 'Home'},],}))
                }
                return response.json()
            })
            .then((responseJson) => {
                this.me = responseJson['me']
                this.opponent = responseJson['opponent']
                this.color = responseJson['my_color']
                this.setState({allowRender: true})

            })
    }

    onDrop = ({sourceSquare, targetSquare}, promoteTo) => {
        if (this.state.ended || !this.color.startsWith(this.game.turn()))
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

    sendMove = (san) => {
        const message = {
            "type": "move",
            "color": this.color,
            "san": san
        }
        this.socket.send(JSON.stringify(message))
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
            this.props.navigation.dispatch(CommonActions.reset({index: 0, routes: [{name: 'Home'},],}))
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
            this.gameResult(content['subtype'], content['winner'], content['new_elo_white'], content['new_elo_black'])
            this.socket.close()
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
            this.socket.close()
            state = {
                ended: true,
                noOpponent: true
            }
        }
        if (state) {
            this.setState(state)
        }
    }

    gameResult = (reason, winner, whiteElo, blackElo) => {
        let endGameMessage
        let opponentEloDifference
        let myEloDifference

        if (reason === 'game_over') {
            if (winner === 'draw')
                endGameMessage = 'draw'
            else
                endGameMessage = winner + " has won!"
        } else if (reason === 'time_finished')
            endGameMessage = winner + " has won by time!"
        else if (reason === 'concede')
            endGameMessage = winner + " has won by resign!"
        else if (reason === 'opponent_disconnected')
            endGameMessage = winner + " has won because his opponent disconnected."

        if (this.color === 'white') {
            myEloDifference = whiteElo - this.me.elo
            opponentEloDifference = blackElo - this.opponent.elo
        } else {
            myEloDifference = blackElo - this.me.elo
            opponentEloDifference = whiteElo - this.opponent.elo
        }

        const state = {
            endGameMessage: endGameMessage,
            myEloDifference: myEloDifference,
            opponentEloDifference: opponentEloDifference
        }
        this.setState(state)
    }

    handleClose = () => {
        const state = {
            showModal: false
        }
        this.setState(state)
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
        if (this.color.startsWith(this.game.turn()) && !this.state.ended) {
            const message = {
                "type": "time_finished",
                "color": this.color === 'white' ? 'black' : 'white',  //chi ha vinto
            }
            this.socket.send(JSON.stringify(message))
        }
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
            [sourceSquare]: {backgroundColor: "rgb(236,196,90)"},
            [targetSquare]: {backgroundColor: "rgb(255, 255, 0)"},
            [kingSquare]: {backgroundColor: "rgb(255, 0, 0)"}
        }
    }

    componentWillUnmount() {
        this.socket.close()
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

    concede = () => {
        if (this.state.ended)
            return null
        const message = {
            "type": "concede",
            "color": this.color === 'white' ? 'black' : 'white',     //chi ha vinto
        }
        this.socket.send(JSON.stringify(message))
    }


    onChoice = (id) => {
        this.onDrop(this.state.pendingPromotion, id)
    }

    render() {
        const windowWidth = Dimensions.get('window').width

        if (this.state.allowRender) {

            let myEloDifferenceElement = <></>
            if (this.state.myEloDifference)
                if (this.state.myEloDifference >= 0)
                    myEloDifferenceElement = <span style={{color: "green"}}> +{this.state.myEloDifference}</span>
                else
                    myEloDifferenceElement = <span style={{color: "red"}}> {this.state.myEloDifference}</span>

            let opponentEloDifferenceElement = <></>
            if (this.state.opponentEloDifference)
                if (this.state.opponentEloDifference >= 0)
                    opponentEloDifferenceElement =
                        <span style={{color: "green"}}> +{this.state.opponentEloDifference}</span>
                else
                    opponentEloDifferenceElement =
                        <span style={{color: "red"}}> {this.state.opponentEloDifference}</span>

            let countdownTop
            let countdownBottom

            if (this.color === 'white') {
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

            let promotePanel = <></>
            if (!!this.state.pendingPromotion) {
                promotePanel = this.game.turn() === "w" ? <View style={{flexDirection: "row"}}>
                    <TouchableOpacity onPress={() => this.onChoice("r")}>
                        <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/wR.png"}}
                               style={{height: "80px", width: "80px"}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onChoice("b")}>
                        <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/wB.png"}}
                               style={{height: "80px", width: "80px"}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onChoice("n")}>
                        <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/wN.png"}}
                               style={{height: "80px", width: "80px"}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onChoice("q")}>
                        <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/wQ.png"}}
                               style={{height: "80px", width: "80px"}}/>
                    </TouchableOpacity>
                </View> : <View style={{flexDirection: "row"}}>
                    <TouchableOpacity onPress={() => this.onChoice("r")}>
                        <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/bR.png"}}
                               style={{height: "80px", width: "80px"}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onChoice("b")}>
                        <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/bB.png"}}
                               style={{height: "80px", width: "80px"}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onChoice("n")}>
                        <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/bN.png"}}
                               style={{height: "80px", width: "80px"}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.onChoice("q")}>
                        <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/bQ.png"}}
                               style={{height: "80px", width: "80px"}}/>
                    </TouchableOpacity>
                </View>
            }


            return (
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <StatusBar style="auto"/>


                    <TouchableOpacity disabled={!this.state.ended} onPress={() =>
                        this.props.navigation.navigate("Profile", {username: this.opponent.username})}>
                        <View style={{
                            border: "1px solid rgb(98, 0, 238)",
                            flexDirection: "row",
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Image source={{uri: GLOBAL.origin + this.opponent.picture}}
                                   style={{height: "50px", width: "50px"}}/>
                            <Headline style={{alignItems: 'center', justifyContent: 'center', marginLeft: "10px"}}>
                                {this.opponent.username}
                                <Image style={{height: "11px", width: "16px", marginLeft: "8px", marginRight: "10px"}}
                                       source={{uri: GLOBAL.origin + this.opponent.country_flag}}/>
                                Elo: {this.opponent.elo} {opponentEloDifferenceElement}
                            </Headline>
                        </View>
                    </TouchableOpacity>

                    {promotePanel}

                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Chessboard
                            width={windowWidth / 100 * 50}
                            position={this.state.fen}
                            onDrop={this.onDrop}
                            boardStyle={{
                                borderRadius: "5px",
                                boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
                            }}
                            dropSquareStyle={{boxShadow: "inset 0 0 1px 4px rgb(255, 255, 0)"}}  //Stile quadrato su cui il pezzo sta passando
                            squareStyles={this.state.styledSquares}
                            orientation={this.color}
                        />

                        <View style={{
                            flexDirection: "col",
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <div style={clockStyle}>
                                {countdownTop}
                            </div>
                            <View style={{
                                flexDirection: "row",
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Button mode={"contained"} color={"red"} onPress={() => {
                                    this.props.navigation.navigate("Analyze", {game_id: this.game_id})
                                }} disabled={!this.state.ended}>Analyze</Button>
                                <Button mode={"contained"} color={"black"} dark={true} disabled={this.state.ended}
                                        onPress={this.concede}>
                                    Concede
                                </Button>
                                <Button mode={"contained"} disabled={!this.state.ended} onPress={() => {
                                    this.props.navigation.dispatch(CommonActions.reset({
                                        index: 0,
                                        routes: [{name: 'Home'},],
                                    }))
                                }}>Home</Button>
                            </View>
                            <div style={clockStyle}>
                                {countdownBottom}
                            </div>
                        </View>

                    </View>

                    <TouchableOpacity disabled={!this.state.ended} onPress={() =>
                        this.props.navigation.navigate("Profile", {username: this.me.username})}>
                        <View style={{
                            border: "1px solid rgb(98, 0, 238)",
                            flexDirection: "row",
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Image source={{uri: GLOBAL.origin + this.me.picture}}
                                   style={{height: "50px", width: "50px"}}/>
                            <Headline style={{alignItems: 'center', justifyContent: 'center', marginLeft: "10px"}}>
                                {this.me.username}
                                <Image style={{height: "11px", width: "16px", marginLeft: "8px", marginRight: "10px"}}
                                       source={{uri: GLOBAL.origin + this.me.country_flag}}/>
                                Elo: {this.me.elo} {myEloDifferenceElement}
                            </Headline>
                        </View>
                    </TouchableOpacity>

                    <Provider>
                        <Portal>
                            <Dialog visible={this.state.noOpponent}
                                    style={{alignItems: 'center', justifyContent: 'center'}} dissmissable={false}>
                                <Dialog.Title>Il tuo avversario non si è connesso e la partita è
                                    annullata </Dialog.Title>

                                <Dialog.Actions>
                                    <Button mode="contained"
                                            onPress={() => {
                                                this.props.navigation.dispatch(CommonActions.reset({
                                                    index: 0,
                                                    routes: [{name: 'Home'},],
                                                }))
                                            }}>
                                        Home
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>
                            <Dialog visible={!!this.state.endGameMessage}
                                    onDismiss={() => this.setState({endGameMessage: null})}
                                    style={{alignItems: 'center', justifyContent: 'center'}}>
                                <Dialog.Title>{this.state.endGameMessage} </Dialog.Title>

                                <Dialog.Actions>
                                    <Button mode="contained"
                                            onPress={() => this.setState({endGameMessage: null})}>
                                        Close
                                    </Button>
                                </Dialog.Actions>
                            </Dialog>

                        </Portal>
                    </Provider>

                </View>
            )
        } else return <></>
    }
}

export default Game

const clockStyle = {
    fontFamily: "sans-serif",
    color: "black",
    fontWeight: "100px",
    fontSize: "50px",
    width: "fit-content",
    border: "solid thin",
    background: "rgb(240, 217, 181)",
    textAlign: "center"
}