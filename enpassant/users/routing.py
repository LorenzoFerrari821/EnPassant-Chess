from django.urls import path
from . import consumers
from channels.auth import AuthMiddlewareStack

websocket_urlpatterns = [
    path('users/<username>/', AuthMiddlewareStack(consumers.ProfileConsumer.as_asgi()), name='profile')
]
