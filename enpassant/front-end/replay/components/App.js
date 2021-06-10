import React from "react";
import Game from "./Game"
import Player from "./Player";
import {Container, Col} from "react-bootstrap"

class App extends React.Component {

    render() {
        return (
            <Container style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100%",
                backgroundColor: "white",
                marginTop: "20px"
            }}>
                <Col>
                    <Player player={this.props.opponent}/>
                    <Game pgn={this.props.pgn} color={this.props.color}/>
                    <Player player={this.props.me}/>
                </Col>
            </Container>

        )
    }
}

export default App;

