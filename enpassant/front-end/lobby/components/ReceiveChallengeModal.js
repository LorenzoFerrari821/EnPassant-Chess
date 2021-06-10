import React from "react";
import {Image, Col, Row, Modal, Button, OverlayTrigger, Tooltip} from "react-bootstrap"

class ReceiveChallengeModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            challenge: props.challenge,
        }
        this.timer = null
    }

    static getDerivedStateFromProps({challenge}) {
        return {
            challenge: challenge
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.challenge)
            this.timer = setTimeout(this.hide, 15000)
    }

    hide = () => {
        clearTimeout(this.timer)
        this.timer = null
        const state = {
            challenge: null
        }
        this.setState(state)
        this.props.refuseChallenge()
    }

    render() {
        const challenge = this.state.challenge
        const location = window.location
        if (challenge) {
            const time = challenge.time.split('|')
            const minutes = time[0] + ' minutes'
            const increment = time[1] !== 0 ? ' + ' + time[1] + 's per move' : ''
            let image
            challenge.challenger.image ? image = challenge.challenger.image : image = '/media/profile_pictures/default.png'
            return (
                <Modal show={!!this.state.challenge} onHide={this.hide} backdrop="static" keyboard={false} centered>
                    <Modal.Header>
                        <Modal.Title>You've been challenged by: {challenge.challenger.username}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <Image src={image} style={{height: "80px"}} alt={"Profile picture"} rounded fluid/>
                            </Col>
                            <Col md={9}>
                                <Row>
                                    <h5>
                                        User: {' '}
                                        <a href={location.origin + '/users/' + challenge.challenger.username}>
                                            {challenge.challenger.username}
                                        </a>
                                        <OverlayTrigger placement='right'
                                                        overlay={
                                                            <Tooltip>{challenge.challenger.country_name}</Tooltip>}>
                                            <Image style={{marginLeft: "6px"}}
                                                   src={challenge.challenger.country_flag}/>
                                        </OverlayTrigger>
                                    </h5>
                                    <h5 style={{marginLeft: "10px"}}>Elo: {challenge.challenger.elo}</h5>
                                </Row>
                                <Row>
                                    <h5>Time: {minutes}{increment}.</h5>
                                </Row>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.hide}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => {
                            this.hide();
                            this.props.acceptChallenge();
                        }}>
                            Accept
                        </Button>
                    </Modal.Footer>
                </Modal>
            )
        } else return null;
    }
}

export default ReceiveChallengeModal



