import React, {Component} from 'react'
import {View, Image} from 'react-native'
import {Button, Card, Title, Paragraph} from 'react-native-paper'
import {StatusBar} from 'expo-status-bar'
import GLOBAL from '../Global.js'
import {CommonActions} from "@react-navigation/native";


class Home extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        const style = {
            flex: 1,
            backgroundColor: 'white',
            alignItems: 'center',
            justifyContent: 'center'
        }


        const LeftContent = () => <Image
            style={{width: 50, height: 50}} source={require('../assets/chess_piece_king.png')}/>

        return (
            <View style={style}>
                <StatusBar style="auto"/>
                <Card>
                    <Card.Title title="Home of EnPassant" subtitle="From here you can navigate through the application"
                                left={LeftContent}/>

                    <Card.Cover source={require('../assets/home-cover.jpg')}/>
                    <Card.Actions>
                        <View style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Button mode="contained" onPress={() => {
                                this.props.navigation.navigate("Lobby")
                            }}>
                                Lobby
                            </Button>
                            <Button mode="contained" style={{marginLeft: "10px", marginRight: "10px"}}
                                    onPress={() => {
                                        this.props.navigation.navigate("Profile", {username: GLOBAL.user.username})
                                    }}>
                                Profile
                            </Button>
                            <Button mode="contained" onPress={() => {
                                this.props.navigation.dispatch(CommonActions.reset({
                                    index: 0,
                                    routes: [{name: 'LogIn'},],
                                }))
                            }}>
                                Logout
                            </Button>
                        </View>

                    </Card.Actions>
                </Card>
            </View>
        )
    }
}


export default Home


