from django.urls import path
from . import views
from django.contrib.auth.views import LogoutView, PasswordResetDoneView, PasswordChangeDoneView, PasswordResetView, \
    PasswordChangeView, PasswordResetCompleteView, PasswordResetConfirmView, LoginView
from .forms import CustomAuthenticationForm

urlpatterns = [
    # Passo un form custom per sbloccare la possibilità di mostrare un messaggio se l'utente è disattivato
    path('login/', LoginView.as_view(template_name='users/credentials/login.html', form_class=CustomAuthenticationForm),
         name='login'),

    path('logout/', LogoutView.as_view(), name='logout'),
    path('password_change/',
         PasswordChangeView.as_view(template_name='users/credentials/user_password_change_form.html'),
         name='password_change'),
    path('password_change/done/',
         PasswordChangeDoneView.as_view(template_name='users/credentials/user_password_change_done.html'),
         name='password_change_done'),
    path('password_reset/', PasswordResetView.as_view(template_name='users/credentials/password_reset_form.html'),
         name='password_reset'),
    path('password_reset/done/',
         PasswordResetDoneView.as_view(template_name='users/credentials/password_reset_done.html'),
         name='password_reset_done'),
    path('reset/<uidb64>/<token>/',
         PasswordResetConfirmView.as_view(template_name='users/credentials/password_reset_confirm.html'),
         name='password_reset_confirm'),
    path('reset/done/',
         PasswordResetCompleteView.as_view(template_name='users/credentials/password_reset_complete.html'),
         name='password_reset_complete'),
    path('signup/', views.signup, name='signup'),
    path('activate/<uidb64>/<token>/', views.activate, name='activate'),
    path('edit/', views.useredit, name='user_edit'),

    path('<username>/', views.profile, name='profile')
]
