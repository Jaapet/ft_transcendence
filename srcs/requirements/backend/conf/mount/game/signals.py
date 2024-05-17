from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.db import models
from .models import Match, Member

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