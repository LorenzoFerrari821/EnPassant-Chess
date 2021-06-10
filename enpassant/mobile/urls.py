from django.urls import path
from django.conf.urls import include

urlpatterns = [
    path('users/', include('mobile.users.urls')),
    path('game/', include('mobile.game.urls')),
]
