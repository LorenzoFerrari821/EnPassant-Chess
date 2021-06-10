import React from "react"
import {Card, ListGroup} from "react-bootstrap"
import Entry from "./Entry";


class GamesList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            games: [],
            numberOfGames: 15,
            scrollThreshold: 600
        }
        this.socket = null

    }

    componentDidMount() {
        this.wsOpen()
    }

    wsOpen = () => {
        const location = window.location;
        let ws_protocol = 'ws://';
        if (location.protocol === 'https:') { //Se siamo in produzione, non usiamo http ma https e quindi usiamo wss e non ws
            ws_protocol = 'wss://'
        }
        const endpoint = ws_protocol + location.host + location.pathname;
        console.log(endpoint)
        this.socket = new WebSocket(endpoint)
        this.socket.onclose = () => {
            this.socket = null
            setTimeout(this.wsOpen, 10000)
        }
        this.socket.onmessage = this.receive
    }

    receive = (message) => {
        const content = JSON.parse(message.data)
        const state = {
            'games': content['games'],
        }
        this.setState(state)
    }

    getMore = (event) => {
        if (event.target.scrollTop > this.state.scrollThreshold) {
            const message = {
                "n": this.state.numberOfGames + 10
            }
            this.socket.send(JSON.stringify(message))
            const state = {
                "numberOfGames": this.state.numberOfGames + 10,
                "scrollThreshold": this.state.scrollThreshold + 600
            }
            this.setState(state)
        }
    }

    render() {
        return (
            <Card border="primary" style={{width: '32rem', height: "600px"}}>
                <Card.Header>
                    <h3 style={{textAlign: "center", fontWeight: "bold"}}>Recent games</h3>
                </Card.Header>
                <Card.Body onScroll={this.getMore} style={{overflowY: "auto"}}>
                    <Card.Text>
                        <ListGroup>
                            {this.state.games.map((game) => {
                                return <Entry key={game.id} game={game} username={this.props.username}
                                              mine={this.props.mine}/>
                            })}
                        </ListGroup>
                    </Card.Text>
                </Card.Body>
            </Card>
        )
    }
}

export default GamesList;
