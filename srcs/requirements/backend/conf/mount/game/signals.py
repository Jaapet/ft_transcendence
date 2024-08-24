from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from django.db import models, transaction
from .models import Match, Match3, Member

# Deletes any match that has both winner and loser as null, so deleted users
@receiver(pre_delete, sender=Member)
def delete_match_if_both_players_deleted(sender, instance, **kwargs):
	# Check if the soon-to-be deleted member was a player in any matches
	matches_with_soon_to_be_deleted_player = Match.objects.filter(
		models.Q(winner=instance) | models.Q(loser=instance)
	)
	for match in matches_with_soon_to_be_deleted_player:
		if ((match.winner == instance and match.loser == None)
			or (match.loser == instance and match.winner == None)):
			match.delete()

# Deletes any match3 that has all players as null, so deleted users
@receiver(pre_delete, sender=Member)
def delete_match3_if_all_players_deleted(sender, instance, **kwargs):
	# Check if the soon-to-be deleted member was a player in any matches
	matches_with_soon_to_be_deleted_player = Match3.objects.filter(
		models.Q(paddle1=instance) | models.Q(paddle2=instance) | models.Q(ball=instance)
	)
	for match in matches_with_soon_to_be_deleted_player:
		if ((match.paddle1 == instance and match.paddle2 == None and match.ball == None)
			or (match.paddle2 == instance and match.paddle1 == None and match.ball == None)
			or (match.ball == instance and match.paddle1 == None and match.paddle2 == None)):
			match.delete()

### ELO

# Match / Pong2 / 1v1

def calculate_pong2_elo(winner_elo, loser_elo, k=40, min_elo=0, max_elo=5000):
	# expected probability that the winner won
	expected_winner_win = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
	# expected probability that the loser won
	expected_loser_win = 1 - expected_winner_win

	# 1 means winning, 0 means losing
	new_winner_elo = winner_elo + k * (1 - expected_winner_win)
	new_loser_elo = loser_elo + k * (0 - expected_loser_win)

	new_winner_elo = min(max(new_winner_elo, min_elo), max_elo)
	new_loser_elo = min(max(new_loser_elo, min_elo), max_elo)

	return new_winner_elo, new_loser_elo

def update_pong2_elo(winner, loser):
	winner_elo, loser_elo = calculate_pong2_elo(winner.elo_pong, loser.elo_pong)

	with transaction.atomic():
		winner.elo_pong = round(winner_elo)
		loser.elo_pong = round(loser_elo)
		winner.save(update_fields=['elo_pong'])
		loser.save(update_fields=['elo_pong'])

# Updates ELO after a match is saved
@receiver(post_save, sender=Match)
def update_elo_on_pong2_match_save(sender, instance, created, **kwargs):
	if created and instance.winner and instance.loser:
		update_pong2_elo(instance.winner, instance.loser)

# Match3 / Pong3 / 1v2

def calculate_pong3_elo(paddle1_elo, paddle2_elo, ball_elo, ball_won, k=40, min_elo=0, max_elo=5000):
	combined_paddles_elo = (paddle1_elo + paddle2_elo) / 2

	# expected probability that the ball won
	expected_ball_win = 1 / (1 + 10 ** ((combined_paddles_elo - ball_elo) / 400))
	# expected probability that the paddles won
	expected_paddles_win = 1 - expected_ball_win

	# 1 means winning, 0 means losing
	# Weighted cause winning as the ball is assumed to be harder
	new_ball_elo = ball_elo + k * ((1 if ball_won else 0) - expected_ball_win)
	new_paddle1_elo = paddle1_elo + k * ((0 if ball_won else 1) - expected_paddles_win)
	new_paddle2_elo = paddle2_elo + k * ((0 if ball_won else 1) - expected_paddles_win)

	new_ball_elo = min(max(new_ball_elo, min_elo), max_elo)
	new_paddle1_elo = min(max(new_paddle1_elo, min_elo), max_elo)
	new_paddle2_elo = min(max(new_paddle2_elo, min_elo), max_elo)

	return new_paddle1_elo, new_paddle2_elo, new_ball_elo

def update_pong3_elo(paddle1, paddle2, ball, ball_won):
	paddle1_elo, paddle2_elo, ball_elo = calculate_pong3_elo(
		paddle1.elo_pong, paddle2.elo_pong, ball.elo_pong, ball_won)

	with transaction.atomic():
		paddle1.elo_pong = round(paddle1_elo)
		paddle2.elo_pong = round(paddle2_elo)
		ball.elo_pong = round(ball_elo)
		paddle1.save(update_fields=['elo_pong'])
		paddle2.save(update_fields=['elo_pong'])
		ball.save(update_fields=['elo_pong'])

@receiver(post_save, sender=Match3)
def update_elo_on_pong3_match_save(sender, instance, created, **kwargs):
	if created and instance.paddle1 and instance.paddle2 and instance.ball:
		update_pong3_elo(instance.paddle1, instance.paddle2, instance.ball, instance.ball_won)
