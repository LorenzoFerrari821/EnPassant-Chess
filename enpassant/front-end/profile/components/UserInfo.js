import React from "react"
import {Card, ListGroup, OverlayTrigger, Tooltip, Image, Button} from "react-bootstrap"


class UserInfo extends React.Component {

    render() {
        let infos = []
        infos.push({'First name': this.props.firstName})
        infos.push({'Last name': this.props.lastName})
        infos.push({'Email': this.props.email})
        infos.push({'Elo': this.props.elo})
        infos.push({'Games played': this.props.gamesPlayed})

        let footerElement = null
        if (this.props.mine) {
            footerElement = <Card.Footer>
                <Button href={location.origin + '/users/edit/'} variant="primary">
                    Edit profile
                </Button>
                <Button href={location.origin + '/users/password_change/'} variant="warning"
                        style={{marginLeft: "10px"}}>Change Password
                </Button>
            </Card.Footer>
        }

        return (
                <Card border="primary" style={{width: '32rem', height: "600px"}}>
                    <Card.Header>
                        <Card.Img variant="top" src={this.props.picture}
                                  style={{
                                      maxHeight: "200px", width: "auto", display: "block",
                                      marginLeft: "auto", marginRight: "auto"}}/>
                    </Card.Header>
                    <Card.Body>
                        <Card.Title style={{textAlign: "center"}}>
                            <h2 style={{fontWeight: "bold"}}>{this.props.username}
                                <OverlayTrigger placement='right' overlay={<Tooltip>{this.props.countryName}</Tooltip>}>
                                    <Image style={{marginLeft: "6px"}} src={this.props.countryFlag}/>
                                </OverlayTrigger>
                            </h2>
                        </Card.Title>
                        <Card.Text>
                            <ListGroup variant="flush">
                                {infos.map((info) => {
                                    let property
                                    let value
                                    Object.keys(info).forEach((key) => {
                                        property = key
                                        value = info[key]
                                    })
                                    if (property === 'Email' && this.props.mine === false)
                                        return
                                    return (
                                        <ListGroup.Item key={property}>
                                            <h6><span style={{fontWeight: "bold"}}>{property}</span>: {value}</h6>
                                        </ListGroup.Item>
                                    )
                                })}
                            </ListGroup>
                        </Card.Text>
                    </Card.Body>
                    {footerElement}
                </Card>
        )
    }
}

export default UserInfo;
