from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from django.db import models, transaction
from .models import Match, Match3, MatchR, Member, RoyalPlayer

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

@receiver(pre_delete, sender=Member)
def delete_matchr_if_all_players_deleted(sender, instance, **kwargs):
	# Retrieve all matches that user participated in
	plays = RoyalPlayer.objects.filter(models.Q(member=instance))
	for play in plays:
		match = play.match
		# Retrieve all players associated with the match except the one being deleted
		players = RoyalPlayer.objects.filter(match=match).exclude(member=instance)
		# Check if all other players in the match are deleted
		if players.exists() and not players.filter(member__isnull=False).exists():
			# If all other players are deleted, delete the match
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
	winner_elo, loser_elo = calculate_pong_elo(winner.elo_pong, loser.elo_pong)

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
	# TODO: Adjust this if winning as the ball is not as hard as expected
	new_ball_elo = ball_elo + k * ((1.1 if ball_won else 0.1) - expected_ball_win)
	new_paddle1_elo = paddle1_elo + k * ((-0.1 if ball_won else 0.9) - expected_paddles_win)
	new_paddle2_elo = paddle2_elo + k * ((-0.1 if ball_won else 0.9) - expected_paddles_win)

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

# MatchR / Royal

def calculate_royal_player_elo_part(player, rival, k):
	# expected probability that the player won
	expected_player_win = 1 / (1 + 10 ** ((rival['elo'] - player['elo']) / 400))

	# 1 means winning, 0 means losing
	player_elo_change = k * ((1 if player['pos'] < rival['pos'] else 0) - expected_player_win)

	return player_elo_change

def calculate_royal_player_elo(player, players, k, min_elo=0, max_elo=5000):
	elo = player['elo']
	pos = player['pos']

	for rival in players:
		if rival != player:
			elo += calculate_royal_player_elo_part(player, rival, k)

	elo = min(max(elo, min_elo), max_elo)
	return elo

def calculate_royal_elo(players):
	k = len(players) * 2.5
	print("K:", k) # debug

	new_players_elo = []
	for player in players:
		new_players_elo.append(calculate_royal_player_elo(player, players, k))

	return new_players_elo

def get_average_royal_match_elo(players):
	total_elo = 0
	count = 0
	for player in players:
		if player.member:
			total_elo += player.member.elo_royal
			count += 1
	return total_elo / count if count > 0 else 1000

def update_royal_elo(players):
	average_elo = get_average_royal_match_elo(players)
	print("Average ELO:", average_elo) # debug

	players_trunc = []

	for player in players:
		if player.member:
			players_trunc.append({ "elo": player.member.elo_royal, "pos": player.position })
		else:
			players_trunc.append({ "elo": average_elo, "pos": player.position })

	new_players_elo = calculate_royal_elo(players_trunc)

	for i, player in enumerate(players):
		if player.member and i < len(new_players_elo):
			with transaction.atomic():
				player.member.elo_royal = round(new_players_elo[i])
				player.member.save(update_fields=['elo_royal'])

@receiver(post_save, sender=MatchR)
def update_elo_on_royal_match_save(sender, instance, created, **kwargs):
	print("Match:", instance) # debug
	print("Created:", created) # debug
	print("Players:", instance.players.all()) # debug
	if instance.players.exists():
		update_royal_elo(instance.players.all())
