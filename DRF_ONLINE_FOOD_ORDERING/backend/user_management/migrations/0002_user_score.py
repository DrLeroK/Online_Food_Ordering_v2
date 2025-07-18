# Generated by Django 4.2.19 on 2025-06-21 07:34

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user_management', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='score',
            field=models.PositiveIntegerField(default=0, help_text='Points accumulated from orders', validators=[django.core.validators.MinValueValidator(0)], verbose_name='loyalty score'),
        ),
    ]
