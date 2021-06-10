from django.contrib import admin
from .models import Game
from django.urls import reverse
from django.utils.html import format_html
from admin_numeric_filter.admin import NumericFilterModelAdmin
from rangefilter.filters import DateRangeFilter
from django_admin_listfilter_dropdown.filters import ChoiceDropdownFilter


# Register your models here.

@admin.register(Game)
class GameAdmin(NumericFilterModelAdmin, admin.ModelAdmin):
    list_display = ['__str__', 'link_to_white', 'link_to_black', 'time', 'result', 'date']
    search_fields = ['white__username', 'black__username']
    list_filter = (
        ('time', ChoiceDropdownFilter),
        ('date', DateRangeFilter),
        ('result', ChoiceDropdownFilter),
    )
    fields = ('white', 'black', 'time', 'result', 'pgn', 'id', 'date')
    readonly_fields = ('id', 'date')

    def get_rangefilter_date_title(self, request, field_path):
        return 'By date'

    def link_to_white(self, obj):
        link = reverse("admin:users_user_change", args=[obj.white_id])
        return format_html(f'<a href="{link}"> {obj.white}</a>')

    link_to_white.short_description = 'White'
    link_to_white.admin_order_field = 'white'

    def link_to_black(self, obj):
        link = reverse("admin:users_user_change", args=[obj.black_id])
        return format_html(f'<a href="{link}"> {obj.black}</a>')

    link_to_black.short_description = 'Black'
    link_to_black.admin_order_field = 'black'
