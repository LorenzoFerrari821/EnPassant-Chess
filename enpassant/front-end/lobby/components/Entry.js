import React from "react"
import {Image, ListGroup, Button, Row, OverlayTrigger, Tooltip} from "react-bootstrap";


class Entry extends React.Component {

    render() {
        const user = this.props.user
        return (
            <ListGroup.Item action variant={this.props.color}>
                <Row sm="auto" style={{textAlign: "center"}}>
                    <Image src={user.picture} style={{
                        maxHeight: "60px",
                        width: "auto",
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto"
                    }} alt={"Profile picture"}/>
                    <h5 style={{padding: "15px"}}>
                        <a href={location.origin + '/users/' + user.username}>{user.username}</a>
                        <OverlayTrigger placement='top' overlay={<Tooltip>{user.country_name}</Tooltip>}>
                            <Image style={{marginLeft: "6px"}} src={user.country_flag}/>
                        </OverlayTrigger>
                        <span style={{marginLeft: "20px"}}>{user.elo}</span>
                    </h5>
                    <Button style={{marginLeft: "10px"}} variant="primary" onClick={() => {
                        this.props.showSendChallengeModal(user)
                    }}>
                        Send Challenge
                    </Button>
                </Row>
            </ListGroup.Item>
        )
    }
}

export default Entry;
