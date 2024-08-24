from django.db import models, transaction
from django.utils import timezone
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator

# The create_user function will be called for each new Member
# the create_superuser is called only for createsuperuser cmd in cli (python manage.py createsuperuser)
class MemberManager(BaseUserManager):
	use_in_migrations=True

	def _create_user(self, username, email, is_admin, password=None, **extra_fields):
		try:
			if not username:
				raise ValueError('Need a username')
			if not email:
				raise ValueError('Need an email address')
			email = self.normalize_email(email)
			with transaction.atomic():
				member = self.model(username=username, email=email, is_admin=is_admin, **extra_fields)
				member.set_password(password)
				member.save(using=self._db)
			return member
		except Exception as e:
			raise ValueError(str(e))

	def create_user(self, username, email, password=None, **extra_fields):
		extra_fields.setdefault('is_superuser', False)
		return self._create_user(username, email, False, password, **extra_fields)

	def create_superuser(self, username, email, password=None, **extra_fields):
		extra_fields.setdefault('is_superuser', True)
		# This might be a useless check
		if extra_fields.get('is_superuser') is not True:
			raise ValueError('Failed to create super user: Super user must have is_superuser=True.')
		return self._create_user(username, email, True, password, **extra_fields)

	def get_online_users(self):
		return self.filter(last_activity__gte=timezone.now() - timezone.timedelta(minutes=5))

	def get_ingame_users(self):
		return self.filter(is_ingame=True)

# Member objects contain:
# - username			(CharField)
# - email					(EmailField)
# - avatar				(ImageField)
# - join_date			(DateField)
# - is_admin			(BooleanField)
# - last_activity	(DateTimeField)
# - friends				(ManyToManyField Member)
# - elo_pong			(IntegerField)
# - everything else is from AbstractBaseUser
#
# From Match objects:
# - pong2_matches_lost
# - pong2_matches_won
#
# From Match3 objects:
# - pong3_matches_as_paddle1
# - pong3_matches_as_paddle2
# - pong3_matches_as_ball
#
# Indexed on:
# - username
# - last_activity
# - join_date + username
# - DESC join_date + username
# - elo_pong
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

	qr_2fa = models.CharField(
		max_length=255,
		null=True,
		blank=False,
		db_comment="Filepath of 2FA QR code of a member",
		verbose_name="2FA QR filepath"
	)

	is_admin = models.BooleanField(
		default=False,
		db_comment="Admin status",
		verbose_name="Admin status"
	)

	is_ingame = models.BooleanField(
		default=False,
		db_comment="In-Game status",
		verbose_name="In-Game status"
	)

	last_activity = models.DateTimeField(
		null=True,
		blank=True,
		verbose_name="Last Activity"
	)

	friends = models.ManyToManyField(
		"Member",
		blank=True,
		symmetrical=True,
		verbose_name="Friends list"
	)

	elo_pong = models.IntegerField(
		default=1000,
		null=False,
		blank=False,
		db_comment="ELO rating for the pong game",
		verbose_name="Pong ELO rating"
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
			models.Index(fields=["username"], name="member_username_idx"),
			models.Index(fields=["last_activity"], name="member_last_activity_idx"),
			models.Index(fields=["join_date", "username"], name="member_join_date_idx"),
			models.Index(fields=["-join_date", "username"], name="member_join_date_rev_idx"),
			models.Index(fields=["elo_pong"], name="member_elo_pong_idx")
		]

	def __str__(self):
		return f"{self.username} ({self.id})"

	@property
	def is_staff(self):
		return self.is_admin

	@property
	def is_online(self):
		if self.is_ingame:
			return "ingame"
		# Right now - 5 minutes
		threshold = timezone.now() - timezone.timedelta(minutes=5)
		if (self.last_activity and self.last_activity >= threshold):
			return "online"
		return "offline"

	def update_last_activity(self):
		self.last_activity = timezone.now()
		self.save(update_fields=['last_activity'])

	def send_friend_request(self, target):
		try:
			if (target in self.friends.all()):
				raise ValueError("This user is already your friend.")
			if (self == target):
				raise ValueError("You can't add yourself as a friend.")
			if (FriendRequest.objects.filter(sender=self, recipient=target).exists()):
				raise ValueError("You already sent a friend request to this user.")
			if (FriendRequest.objects.filter(sender=target, recipient=self).exists()):
				raise ValueError("This user already sent you a friend request.")
			with transaction.atomic():
				friend_request = FriendRequest(sender=self, recipient=target)
				friend_request.save()
			return friend_request
		except Exception as e:
			raise ValueError(str(e))

	def delete_friend_request(self, friend_request):
		try:
			if (friend_request.sender != self):
				raise ValueError("This friend request was not made by you!")
			friend_request.delete()
		except Exception as e:
			raise ValueError(str(e))

	def accept_friend_request(self, friend_request):
		try:
			if (friend_request.recipient != self):
				raise ValueError("This friend request is not for you!")
			with transaction.atomic():
				self.friends.add(friend_request.sender)
				friend_request.sender.friends.add(self)
				friend_request.delete()
		except Exception as e:
			raise ValueError(str(e))

	def decline_friend_request(self, friend_request):
		try:
			if (friend_request.recipient != self):
				raise ValueError("This friend request is not for you!")
			friend_request.delete()
		except Exception as e:
			raise ValueError(str(e))

	def remove_friend(self, target):
		try:
			if (target not in self.friends.all()):
				raise ValueError("This user is not your friend.")
			if (self == target):
				raise ValueError("You can't remove yourself as a friend.")
			with transaction.atomic():
				self.friends.remove(target)
				target.friends.remove(self)
		except Exception as e:
			raise ValueError(str(e))

# FriendRequest objects contain:
# - sender		(Member ForeignKey)
# - recipient	(Member ForeignKey)
# - datetime	(DateTimeField)
#
# Indexed on:
# - datetime
# - sender
# - recipient
class FriendRequest(models.Model):
	sender = models.ForeignKey(
		Member,
		null=False,
		blank=False,
		related_name="sender",
		on_delete=models.CASCADE,
		db_comment="Sender",
		verbose_name="Friend request sender"
	)

	recipient = models.ForeignKey(
		Member,
		null=False,
		blank=False,
		related_name="recipient",
		on_delete=models.CASCADE,
		db_comment="Recipient",
		verbose_name="Friend request recipient"
	)

	datetime = models.DateTimeField(
		auto_now_add=True,
		db_comment="Date and time of the creation of the friend request",
		verbose_name="Date and time of friend request"
	)

	class Meta:
		verbose_name = "friend request"
		verbose_name_plural = "friend requests"
		indexes = [
			models.Index(fields=["datetime"], name="friend_request_date_idx"),
			models.Index(fields=["sender"], name="friend_request_sender_idx"),
			models.Index(fields=["recipient"], name="friend_request_recipient_idx")
		]

	def __str__(self):
		return f"{self.sender.username} invited {self.recipient.username} ({self.datetime})"

# Match objects contain:
# - type						(CharField)
# - winner					(Member Foreign Key)
# - loser						(Member Foreign Key)
# - winner_score		(IntegerField)
# - loser_score			(IntegerField)
# - start_datetime	(DateTimeField)
# - end_datetime		(DateTimeField)
#
# Indexed on:
# - winner
# - loser
# - end_datetime
class Match(models.Model):
	type = models.CharField(
		null=False,
		blank=False,
		default='pong2',
		db_comment="Type of the game",
		verbose_name="Game Type"
	)

	winner = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='pong2_matches_won',
		db_comment="Winner of the match",
		verbose_name="Winner"
	)

	loser = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='pong2_matches_lost',
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
		verbose_name = "pong2 match"
		verbose_name_plural = "pong2 matches"
		indexes = [
			models.Index(fields=["winner"], name="pong2_match_winner_idx"),
			models.Index(fields=["loser"], name="pong2_match_loser_idx"),
			models.Index(fields=["end_datetime"], name="pong2_match_date_idx")
		]

	def __str__(self):
		winner_name = "Deleted member"
		loser_name = "Deleted member"
		if (self.winner):
			winner_name = self.winner.username
		if (self.loser):
			loser_name = self.loser.username
		return f"{winner_name} vs {loser_name} ({self.winner_score}-{self.loser_score})"

# Match3 objects contain:
# - type						(CharField)
# - paddle1					(Member Foreign Key)
# - paddle2					(Member Foreign Key)
# - ball						(Member Foreign Key)
# - ball_won				(BooleanField)
# - start_datetime	(DateTimeField)
# - end_datetime		(DateTimeField)
#
# Indexed on:
# - ball_won
# - end_datetime
class Match3(models.Model):
	type = models.CharField(
		null=False,
		blank=False,
		default='pong3',
		db_comment="Type of the game",
		verbose_name="Game Type"
	)

	paddle1 = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='pong3_matches_as_paddle1',
		db_comment="First paddle in the match",
		verbose_name="Paddle 1"
	)

	paddle2 = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='pong3_matches_as_paddle2',
		db_comment="Second paddle in the match",
		verbose_name="Paddle 2"
	)

	ball = models.ForeignKey(
		Member,
		null=True,
		on_delete=models.SET_NULL,
		related_name='pong3_matches_as_ball',
		db_comment="The ball in the match",
		verbose_name="Ball"
	)

	ball_won = models.BooleanField(
		default=False,
		db_comment="Whether the ball won the match",
		verbose_name="Ball Won"
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
		verbose_name = "pong3 match"
		verbose_name_plural = "pong3 matches"
		indexes = [
			models.Index(fields=["ball_won"], name="pong3_match_ball_won_idx"),
			models.Index(fields=["end_datetime"], name="pong3_match_date_idx")
		]

	def __str__(self):
		paddle1_name = "Deleted member"
		paddle2_name = "Deleted member"
		ball_name = "Deleted member"
		result = "paddles won"
		if (self.paddle1):
			paddle1_name = self.paddle1.username
		if (self.paddle2):
			paddle2_name = self.paddle2.username
		if (self.ball):
			ball_name = self.ball.username
		if (self.ball_won == True):
			result = "ball won"
		return f"{paddle1_name} & {paddle2_name} vs {ball_name} ({result})"
