from .models import Member, Match
from rest_framework import viewsets, permissions
from .serializers import MemberSerializer, MatchSerializer

# TODO: protect these later!

class MemberViewSet(viewsets.ModelViewSet):
	queryset = Member.objects.all().order_by('username')
	serializer_class = MemberSerializer
#	permission_classes = [permissions.IsAuthenticated]

class MatchViewSet(viewsets.ModelViewSet):
	queryset = Match.objects.all().select_related("player1", "player2").order_by('end_datetime')
	serializer_class = MatchSerializer
#	permission_classes = [permissions.IsAuthenticated]
