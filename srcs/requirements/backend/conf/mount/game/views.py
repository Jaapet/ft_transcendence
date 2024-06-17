import os
from .models import Member, FriendRequest, Match, Match3
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp.plugins.otp_totp.models import TOTPDevice
import qrcode
from io import BytesIO
from .serializers import (
	CustomTokenObtainPairSerializer,
	MemberSerializer,
	RegisterMemberSerializer,
	UpdateMemberSerializer,
	FriendSerializer,
	FriendRequestSerializer,
	SendFriendRequestSerializer,
	InteractFriendRequestSerializer,
	RemoveFriendSerializer,
	MatchSerializer,
	Match3Serializer
)

# Enables 2FA for current user
class Enable2FAView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		user = request.user

		# Check if the user already has a TOTP device
		if TOTPDevice.objects.filter(user=user, confirmed=True).exists():
			return Response({'detail': '2FA is already enabled for this user'}, status=status.HTTP_400_BAD_REQUEST)

		# Create or Get the user's TOTP device
		device = TOTPDevice.objects.create(user=user, confirmed=True)
		secret = device.config_url

		# Generate a QR code for the TOTP secret
		qr_img = qrcode.make(secret)
		buffer = BytesIO()
		qr_img.save(buffer, format='PNG')
		buffer.seek(0)

		file_name = f'{user.id}_{timezone.now()}_qr.png'

		file_path = os.path.join(settings.MEDIA_ROOT, file_name)
		with open(file_path, 'wb') as f:
			f.write(buffer.getvalue())

		file_url = os.path.join(settings.MEDIA_URL, file_name)

		return JsonResponse({'secret_key': secret.split('secret=')[1].split('&')[0], 'qr_code_url': file_url},status=status.HTTP_201_CREATED)

# Verifies 2FA token for user login and returns JWT
class Verify2FAView(APIView):
	permission_classes = [permissions.AllowAny]

	def post(self, request, *args, **kwargs):
		user_id = request.data.get('user_id')
		otp = request.data.get('otp')
		if not user_id or not otp:
			return Response({'detail': 'Both user_id and otp are required'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			user = get_user_model().objects.get(id=user_id)
		except get_user_model().DoesNotExist:
			return Response({'detail': 'Invalid user_id'}, status=status.HTTP_400_BAD_REQUEST)

		device = user.totpdevice_set.filter(confirmed=True).first()
		if not device:
			return Response({'detail': 'User does not have 2FA enabled'}, status=status.HTTP_400_BAD_REQUEST)

		if device and device.verify_token(otp):
			refresh = RefreshToken.for_user(user)
			return Response({
				'refresh': str(refresh),
				'access': str(refresh.access_token),
			}, status=status.HTTP_200_OK)

		return Response({'detail': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

# Checks username and password validity for login
# Logs in directly if 2FA is disabled
# Notifies that 2FA is required otherwise
class CustomTokenObtainPairView(TokenObtainPairView):
	serializer_class = CustomTokenObtainPairSerializer

# TODO: Check if this uses the index
# Queries all members ordered by username
# Requires authentication
class MemberViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MemberSerializer
	queryset = Member.objects.all().order_by('username')

# Queries the currently logged-in user
# Used for authentication
class MemberAPIView(RetrieveAPIView):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = MemberSerializer

	def get_object(self):
		return self.request.user

# Creates a user
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

# Edits the currently logged-in user
class UpdateMemberAPIView(UpdateAPIView):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = UpdateMemberSerializer
	parser_classes = [MultiPartParser]

	def put(self, request, *args, **kwargs):
		serializer = self.serializer_class(data=request.data, instance=request.user, context={ 'request': request })
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_200_OK)
		print("Invalid Serializer:")
		print(serializer)
		print(serializer.errors)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Queries the currently logged-in user's friend list
class FriendListAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user = request.user
		friends = user.friends.all()
		serializer = FriendSerializer(friends, many=True, context={'request': request})
		return Response(serializer.data)

# Custom permissions for FriendRequestViewSet
class FriendRequestViewSetPermissions(permissions.BasePermission):
	def has_permission(self, request, view):
		# Admins have full access
		if request.user and request.user.is_staff:
			return True
		# Users can only use these actions (1 F reqs, all F reqs by 1 user, all F reqs for 1 user)
		if request.user and view.action in ['retrieve', 'requests_sent', 'requests_received']:
			return True
		return False

	def has_object_permission(self, request, view, obj):
		# Admins have full access
		if request.user and request.user.is_staff:
			return True
		# Users can only access their own friend requests through retrieve
		# For custom actions permissions, check them in FriendRequestViewSet
		if view.action in ['retrieve']:
			return obj.sender == request.user or obj.recipient == request.user
		return False

# Queries all friend requests ordered by most recent
# Requires authentication
class FriendRequestViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated, FriendRequestViewSetPermissions]
	serializer_class = FriendRequestSerializer
	queryset = FriendRequest.objects.all().select_related("sender", "recipient").order_by('-datetime')

	# Get all friend requests sent by 1 user
	@action(detail=False, methods=['get'])
	def requests_sent(self, request, pk=None):
		user_id = request.query_params.get('user_id', None)
		if (user_id is None):
			return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

		# Only allow user to see their own sent requests
		if request.user.id != int(user_id):
			return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

		user_requests = FriendRequest.objects.filter(Q(sender_id=user_id)).select_related("sender", "recipient").order_by('-datetime')
		serializer = self.get_serializer(user_requests, many=True)
		return Response(serializer.data)

	# Get all friend requests received by 1 user
	@action(detail=False, methods=['get'])
	def requests_received(self, request, pk=None):
		user_id = request.query_params.get('user_id', None)
		if (user_id is None):
			return Response({'error': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

		# Only allow user to see their own received requests
		if request.user.id != int(user_id):
			return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

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

# Queries all pong2 matches ordered by most recently finished
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

# Queries all pong3 matches ordered by most recently finished
# Requires authentication
class Match3ViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = Match3Serializer
	queryset = Match3.objects.all().select_related("paddle1", "paddle2", "ball").order_by('-end_datetime')

	# Get all matches involving 1 player
	@action(detail=False, methods=['get'])
	def player_matches(self, request, pk=None):
		player_id = request.query_params.get('player_id', None)
		if (player_id is None):
			return Response({'error': 'Player ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		player_matches = Match3.objects.filter(Q(paddle1_id=player_id) | Q(paddle2_id=player_id) | Q(ball_id=player_id)).select_related("paddle1", "paddle2", "ball").order_by('-end_datetime')
		serializer = self.get_serializer(player_matches, many=True)
		return Response(serializer.data)

	# Get a player's last 3 matches
	@action(detail=False, methods=['get'])
	def last_player_matches(self, request, pk=None):
		player_id = request.query_params.get('player_id', None)
		if (player_id is None):
			return Response({'error': 'Player ID is required'}, status=status.HTTP_400_BAD_REQUEST)
		player_matches = Match.objects.filter(Q(paddle1_id=player_id) | Q(paddle2_id=player_id) | Q(ball_id=player_id)).select_related("paddle1", "paddle2", "ball").order_by('-end_datetime')[:3]
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
		metrics += self.collect_online_users()
		metrics += self.collect_total_friend_requests()
		metrics += self.collect_total_pong_matches()
		return '\n'.join(metrics)

	def collect_total_users(self):
		total_users = Member.objects.count()
		metric = [
			'# HELP back_total_users Number of accounts created in the database',
			'# TYPE back_total_users counter',
			f'back_total_users {total_users}'
		]
		return metric

	def collect_online_users(self):
		online_users = Member.objects.get_online_users().count()
		metric = [
			'# HELP back_online_users Number of currently online users',
			'# TYPE back_online_users counter',
			f'back_online_users {online_users}'
		]
		return metric

	def collect_total_friend_requests(self):
		total_friend_requests = FriendRequest.objects.count()
		metric = [
			'# HELP back_total_friend_requests Number of pending friend requests',
			'# TYPE back_total_friend_requests counter',
			f'back_total_friend_requests {total_friend_requests}'
		]
		return metric

	def collect_total_pong_matches(self):
		total_pong_matches = Match.objects.count()
		metric = [
			'# HELP back_total_pong_matches Number of played pong matches',
			'# TYPE back_total_pong_matches counter',
			f'back_total_pong_matches {total_pong_matches}'
		]
		return metric