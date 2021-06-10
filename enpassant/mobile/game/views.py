from django.shortcuts import  get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from game.models import Game


class GameView(APIView):

    def get(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        if request.user == game.white:
            me = game.white.as_dict()
            opponent = game.black.as_dict()
            my_color = 'white'
        elif request.user == game.black:
            me = game.black.as_dict()
            opponent = game.white.as_dict()
            my_color = 'black'
        else:
            return Response(None, status=status.HTTP_403_FORBIDDEN)
        if game.result != '-':
            return Response(None, status=status.HTTP_403_FORBIDDEN)
        return Response({'me': me, 'opponent': opponent, 'my_color': my_color})


class ReplayView(APIView):

    def get(self, request, game_id):
        game = get_object_or_404(Game, pk=game_id)
        if request.user == game.white:
            me = game.white.as_dict()
            opponent = game.black.as_dict()
            my_color = 'white'
        elif request.user == game.black:
            me = game.black.as_dict()
            opponent = game.white.as_dict()
            my_color = 'black'
        else:
            return Response(None, status=status.HTTP_403_FORBIDDEN)
        if game.result == '-':
            return Response(None, status=status.HTTP_403_FORBIDDEN)
        return Response({'me': me, 'opponent': opponent, 'pgn': game.pgn, 'my_color': my_color})
