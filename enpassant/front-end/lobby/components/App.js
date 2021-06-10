import React from "react"
import UsersList from "./UsersList"
import ReceiveChallengeModal from "./ReceiveChallengeModal"
import SendChallengeModal from "./SendChallengeModal"
import RapidQueue from "./RapidQueue";
import {Button, Alert, Row, Card, Col} from "react-bootstrap"


class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            challengeSent: false,
            challengeReceived: null,
            showSendChallenge: null,   //contiene l'utente sfidato se il modal è da mostrare
            showNoSocketAlert: false
        }
        this.socket = null
    }

    componentDidMount() {
        const state = {
            showNoSocketAlert: true
        }
        this.setState(state)
        this.wsOpen()
        setInterval(this.populateLobby, 20000)
    }

    wsOpen = () => {
        const location = window.location;
        let ws_protocol = 'ws://';
        if (location.protocol === 'https:') { //Se siamo in produzione, non usiamo http ma https e quindi usiamo wss e non ws
            ws_protocol = 'wss://'
        }
        const endpoint = ws_protocol + location.host + location.pathname;
        this.socket = new WebSocket(endpoint)
        const state = {
            showNoSocketAlert: false
        }
        this.setState(state)

        this.socket.onclose = () => {
            this.socket = null
            const state = {
                showNoSocketAlert: true
            }
            this.setState(state)
            setTimeout(this.wsOpen, 10000)
        }
        this.socket.onmessage = this.receive
    }

    populateLobby = () => {
        const message = {
            "type": "populate",
        };
        this.socket.send(JSON.stringify(message));
    }

    receive = (message) => {
        const content = JSON.parse(message.data)
        const type = content['type']
        if (type === 'populate') {
            const state = {
                users: content['users']
            }
            this.setState(state)
        } else if (type === 'challenge' && !this.state.challengeSent && !this.state.challengeReceived) {
            const state = {
                challengeReceived: {
                    challenger: content['challenger'],
                    challenged: content['challenged'],
                    time: content['time']
                }
            }
            this.setState(state)
        } else if (type === 'game_id')
            window.location.href = window.location.origin + "/game/" + content['id']
    }

    sendChallenge = (user, time) => {
        if (this.state.challengeReceived || this.state.challengeSent)
            return null
        const message = {
            "type": "challenge",
            "challenged": user,
            "time": time
        };
        this.socket.send(JSON.stringify(message));
        const state = {
            challengeSent: true
        }
        this.setState(state, () => {
            setTimeout(() => {
                const state = {
                    challengeSent: false
                }
                this.setState(state)
            }, 15000)
        })
    }

    acceptChallenge = () => {
        const message = {
            "type": "accept",
            "challenger": this.state.challengeReceived.challenger,
            "challenged": this.state.challengeReceived.challenged,
            "time": this.state.challengeReceived.time
        }
        this.socket.send(JSON.stringify(message))
    }
    refuseChallenge = () => {
        const state = {
            challengeReceived: null
        }
        this.setState(state)
    }

    showSendChallengeModal = (user) => {
        this.setState(() => {
            return ({
                showSendChallenge: user
            })
        })
    }

    enterQueue = (time) => {
        const message = {
            "type": "enter_queue",
            "time": time
        }
        this.socket.send(JSON.stringify(message))

    }

    exitQueue = (time) => {
        const message = {
            "type": "exit_queue",
            "time": time
        }
        this.socket.send(JSON.stringify(message))

    }

    render() {
        return (
            <Card border="primary" style={{width: '30rem', height: "600px"}}>
                <Card.Header style={{textAlign: "center"}}>
                    <Card.Title style={{textAlign: "center"}}>
                        <h1>Lobby of EnPassant</h1>
                    </Card.Title>
                    <Card.Subtitle>
                        Select a player to challenge or use the quick matchmaker
                    </Card.Subtitle>
                </Card.Header>
                <Card.Body>
                    <Alert show={this.state.showNoSocketAlert} variant={'danger'}>
                        You have lost the connection with the server. Reconnect will be attempted in 10 second.
                    </Alert>
                    <Card.Text>
                        <Row>
                            <Col sm={4}>
                                <Button variant="primary" onClick={this.populateLobby}>
                                    Refresh the list
                                </Button>
                            </Col>
                            <Col sm={2}>
                                <RapidQueue enterQueue={this.enterQueue} exitQueue={this.exitQueue}/>
                            </Col>
                        </Row>
                        <UsersList users={this.state.users} showSendChallengeModal={this.showSendChallengeModal}/>
                    </Card.Text>
                </Card.Body>
                <ReceiveChallengeModal challenge={this.state.challengeReceived} acceptChallenge={this.acceptChallenge}
                                       refuseChallenge={this.refuseChallenge}/>
                <SendChallengeModal sendChallenge={this.sendChallenge} user={this.state.showSendChallenge}
                                    showSendChallengeModal={this.showSendChallengeModal}/>
            </Card>

        )
    }
}

export default App;
