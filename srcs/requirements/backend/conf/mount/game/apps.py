from django.apps import AppConfig

class UsersConfig(AppConfig):
	default_auto_field = 'django.db.models.BigAutoField'
	name = 'game'

	def ready(self):
		import game.signals
		from .models import Member
		Member.objects.all().update(is_ingame=False)