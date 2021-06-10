import React from "react"
import {Card} from "react-bootstrap"

class MoveList extends React.Component {

    render() {
        return (
            <Card border="primary" style={{
                width: '300px',
                height: "400px",
            }}><Card.Header>
                <Card.Title>Moves list</Card.Title>
            </Card.Header>
                <Card.Body style={{overflowY: "auto"}}>
                    <Card.Text style={{fontWeight: "bold"}}>
                        {this.props.pgn.split(" ").map((move, index) => {
                            if (index === this.props.index)
                                return <span style={{backgroundColor: "#ffc107", marginRight: "5px"}}>{move}</span>
                            else
                                return <span style={{marginRight: "5px"}}>{move}</span>
                        })}
                    </Card.Text>
                </Card.Body>
            </Card>
        )
    }
}

export default MoveList;
