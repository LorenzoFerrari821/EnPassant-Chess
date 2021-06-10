from django.shortcuts import render, get_object_or_404, redirect
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from users.forms import UserSignupForm, UserEditForm
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode


# Create your views here.

def signup(request):
    if request.method == 'POST':
        form = UserSignupForm(request.POST, request.FILES)
        if form.is_valid():
            # Creiamo l'utente ma disattivato, l'account viene attivato con un link di conferma tramite mail
            user = form.save(commit=False)
            user.is_active = False
            user.save()
            site_domain = get_current_site(request).domain
            mail_subject = 'Activate your account.'
            message = render_to_string('users/credentials/activation_mail_content.html', {
                'user': user,
                'domain': site_domain,
                'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                # codifichiamo l'id utente prima in bytecode e poi in uid
                'token': default_token_generator.make_token(user),  # creiamo un token a partire dall'istanza utente
            })
            receiver = form.cleaned_data.get('email')
            email = EmailMessage(mail_subject, message, to=[receiver])
            email.send()
            return render(request, 'users/credentials/user_activation.html')
    else:
        form = UserSignupForm()
    return render(request, 'users/credentials/user_signup.html', {'form': form})


def activate(request, uidb64, token):
    # Decodifichiamo l'uid e vediamo se esiste un utente correlato
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_user_model().objects.get(pk=uid)
    except(TypeError, ValueError, OverflowError, get_user_model().DoesNotExist):
        user = None

    valid_link = False
    # Controlliamo che il token ricevuto sia lo stesso generato per l'utente
    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        valid_link = True
    return render(request, 'users/credentials/user_activation_done.html', {'valid_link': valid_link})


@login_required
def useredit(request):
    user = get_user_model().objects.get(pk=request.user.pk)
    if request.method == 'POST':
        form = UserEditForm(request.POST, request.FILES, instance=user)
        if form.is_valid():
            form.save()
            username = form.cleaned_data['username']
            return redirect('profile', username)
    else:
        form = UserEditForm(instance=user)
    return render(request, 'users/credentials/user_edit_form.html', {'form': form})


@login_required
def profile(request, username):
    user_visited = get_object_or_404(get_user_model(), username=username)
    mine = True
    if request.user != user_visited:  # Vediamo il profilo di un altro, visibilità dati limitata e no modifiche.
        mine = False
        user_visited.email = ''

    context = {'user_visited': user_visited, 'mine': mine}
    return render(request, 'users/profile.html', context=context)
