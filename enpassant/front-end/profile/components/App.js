import React from "react"
import UserInfo from "./UserInfo"
import GamesList from "./GamesList";
import {Row, Col, Container} from "react-bootstrap"


class App extends React.Component {

    render() {
        return (
            <Container>
                <Row style={{marginTop: "30px"}} lg={2} md={1}>
                    <Col>
                        <UserInfo
                            username={this.props.username}
                            firstName={this.props.firstName}
                            lastName={this.props.lastName}
                            countryName={this.props.countryName}
                            countryFlag={this.props.countryFlag}
                            picture={this.props.picture}
                            elo={this.props.elo}
                            gamesPlayed={this.props.gamesPlayed}
                            email={this.props.email}
                            mine={this.props.mine}
                        />
                    </Col>
                    <Col>
                        <GamesList username={this.props.username} mine={this.props.mine}/>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default App;
