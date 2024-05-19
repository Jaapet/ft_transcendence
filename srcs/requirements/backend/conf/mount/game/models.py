from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin

# The create_user function will be called for each new Member
# the create_superuser is called only for createsuperuser cmd in cli (python manage.py createsuperuser)
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
		# This might be a useless check
		if extra_fields.get('is_superuser') is not True:
			raise ValueError('Superuser must have is_superuser=True.')
		return self._create_user(username, email, True, password, **extra_fields)

# Member objects contain:
# - username	(CharField)
# - email		(EmailField)
# - avatar		(ImageField)
# - join_date	(DateField)
# - is_admin	(booleanField)
# - TODO: Friend list
# - everything else is from AbstractBaseUser
#
# Indexed on:
# - username
# - join_date + username
# - DESC join_date + username
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

	# Required for extending AbstractBaseUser
	USERNAME_FIELD = "username"
	# Username is required by default so no need to repeat it
	REQUIRED_FIELDS = ["email"]

	class Meta:
		verbose_name = "member"
		verbose_name_plural = "members"
		indexes = [
			models.Index(fields=["username"], name="username_idx"),
			models.Index(fields=["join_date", "username"], name="join_date_idx"),
			models.Index(fields=["-join_date", "username"], name="join_date_rev_idx")
		]

	def __str__(self):
		return f"{self.username} ({self.id})"

	@property
	def is_staff(self):
		return self.is_admin

# Match objects contain:
# - winner			(Member Foreign Key)
# - loser			(Member Foreign Key)
# - winner_score	(IntegerField)
# - loser_score		(IntegerField)
# - start_datetime	(DateTimeField)
# - end_datetime	(DateTimeField)
#
# Indexed on:
# - winner
# - loser
# - end_datetime
# TODO: Index on players in either winner or loser
# TODO: Index on end_datetime + players in either winner or loser
class Match(models.Model):
	winner = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='matches_won',
		db_comment="Winner of the match",
		verbose_name="Winner"
	)

	loser = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='matches_lost',
		db_comment="Loser of the match",
		verbose_name="Loser"
	)

	winner_score = models.IntegerField(
		default=0,
		db_comment="Winner's score in the match",
		verbose_name="Winner's score"
	)

	loser_score = models.IntegerField(
		default=0,
		db_comment="Loser's score in the match",
		verbose_name="Loser's score"
	)

	start_datetime = models.DateTimeField(
		auto_now_add=True,
		db_comment="Date and time of the start of the match",
		verbose_name="Start of match"
	)

	end_datetime = models.DateTimeField(
		db_comment="Date and time of the end of the match",
		verbose_name="End of match"
	)

	class Meta:
		verbose_name = "match"
		verbose_name_plural = "matches"
		indexes = [
			models.Index(fields=["winner"], name="winner_idx"),
			models.Index(fields=["loser"], name="loser_idx"),
			models.Index(fields=["end_datetime"], name="date_idx")
		]

	def __str__(self):
		winner_name = "Deleted member"
		loser_name = "Deleted member"
		if (self.winner):
			winner_name = self.winner.username
		if (self.loser):
			loser_name = self.loser.username
		return f"{winner_name} vs {loser_name} ({self.winner_score}-{self.loser_score})"
