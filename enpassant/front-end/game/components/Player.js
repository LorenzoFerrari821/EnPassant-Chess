import React from "react";
import {Image, OverlayTrigger, Tooltip} from "react-bootstrap"

class Player extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let usernameElement = this.props.player.username
        if (this.props.showLink)
            usernameElement =
                <a href={location.origin + '/users/' + this.props.player.username}>{this.props.player.username}</a>

        let eloElement = this.props.player.elo
        if (this.props.difference)
            if (this.props.difference >= 0)
                eloElement = <>{this.props.player.elo}<span
                    style={{color: "green"}}> +{this.props.difference}</span></>
            else
                eloElement = <>{this.props.player.elo}<span
                    style={{color: "red"}}> {this.props.difference}</span></>

        return (
            <div style={{
                paddingLeft: " 4px",
                borderStyle: "solid",
                borderWidth: "1px 1px 1px 5px",
                borderColor: "#0d6efd",
                borderRadius: "5px",
                fontWeight: "bold"
            }}>
                <Image src={this.props.player.picture} style={{
                    maxHeight: "50px",
                    width: "auto",
                    marginRight: "10px"
                }} alt={"Profile picture"} rounded/>
                {usernameElement}
                <OverlayTrigger placement='top' overlay={<Tooltip>{this.props.player.country_name}</Tooltip>}>
                    <Image style={{marginLeft: "6px", marginRight: "15px"}} src={this.props.player.country_flag}/>
                </OverlayTrigger>
                {eloElement}
            </div>
        )
    }
}

export default Player;

