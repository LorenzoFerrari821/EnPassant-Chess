from django.db import models
from django.contrib.auth.models import AbstractUser
from django_countries.fields import CountryField


# Create your models here.

class User(AbstractUser):
    email = models.EmailField('email address', max_length=100, unique=True,
                              error_messages={'unique': "A user with that email already exists."})
    picture = models.ImageField(null=True, blank=True, upload_to='profile_pictures',
                                default="/media/profile_pictures/default.png")
    country = CountryField(blank_label='Select country')
    elo = models.PositiveSmallIntegerField('ELO', default=1000)
    games_played = models.PositiveIntegerField(default=0)

    def as_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "elo": self.elo,
            "picture": self.picture_url,
            "country_flag": self.country.flag,
            "country_name": self.country.name,
        }

    def as_dict_for_profile(self):
        return {
            "username": self.username,
            "country_flag": self.country.flag,
            "country_name": self.country.name,
        }

    def as_dict_for_mobile(self):
        return {
            "username": self.username,
            "elo": self.elo,
            "picture_url": self.picture_url,
            "country_flag": self.country.flag,
            "country_name": self.country.name,
            "games_played": self.games_played,
            "first_name": self.first_name,
            "last_name": self.first_name,
            "email": self.email
        }

    @property
    def picture_url(self):
        if self.picture and hasattr(self.picture, 'url'):
            return self.picture.url
        else:
            return "/media/profile_pictures/default.png"

    @property
    def country_name(self):
        return self.country.name

    @property
    def country_flag(self):
        return self.country.flag
