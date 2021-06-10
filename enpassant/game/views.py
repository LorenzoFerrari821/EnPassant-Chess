from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Game
from django.db.models import Q


# Create your views here.

@login_required
def lobby(request):
    # Test if a pending game exists for this user
    game = Game.objects.filter((Q(white=request.user) | Q(black=request.user)) & Q(result='-')).order_by('-date')
    if game:
        return redirect('game', game_id=game[0].id)
    return render(request, 'game/lobby.html')


@login_required
def game_view(request, game_id):
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
        return render(request, 'game/error.html', {'error': "This is not your game!"})
    if game.result != '-':
        return render(request, 'game/error.html', {'error': "The game is already finished.", 'id': str(game.id)})
    return render(request, 'game/game.html', {'me': me, 'opponent': opponent, 'my_color': my_color})


@login_required
def replay_view(request, game_id):
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
        return render(request, 'game/error.html', {'error': "This is not one of your games!"})
    if game.result == '-':
        return redirect('game', game_id=game.id)
    return render(request, 'game/replay.html', {'me': me, 'opponent': opponent, 'pgn': game.pgn, 'my_color': my_color})
