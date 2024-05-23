from .models import Member, Match
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import (
	MemberSerializer,
	RegisterMemberSerializer,
	SendFriendRequestSerializer,
	ReceiveFriendRequestSerializer,
	MatchSerializer
)

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
class RegisterMemberAPIView(APIView):
	permission_classes = [permissions.AllowAny]
	serializer_class = RegisterMemberSerializer
	parser_classes = [MultiPartParser]

	def post(self, request, *args, **kwargs):
		serializer = self.serializer_class(data=request.data, context={'request': request})
		if serializer.is_valid():
			avatar_data = request.data.get('avatar')
			serializer.save(avatar=avatar_data)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		print("Invalid Serializer:")
		print(serializer)
		print(serializer.errors)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendFriendRequestAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		serializer = SendFriendRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		target = serializer.validated_data['target_id']
		try:
			request.user.send_friend_request(target)
			return Response({"detail": "Friend request sent."}, status=status.HTTP_201_CREATED)
		except ValueError as err:
			return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)

class AcceptFriendRequestAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		serializer = ReceiveFriendRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		friend_request = serializer.validated_data['request_id']
		try:
			request.user.accept_friend_request(friend_request)
			return Response({"detail": "Friend request accepted."}, status=status.HTTP_200_OK)
		except ValueError as err:
			return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)

class DeclineFriendRequestAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		serializer = ReceiveFriendRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		friend_request = serializer.validated_data['request_id']
		try:
			request.user.decline_friend_request(friend_request)
			return Response({"detail": "Friend request declined."}, status=status.HTTP_200_OK)
		except ValueError as err:
			return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)

# Queries all matches ordered by most recently finished
# Requires authentication
class MatchViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MatchSerializer
	queryset = Match.objects.all().select_related("winner", "loser").order_by('-end_datetime')

	@action(detail=False, methods=['get'])
	def player_matches(self, request, pk=None):
		player_id = request.query_params.get('player_id', None)
		if (player_id is None):
			return Response({'error': 'Player ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		player_matches = Match.objects.filter(Q(winner_id=player_id) | Q(loser_id=player_id)).select_related("winner", "loser").order_by('-end_datetime')
		serializer = self.get_serializer(player_matches, many=True)
		return Response(serializer.data)

	@action(detail=False, methods=['get'])
	def last_player_matches(self, request, pk=None):
		player_id = request.query_params.get('player_id', None)
		if (player_id is None):
			return Response({'error': 'Player ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		player_matches = Match.objects.filter(Q(winner_id=player_id) | Q(loser_id=player_id)).select_related("winner", "loser").order_by('-end_datetime')[:3]
		serializer = self.get_serializer(player_matches, many=True)
		return Response(serializer.data)