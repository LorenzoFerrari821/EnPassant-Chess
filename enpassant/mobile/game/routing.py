from django.urls import path
from .consumers import LobbyConsumer, GameConsumer
from ..middleware import TokenAuthMiddleware

websocket_urlpatterns = [
    path("mobile/game/lobby/", TokenAuthMiddleware(LobbyConsumer.as_asgi())),
    path("mobile/game/<uuid:game_id>/", TokenAuthMiddleware(GameConsumer.as_asgi()))
]
