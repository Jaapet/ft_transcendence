from game.views import Member, Match
from rest_framework import serializers

# Declaring the fields I want by hand to avoid problems with
# permission-detail and lookup_field
class MemberSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Member
		fields = ('url', 'id', 'username', 'password', 'email', 'avatar', 'join_date', 'is_superuser', 'is_admin')

class RegisterMemberSerializer(serializers.HyperlinkedModelSerializer):
	avatar = serializers.ImageField(required=False)
	
	def create(self, validated_data):
		avatar_data = validated_data.pop('avatar', None)
		member = Member.objects.create_user(
			username=validated_data['username'],
			email=validated_data['email'],
			password=validated_data['password']
		)
		if avatar_data:
			member.avatar = avatar_data
			member.save()
		return member

	class Meta:
		model = Member
		fields = ('url', 'username', 'email', 'password', 'avatar')

# This one is fine
class MatchSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Match
		fields = '__all__'