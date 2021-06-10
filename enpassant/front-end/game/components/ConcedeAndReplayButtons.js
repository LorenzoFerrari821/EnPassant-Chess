import ConcedeButton from "./ConcedeButton";
import React from "react"
import {Button, Row} from "react-bootstrap"

class ConcedeAndReplayButtons extends React.Component {
    constructor() {
        super();
        this.url = location.origin + '/game/replay/' + window.location.pathname.split("/")[2]
        console.log(this.url)
    }

    render() {

        const replayButton = this.props.showReplay ?
            <Button variant="warning" href={this.url} style={{marginLeft: "10px"}}>Analyze the game</Button>
            : null
        return (
            <Row>
                <div>
                    <ConcedeButton onClick={this.props.concede}/>
                    {replayButton}
                </div>
            </Row>
        )
    }
}


export default ConcedeAndReplayButtons;
