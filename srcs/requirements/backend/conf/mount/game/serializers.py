from game.views import Member, Match
from rest_framework import serializers

# Limiting sizes of file uploads
# Currently to 10MB
def validate_file_size(file):
	megabytes = 10 # 10MB limit
	max_size = megabytes * 1024 * 1024
	if (file.size > max_size):
		raise serializers.ValidationError(f"File size must be under {megabytes} MB")

# Declaring the fields I want by hand to avoid problems with
# permission-detail and lookup_field
class MemberSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Member
		fields = ('url', 'id', 'username', 'password', 'email', 'avatar', 'join_date', 'is_superuser', 'is_admin')

# Serializes sent data for Member registration
# Checks if avatar is under size limit defined in validate_file_size
# Checks if avatar is a correct image file
# Checks if username and email are unique across DB
# Checks if email is valid
# Hashes password
# Avatar is optional
class RegisterMemberSerializer(serializers.HyperlinkedModelSerializer):
	avatar = serializers.ImageField(required=False, validators=[validate_file_size])
	
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
		fields = ('url', 'username', 'email', 'password', 'avatar')

class MatchSerializer(serializers.HyperlinkedModelSerializer):
	winner_username = serializers.SerializerMethodField()
	loser_username = serializers.SerializerMethodField()
	start_date = serializers.DateTimeField(source='start_datetime', format='%B %d %Y')
	end_date = serializers.DateTimeField(source='end_datetime', format='%B %d %Y')
	start_time = serializers.DateTimeField(source='start_datetime', format='%H:%M')
	end_time = serializers.DateTimeField(source='end_datetime', format='%H:%M')

	class Meta:
		model = Match
		fields = [
			'url',
			'id',
			'winner',
			'loser',
			'winner_score',
			'loser_score',
			'start_date',
			'end_date',
			'start_time',
			'end_time',
			'winner_username',
			'loser_username'
		]
	
	def get_winner_username(self, obj):
		return obj.winner.username if obj.winner else 'Deleted user'
	
	def get_loser_username(self, obj):
		return obj.loser.username if obj.loser else 'Deleted user'
