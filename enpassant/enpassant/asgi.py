"""
ASGI config for enpassant project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from enpassant.routing import websocket_urlpatterns
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'enpassant.settings')
django.setup()

'''Channels controlla prima di tutto il tipo di protocollo utilizzato per le richieste e indirizza al gestore corretto.
Per il websocket si usa un protocollo specifico, ws://. Se il protocollo ws viene rilevato la richiesta viene passata ad
middleware per identificare un utente, basato sul sistema django. Dopo di che si passa al gestore dei pattern che 
seleziona il consumer corretto da invocare, analogamente al funzionamento di django con django'''
application = ProtocolTypeRouter({
    'http': get_asgi_application(),  # Django's ASGI application to handle traditional HTTP requests
    'websocket': URLRouter(websocket_urlpatterns)  #lista pattern routing
})
