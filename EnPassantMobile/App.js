import React, {Component} from 'react'
import LogIn from "./screens/LogIn"
import Lobby from "./screens/Lobby"
import SignUp from "./screens/SignUp"
import Profile from "./screens/Profile"
import Home from "./screens/Home"
import Game from "./screens/Game"
import Analyze from "./screens/Analyze"
import {Headline, Button} from "react-native-paper";
import {Image, View} from "react-native"

import {NavigationContainer} from "@react-navigation/native";
import {createStackNavigator} from '@react-navigation/stack'
import * as RootNavigation from './RootNavigation.js';
import {navigationRef} from "./RootNavigation.js";

const Stack = createStackNavigator()

function LogoTitle() {
    return (
        <View style={{flex: 1, flexDirection: "row"}}>
            <Image
                style={{width: 50, height: 50}}
                source={require('./assets/chess_piece_king.png')}
            />
            <Headline style={{alignItems: 'center', justifyContent: 'center'}}>EnPassant</Headline>
        </View>
    );
}

export default class App extends Component {
    render() {

        const optionsWithButton = {
            headerLeft: null,
            headerTitle: props => <LogoTitle {...props} />,
            headerRight: () => (
                <Button onPress={() => RootNavigation.dispatch()} mode="contained">
                    Go to the Home
                </Button>
            )
        }
        const optionsWithoutButton = {
            headerLeft: null,
            headerTitle: props => <LogoTitle {...props} />,
            headerRight: null
        }
        return (
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator initialRouteName="LogIn">
                    <Stack.Screen name="LogIn" component={LogIn} options={optionsWithoutButton}/>
                    <Stack.Screen name="Home" component={Home} options={optionsWithoutButton}/>
                    <Stack.Screen name="Lobby" component={Lobby} options={optionsWithButton}/>
                    <Stack.Screen name="SignUp" component={SignUp} options={optionsWithoutButton}/>
                    <Stack.Screen name="Profile" component={Profile} options={optionsWithButton}/>
                    <Stack.Screen name="Game" component={Game} options={optionsWithoutButton}/>
                    <Stack.Screen name="Analyze" component={Analyze} options={optionsWithButton}/>
                </Stack.Navigator>
            </NavigationContainer>
        )
    }
}



