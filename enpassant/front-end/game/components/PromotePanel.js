import React from "react";
import "./css/PromotePanel.css"
import {Image, Row, Col} from "react-bootstrap"

class PromotePanel extends React.Component {
    render() {
        let element = null
        if (this.props.show) {
            if (this.props.color === "white") {
                element = <Row>
                    <Col>
                        <Image className={"img"} src="https://chessboardjs.com/img/chesspieces/wikipedia/wR.png"
                               alt={"wR"} id={"r"} onClick={this.props.onClick}/>
                    </Col>
                    <Col>
                        <Image className={"img"} src="https://chessboardjs.com/img/chesspieces/wikipedia/wB.png"
                               alt={"wB"} id={"b"} onClick={this.props.onClick}/>
                    </Col>
                    <Col>
                        <Image className={"img"} src="https://chessboardjs.com/img/chesspieces/wikipedia/wN.png"
                               alt={"wN"} id={"n"} onClick={this.props.onClick}/>
                    </Col>
                    <Col>
                        <Image className={"img"} src="https://chessboardjs.com/img/chesspieces/wikipedia/wQ.png"
                               alt={"wQ"} id={"q"} onClick={this.props.onClick}/>
                    </Col>
                </Row>
            } else {
                element = <Row>
                    <Col>
                        <Image className={"img"} src="https://chessboardjs.com/img/chesspieces/wikipedia/bR.png"
                               alt={"bR"} id={"r"} onClick={this.props.onClick}/>
                    </Col>
                    <Col>
                        <Image className={"img"} src="https://chessboardjs.com/img/chesspieces/wikipedia/bB.png"
                               alt={"bB"} id={"b"} onClick={this.props.onClick}/>
                    </Col>
                    <Col>
                        <Image className={"img"} src="https://chessboardjs.com/img/chesspieces/wikipedia/bN.png"
                               alt={"bN"} id={"n"} onClick={this.props.onClick}/>
                    </Col>
                    <Col>
                        <Image className={"img"} src="https://chessboardjs.com/img/chesspieces/wikipedia/bQ.png"
                               alt={"bQ"} id={"q"} onClick={this.props.onClick}/>
                    </Col>
                </Row>
            }
        }
        return element
    }
}


export default PromotePanel;