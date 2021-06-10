import React, {Component} from 'react'
import {Image, View, FlatList, SafeAreaView} from 'react-native'
import {Button, Card, Paragraph, List, Portal, Dialog, Provider} from 'react-native-paper'
import {StatusBar} from 'expo-status-bar'
import GLOBAL from '../Global.js'
import {TouchableOpacity} from "react-native-gesture-handler";

class Profile extends Component {
    constructor(props) {
        super(props);
        this.mine = false
        this.inexistent = false
        this.user = null
        this.socket = null

        this.state = {
            games: [],
            numberOfGames: 15,
            dialog: null
        }
        if (props.route.params.username === GLOBAL.user.username) {
            this.user = GLOBAL.user
            this.mine = true
        } else {
            fetch('http://127.0.0.1:8000/mobile/users/' + props.route.params.username, {
                method: "GET",
                headers: {
                    Accept: 'application/json', 'content-Type': 'application/json',
                    Authorization: "Token " + GLOBAL.user.token
                }
            })
                .then((response) => {
                    if (response["status"] === '404')
                        this.inexistent = true
                    else if (response["status"] === '401')
                        this.props.navigation.navigate("Login")
                    return response.json()
                })
                .then((responseJson) => {
                    this.user = responseJson
                    this.wsOpen()
                })
        }
    }

    wsOpen = () => {
        const endpoint = "ws://127.0.0.1:8000/mobile/users/" + this.user.username + "/?token=" + GLOBAL.user.token
        this.socket = new WebSocket(endpoint)
        this.socket.onmessage = this.receive
    }


    componentDidMount() {
        if (this.user)
            this.wsOpen()
    }

    receive = (message) => {
        const content = JSON.parse(message.data)
        const state = {
            'games': content['games'],
        }
        this.setState(state)
    }

    getMore = () => {
        const message = {
            "n": this.state.numberOfGames + 10
        }
        this.socket.send(JSON.stringify(message))
        const state = {
            "numberOfGames": this.state.numberOfGames + 10,
        }
        this.setState(state)
    }

    renderItem = ({item}) => {
        let backGround
        if (item.result === 'w') {
            if (this.user.username === item.white.username)
                backGround = {backgroundColor: "#d1e7dd"}
            else
                backGround = {backgroundColor: "#f8d7da"}
        } else if (item.result === 'b') {
            if (this.user.username === item.black.username)
                backGround = {backgroundColor: "#d1e7dd"}
            else
                backGround = {backgroundColor: "#f8d7da"}
        } else
            backGround = {backgroundColor: "#fff3cd"}
        const min = item.time.split("|")[0] + ' min'
        const increment = item.time.split("|")[1] === '0' ? '' : ' + ' + item.time.split("|")[1]
        const time = min.concat(increment)

        return (
            <TouchableOpacity onPress={() => this.setState({dialog: item})}>
                <Paragraph
                    style={{fontWeight: "bold", ...backGround}}>{item.white.username} VS {item.black.username} : {time}</Paragraph>
            </TouchableOpacity>
        )
    }

    render() {
        if (!this.user)
            return null

        let reviewButton = this.mine ? <Button mode="contained" onPress={() => {
            this.props.navigation.navigate("Analyze", {game_id: this.state.dialog.id})
        }} color={"red"}>
            Review the game
        </Button> : null

        let dialogItem = this.state.dialog ? <Portal>
            <Dialog visible={!!this.state.dialog}
                    style={{alignItems: 'center', justifyContent: 'center'}}
                    onDismiss={() => {
                        this.setState({dialog: null})
                    }}>
                <Dialog.Title>You want to...</Dialog.Title>
                <Dialog.Actions>
                    <Button mode="contained"
                            onPress={() => {
                                this.props.navigation.push("Profile", {username: this.state.dialog.white.username})
                            }}>
                        Visit {this.state.dialog.white.username}
                    </Button>
                    <Button mode="contained" style={{marginLeft: "10px", marginRight: "10px"}}
                            onPress={() => {
                                this.props.navigation.push("Profile", {username: this.state.dialog.black.username})

                            }}>
                        Visit {this.state.dialog.black.username}
                    </Button>
                    {reviewButton}
                    <Button mode="contained" onPress={() => {
                        this.setState({dialog: null})
                    }} style={{marginLeft: "10px"}}>
                        Close this
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal> : null


        let infos = []
        infos.push({'First name': this.user.first_name})
        infos.push({'Last name': this.user.last_name})
        if (this.mine)
            infos.push({'Email': this.user.email})
        infos.push({'Elo': this.user.elo})
        infos.push({"Country": this.user.country_name})
        infos.push({'Games played': this.user.games_played})


        if (this.inexistent) {
            return (
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Paragraph style={{color: "red", fontWeight: "bold"}}>The requested user does not
                        exist.</Paragraph>
                </View>
            )
        } else return (
            <Provider>
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <StatusBar style="auto"/>
                    <Card>
                        <Card>
                            <Card.Cover source={{uri: GLOBAL.origin + this.user.picture_url}}/>
                        </Card>
                        <Card.Title title={"Profile of " + this.user.username}
                                    style={{align: "center", fontWeight: "bold"}}/>
                        <Card.Content>
                            {infos.map((info) => {
                                let property
                                let value
                                Object.keys(info).forEach((key) => {
                                    property = key
                                    value = info[key]
                                })
                                if (property === 'Email' && this.mine === false)
                                    return
                                if (property === 'Country') {
                                    return (
                                        <Paragraph>
                                            <span style={{fontWeight: "bold"}}>{property}:</span> {value}
                                            <Image source={{uri: GLOBAL.origin + this.user.country_flag}}
                                                   style={{height: "11px", width: "16px", marginLeft: "5px"}}/>
                                        </Paragraph>
                                    )
                                }
                                return (
                                    <Paragraph><span style={{fontWeight: "bold"}}>{property}: </span>{value}
                                    </Paragraph>
                                )
                            })}
                        </Card.Content>

                        <Card.Actions>
                            <Button mode="contained">
                                Edit profile
                            </Button>
                            <Button mode="contained" style={{marginLeft:"10px"}}>
                                Edit password
                            </Button>
                        </Card.Actions>
                    </Card>

                    <List.Section>
                        <List.Accordion
                            title={this.user.username + " recent games"}
                            left={props => <List.Icon {...props} icon="equal"/>}>
                            <SafeAreaView>
                                <FlatList
                                    data={this.state.games}
                                    renderItem={this.renderItem}
                                    onEndReached={this.getMore}
                                />
                            </SafeAreaView>
                        </List.Accordion>
                    </List.Section>
                    {dialogItem}
                </View>
            </Provider>
        )
    }
}


export default Profile

