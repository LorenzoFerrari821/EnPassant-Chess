from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

from admin_numeric_filter.admin import NumericFilterModelAdmin, RangeNumericFilter
from django_admin_listfilter_dropdown.filters import ChoiceDropdownFilter
from django.utils.html import format_html
from rangefilter.filters import DateRangeFilter


# Register your models here.
@admin.register(User)
class CustomUserAdmin(NumericFilterModelAdmin, UserAdmin):
    list_display = ['username', 'email', 'country_custom', 'elo', 'games_played', 'last_login', 'is_active', 'is_staff']
    search_fields = ['username', 'email']
    list_filter = (
        ('country', ChoiceDropdownFilter),  # Menù a tendina
        ('elo', RangeNumericFilter),  # Range search
        ('games_played', RangeNumericFilter),  # Range search
        ('last_login', DateRangeFilter),
        'is_active',
    )

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('email', 'country', 'first_name', 'last_name', 'picture')}),
        ('Game Statistics', {'fields': ('elo', 'games_played')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Permissions',
         {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'), 'classes': ['collapse']}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'country'),
        }),
    )

    add_form_template = 'admin/add_form.html'

    def country_custom(self, obj):
        return format_html(f'{obj.country.name} <img src="{obj.country.flag}">')

    country_custom.admin_order_field = 'country'
    country_custom.short_description = 'Country'

    # Imposta il titolo custom per il filtro data
    def get_rangefilter_last_login_title(self, request, field_path):
        return 'By last login'
