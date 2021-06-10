from django.urls import path
from . import views

urlpatterns = [
   path('<uuid:game_id>/', views.GameView.as_view()),
   path('replay/<uuid:game_id>/', views.ReplayView.as_view())
]
