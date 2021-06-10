import React, {Component} from 'react'
import {Image, View, SafeAreaView, FlatList} from 'react-native'
import {StatusBar} from "expo-status-bar";
import {
    Button,
    Card,
    Portal,
    Dialog,
    Provider,
    Headline,
    RadioButton,
    Paragraph,
    ActivityIndicator
} from 'react-native-paper'
import GLOBAL from '../Global.js'
import {TouchableOpacity} from "react-native-gesture-handler"


class Lobby extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: {},
            showSendChallengeDialog: false,
            selectedTime: "10|0",
            showWaitDialog: false,
            challengeReceived: null,
            showRapidQueueDialog: false,
            showWaitQueueDialog: false
        }
        this.websocket = null
        this.timer = null
    }

    componentDidMount() {
        this.wsOpen()
        this.timer = setInterval(this.populateLobby, 5000)
    }

    wsOpen = () => {
        const endpoint = "ws://127.0.0.1:8000/mobile/game/lobby/?token=" + GLOBAL.user.token
        this.socket = new WebSocket(endpoint)
        this.socket.onmessage = this.receive
    }


    receive = (message) => {
        const content = JSON.parse(message.data)
        const type = content['type']
        if (type === 'populate') {
            const state = {
                users: content['users']
            }
            this.setState(state)
        } else if (type === 'challenge' && !this.state.showWaitDialog) {
            setInterval(() => this.setState({challengeReceived: null}), 15000)
            this.setState({
                challengeReceived: {
                    challenger: content['challenger'],
                    challenged: content['challenged'],
                    time: content['time']
                }
            })
        } else if (type === 'game_id') {
            this.componentWillUnmount()
            this.props.navigation.navigate('Game', {game_id: content['id']})
        }
    }

    populateLobby = () => {
        const message = {
            "type": "populate",
        };
        this.socket.send(JSON.stringify(message));
    }

    renderItem = ({item}) => {
        return (
            <TouchableOpacity onPress={() => this.setState({showSendChallengeDialog: item})}>
                <View style={{
                    border: "1px solid rgb(98, 0, 238)",
                    flexDirection: "row",
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Image source={{uri: GLOBAL.origin + item.picture}} style={{height: "50px", width: "50px"}}/>
                    <Headline style={{alignItems: 'center', justifyContent: 'center', marginLeft: "10px"}}>
                        {item.username}
                        <Image style={{height: "11px", width: "16px", marginLeft: "8px", marginRight: "10px"}}
                               source={{uri: GLOBAL.origin + item.country_flag}}/>
                        Elo: {item.elo}
                    </Headline>
                </View>
            </TouchableOpacity>
        )
    }

    componentWillUnmount() {
        clearInterval(this.timer)
        this.socket.close()
    }

    sendChallenge = () => {
        const user = this.state.showSendChallengeDialog
        const time = this.state.selectedTime
        setTimeout(() => {
            this.setState({showWaitDialog: false})
        }, 15000)
        this.setState({showSendChallengeDialog: false, showWaitDialog: true})
        const message = {
            "type": "challenge",
            "challenged": user,
            "time": time
        };
        this.socket.send(JSON.stringify(message));
    }

    acceptChallenge = () => {
        const message = {
            "type": "accept",
            "challenger": this.state.challengeReceived.challenger,
            "challenged": this.state.challengeReceived.challenged,
            "time": this.state.challengeReceived.time
        }
        this.socket.send(JSON.stringify(message))
    }


    enterQueue = () => {
        const message = {
            "type": "enter_queue",
            "time": this.state.selectedTime
        }
        this.socket.send(JSON.stringify(message))
        this.setState({showWaitQueueDialog: true, showRapidQueueDialog: false})
    }

    exitQueue = () => {
        const message = {
            "type": "exit_queue",
            "time": this.state.selectedTime
        }
        this.socket.send(JSON.stringify(message))
        this.setState({showWaitQueueDialog: false})
    }


    render() {
        let challengedDialog = null
        if (!!this.state.challengeReceived) {
            const challenge = this.state.challengeReceived
            const time = challenge.time.split('|')
            const minutes = time[0] + ' minutes'
            const increment = Number(time[1]) !== 0 ? ' + ' + time[1] + 's per move' : ''
            challengedDialog = <Dialog visible={!!this.state.challengeReceived}
                                       style={{
                                           alignItems: 'center',
                                           justifyContent: 'center'
                                       }}
                                       onDismiss={() => {
                                           this.setState({challengeReceived: null})
                                       }}>
                <Dialog.Title>You have been challenged by:</Dialog.Title>
                <Dialog.Content>
                    <View style={{
                        border: "1px solid rgb(98, 0, 238)",
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Image
                            source={{uri: GLOBAL.origin + challenge.challenger.picture}}
                            style={{height: "50px", width: "50px"}}/>
                        <Headline
                            style={{alignItems: 'center', justifyContent: 'center', marginLeft: "10px"}}>
                            {challenge.challenger.username}
                            <Image
                                style={{
                                    height: "11px",
                                    width: "16px",
                                    marginLeft: "8px",
                                    marginRight: "10px"
                                }}
                                source={{uri: GLOBAL.origin + challenge.challenger.country_flag}}/>
                            Elo: {challenge.challenger.elo}
                        </Headline>
                    </View>
                    <View> <Headline>Time: {minutes}{increment}.</Headline></View>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button mode="contained" color="red" onPress={this.acceptChallenge}
                            style={{marginRight: "10px"}}>
                        Accept
                    </Button>
                    <Button mode="contained"
                            onPress={() => {
                                this.setState({challengeReceived: null})
                            }}>
                        Refuse
                    </Button>
                </Dialog.Actions>
            </Dialog>
        }


        return (

            <View style={{
                flex: 1,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <StatusBar style="auto"/>

                <Card>
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Card.Title title="Lobby" subtitle="Here you can search for a game."/>
                        <Card.Actions>
                            <Button mode={"contained"} onPress={this.populateLobby}>Refresh</Button>
                            <Button mode={"contained"} style={{marginLeft: "5px"}}
                                    onPress={() => {
                                        this.setState({showRapidQueueDialog: true})
                                    }}>Rapid Queue</Button>
                        </Card.Actions>
                        <Card.Content>
                            <Headline>Users list:</Headline>
                            <SafeAreaView>
                                <FlatList
                                    data={Object.values(this.state.users)}
                                    renderItem={this.renderItem}
                                    keyExtractor={item => item.id}
                                />
                            </SafeAreaView>

                        </Card.Content>
                    </View>
                </Card>
                <Provider>
                    <Portal>
                        <Dialog visible={!!this.state.showSendChallengeDialog}
                                style={{alignItems: 'center', justifyContent: 'center'}}
                                onDismiss={() => {
                                    this.setState({showSendChallengeDialog: false})
                                }}>
                            <Dialog.Title>Select a time format in order to
                                challenge {this.state.showSendChallengeDialog.username}</Dialog.Title>

                            <Dialog.Content>
                                <View style={{flex: 1, flexDirection: "row", justifyContent: "Center"}}>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="3|0"
                                            color="red"
                                            status={this.state.selectedTime === '3|0' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "3|0"})
                                            }}
                                        />
                                        3 minutes
                                    </Paragraph>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="5|0"
                                            color="red"
                                            status={this.state.selectedTime === '5|0' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "5|0"})
                                            }}
                                        />
                                        5 minutes
                                    </Paragraph>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="10|0"
                                            color="red"
                                            status={this.state.selectedTime === '10|0' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "10|0"})
                                            }}
                                        />
                                        10 minutes
                                    </Paragraph>
                                </View>
                                <View style={{flex: 1, flexDirection: "row", justifyContent: "Center"}}>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="30|0"
                                            color="red"
                                            status={this.state.selectedTime === '30|0' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "30|0"})
                                            }}
                                        />
                                        30 minutes
                                    </Paragraph>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="3|1"
                                            color="red"
                                            status={this.state.selectedTime === '3|1' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "3|1"})
                                            }}
                                        />
                                        3 minutes + 1s per move
                                    </Paragraph>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="3|2"
                                            color="red"
                                            status={this.state.selectedTime === '3|2' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "3|2"})
                                            }}
                                        />
                                        3 minutes + 2s per move
                                    </Paragraph>
                                </View>
                            </Dialog.Content>

                            <Dialog.Actions>
                                <Button mode="contained" color="red" onPress={this.sendChallenge}
                                        style={{marginRight: "10px"}}>
                                    Send challenge
                                </Button>
                                <Button mode="contained"
                                        onPress={() => {
                                            this.setState({showSendChallengeDialog: false})
                                        }}>
                                    Close
                                </Button>
                            </Dialog.Actions>
                        </Dialog>

                        <Dialog visible={this.state.showWaitDialog} dismissable={false}
                                style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Dialog.Title>Waiting... <ActivityIndicator animating={true}/></Dialog.Title>
                        </Dialog>
                        {challengedDialog}

                        <Dialog visible={this.state.showRapidQueueDialog}
                                style={{alignItems: 'center', justifyContent: 'center'}}
                                onDismiss={() => {
                                    this.setState({showRapidQueueDialog: false})
                                }}>
                            <Dialog.Title>Select a time format to enter the rapid queue.</Dialog.Title>
                            <Dialog.Content>
                                <View style={{flex: 1, flexDirection: "row", justifyContent: "Center"}}>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="3|0"
                                            color="red"
                                            status={this.state.selectedTime === '3|0' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "3|0"})
                                            }}
                                        />
                                        3 minutes
                                    </Paragraph>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="5|0"
                                            color="red"
                                            status={this.state.selectedTime === '5|0' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "5|0"})
                                            }}
                                        />
                                        5 minutes
                                    </Paragraph>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="10|0"
                                            color="red"
                                            status={this.state.selectedTime === '10|0' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "10|0"})
                                            }}
                                        />
                                        10 minutes
                                    </Paragraph>
                                </View>
                                <View style={{flex: 1, flexDirection: "row", justifyContent: "Center"}}>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="30|0"
                                            color="red"
                                            status={this.state.selectedTime === '30|0' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "30|0"})
                                            }}
                                        />
                                        30 minutes
                                    </Paragraph>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="3|1"
                                            color="red"
                                            status={this.state.selectedTime === '3|1' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "3|1"})
                                            }}
                                        />
                                        3 minutes + 1s per move
                                    </Paragraph>
                                    <Paragraph style={{fontWeight: "bold"}}>
                                        <RadioButton
                                            value="3|2"
                                            color="red"
                                            status={this.state.selectedTime === '3|2' ? 'checked' : 'unchecked'}
                                            onPress={() => {
                                                this.setState({selectedTime: "3|2"})
                                            }}
                                        />
                                        3 minutes + 2s per move
                                    </Paragraph>
                                </View>
                            </Dialog.Content>

                            <Dialog.Actions>
                                <Button mode="contained" color="red" onPress={this.enterQueue}
                                        style={{marginRight: "10px"}}>
                                    Enter queue
                                </Button>
                                <Button mode="contained"
                                        onPress={() => {
                                            this.setState({showRapidQueueDialog: false})
                                        }}>
                                    Close
                                </Button>
                            </Dialog.Actions>
                        </Dialog>

                        <Dialog visible={this.state.showWaitQueueDialog} dismissable={false}
                                style={{alignItems: 'center', justifyContent: 'center'}}>
                            <Dialog.Title>Waiting... <ActivityIndicator animating={true}/></Dialog.Title>
                            <Dialog.Actions>
                                <Button mode="contained"
                                        onPress={this.exitQueue}>
                                    Exit queue
                                </Button>
                            </Dialog.Actions>
                        </Dialog>

                    </Portal>
                </Provider>
            </View>
        )
    }

}

export default Lobby


