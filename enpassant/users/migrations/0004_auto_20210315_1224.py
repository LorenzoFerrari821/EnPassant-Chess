# Generated by Django 3.1.7 on 2021-03-15 11:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_auto_20210315_1222'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='elo',
            field=models.PositiveSmallIntegerField(default=1000, editable=False, verbose_name='ELO'),
        ),
    ]
