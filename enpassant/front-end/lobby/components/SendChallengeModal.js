import React from "react"
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Spinner from 'react-bootstrap/Spinner'
import Form from 'react-bootstrap/Form'


class SendChallengeModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showWait: false,
            formValidated: false,
            timeValue: null
        }
    }

    handleClose = () => {
        this.props.showSendChallengeModal(null)
    }

    handleCloseWait = () => {
        this.props.showSendChallengeModal(null)
        const state = {
            showWait: false
        }
        this.setState(state);
    }

    handleSubmit = (event) => {
        event.preventDefault();  //Prevent the submission to the server of the form (so no refresh)
        const form = event.currentTarget;
        if (form.checkValidity() === false)
            document.getElementById("total").hidden = false;
        else {
            this.props.sendChallenge(this.props.user, this.state.timeValue)
            const state = {
                showWait: true
            }
            this.setState(state, () => {
                setTimeout(this.handleCloseWait, 15000)
            });
        }
    }

    handleSelection = (event) => {
        const state = {
            timeValue: event.target.id
        }
        this.setState(state)
    }

    render() {
        if (this.props.user) {
            return (
                <>
                    <Modal show={!this.state.showWait} onHide={this.handleClose} centered>
                        <Modal.Header>
                            <Modal.Title>Challenge {this.props.user.username} to a game.</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form id="form" noValidate onSubmit={this.handleSubmit}>
                                <Form.Group>
                                    <h6>Chose the time rules for this game:</h6>
                                    <Form.Check required inline label="3 min" name="group1" type={"radio"}
                                                id={`3|0`} onInput={this.handleSelection}/>
                                    <Form.Check required inline label="5 min" name="group1" type={"radio"}
                                                id={`5|0`} onInput={this.handleSelection}/>
                                    <Form.Check required inline label="10 min" name="group1" type={"radio"}
                                                id={`10|0`} onInput={this.handleSelection}/>
                                    <Form.Check required inline label="30 min" name="group1" type={"radio"}
                                                id={`30|0`} onInput={this.handleSelection}/>
                                    <Form.Check required inline label="3 min increment 1s" name="group1" type={"radio"}
                                                id={`3|1`} onInput={this.handleSelection}/>
                                    <Form.Check required inline label="3 min increment 2s" name="group1" type={"radio"}
                                                id={`3|2`} onInput={this.handleSelection}/>
                                    <p id="total" style={{color: "red"}} hidden={true}>Choose the time rules. </p>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit" form='form'>
                                Send challenge
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={this.state.showWait} onHide={this.handleCloseWait} backdrop="static" keyboard={false}
                           centered>
                        <Modal.Header>
                            <Modal.Title>Waiting response...</Modal.Title>
                            <Spinner animation="border"/>
                        </Modal.Header>
                    </Modal>
                </>
            )
        } else return null
    }
}

export default SendChallengeModal;


