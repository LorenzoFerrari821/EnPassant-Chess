from .users import routing as users
from .game import routing as game

websocket_urlpatterns = users.websocket_urlpatterns + game.websocket_urlpatterns

