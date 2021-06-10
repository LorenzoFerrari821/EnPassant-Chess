import React from "react"
import Entry from "./Entry";
import {ListGroup} from "react-bootstrap"

class UsersList extends React.Component {

    render() {
        const users = Object.values(this.props.users)
        return (
            <div>
                <h3>Users in lobby:</h3>
                <ListGroup variant="flush" style={{maxHeight : "400px", overflowY: "auto"}}>
                    {users.map((user, index) => {
                        return <Entry user={user} key={user.username} color={index % 2 === 0 ? 'light' : 'dark'}
                                      showSendChallengeModal={this.props.showSendChallengeModal}/>
                    })}
                </ListGroup>
            </div>
        )
    }
}

export default UsersList;


