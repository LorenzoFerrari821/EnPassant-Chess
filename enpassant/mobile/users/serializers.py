"""Prima di essere inviati, i dati generati da django (modelli e query ad esempio) vanno serializzati, ovvero 
in un formato facilmente inviabile e interpretabile."""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django_countries.serializers import CountryFieldMixin
from drf_extra_fields.fields import Base64ImageField

from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


class RegisterSerializer(CountryFieldMixin, serializers.ModelSerializer):
    picture = Base64ImageField()

    class Meta:
        model = get_user_model()
        exclude = ['last_login', 'is_superuser', 'is_staff', 'date_joined', 'groups', 'user_permissions']

    def create(self, validated_data):
        print(validated_data)
        password = validated_data.pop('password')
        user = super().create({**validated_data, 'is_active': False})
        user.set_password(password)
        user.save()

        site_domain = '127.0.0.1:8000'
        mail_subject = 'Activate your account.'
        message = render_to_string('users/credentials/activation_mail_content.html', {
            'user': user,
            'domain': site_domain,
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            # codifichiamo l'id utente prima in bytecode e poi in uid
            'token': default_token_generator.make_token(user),  # creiamo un token a partire dall'istanza utente
        })
        receiver = user.email
        email = EmailMessage(mail_subject, message, to=[receiver])
        email.send()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "username", "email", "games_played", "elo", "first_name", "last_name", "picture_url",
                  "country_name", "country_flag"]
