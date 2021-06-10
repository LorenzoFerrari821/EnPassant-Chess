import React from "react"
import {Button, ButtonGroup, Tooltip, OverlayTrigger} from "react-bootstrap"


class Buttons extends React.Component {
    render() {
        return (
            <ButtonGroup vertical style={{marginTop: "auto"}}>
                <Button variant="warning" onClick={this.props.undo}>Undo your last move</Button>
                <ButtonGroup size="lg">
                    <OverlayTrigger placement='bottom' overlay={<Tooltip>Start</Tooltip>}>
                        <Button variant="primary" onClick={this.props.start}>
                            <i className="fa fa-fast-backward" aria-hidden="true"/>
                        </Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement='bottom' overlay={<Tooltip>Back 1 move</Tooltip>}>
                        <Button variant="primary" onClick={this.previous}>
                            <i className="fa fa-step-backward" aria-hidden="true"/>
                        </Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement='bottom' overlay={<Tooltip>Forward 1 move</Tooltip>}>
                        <Button variant="primary" onClick={this.props.next}>
                            <i className="fa fa-step-forward" aria-hidden="true"/>
                        </Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement='bottom' overlay={<Tooltip>End</Tooltip>}>
                        <Button variant="primary" onClick={this.props.end}>
                            <i className="fa fa-fast-forward" aria-hidden="true"/>
                        </Button>
                    </OverlayTrigger>
                </ButtonGroup>
            </ButtonGroup>
        )
    }
}

export default Buttons;
