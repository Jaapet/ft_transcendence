from django.apps import AppConfig, apps
from django.core.exceptions import ImproperlyConfigured

class UsersConfig(AppConfig):
	default_auto_field = 'django.db.models.BigAutoField'
	name = 'game'

	def ready(self):
		try:
			Member = apps.get_model('game', 'Member')
			Member.objects.all().update(is_ingame=False)
		except LookupError:
			print("Member model does not yet exist")
		except ImproperlyConfigured as e:
			print(f"ImproperlyConfigured: {e}")