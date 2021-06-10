from django.db import models
from django.contrib.auth import get_user_model
import uuid


# Create your models here.

class Game(models.Model):
    CHOICES_RESULT = [
        ('w', 'White won'),
        ('b', 'Black won'),
        ('d', 'Draw'),
        ('-', 'Pending'),
        ('c', 'Cancelled')
    ]
    CHOICES_TIME = [
        ('3|0', '3 min'),
        ('5|0', '5 min'),
        ('10|0', '10 min'),
        ('30|0', '30 min'),
        ('3|1', '3 min increment 1'),
        ('3|2', '3 min increment 2'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # versione 4 ovvero random
    white = models.ForeignKey(get_user_model(), null=True, blank=False, on_delete=models.SET_NULL, related_name='white')
    black = models.ForeignKey(get_user_model(), null=True, blank=False, on_delete=models.SET_NULL, related_name='black')
    time = models.CharField(max_length=4, choices=CHOICES_TIME, default='10|0')
    pgn = models.TextField(null=False, blank=True, default='')
    result = models.CharField(max_length=1, choices=CHOICES_RESULT, default='-')
    date = models.DateField(auto_now_add=True)

    def as_dict(self):
        return ({
            'white': self.white.username,
            'black': self.black.username,
            'increment': int(self.time.split("|")[1]) * 1000,
            'white_time': int(self.time.split("|")[0]) * 60 * 1000,
            'black_time': int(self.time.split("|")[0]) * 60 * 1000
        })

    def as_dict_for_profile(self):
        return ({
            'id': str(self.id),
            'white': self.white.as_dict_for_profile(),
            'black': self.black.as_dict_for_profile(),
            'time': self.time,
            'result': self.result
        })

    def __str__(self):
        w = self.white if self.white else '{Deleted user}'
        b = self.black if self.black else '{Deleted user}'
        return f'{w} VS {b}'
