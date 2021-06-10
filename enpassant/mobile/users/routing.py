from django.urls import path
from .consumers import ProfileConsumer
from ..middleware import TokenAuthMiddleware

websocket_urlpatterns = [
    path("mobile/users/<username>/", TokenAuthMiddleware(ProfileConsumer.as_asgi()))
]
