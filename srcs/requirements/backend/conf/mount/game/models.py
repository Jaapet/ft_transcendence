from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin

class MemberManager(BaseUserManager):
	use_in_migrations=True

	def _create_user(self, username, email, is_admin, password=None, **extra_fields):
		if not username:
			raise ValueError('Need a username')
		if not email:
			raise ValueError('Need an email address')
		username = username
		email = self.normalize_email(email)
		member = self.model(username=username, email=email, is_admin=is_admin, **extra_fields)
		member.set_password(password)
		member.save(using=self._db)
		return member

	def create_user(self, username, email, password=None, **extra_fields):
		extra_fields.setdefault('is_superuser', False)
		return self._create_user(username, email, False, password, **extra_fields)

	def create_superuser(self, username, email, password=None, **extra_fields):
		extra_fields.setdefault('is_superuser', True)
		if extra_fields.get('is_superuser') is not True:
			raise ValueError('Superuser must have is_superuser=True.')
		return self._create_user(username, email, True, password, **extra_fields)

# TODO: Check out Field.validators
class Member(AbstractBaseUser, PermissionsMixin):
	username = models.CharField(
		max_length=25,
		null=False,
		blank=False,
		unique=True,
		db_comment="Unique display name of a member",
		verbose_name="Username"
	)

	email = models.EmailField(
		max_length=150,
		null=False,
		blank=False,
		unique=True,
		db_comment="Unique valid email adress of a member",
		verbose_name="Email address"
	)

	#TODO: Check if this works
	avatar = models.ImageField(
		upload_to="%Y/%m/%d",
		default="default.png",
		db_comment="Avatar of a member",
		verbose_name="Avatar"
	)

	join_date = models.DateField(
		auto_now_add=True,
		db_comment="Date of registration",
		verbose_name="Join date"
	)

	is_admin = models.BooleanField(
		default=False,
		db_comment="Admin status",
		verbose_name="Admin status"
	)

	objects = MemberManager()

	USERNAME_FIELD = "username"
	REQUIRED_FIELDS = ["email"]

	class Meta:
		verbose_name = "member"
		verbose_name_plural = "members"
		indexes = [
			models.Index(fields=["username"], name="username_idx"),
			models.Index(fields=["join_date", "username"], name="join_date_idx")
		]

	def __str__(self):
		return f"{self.username} ({self.id})"

	@property
	def is_staff(self):
		return self.is_admin

class Match(models.Model):
	player1 = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='matches_as_p1',
		db_comment="First player in a match",
		verbose_name="Player 1"
	)

	player2 = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='matches_as_p2',
		db_comment="Second player in a match",
		verbose_name="Player 2"
	)

	score1 = models.IntegerField(
		default=0,
		db_comment="First player's score in a match",
		verbose_name="Player 1's score"
	)

	score2 = models.IntegerField(
		default=0,
		db_comment="Second player's score in a match",
		verbose_name="Player 2's score"
	)

	start_datetime = models.DateTimeField(
		auto_now_add=True,
		db_comment="Date and time of start of the match",
		verbose_name="Start of match"
	)

	end_datetime = models.DateTimeField(
		db_comment="Date and time of end of the match",
		verbose_name="End of match"
	)

	class Meta:
		verbose_name = "match"
		verbose_name_plural = "matches"
		indexes = [
			models.Index(fields=["player1", "player2"], name="players_idx"),
			models.Index(fields=["end_datetime"], name="date_idx")
		]

	def __str__(self):
		return f"{self.player1.username} vs {self.player2.username} ({self.id})"
