from .models import Member, Match
from rest_framework import viewsets, permissions
from rest_framework.generics import RetrieveAPIView, CreateAPIView
from .serializers import MemberSerializer, RegisterMemberSerializer, MatchSerializer

# Queries all members ordered by username
# Requires authentication
class MemberViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MemberSerializer
	queryset = Member.objects.all().order_by('username')

# Queries one member
# Used for authentication
class MemberAPIView(RetrieveAPIView):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MemberSerializer

	def get_object(self):
		return self.request.user

# Creates one member
# Used for registration
class RegisterMemberAPIView(CreateAPIView):
	permission_classes = [permissions.AllowAny]
	serializer_class = RegisterMemberSerializer

# Queries all matches ordered by most recently finished
# Requires authentication
class MatchViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MatchSerializer
	queryset = Match.objects.all().select_related("player1", "player2").order_by('-end_datetime')
