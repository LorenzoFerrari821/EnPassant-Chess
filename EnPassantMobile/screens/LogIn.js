import React, {Component} from 'react'
import {View} from 'react-native'
import {TextInput, Button, Card, Paragraph} from 'react-native-paper'
import {StatusBar} from 'expo-status-bar'
import GLOBAL from '../Global.js'

class LogIn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: {text: "", error: false},
            password: {text: "", error: false},
            error: ""
        }
    }

    checkFormFilled = () => {
        if (this.state.username.text === "") {
            const state = {
                username: {text: "", error: true}
            }
            this.setState(state)
        }
        if (this.state.password.text === "") {
            const state = {
                password: {text: "", error: true}
            }
            this.setState(state)
            return 0
        }
        return 1
    }

    login = () => {
        if (this.checkFormFilled()) {
            fetch('http://127.0.0.1:8000/mobile/users/login-token/', {
                method: "POST",
                headers: {
                    Accept: 'application/json', 'content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.state.username.text,
                    password: this.state.password.text,
                })
            })
                .then((response) => {
                        let state = {error: ""}
                        if (response['status'] !== 200) {
                            state = {
                                error: "Your credentials are invalid"
                            }
                        }
                        this.setState(state)
                        return response.json()
                    }
                )
                .then((responseJson) => {
                    if (this.state.error === "") {
                        GLOBAL.user = responseJson
                        this.props.navigation.navigate("Home") //Da cambiare in lobby
                    }
                })
        }
    }

    changeUsername = (text) => {
        const state = {
            username: {text: text, error: false}
        }
        this.setState(state)
    }

    changePassword = (text) => {
        const state = {
            password: {text: text, error: false}
        }
        this.setState(state)
    }

    render() {

        return (
            <View style={{
                flex: 1,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <StatusBar style="auto"/>
                <Card>
                    <Card.Title title="Welcome to EnPassant" subtitle="Log in to start playing"/>
                    <Card.Content>
                        <Paragraph style={{color: "red", fontWeight: "bold"}}>{this.state.error}</Paragraph>
                    </Card.Content>
                    <Card.Content>
                        <TextInput mode='outlined' label="Username" value={this.state.username.text}
                                   onChangeText={this.changeUsername}
                                   error={this.state.username.error}/>
                        <TextInput mode='outlined' label="Password" value={this.state.password.text}
                                   onChangeText={this.changePassword}
                                   error={this.state.password.error}/>
                    </Card.Content>
                    <Card.Actions>
                        <Button mode={"contained"} onPress={this.login}>Log In</Button>
                        <Button mode={"contained"} style={{marginLeft: "5px"}} onPress={() => {
                            this.props.navigation.navigate("SignUp")
                        }}>
                            Don't have an account? Sign In
                        </Button>
                    </Card.Actions>
                    <Card.Actions>
                        <Button mode={"contained"} color={"red"}>I forgot my password</Button>
                    </Card.Actions>
                </Card>
            </View>
        )
    }
}


export default LogIn


