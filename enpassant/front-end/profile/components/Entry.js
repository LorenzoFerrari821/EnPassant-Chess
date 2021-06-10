import React from "react"
import {Image, ListGroup, OverlayTrigger, Tooltip, Row, Col, Container, Button} from "react-bootstrap"

class Entry extends React.Component {

    render() {
        let variant
        if (this.props.game.result === 'w') {
            if (this.props.username === this.props.game.white.username)
                variant = 'success'
            else
                variant = 'danger'
        } else if (this.props.game.result === 'b') {
            if (this.props.username === this.props.game.black.username)
                variant = 'success'
            else
                variant = 'danger'
        } else
            variant = 'warning'
        const min = this.props.game.time.split("|")[0] + ' min'
        const increment = this.props.game.time.split("|")[1] === '0' ? '' : ' + ' + this.props.game.time.split("|")[1]
        const time = min.concat(increment)

        let buttonElement = null
        if (this.props.mine) {
            buttonElement = <Col style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                <Button href={location.origin + '/game/replay/' + this.props.game.id} variant="primary">Replay</Button>
            </Col>
        }

        return (
            <ListGroup.Item key={this.props.game.id} variant={variant}>
                <Container>
                    <Row>
                        <Col xs={6}>
                            <h5 style={{fontWeight: "bold"}}>
                                <a href={location.origin + '/users/' + this.props.game.white.username}>{this.props.game.white.username}</a>
                                <OverlayTrigger placement='right'
                                                overlay={<Tooltip>{this.props.game.white.country_name}</Tooltip>}>
                                    <Image style={{marginLeft: "6px"}}
                                           src={this.props.game.white.country_flag}/>
                                </OverlayTrigger>
                            </h5>

                            <span>VS</span>

                            <h5 style={{fontWeight: "bold", marginTop: "5px"}}>
                                <a href={location.origin + '/users/' + this.props.game.black.username}>{this.props.game.black.username}</a>

                                <OverlayTrigger placement='right'
                                                overlay={<Tooltip>{this.props.game.black.country_name}</Tooltip>}>
                                    <Image style={{marginLeft: "6px", marginRight: "6px"}}
                                           src={this.props.game.black.country_flag}/>
                                </OverlayTrigger>
                            </h5>
                        </Col>

                        <Col style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <h5 className="align-middle" style={{fontWeight: "bold", color: "black"}}>
                                {time}
                            </h5>
                        </Col>
                        {buttonElement}
                    </Row>
                </Container>
            </ListGroup.Item>
        )
    }
}

export default Entry;
