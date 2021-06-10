from django.urls import path
from . import views

urlpatterns = [
    path('lobby/', views.lobby, name='lobby'),
    path('<uuid:game_id>/', views.game_view, name='game'),
    path('replay/<uuid:game_id>/', views.replay_view, name='replay')
]
