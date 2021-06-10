import game.routing
import users.routing
import mobile.routing

'''Esattamente come Django, utilizziamo un file per gestire il routing. I vari path vengono gestiti dai consumers, 
analogo delle views'''

websocket_urlpatterns = game.routing.websocket_urlpatterns + users.routing.websocket_urlpatterns + mobile.routing.websocket_urlpatterns
