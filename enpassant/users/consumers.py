from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.shortcuts import redirect

from game.models import Game
from django.db.models import Q


class ProfileConsumer(AsyncJsonWebsocketConsumer):

    async def websocket_connect(self, event):
        if self.scope['user'].is_anonymous:
            return redirect('login')
        await super().websocket_connect(event)

        username = self.scope["url_route"]["kwargs"]["username"]

        games = await self.get_games(username, 15)
        await self.send_json({
            'games': games
        })

    async def receive_json(self, message, **kwargs):
        """Riceve una richiesta di partite dal client e risponde."""

        username = self.scope["url_route"]["kwargs"]["username"]
        games = await self.get_games(username, message['n'])
        await self.send_json({
            'games': games
        })

    @database_sync_to_async
    def get_games(self, username, n):
        excluded_results = {'c', '-'}
        return [game.as_dict_for_profile() for game in Game.objects.filter(
            (Q(white__username=username) | Q(black__username=username)) & ~Q(result__in=excluded_results)) \
                                                           .order_by('-date')[:n]]
