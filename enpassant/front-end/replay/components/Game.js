import Chess from "../node_modules/chess.js/chess"
import React from "react"
import Chessboard from "chessboardjsx"
import PromotePanel from "./PromotePanel"
import {Row, Col} from "react-bootstrap"
import MoveList from "./MoveList"
import Buttons from "./Buttons"

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fen: 'start',
            pendingPromotion: null,
            index: 0,
        }
        this.game = new Chess()
        this.game.load_pgn(this.props.pgn)
        this.fensList = []
        do
            this.fensList.push(this.game.fen())
        while (this.game.undo())
        this.fensList = this.fensList.reverse()
        this.game = new Chess()
    }

    componentDidMount() {
        window.addEventListener("keydown", this.keyPressed, true)
    }

    keyPressed = (event) => {
        switch (event.key) {
            case "ArrowLeft":
                this.previous()
                break
            case "ArrowRight":
                this.next()
                break
            default:
                return
        }
    }

    onChoice = (choice) => {
        this.onDrop(this.state.pendingPromotion, choice.target.id)
    }

    onDrop = ({sourceSquare, targetSquare}, promoteTo) => {
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
                    targetSquare: targetSquare,
                    color: this.game.turn()
                }
            }
        } else { //se la mossa è una promozione e l'utente ha scelto il pezzo effettuiamo la mossa con la promozione voluta
            this.game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: promoteTo
            })
        }
        if (!pendingPromotion) {
            state = {
                fen: this.game.fen(),
                pendingPromotion: pendingPromotion,
            }
        } else
            state = {
                pendingPromotion: pendingPromotion,
            }
        this.setState(state)
    }

    undo = () => {
        this.game.undo()
        const state = {
            fen: this.game.fen(),
            pendingPromotion: null
        }
        this.setState(state)
    }

    next = () => {
        const index = this.state.index === this.fensList.length - 1 ? this.state.index : this.state.index + 1
        const state = {
            index: index,
            fen: this.fensList[index]
        }
        this.game = new Chess(this.fensList[index])
        this.setState(state)
    }
    previous = () => {
        const index = this.state.index === 0 ? 0 : this.state.index - 1
        const state = {
            index: index,
            fen: this.fensList[index]
        }
        this.game = new Chess(this.fensList[index])
        this.setState(state)
    }
    start = () => {
        const state = {
            index: 0,
            fen: this.fensList[0]
        }
        this.game = new Chess(this.fensList[0])
        this.setState(state)
    }
    end = () => {
        const index = this.fensList.length - 1
        const state = {
            index: index,
            fen: this.fensList[index]
        }
        this.game = new Chess(this.fensList[index])
        this.setState(state)
    }

    render() {
        const index = this.state.index + (Math.floor((this.state.index - 1) / 2))
        const fen = this.state.fen
        return (
            <>
                <PromotePanel promotion={this.state.pendingPromotion} onClick={this.onChoice}/>
                <Row>
                    <Col>
                        <Chessboard
                            id={"board"}
                            width={500}
                            position={fen}
                            onDrop={this.onDrop}
                            boardStyle={{
                                borderRadius: "5px",
                                boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
                            }}
                            dropSquareStyle={{boxShadow: "inset 0 0 1px 4px rgb(255, 255, 0)"}}  //Stile quadrato su cui il pezzo sta passando
                            orientation={this.props.color}
                        />
                    </Col>

                    <Col style={{display: "flex", flexDirection: "column"}}>
                        <MoveList pgn={this.props.pgn} index={index}/>
                        <Buttons undo={this.undo} end={this.end} start={this.start} next={this.next}
                                 previous={this.previous}/>
                    </Col>
                </Row>
            </>
        )
    }
}

export default Game;
