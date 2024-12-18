# Generated by Django 4.2.13 on 2024-06-16 17:31

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0012_alter_member_elo_pong'),
    ]

    operations = [
        migrations.CreateModel(
            name='Match3',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(db_comment='Type of the game', default='pong3', verbose_name='Game Type')),
                ('ball_won', models.BooleanField(db_comment='Whether the ball won the match', default=False, verbose_name='Ball Won')),
                ('start_datetime', models.DateTimeField(auto_now_add=True, db_comment='Date and time of the start of the match', verbose_name='Start of match')),
                ('end_datetime', models.DateTimeField(db_comment='Date and time of the end of the match', verbose_name='End of match')),
            ],
            options={
                'verbose_name': 'match',
                'verbose_name_plural': 'matches',
            },
        ),
        migrations.RenameIndex(
            model_name='match',
            new_name='pong2_match_winner_idx',
            old_name='match_winner_idx',
        ),
        migrations.RenameIndex(
            model_name='match',
            new_name='pong2_match_loser_idx',
            old_name='match_loser_idx',
        ),
        migrations.RenameIndex(
            model_name='match',
            new_name='pong2_match_date_idx',
            old_name='match_date_idx',
        ),
        migrations.AddField(
            model_name='match',
            name='type',
            field=models.CharField(db_comment='Type of the game', default='pong2', verbose_name='Game Type'),
        ),
        migrations.AlterField(
            model_name='match',
            name='loser',
            field=models.ForeignKey(db_comment='Loser of the match', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pong2_matches_lost', to=settings.AUTH_USER_MODEL, verbose_name='Loser'),
        ),
        migrations.AlterField(
            model_name='match',
            name='winner',
            field=models.ForeignKey(db_comment='Winner of the match', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pong2_matches_won', to=settings.AUTH_USER_MODEL, verbose_name='Winner'),
        ),
        migrations.AddField(
            model_name='match3',
            name='ball',
            field=models.ForeignKey(db_comment='The ball in the match', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pong3_matches_as_ball', to=settings.AUTH_USER_MODEL, verbose_name='Ball'),
        ),
        migrations.AddField(
            model_name='match3',
            name='paddle1',
            field=models.ForeignKey(db_comment='First paddle in the match', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pong3_matches_as_paddle1', to=settings.AUTH_USER_MODEL, verbose_name='Paddle 1'),
        ),
        migrations.AddField(
            model_name='match3',
            name='paddle2',
            field=models.ForeignKey(db_comment='Second paddle in the match', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pong3_matches_as_paddle2', to=settings.AUTH_USER_MODEL, verbose_name='Paddle 2'),
        ),
        migrations.AddIndex(
            model_name='match3',
            index=models.Index(fields=['ball_won'], name='pong3_match_ball_won_idx'),
        ),
        migrations.AddIndex(
            model_name='match3',
            index=models.Index(fields=['end_datetime'], name='pong3_match_date_idx'),
        ),
    ]
