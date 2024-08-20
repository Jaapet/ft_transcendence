from django.apps import AppConfig, apps
from django.db import connection
from django.db.utils import OperationalError

class UsersConfig(AppConfig):
	default_auto_field = 'django.db.models.BigAutoField'
	name = 'game'

	def ready(self):
		try:
			# Check if 'game_member' table exists in DB
			with connection.cursor() as cursor:
				cursor.execute("""
					SELECT EXISTS (
						SELECT 1
						FROM information_schema.tables
						WHERE table_name = 'game_member'
					);
				""")
				table_exists = cursor.fetchone()[0]
			if table_exists:
				Member = apps.get_model('game', 'Member')
				Member.objects.all().update(is_ingame=False)
			else:
				print("Member model does not yet exist")
		except OperationalError as e:
			print(f"Database error: {e}")