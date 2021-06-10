from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.SignUpView.as_view(), name="signup_view"),
    path('login-token/', views.LoginView.as_view(), name="token_login"), #Fornisce un token quando riceve un username e password validi in POST
    path('<username>/', views.ProfileView.as_view())
]




'''

urlpatterns = [

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
    path('edit/', views.useredit, name='user_edit'),
]
'''
