from django.urls import path
from . import consumers
from channels.auth import AuthMiddlewareStack

websocket_urlpatterns = [
    path('game/lobby/', AuthMiddlewareStack(consumers.LobbyConsumer.as_asgi()), name='lobby'),
    path('game/<uuid:game_id>/', AuthMiddlewareStack(consumers.GameConsumer.as_asgi()), name='game'),
]
