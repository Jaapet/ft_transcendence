import os
from .models import Member, FriendRequest, Match
from django.db.models import Q
from django.http import HttpResponse
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import (
	MemberSerializer,
	RegisterMemberSerializer,
	UpdateMemberSerializer,
	FriendSerializer,
	FriendRequestSerializer,
	SendFriendRequestSerializer,
	InteractFriendRequestSerializer,
	RemoveFriendSerializer,
	MatchSerializer
)

# TODO: Check if this uses the index
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

class UpdateMemberAPIView(UpdateAPIView):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = UpdateMemberSerializer
	parser_classes = [MultiPartParser]

	def put(self, request, *args, **kwargs):
		serializer = self.serializer_class(data=request.data, instance=request.user, context={'request': request})
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		print("Invalid Serializer:")
		print(serializer)
		print(serializer.errors)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FriendListAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user = request.user
		friends = user.friends.all()
		serializer = FriendSerializer(friends, many=True, context={'request': request})
		return Response(serializer.data)

# Queries all friend requests ordered by most recent
# Requires authentication
class FriendRequestViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = FriendRequestSerializer
	queryset = FriendRequest.objects.all().select_related("sender", "recipient").order_by('-datetime')

	# Get all friend requests sent by 1 user
	@action(detail=False, methods=['get'])
	def requests_sent(self, request, pk=None):
		user_id = request.query_params.get('user_id', None)
		if (user_id is None):
			return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		user_requests = FriendRequest.objects.filter(Q(sender_id=user_id)).select_related("sender", "recipient").order_by('-datetime')
		serializer = self.get_serializer(user_requests, many=True)
		return Response(serializer.data)

	# Get all friend requests received by 1 user
	@action(detail=False, methods=['get'])
	def requests_received(self, request, pk=None):
		user_id = request.query_params.get('user_id', None)
		if (user_id is None):
			return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		user_requests = FriendRequest.objects.filter(Q(recipient_id=user_id)).select_related("sender", "recipient").order_by('-datetime')
		serializer = self.get_serializer(user_requests, many=True)
		return Response(serializer.data)

class CheckFriendshipStatusAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user1_id = request.query_params.get('user1_id')
		user2_id = request.query_params.get('user2_id')
		if not (user1_id and user2_id):
			return Response({"detail": "Both user IDs are required."}, status=status.HTTP_400_BAD_REQUEST)

		try:
			user1 = Member.objects.get(id=user1_id)
			user2 = Member.objects.get(id=user2_id)
			is_friend = user1.friends.filter(id=user2_id).exists()
			return Response({"detail": is_friend}, status=status.HTTP_200_OK)
		except Member.DoesNotExist:
			return Response({"detail": "One or both users do not exist."}, status=status.HTTP_404_NOT_FOUND)

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

class DeleteFriendRequestAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		serializer = InteractFriendRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		friend_request = serializer.validated_data['request_id']
		try:
			request.user.delete_friend_request(friend_request)
			return Response({"detail": "Friend request deleted."}, status=status.HTTP_200_OK)
		except ValueError as err:
			return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)

class AcceptFriendRequestAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		serializer = InteractFriendRequestSerializer(data=request.data)
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
		serializer = InteractFriendRequestSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		friend_request = serializer.validated_data['request_id']
		try:
			request.user.decline_friend_request(friend_request)
			return Response({"detail": "Friend request declined."}, status=status.HTTP_200_OK)
		except ValueError as err:
			return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)

class RemoveFriendAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		serializer = RemoveFriendSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		friend = serializer.validated_data['target_id']
		try:
			request.user.remove_friend(friend)
			return Response({"detail": "Friend removed."}, status=status.HTTP_200_OK)
		except ValueError as err:
			return Response({"detail": str(err)}, status=status.HTTP_400_BAD_REQUEST)

# Queries all matches ordered by most recently finished
# Requires authentication
class MatchViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MatchSerializer
	queryset = Match.objects.all().select_related("winner", "loser").order_by('-end_datetime')

	# Get all matches involving 1 player
	@action(detail=False, methods=['get'])
	def player_matches(self, request, pk=None):
		player_id = request.query_params.get('player_id', None)
		if (player_id is None):
			return Response({'error': 'Player ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		player_matches = Match.objects.filter(Q(winner_id=player_id) | Q(loser_id=player_id)).select_related("winner", "loser").order_by('-end_datetime')
		serializer = self.get_serializer(player_matches, many=True)
		return Response(serializer.data)

	# Get a player's last 3 matches
	@action(detail=False, methods=['get'])
	def last_player_matches(self, request, pk=None):
		player_id = request.query_params.get('player_id', None)
		if (player_id is None):
			return Response({'error': 'Player ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		player_matches = Match.objects.filter(Q(winner_id=player_id) | Q(loser_id=player_id)).select_related("winner", "loser").order_by('-end_datetime')[:3]
		serializer = self.get_serializer(player_matches, many=True)
		return Response(serializer.data)

class PrometheusAuthentication(BaseAuthentication):
	def authenticate(self, request):
		# Check if the request contains the expected header
		if 'Authorization' not in request.headers:
			return None

		# Validate the value of the header (you can implement your own logic here)
		auth_token = request.headers['Authorization']
		if auth_token != 'Bearer ' + os.environ.get('METRICS_TOKEN_BACKEND'):
			raise AuthenticationFailed('Invalid token')

		# If the token is valid, return a dummy user object
		return (self.dummy_user(), None)

	def dummy_user(self):
		# Create a dummy user object since we don't have real user authentication
		return Member(username=';prometheus;')

class MetricsView(APIView):
	authentication_classes = [PrometheusAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		metrics = self.collect_metrics()
		return HttpResponse(metrics, content_type='text/plain')

	def collect_metrics(self):
		# Collect metrics here and format them as Prometheus exposition format
		metrics = []
		metrics += self.collect_total_users()
		return '\n'.join(metrics)

	def collect_total_users(self):
		total_users = Member.objects.count()
		metric = [
			'# HELP back_total_users Number of accounts created in the database',
			'# TYPE back_total_users counter',
			f'back_total_users {total_users}'
		]
		return metric