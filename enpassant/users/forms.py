from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django import forms
from django.contrib.auth import get_user_model


class UserSignupForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = get_user_model()
        fields = ('username', 'password1', 'password2', 'email', 'country', 'first_name', 'last_name', 'picture')
        help_texts = {
            'username': '150 characters or fewer. Letters, digits and @/./+/-/_ only',
            'first_name': 'Optional.',
            'last_name': 'Optional.',
            'picture': 'Optional.',
            'email': 'Enter your email.',
            'country': 'Choose your country.'
        }


class UserEditForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'country', 'first_name', 'last_name', 'picture')
        help_texts = {
            'username': '150 characters or fewer. Letters, digits and @/./+/-/_ only',
            'first_name': 'Optional.',
            'last_name': 'Optional.',
            'picture': 'Optional.',
            'email': 'Enter your email.',
            'country': 'Choose your country.'
        }

# Estendo per permettere la visualizzazione del messaggio di errore quando un utente inattivo prova a loggare.
# Mettendo True un utente può SEMPRE provare a loggare. Se un utente disattivato prova a loggare le altre funzioni
# possono sollevare l'errore corretto. Inoltre sovrascrivo l'errore.
class CustomAuthenticationForm(AuthenticationForm):
    #Aggiungo un errore per utenti disattivati
    error_messages = {
        'invalid_login': (
            "Please enter a correct %(username)s and password. Note that both fields may be case-sensitive."
        ),
        'inactive': (
            "This account is inactive. Write to our staff at staffenpassant@gmail.com for more information and to "
            "reactivate it.")
    }

    def get_invalid_login_error(self):
        try:
            user = get_user_model().objects.get(username=self.cleaned_data.get('username'))
        except get_user_model().DoesNotExist:
            user = None
        if user and not user.is_active:
            raise forms.ValidationError(self.error_messages['inactive'], code='inactive')
        else:
            return forms.ValidationError(
                self.error_messages['invalid_login'],
                code='invalid_login',
                params={'username': self.username_field.verbose_name},
            )
