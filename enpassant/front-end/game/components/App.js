import React from "react"
import Player from "./Player"
import Game from "./Game"
import {Button, Container, Col, Modal} from "react-bootstrap"

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gameEnded: false,
            myEloDifference: null,
            opponentEloDifference: null,
            showModal: false
        }
        this.analyzeURL = location.origin + '/game/replay/' + window.location.pathname.split("/")[2]
    }

    gameResult = (reason, winner, whiteElo, blackElo) => {
        let msg
        let opponentEloDifference
        let myEloDifference

        if (reason === 'game_over') {
            if (winner === 'draw')
                msg = 'draw'
            else
                msg = winner + " has won!"
        } else if (reason === 'time_finished')
            msg = winner + " has won by time!"
        else if (reason === 'concede')
            msg = winner + " has won by resign!"
        else if (reason === 'opponent_disconnected')
            msg = winner + " has won because his opponent disconnected."

        if (this.props.color === 'white') {
            myEloDifference = whiteElo - this.props.me.elo
            opponentEloDifference = blackElo - this.props.opponent.elo
        } else {
            myEloDifference = blackElo - this.props.me.elo
            opponentEloDifference = whiteElo - this.props.opponent.elo
        }

        const state = {
            gameEnded: msg,
            showModal:true,
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

    render() {
        return (
            <Container style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                width: "900px",
                backgroundColor: "white",
                marginTop: "20px"
            }}>
                <Col>
                    <Player player={this.props.opponent} showLink={!!this.state.gameEnded}
                            difference={this.state.opponentEloDifference}/>
                    <Game gameResult={this.gameResult} color={this.props.color}/>
                    <Player player={this.props.me} showLink={!!this.state.gameEnded}
                            difference={this.state.myEloDifference}/>
                </Col>
                <Modal show={this.state.showModal} onHide={this.handleClose} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.gameEnded}</Modal.Title>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>Close</Button>
                        <Button variant="primary" href={location.origin + '/game/lobby'}>Return to the Lobby</Button>
                        <Button variant="warning" href={this.analyzeURL}>Analyze</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        )
    }
}

export default App;

