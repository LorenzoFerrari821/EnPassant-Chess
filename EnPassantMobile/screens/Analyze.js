import React, {Component} from 'react'
import {Dimensions, Image, View} from 'react-native'
import {Button, Headline} from 'react-native-paper'
import {StatusBar} from 'expo-status-bar'
import GLOBAL from '../Global.js'
import {CommonActions} from "@react-navigation/native";
import {TouchableOpacity} from "react-native-gesture-handler";
import Chessboard from "chessboardjsx"
import Chess from "chess.js"

class Analyze extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allowRender: false,
            fen: 'start',
            pendingPromotion: null,
            index: 0,
        }
        this.game_id = this.props.route.params.game_id
        this.me = null
        this.opponent = null
        this.color = null
        this.pgn = null
        this.game = null
        this.fensList = []

        this.apiFetch()
    }

    createList = () => {
        this.game = new Chess()
        this.game.load_pgn(this.pgn)
        this.fensList = []
        do
            this.fensList.push(this.game.fen())
        while (this.game.undo())
        this.fensList = this.fensList.reverse()
        this.game = new Chess()
    }

    apiFetch = () => {
        fetch('http://127.0.0.1:8000/mobile/game/replay/' + this.game_id, {
            method: "GET",
            headers: {
                Accept: 'application/json', 'content-Type': 'application/json',
                Authorization: "Token " + GLOBAL.user.token
            }
        })
            .then((response) => {
                if (response["status"] !== 200) {
                    this.props.navigation.dispatch(CommonActions.reset({index: 0, routes: [{name: 'Home'},],}))
                }
                return response.json()
            })
            .then((responseJson) => {
                this.me = responseJson['me']
                this.opponent = responseJson['opponent']
                this.color = responseJson['my_color']
                this.pgn = responseJson['pgn']
                this.createList()
                this.setState({allowRender: true})
            })
    }

    onDrop = ({sourceSquare, targetSquare}, promoteTo) => {
        let move
        let pendingPromotion = null
        let state = {}

        if (!promoteTo) { //Non sappiamo se la mossa è una promozione o no
            if ((move = this.game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q' //promozione temporanea
            })) === null)
                return null;

            //Controlliamo se la mossa effettuata è una promozione. Se è così annulliamo la mossa e salviamo che è in corso una promozione
            if (move.flags.includes("p")) {
                this.game.undo();
                pendingPromotion = {
                    sourceSquare: sourceSquare,
                    targetSquare: targetSquare,
                    color: this.game.turn()
                }
            }
        } else { //se la mossa è una promozione e l'utente ha scelto il pezzo effettuiamo la mossa con la promozione voluta
            this.game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: promoteTo
            })
        }
        if (!pendingPromotion) {
            state = {
                fen: this.game.fen(),
                pendingPromotion: pendingPromotion,
            }
        } else
            state = {
                pendingPromotion: pendingPromotion,
            }
        this.setState(state)
    }

    onChoice = (id) => {
        this.onDrop(this.state.pendingPromotion, id)
    }

    undo = () => {
        this.game.undo()
        const state = {
            fen: this.game.fen(),
            pendingPromotion: null
        }
        this.setState(state)
    }

    next = () => {
        const index = this.state.index === this.fensList.length - 1 ? this.state.index : this.state.index + 1
        const state = {
            index: index,
            fen: this.fensList[index]
        }
        this.game = new Chess(this.fensList[index])
        this.setState(state)
    }
    previous = () => {
        const index = this.state.index === 0 ? 0 : this.state.index - 1
        const state = {
            index: index,
            fen: this.fensList[index]
        }
        this.game = new Chess(this.fensList[index])
        this.setState(state)
    }
    start = () => {
        const state = {
            index: 0,
            fen: this.fensList[0]
        }
        this.game = new Chess(this.fensList[0])
        this.setState(state)
    }
    end = () => {
        const index = this.fensList.length - 1
        const state = {
            index: index,
            fen: this.fensList[index]
        }
        this.game = new Chess(this.fensList[index])
        this.setState(state)
    }

    render() {
        const windowWidth = Dimensions.get('window').width

        let promotePanel = <></>
        if (!!this.state.pendingPromotion) {
            promotePanel = this.game.turn() === "w" ? <View style={{flexDirection: "row"}}>
                <TouchableOpacity onPress={() => this.onChoice("r")}>
                    <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/wR.png"}}
                           style={{height: "80px", width: "80px"}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onChoice("b")}>
                    <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/wB.png"}}
                           style={{height: "80px", width: "80px"}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onChoice("n")}>
                    <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/wN.png"}}
                           style={{height: "80px", width: "80px"}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onChoice("q")}>
                    <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/wQ.png"}}
                           style={{height: "80px", width: "80px"}}/>
                </TouchableOpacity>
            </View> : <View style={{flexDirection: "row"}}>
                <TouchableOpacity onPress={() => this.onChoice("r")}>
                    <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/bR.png"}}
                           style={{height: "80px", width: "80px"}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onChoice("b")}>
                    <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/bB.png"}}
                           style={{height: "80px", width: "80px"}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onChoice("n")}>
                    <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/bN.png"}}
                           style={{height: "80px", width: "80px"}}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.onChoice("q")}>
                    <Image source={{uri: "https://chessboardjs.com/img/chesspieces/wikipedia/bQ.png"}}
                           style={{height: "80px", width: "80px"}}/>
                </TouchableOpacity>
            </View>
        }

        if (this.state.allowRender) {
            return (
                <View style={{
                    flex: 1,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <StatusBar style="auto"/>

                    <TouchableOpacity onPress={() =>
                        this.props.navigation.dispatch(CommonActions.reset({
                            index: 0,
                            routes: [{name: 'Profile', params: {username: this.opponent.username}},],
                        }))}>
                        <View style={{
                            border: "1px solid rgb(98, 0, 238)",
                            flexDirection: "row",
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Image source={{uri: GLOBAL.origin + this.opponent.picture}}
                                   style={{height: "50px", width: "50px"}}/>
                            <Headline style={{alignItems: 'center', justifyContent: 'center', marginLeft: "10px"}}>
                                {this.opponent.username}
                                <Image style={{height: "11px", width: "16px", marginLeft: "8px", marginRight: "10px"}}
                                       source={{uri: GLOBAL.origin + this.opponent.country_flag}}/>
                                Elo: {this.opponent.elo}
                            </Headline>
                        </View>
                    </TouchableOpacity>

                    {promotePanel}

                    <View style={{
                        flexDirection: "row",
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Chessboard
                            width={windowWidth / 100 * 50}
                            position={this.state.fen}
                            onDrop={this.onDrop}
                            boardStyle={{
                                borderRadius: "5px",
                                boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
                            }}
                            dropSquareStyle={{boxShadow: "inset 0 0 1px 4px rgb(255, 255, 0)"}}  //Stile quadrato su cui il pezzo sta passando
                            orientation={this.color}
                        />

                        <View style={{
                            flexDirection: "col",
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: "1px solid rgb(98, 0, 238)",
                        }}>

                            <Button style={{marginBottom: "5px"}} mode={"contained"} color={"red"} onPress={this.undo}>Undo
                                one of your moves</Button>
                            <View style={{
                                flexDirection: "row",
                            }}>
                                <Button mode={"contained"} onPress={this.start}>Start</Button>
                                <Button mode={"contained"} style={{marginLeft: "5px"}} onPress={this.end}>End</Button>
                            </View>
                            <View style={{
                                flexDirection: "row",
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: "5px"
                            }}>
                                <Button mode={"contained"} onPress={this.previous}>Backward</Button>
                                <Button mode={"contained"} style={{marginLeft: "5px"}}
                                        onPress={this.next}>Forward</Button>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() =>
                        this.props.navigation.dispatch(CommonActions.reset({
                            index: 0,
                            routes: [{name: 'Profile', params: {username: this.me.username}},],
                        }))}>
                        <View style={{
                            border: "1px solid rgb(98, 0, 238)",
                            flexDirection: "row",
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Image source={{uri: GLOBAL.origin + this.me.picture}}
                                   style={{height: "50px", width: "50px"}}/>
                            <Headline style={{alignItems: 'center', justifyContent: 'center', marginLeft: "10px"}}>
                                {this.me.username}
                                <Image
                                    style={{height: "11px", width: "16px", marginLeft: "8px", marginRight: "10px"}}
                                    source={{uri: GLOBAL.origin + this.me.country_flag}}/>
                                Elo: {this.me.elo}
                            </Headline>
                        </View>
                    </TouchableOpacity>
                </View>
            )
        } else return <></>
    }
}


export default Analyze


