import React from "react"
import {Button, Tooltip, Overlay} from "react-bootstrap"



class ConcedeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            button: 'dark',
            showTooltip: false,
            timer: null
        }
        this.ref = React.createRef()
    }

    onClick = () => {
        if (this.state.button === 'dark') {
            const timer = setTimeout(() => {
                this.setState(() => {
                        return ({button: 'dark', timer: null, showTooltip: false})
                    }
                )
            }, 5000)
            this.setState(() => {
                    return ({button: 'danger', timer: timer, showTooltip: true})
                }
            )
        } else {
            clearTimeout(this.state.timer)
            this.props.onClick()
            this.setState(() => {
                return ({timer: null, showTooltip: false})
            })
        }
    }

    render() {

        return (
            <>
                <Button ref={this.ref} variant={this.state.button} onClick={this.onClick}>Concede {' '}
                    <i className="fa fa-flag-o" aria-hidden="true"/>
                </Button>
                <Overlay show={this.state.showTooltip} placement="top" target={this.ref.current}>
                    <Tooltip id="tooltip-concede">
                        Click again to concede.
                    </Tooltip>
                </Overlay>
            </>
        )
    }
}

export default ConcedeButton;

