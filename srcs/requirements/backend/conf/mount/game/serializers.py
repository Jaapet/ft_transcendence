from .models import Member, FriendRequest, Match, Match3, MatchR, RoyalPlayer
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django_otp.plugins.otp_totp.models import TOTPDevice

# Checks username and password validity for login
# Logs in directly if 2FA is disabled
# Notifies that 2FA is required otherwise
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
	def validate(self, attrs):
		data = super().validate(attrs)
		user = self.user

		device = TOTPDevice.objects.filter(user=user, confirmed=True).first()

		if device:
			return {'requires_2fa': True, 'user_id': user.id}
		else:
			refresh = self.get_token(self.user)
			data['refresh'] = str(refresh)
			data['access'] = str(refresh.access_token)
			return data

# Limiting sizes of file uploads
# Currently to 10MB
def validate_file_size(file):
	megabytes = 10 # 10MB limit
	max_size = megabytes * 1024 * 1024
	if (file.size > max_size):
		raise serializers.ValidationError(f"File size must be under {megabytes} MB")

# Limiting types of file uploads
# JPEG, PNG, BMP
def validate_file_type(file):
	valid_mime_types = ['image/jpeg', 'image/png', 'image/bmp']
	file_mime_type = file.content_type
	if file_mime_type not in valid_mime_types:
		raise serializers.ValidationError('File type must be JPEG, PNG or BMP')

# Restricted serializer for querying users that are not the current one
class RestrictedMemberSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Member
		fields = [
			'id',
			'username',
			'avatar',
			'join_date',
			'is_admin',
			'elo_pong',
			'elo_royal',
			'is_online'
		]

# Serializes sent data for Member registration
# Checks if avatar is under size limit defined in validate_file_size
# Checks if avatar is a correct image file
# Checks if username and email are unique across DB
# Checks if email is valid
# Hashes password
# Avatar is optional
class RegisterMemberSerializer(serializers.HyperlinkedModelSerializer):
	avatar = serializers.ImageField(required=False, validators=[validate_file_size, validate_file_type])

	def create(self, validated_data):
		avatar = validated_data.pop('avatar', None)
		member = Member.objects.create_user(
			username=validated_data['username'],
			email=validated_data['email'],
			password=validated_data['password']
		)
		if avatar:
			member.avatar = avatar
			member.save()
		return member

	class Meta:
		model = Member
		fields = [
			'url',
			'username',
			'email',
			'password',
			'avatar'
		]

# Serializes sent data for Member update
# Checks if avatar is under size limit defined in validate_file_size
# Checks if avatar is a correct image file
# Checks if username and email are unique across DB
# Checks if email is valid
# Hashes password
# All fields are optional
class UpdateMemberSerializer(serializers.HyperlinkedModelSerializer):
	avatar = serializers.ImageField(required=False, validators=[validate_file_size, validate_file_type])

	def update(self, instance, validated_data):
		avatar = validated_data.pop('avatar', None)
		if avatar:
			instance.avatar = avatar
		password = validated_data.pop('password', None)
		if password:
			instance.set_password(password)
		instance.username = validated_data.get('username', instance.username)
		instance.email = validated_data.get('email', instance.email)
		return super().update(instance, validated_data)

	class Meta:
		model = Member
		fields = [
			'username',
			'password',
			'email',
			'avatar'
		]
		extra_kwargs = {
			'username': {'required': False},
			'password': {'required': False},
			'email': {'required': False},
			'avatar': {'required': False}
		}

class UpdateMemberIngameStatusSerializer(serializers.Serializer):
	user_id = serializers.IntegerField(required=True)
	is_ingame = serializers.BooleanField(required=True)

	def validate_user_id(self, value):
		if not Member.objects.filter(id=value).exists():
			raise serializers.ValidationError("User does not exist.")
		return value

	def update(self, instance, validated_data):
		instance.is_ingame = validated_data.get('is_ingame', instance.is_ingame)
		instance.save()
		return instance

class SendFriendRequestSerializer(serializers.Serializer):
	target_id = serializers.IntegerField()

	def validate_target_id(self, value):
		try:
			target = Member.objects.get(id=value)
		except Member.DoesNotExist:
			raise serializers.ValidationError("Recipient does not exist.")
		return target

class InteractFriendRequestSerializer(serializers.Serializer):
	request_id = serializers.IntegerField()

	def validate_request_id(self, value):
		try:
			friend_request = FriendRequest.objects.get(id=value)
		except FriendRequest.DoesNotExist:
			raise serializers.ValidationError("Friend request does not exist.")
		return friend_request

class RemoveFriendSerializer(serializers.Serializer):
	target_id = serializers.IntegerField()

	def validate_target_id(self, value):
		try:
			target = Member.objects.get(id=value)
		except Member.DoesNotExist:
			raise serializers.ValidationError("This user does not exist.")
		return target

class FriendRequestSerializer(serializers.HyperlinkedModelSerializer):
	sender_username = serializers.SerializerMethodField()
	recipient_username = serializers.SerializerMethodField()
	sender_id = serializers.SerializerMethodField()
	recipient_id = serializers.SerializerMethodField()
	date = serializers.DateTimeField(source='datetime', format='%B %d %Y')
	time = serializers.DateTimeField(source='datetime', format='%H:%M')

	class Meta:
		model = FriendRequest
		fields = [
			'url',
			'id',
			'sender',
			'recipient',
			'datetime',
			'sender_username',
			'recipient_username',
			'sender_id',
			'recipient_id',
			'date',
			'time'
		]

	def get_sender_username(self, obj):
		return obj.sender.username if obj.sender else 'Deleted user'

	def get_recipient_username(self, obj):
		return obj.recipient.username if obj.recipient else 'Deleted user'

	def get_sender_id(self, obj):
		return obj.sender.id if obj.sender else None

	def get_recipient_id(self, obj):
		return obj.recipient.id if obj.recipient else None

class MatchSerializer(serializers.HyperlinkedModelSerializer):
	winner_username = serializers.SerializerMethodField()
	loser_username = serializers.SerializerMethodField()
	winner_id = serializers.SerializerMethodField()
	loser_id = serializers.SerializerMethodField()
	start_date = serializers.DateTimeField(source='start_datetime', format='%B %d %Y')
	end_date = serializers.DateTimeField(source='end_datetime', format='%B %d %Y')
	start_time = serializers.DateTimeField(source='start_datetime', format='%H:%M')
	end_time = serializers.DateTimeField(source='end_datetime', format='%H:%M')

	class Meta:
		model = Match
		fields = [
			'url',
			'id',
			'type',
			'winner',
			'loser',
			'winner_score',
			'loser_score',
			'start_date',
			'end_date',
			'start_time',
			'end_time',
			'winner_username',
			'loser_username',
			'winner_id',
			'loser_id'
		]

	def get_winner_username(self, obj):
		return obj.winner.username if obj.winner else 'Deleted user'

	def get_loser_username(self, obj):
		return obj.loser.username if obj.loser else 'Deleted user'

	def get_winner_id(self, obj):
		return obj.winner.id if obj.winner else None

	def get_loser_id(self, obj):
		return obj.loser.id if obj.loser else None

class RegisterMatchSerializer(serializers.ModelSerializer):
	winner_id = serializers.IntegerField(write_only=True)
	loser_id = serializers.IntegerField(write_only=True)

	class Meta:
		model = Match
		fields = [
			'type',
			'winner_id',
			'loser_id',
			'winner_score',
			'loser_score',
			'start_datetime',
			'end_datetime'
		]

	def create(self, validated_data):
		winner_id = validated_data.pop('winner_id', None)
		loser_id = validated_data.pop('loser_id', None)

		winner = None
		loser = None

		if winner_id:
			try:
				winner = Member.objects.get(id=winner_id)
			except Member.DoesNotExist:
				pass

		if loser_id:
			try:
				loser = Member.objects.get(id=loser_id)
			except Member.DoesNotExist:
				pass

		match = Match.objects.create(winner=winner, loser=loser, **validated_data)
		return match

class Match3Serializer(serializers.HyperlinkedModelSerializer):
	paddle1_username = serializers.SerializerMethodField()
	paddle2_username = serializers.SerializerMethodField()
	ball_username = serializers.SerializerMethodField()
	paddle1_id = serializers.SerializerMethodField()
	paddle2_id = serializers.SerializerMethodField()
	ball_id = serializers.SerializerMethodField()
	start_date = serializers.DateTimeField(source='start_datetime', format='%B %d %Y')
	end_date = serializers.DateTimeField(source='end_datetime', format='%B %d %Y')
	start_time = serializers.DateTimeField(source='start_datetime', format='%H:%M')
	end_time = serializers.DateTimeField(source='end_datetime', format='%H:%M')

	class Meta:
		model = Match3
		fields = [
			'url',
			'id',
			'type',
			'paddle1',
			'paddle2',
			'ball',
			'ball_won',
			'start_date',
			'end_date',
			'start_time',
			'end_time',
			'paddle1_username',
			'paddle2_username',
			'ball_username',
			'paddle1_id',
			'paddle2_id',
			'ball_id'
		]

	def get_paddle1_username(self, obj):
		return obj.paddle1.username if obj.paddle1 else 'Deleted user'

	def get_paddle2_username(self, obj):
		return obj.paddle2.username if obj.paddle2 else 'Deleted user'

	def get_ball_username(self, obj):
		return obj.ball.username if obj.ball else 'Deleted user'

	def get_paddle1_id(self, obj):
		return obj.paddle1.id if obj.paddle1 else None

	def get_paddle2_id(self, obj):
		return obj.paddle2.id if obj.paddle2 else None

	def get_ball_id(self, obj):
		return obj.ball.id if obj.ball else None

class MatchRSerializer(serializers.HyperlinkedModelSerializer):
	players = serializers.SerializerMethodField()
	start_date = serializers.DateTimeField(source='start_datetime', format='%B %d %Y')
	end_date = serializers.DateTimeField(source='end_datetime', format='%B %d %Y')
	start_time = serializers.DateTimeField(source='start_datetime', format='%H:%M')
	end_time = serializers.DateTimeField(source='end_datetime', format='%H:%M')

	class Meta:
		model = MatchR
		fields = [
			'url',
			'id',
			'type',
			'players',
			'start_date',
			'end_date',
			'start_time',
			'end_time'
		]

	def get_players(self, obj):
		players = RoyalPlayer.objects.filter(match=obj).select_related('member').order_by('position')
		return [
			{
				'username': player.member.username if player.member else 'Deleted user',
				'id': player.member.id if player.member else None,
				'position': player.position
			}
			for player in players
		]
