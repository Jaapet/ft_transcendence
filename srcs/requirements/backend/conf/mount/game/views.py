from .models import Member, Match
from rest_framework import viewsets, permissions
from .serializers import MemberSerializer, MatchSerializer

# TEST
from rest_framework.views import APIView
from rest_framework.response import Response

# TODO: protect these later!

class MemberViewSet(viewsets.ModelViewSet):
	queryset = Member.objects.all().order_by('username')
	serializer_class = MemberSerializer
	permission_classes = [permissions.IsAuthenticated]

class MatchViewSet(viewsets.ModelViewSet):
	queryset = Match.objects.all().select_related("player1", "player2").order_by('end_datetime')
	serializer_class = MatchSerializer
	permission_classes = [permissions.IsAuthenticated]

# TEST
class HelloView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		content = {'message', 'Hello World!'}
		return Response(content)