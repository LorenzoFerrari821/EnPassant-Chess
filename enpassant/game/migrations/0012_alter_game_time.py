# Generated by Django 3.2 on 2021-05-13 19:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0011_alter_game_time'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='time',
            field=models.CharField(choices=[('3|0', '3 min'), ('5|0', '5 min'), ('10|0', '10 min'), ('30|0', '30 min'), ('3|1', '3 min increment 1'), ('3|2', '3 min increment 2')], default='10|0', max_length=4),
        ),
    ]