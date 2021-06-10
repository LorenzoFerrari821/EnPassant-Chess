import React from "react"
import {Button, DropdownButton, Dropdown} from "react-bootstrap"
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";


class RapidQueue extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showWaitModal: false,
            format: null
        }
    }

    onClick = (click) => {
        const state = {
            showWaitModal: true,
            format: click.target.id
        }
        this.setState(state, () => {
            this.props.enterQueue(click.target.id)
        })
    }
    onClose = () => {
        const state = {
            showWaitModal: false,
            format: null
        }
        const format = this.state.format
        this.setState(state, () => {
            this.props.exitQueue(format)
        })
    }

    render() {
        return (
            <>
                <DropdownButton variant="warning" drop="right" title="Rapid queue">
                    <Dropdown.Header>Choose a format</Dropdown.Header>
                    <Dropdown.Item as="button" id={'3|0'} onClick={this.onClick}>3 minutes</Dropdown.Item>
                    <Dropdown.Item as="button" id={'5|0'} onClick={this.onClick}>5 minutes</Dropdown.Item>
                    <Dropdown.Item as="button" id={'10|0'} onClick={this.onClick}>10 minutes</Dropdown.Item>
                    <Dropdown.Item as="button" id={'30|0'} onClick={this.onClick}>30 minutes</Dropdown.Item>
                    <Dropdown.Item as="button" id={'3|1'} onClick={this.onClick}>3 minutes + 1s per move</Dropdown.Item>
                    <Dropdown.Item as="button" id={'3|2'} onClick={this.onClick}>3 minutes + 2s per move</Dropdown.Item>
                </DropdownButton>
                <Modal show={this.state.showWaitModal} backdrop="static" keyboard={false} centered>
                    <Modal.Header>
                        <Modal.Title>Waiting response...</Modal.Title>
                        <Spinner animation="border"/>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.onClose}>
                            Exit queue
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    }
}

export default RapidQueue;
