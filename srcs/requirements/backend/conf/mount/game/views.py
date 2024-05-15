from .models import Member, Match
from rest_framework import viewsets, permissions
from .serializers import MemberSerializer, MatchSerializer

# TEST
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

class MemberViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MemberSerializer
	queryset = Member.objects.all().order_by('username')

class MatchViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MatchSerializer
	queryset = Match.objects.all().select_related("player1", "player2").order_by('end_datetime')

class MemberAPIView(RetrieveAPIView):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MemberSerializer

	def get_object(self):
		return self.request.user