# Generated by Django 4.2.13 on 2024-06-17 16:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0014_alter_match_options_alter_match3_options'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='member',
            index=models.Index(fields=['elo_pong'], name='member_elo_pong_idx'),
        ),
    ]
