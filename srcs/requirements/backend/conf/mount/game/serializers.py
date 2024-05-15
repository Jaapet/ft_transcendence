from game.views import Member, Match
from rest_framework import serializers

# Declaring the fields I want by hand to avoid problems with
# permission-detail and lookup_field
class MemberSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Member
		fields = ('url', 'id', 'username', 'password', 'email', 'avatar', 'join_date', 'is_superuser', 'is_admin')

# This one is fine
class MatchSerializer(serializers.HyperlinkedModelSerializer):
	class Meta:
		model = Match
		fields = '__all__'