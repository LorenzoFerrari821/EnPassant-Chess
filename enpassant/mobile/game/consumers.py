import asyncio
import random
import threading
from operator import itemgetter
from datetime import datetime, timezone
import io
import chess.pgn
import chess

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from game.models import Game


class GameConsumer(AsyncJsonWebsocketConsumer):
    active_games = {}

    async def websocket_connect(self, event):
        user = self.scope["user"]
        await super().websocket_connect(event)
        user_group_name = f"user_{user.username}"  # Ogni utente ha un suo gruppo
        await self.channel_layer.group_add(
            user_group_name,
            self.channel_name,  # Nome del canale (layer) da aggiungere al gruppo
        )

        game = await self.get_game()
        if not game:
            await self.send_json({'noGame': ''})
            await self.websocket_disconnect(self)

        if str(self.scope["url_route"]["kwargs"]["game_id"]) in self.active_games:
            # Almeno un giocatore si è già connesso. La partita potrebbe essere già iniziata oppure deve ancora iniziare.
            # Nel primo caso questa è una riconnessione di un giocatore, nel secondo caso il secondo giocatore si sta connettendo.
            active_game = self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]
            active_game['players'] = 2

            # Quando un secondo giocatore si connette c'è per forza un timer attivo. O è la prima connessione del
            # giocatore (quindi c'è un timer che annulla la partita se il secondo giocatore non si connette) oppure il
            # giocatore si sta riconnettendo dopo una disconnessione a partita già iniziata e allo scattare del timer
            # si vince a tavolino. Stoppiamo il timer, ora che il secondo giocatore è qui.
            if active_game['timer']:
                active_game['timer'].cancel()
                del active_game['timer']

            # Se il game è partito allora questa è una riconnessione: calcoliamo il tempo corretto.
            if active_game['started']:
                if active_game['pgn'] != '':  # Calcoliamo i tempi solo se è stata fatta la prima mossa
                    elapsed = round((datetime.now(timezone.utc) - active_game['lastMoveDate']).total_seconds() * 1000)
                    active_game['lastMoveDate'] = datetime.now(timezone.utc)
                    if chess.pgn.read_game(io.StringIO(active_game['pgn'])).end().board().turn:  # bianco
                        active_game['whiteTime'] -= elapsed
                    else:
                        active_game['blackTime'] -= elapsed
            # Se il game non è partito, ora che ci sono entrambi i giocatori può partire.
            else:
                active_game['started'] = True
        else:
            # Il primo giocatore si sta connettendo. Attiviamo un timer, se il secondo giocatore non arriva chiudiamo il
            # game e avvisiamo che l'avversario non è arrivato.
            timer = threading.Timer(20, lambda: asyncio.run(self.join_timeout()))
            timer.start()
            active_game = {
                'players': 1,
                'white': game['white'],
                'black': game['black'],
                'increment': game['increment'],
                'whiteTime': game['white_time'] + 200,
                'blackTime': game['black_time'] + 200,
                'lastMoveDate': None,
                'pgn': '',
                'started': False,
                'timer': timer
            }
        message = {'type': 'game',
                   **{key: value for key, value in active_game.items() if key in {'pgn', 'whiteTime', 'blackTime'}}}
        await self.send_json(message)
        self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])] = active_game

    async def receive_json(self, in_message, **kwargs):
        """Invocato quando viene ricevuto il contenuto di un messaggio json, valuta il tipo di messaggio e seleziona
        il gestore corretto."""

        if in_message['type'] == "move":
            await self.handle_move(in_message)
        elif in_message['type'] == "time_finished":
            await self.handle_time_finished(in_message['color'])
        elif in_message['type'] == 'concede':
            await self.handle_concede(in_message['color'])

    async def handle_move(self, in_message):
        if str(self.scope["url_route"]["kwargs"]["game_id"]) in self.active_games:
            active_game = self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]

            # Calcolo tempi
            if not active_game['lastMoveDate']:  # Non c'è una data, è la prima mossa della partita
                active_game['lastMoveDate'] = datetime.now(timezone.utc)
            else:
                elapsed = round((datetime.now(timezone.utc) - active_game['lastMoveDate']).total_seconds() * 1000)
                active_game['lastMoveDate'] = datetime.now(timezone.utc)
                if in_message['color'] == 'white':
                    active_game['whiteTime'] -= elapsed
                    active_game['whiteTime'] += active_game['increment']
                else:
                    active_game['blackTime'] -= elapsed
                    active_game['blackTime'] += active_game['increment']

            # controllo se la mossa è valida
            if active_game['pgn'] != '':
                game = chess.pgn.read_game(io.StringIO(active_game['pgn']))
                board = game.end().board()
            else:
                board = chess.Board()
            try:
                board.push_san(in_message['san'])
            except ValueError:  # Mossa non valida! Salveremo i tempi ma non pgn e annulliamo la mossa al giocatore
                out_message = {'type': 'invalidMove', 'whiteTime': active_game['whiteTime'],
                               'blackTime': active_game['black']}
                await self.send_json(out_message)
                self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])] = active_game
            else:  # Mossa valida, salveremo tutto, mandiamo la mossa e poi controlliamo se la partita è finita
                active_game['pgn'] = str(chess.pgn.Game.from_board(board).mainline())
                out_message = {'type': 'move', **{key: value for key, value in active_game.items() if
                                                  key in {'pgn', 'whiteTime', 'blackTime'}}}
                await self.channel_layer.group_send(
                    f"user_{active_game['white']}",
                    out_message
                )
                await self.channel_layer.group_send(
                    f"user_{active_game['black']}",
                    out_message
                )
                self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])] = active_game

                # controllo condizioni fine partita
                if board.is_game_over(claim_draw=True):
                    result = 'draw' if not board.is_checkmate() else in_message['color']
                    new_elos = await self.end_game(result, active_game['pgn'])
                    out_message = {'type': 'results', 'subtype': 'game_over', **new_elos,
                                   'whiteTime': active_game['whiteTime'],
                                   'blackTime': active_game['blackTime'], 'winner': result}
                    await self.channel_layer.group_send(
                        f"user_{active_game['white']}",
                        out_message
                    )
                    await self.channel_layer.group_send(
                        f"user_{active_game['black']}",
                        out_message
                    )
                    del self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]

    async def handle_concede(self, winner):
        if str(self.scope["url_route"]["kwargs"]["game_id"]) in self.active_games:
            active_game = self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]
            new_elos = await self.end_game(winner, active_game['pgn'])
            out_message = {'type': 'results', 'subtype': 'concede', 'winner': winner, **new_elos}
            await self.channel_layer.group_send(
                f"user_{active_game['white']}",
                out_message
            )
            await self.channel_layer.group_send(
                f"user_{active_game['black']}",
                out_message
            )
            del self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]

    async def handle_time_finished(self, winner):
        if str(self.scope["url_route"]["kwargs"]["game_id"]) in self.active_games:
            active_game = self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]
            new_elos = await self.end_game(winner, active_game['pgn'])
            if winner == 'white':
                active_game['blackTime'] = 0
            else:
                active_game['whiteTime'] = 0

            out_message = {'type': 'results', 'subtype': 'time_finished', **new_elos, 'winner': winner,
                           'whiteTime': active_game['whiteTime'], 'blackTime': active_game['blackTime']}
            await self.channel_layer.group_send(
                f"user_{active_game['white']}",
                out_message
            )
            await self.channel_layer.group_send(
                f"user_{active_game['black']}",
                out_message
            )
            del self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]

    async def join_timeout(self):
        await self.close_game()
        del self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]
        await self.send_json({'type': 'joinTimeout'})
        await super().disconnect(None)

    async def move(self, message):
        await self.send_json(message)

    async def results(self, message):
        await self.send_json(message)
        await super().disconnect(None)

    async def disconnect(self, code):
        if str(self.scope["url_route"]["kwargs"]["game_id"]) in self.active_games:
            active_game = self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]
            if active_game['players'] == 2:
                # Quando un giocatore si disconnette attiviamo un timer che chiude il game alla scadenza
                active_game['players'] = 1
                timer = threading.Timer(30, lambda: asyncio.run(
                    self.connection_lost_timeout(
                        str(self.scope["user"]))))  # Escamotage per chiamare una funzione asincrona
                timer.start()
                active_game['timer'] = timer
            else:
                # Se c'e un solo player, allora non ci sono più giocatori e la partita è conclusa
                del self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]
                await self.close_game()

    async def connection_lost_timeout(self, disconnected_user):
        active_game = self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]
        new_elos = await self.end_game('black' if active_game['white'] == disconnected_user else 'white',
                                       active_game['pgn'])
        out_message = {'type': 'results', 'subtype': 'opponent_disconnected',
                       'winner': 'black' if active_game['white'] == disconnected_user else 'white', **new_elos}
        await self.channel_layer.group_send(
            f"user_{active_game['white']}",
            out_message
        )
        await self.channel_layer.group_send(
            f"user_{active_game['black']}",
            out_message
        )
        del self.active_games[str(self.scope["url_route"]["kwargs"]["game_id"])]

    @database_sync_to_async
    def get_game(self):
        try:
            return Game.objects.get(id=self.scope["url_route"]["kwargs"]["game_id"], result='-').as_dict()
        except Game.DoesNotExist:
            return None

    @database_sync_to_async
    def close_game(self):
        try:
            game = Game.objects.get(id=self.scope["url_route"]["kwargs"]["game_id"], result='-')
        except Game.DoesNotExist:
            return None
        game.result = 'c'
        game.save()

    @database_sync_to_async
    def end_game(self, result, pgn):
        try:
            game = Game.objects.get(id=self.scope["url_route"]["kwargs"]["game_id"], result='-')
        except Game.DoesNotExist:
            return {}

        white_elo = game.white.elo
        black_elo = game.black.elo

        # https://it.wikipedia.org/wiki/Elo
        ea_white = 1 / ((10 ** ((black_elo - white_elo) / 400)) + 1)
        ea_black = 1 / ((10 ** ((white_elo - black_elo) / 400)) + 1)

        if result == 'draw':
            game.result = 'd'
            new_elo_white = round(white_elo + (20 * (0.5 - ea_white)))
            new_elo_black = round(black_elo + (20 * (0.5 - ea_black)))
        elif result == 'white':
            game.result = 'w'
            new_elo_white = round(white_elo + (20 * (1 - ea_white)))
            new_elo_black = round(black_elo + (20 * (0 - ea_black)))
        else:
            game.result = 'b'
            new_elo_white = round(white_elo + (20 * (0 - ea_white)))
            new_elo_black = round(black_elo + (20 * (1 - ea_black)))

        game.pgn = pgn
        game.white.elo = new_elo_white
        game.white.games_played += 1
        game.black.elo = new_elo_black
        game.black.games_played += 1
        game.save()
        game.white.save()
        game.black.save()
        return {'new_elo_white': new_elo_white, 'new_elo_black': new_elo_black}


class LobbyConsumer(AsyncJsonWebsocketConsumer):
    connected_users = {}
    queues = {'3|0': [], '5|0': [], '10|0': [], '30|0': [], '3|1': [], '3|2': []}
    time_formats = {'3|0', '5|0', '10|0', '30|0', '3|1', '3|2'}

    async def websocket_connect(self, event):
        await super().websocket_connect(event)

        await self.channel_layer.group_add(
            f"user_{self.scope['user'].username}",  # Ogni utente ha un suo gruppo,
            self.channel_name  # Nome del canale (layer) da aggiungere al gruppo
        )

        user = await self.get_user()
        if user['id'] not in self.connected_users:
            self.connected_users[user['id']] = user
        await self.populate()

    async def populate(self):
        await self.send_json({
            'type': 'populate',
            'users': {**{key: value for key, value in self.connected_users.items() if key != self.scope['user'].id}}
        })

    async def receive_json(self, message, **kwargs):

        message_type = message['type']

        if message_type == 'populate':
            await self.populate()

        if message_type == 'challenge':
            await self.channel_layer.group_send(
                f"user_{message['challenged']['username']}",
                {
                    "type": "challenge",
                    "challenged": message['challenged'],
                    "challenger": self.connected_users[self.scope['user'].id],
                    "time": message['time'] if message['time'] in self.time_formats else '10|0',
                }
            )

        if message_type == 'accept':
            players = [message['challenger'], message['challenged']]
            time = message['time'] if message['time'] in self.time_formats else '10|0'
            random.shuffle(players)

            game_id = await self.create_game(players, time)
            for player in players:
                await self.channel_layer.group_send(
                    f"user_{player['username']}",
                    {
                        "type": "game_id",
                        "id": str(game_id),
                    }
                )

        if message_type == 'enter_queue':
            user = self.connected_users[self.scope['user'].id]
            if user not in self.queues[message['time']]:
                self.queues[message['time']].append(user)
            del self.connected_users[user['id']]

            await self.matchmaker(message['time'])

        if message_type == 'exit_queue':
            user = [x for x in self.queues[message['time']] if x['id'] == self.scope['user'].id][0]
            self.queues[message['time']].remove(user)
            self.connected_users[user['id']] = user

    async def challenge(self, message):
        await self.send_json(message)

    async def game_id(self, message):
        await self.send_json(message)
        await self.disconnect()

    async def disconnect(self, code):
        if self.scope['user'].id in self.connected_users.keys():
            del self.connected_users[self.scope['user'].id]
        else:
            for time in self.time_formats:
                try:
                    user = [user for user in self.queues[time] if user['id'] == self.scope['user'].id][0]
                except IndexError:
                    continue
                else:
                    self.queues[time].remove(user)
                    break

    async def matchmaker(self, time):
        # matchmaker molto semplice senza priorità, confronta due giocatori vicini e li appaia se il loro elo è vicino

        self.queues[time] = sorted(self.queues[time], key=itemgetter('elo'))
        skip = False
        couples = []
        for (index, obj) in enumerate(self.queues[time][:-1]):
            if skip:
                skip = False
                continue
            current, next = obj, self.queues[time][index + 1]
            if abs(current['elo'] - next['elo']) < 300:
                skip = True
                couples.append((index, index + 1))
        for couple in couples:
            players = [self.queues[time][couple[0]], self.queues[time][couple[1]]]
            self.queues[time].remove(players[0])
            self.queues[time].remove(players[1])

            game_id = await self.create_game(players, time)
            for player in players:
                await self.channel_layer.group_send(
                    f"user_{player['username']}",
                    {
                        "type": "game_id",
                        "id": str(game_id),
                    }
                )

    @database_sync_to_async
    def get_user(self):
        return get_user_model().objects.get(username=self.scope['user'].username).as_dict()

    @database_sync_to_async
    def create_game(self, players, time):
        try:
            return Game.objects.create(white_id=players[0]['id'], black_id=players[1]['id'], time=time).id
        except IntegrityError:  # se per mero caso generiamo un UUID4 che già esiste, riproviamo.
            return Game.objects.create(white_id=players[0]['id'], black_id=players[1]['id'], time=time).id
        except Exception as e:
            print(e)
