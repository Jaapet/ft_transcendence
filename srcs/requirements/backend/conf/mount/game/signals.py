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

# ELO
# TODO: Make ELO for Match3
def calculate_pong_elo(winner_elo, loser_elo, k=40, min_elo=0, max_elo=5000):
	# expected_win is the expected probability that the winner won
	expected_win = 1 / (1 + 10 ** ((loser_elo - winner_elo) / 400))
	# expected_lose is the expected probability that the winner lost
	expected_lose = 1 - expected_win

	# 1 means winning, 0 means losing
	new_winner_elo = winner_elo + k * (1 - expected_win)
	new_loser_elo = loser_elo + k * (0 - expected_lose)

	new_winner_elo = min(max(new_winner_elo, min_elo), max_elo)
	new_loser_elo = min(max(new_loser_elo, min_elo), max_elo)

	return new_winner_elo, new_loser_elo

def update_pong_elo(winner, loser):
	winner_elo, loser_elo = calculate_pong_elo(winner.elo_pong, loser.elo_pong)

	with transaction.atomic():
		winner.elo_pong = round(winner_elo)
		loser.elo_pong = round(loser_elo)
		winner.save(update_fields=['elo_pong'])
		loser.save(update_fields=['elo_pong'])

# Updates ELO after a match is saved
@receiver(post_save, sender=Match)
def update_elo_on_match_save(sender, instance, created, **kwargs):
	if created and instance.winner and instance.loser:
		update_pong_elo(instance.winner, instance.loser)