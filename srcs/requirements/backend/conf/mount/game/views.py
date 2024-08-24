import os
from .models import Member, FriendRequest, Match, Match3
from django.db import transaction
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
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
	RestrictedMemberSerializer,
	RegisterMemberSerializer,
	UpdateMemberSerializer,
	UpdateMemberIngameStatusSerializer,
	FriendRequestSerializer,
	SendFriendRequestSerializer,
	InteractFriendRequestSerializer,
	RemoveFriendSerializer,
	MatchSerializer,
	Match3Serializer,
	RegisterMatchSerializer,
	RegisterMatch3Serializer
)

# Queries the health status of the backend
class HealthCheckAPIView(APIView):
	permission_classes = [permissions.AllowAny]

	def get(self, request):
		return Response({'detail': 'Healthy'}, status=status.HTTP_200_OK)

# Enables 2FA for current user
class Enable2FAView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		user = request.user

		# Check if the user already has a TOTP device
		ex_device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
		if ex_device and user.qr_2fa and default_storage.exists(user.qr_2fa[user.qr_2fa.startswith('/media/') and len('/media/'):]):
			ex_secret = ex_device.config_url
			return JsonResponse({
				'detail': '2FA is already enabled for this user',
				'secret_key': ex_secret.split('secret=')[1].split('&')[0],
				'qr_code_url': user.qr_2fa
			}, status=status.HTTP_200_OK)

		# Create or Get the user's TOTP device
		if ex_device:
			device = ex_device
		else:
			device = TOTPDevice.objects.create(user=user, confirmed=True)
		secret = device.config_url

		# Generate a QR code for the TOTP secret
		qr_img = qrcode.make(secret)
		buffer = BytesIO()
		qr_img.save(buffer, format='PNG')
		buffer.seek(0)

		file_dir = os.path.join(settings.MEDIA_ROOT, f'qr_codes/{user.id}')
		os.makedirs(file_dir, exist_ok=True)
		file_name = f'{timezone.now().strftime("%Y%m%d_%H%M%S")}_qr.png'
		file_path = os.path.join(file_dir, file_name)
	
		with default_storage.open(file_path, 'wb') as f:
			f.write(buffer.getvalue())

		file_url = os.path.join(settings.MEDIA_URL, f'qr_codes/{user.id}', file_name)

		with transaction.atomic():
			user.qr_2fa = file_url
			user.save(update_fields=['qr_2fa'])

		return JsonResponse({
			'detail': '2FA has been enabled for this user',
			'secret_key': secret.split('secret=')[1].split('&')[0],
			'qr_code_url': file_url
		}, status=status.HTTP_201_CREATED)

# Disables 2FA for current user
class Disable2FAView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request, *args, **kwargs):
		user = request.user

		device = user.totpdevice_set.filter(confirmed=True).first()
		if not device:
			return Response({'detail': '2FA is already disabled for this user'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			with transaction.atomic():
				if user.qr_2fa:
					path = user.qr_2fa[user.qr_2fa.startswith('/media/') and len('/media/'):]
					if default_storage.exists(path):
						default_storage.delete(path)
				user.qr_2fa = None
				user.save(update_fields=['qr_2fa'])
				device.delete()
		except Exception as e:
			return Response({'detail': f'Could not disable 2FA for this user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

		return Response({'detail': '2FA has been disabled for this user'}, status=status.HTTP_200_OK)

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

# Custom permissions for MemberViewSet
class MemberViewSetPermissions(permissions.BasePermission):
	def has_permission(self, request, view):
		# Admins have full access
		if request.user and request.user.is_staff:
			return True
		# Users can only use these actions (all users, 1 user)
		if request.user and view.action in ['list', 'retrieve']:
			return True
		return False

	def has_object_permission(self, request, view, obj):
		# Admins have full access
		if request.user and request.user.is_staff:
			return True
		# Users can only access the user list, and specific users
		if view.action in ['list', 'retrieve']:
			return True
		return False

# Queries all members ordered by username
# Requires authentication
class MemberViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated, MemberViewSetPermissions]
	serializer_class = RestrictedMemberSerializer
	queryset = Member.objects.all().order_by('username')

# Queries the currently logged-in user
# Used for authentication
class MemberAPIView(RetrieveAPIView):
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = RestrictedMemberSerializer

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
		else:
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
		else:
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LeaderboardsAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		members_by_date = Member.objects.order_by('join_date')
		
		pong_leaders = sorted(members_by_date, key=lambda member: member.elo_pong, reverse=True)[:5]

		serialized_leaders = {
			"pong": []
		}
		for leader in pong_leaders:
			serialized_leaders["pong"].append(RestrictedMemberSerializer(leader, context={'request': request}).data)

		return Response(serialized_leaders)

# Queries the currently logged-in user's friend list
class FriendListAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user = request.user
		friends = user.friends.all()
		serializer = RestrictedMemberSerializer(friends, many=True, context={'request': request})
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
			return Response({'detail': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

		# Only allow user to see their own sent requests
		if request.user.id != int(user_id):
			return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

		user_requests = FriendRequest.objects.filter(Q(sender_id=user_id)).select_related("sender", "recipient").order_by('-datetime')
		serializer = self.get_serializer(user_requests, many=True)
		return Response(serializer.data)

	# Get all friend requests received by 1 user
	@action(detail=False, methods=['get'])
	def requests_received(self, request, pk=None):
		user_id = request.query_params.get('user_id', None)
		if (user_id is None):
			return Response({'detail': 'User ID is required'}, status=status.HTTP_400_BAD_REQUEST)

		# Only allow user to see their own received requests
		if request.user.id != int(user_id):
			return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

		user_requests = FriendRequest.objects.filter(Q(recipient_id=user_id)).select_related("sender", "recipient").order_by('-datetime')
		serializer = self.get_serializer(user_requests, many=True)
		return Response(serializer.data)

# Custom permissions for CheckFriendshipStatusAPIView
class CheckFriendshipStatusAPIViewPermissions(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		# Allow admins to bypass permission check
		if request.user and request.user.is_staff:
			return True

		# Allow users to check only their own friendship status
		user1_id = int(request.query_params.get('user1_id'))
		user2_id = int(request.query_params.get('user2_id'))
		user_id = request.user.id
		if user1_id and user2_id and (user1_id == user_id or user2_id == user_id):
			return True
		return False

# Checks friendship status between 2 users
class CheckFriendshipStatusAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated, CheckFriendshipStatusAPIViewPermissions]

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

# Checks a user's online status
class CheckOnlineStatusAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		user_id = request.query_params.get('user_id')
		if not (user_id):
			return Response({"detail": "User ID is required."}, status=status.HTTP_400_BAD_REQUEST)

		try:
			user = Member.objects.get(id=user_id)
			user_status = user.is_online
			return Response({"detail": user_status}, status=status.HTTP_200_OK)
		except Member.DoesNotExist:
			return Response({"detail": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)

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

# Custom permissions for MatchViewSet
class MatchViewSetPermissions(permissions.BasePermission):
	def has_permission(self, request, view):
		# Admins have full access
		if request.user and request.user.is_staff:
			return True
		# Users can only use these actions (all matches, 1 match, all matches for 1 user, 3 last matches for 1 user)
		if request.user and view.action in ['list', 'retrieve', 'player_matches', 'last_player_matches']:
			return True
		return False

# Queries all pong2 matches ordered by most recently finished
# Requires authentication
class MatchViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated, MatchViewSetPermissions]
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

# Custom permissions for Match3ViewSet
class Match3ViewSetPermissions(permissions.BasePermission):
	def has_permission(self, request, view):
		# Admins have full access
		if request.user and request.user.is_staff:
			return True
		# Users can only use these actions (all matches, 1 match, all matches for 1 user, 3 last matches for 1 user)
		if request.user and view.action in ['list', 'retrieve', 'player_matches', 'last_player_matches']:
			return True
		return False

# Queries all pong3 matches ordered by most recently finished
# Requires authentication
class Match3ViewSet(viewsets.ModelViewSet):
	permission_classes = [permissions.IsAuthenticated, Match3ViewSetPermissions]
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
		player_matches = Match3.objects.filter(Q(paddle1_id=player_id) | Q(paddle2_id=player_id) | Q(ball_id=player_id)).select_related("paddle1", "paddle2", "ball").order_by('-end_datetime')[:3]
		serializer = self.get_serializer(player_matches, many=True)
		return Response(serializer.data)

class LastThreeMatchesAPIView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request, *args, **kwargs):
		target_id = request.query_params.get('target_id')
		if not target_id:
			return Response({"detail": "target_id parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

		try:
			user = Member.objects.get(id=target_id)
		except Member.DoesNotExist:
			return Response({"detail": "User does not exist."}, status=status.HTTP_404_NOT_FOUND)

		# Fetch the last 3 matches of each type
		matches2 = list(Match.objects.filter(Q(winner=user) | Q(loser=user)).select_related("winner", "loser").order_by('-end_datetime')[:3])
		matches3 = list(Match3.objects.filter(Q(paddle1=user) | Q(paddle2=user) | Q(ball=user)).select_related("paddle1", "paddle2", "ball").order_by('-end_datetime')[:3])

		# Combine and sort the matches by date
		all_matches = matches2 + matches3
		all_matches_sorted = sorted(all_matches, key=lambda x: x.end_datetime, reverse=True)

		# Get the last 3 matches
		last_three_matches = all_matches_sorted[:3]

		serialized_matches = []
		for match in last_three_matches:
			if isinstance(match, Match):
				serialized_matches.append(MatchSerializer(match, context={'request': request}).data)
			elif isinstance(match, Match3):
				serialized_matches.append(Match3Serializer(match, context={'request': request}).data)

		return Response(serialized_matches)

# Custom authentication specific to Websocket Server
class WSAuthentication(BaseAuthentication):
	def authenticate(self, request):
		# Check if the request contains the expected header
		if 'Authorization' not in request.headers:
			return None

		# Validate the token contained in the header and the expected syntax
		auth_token = request.headers['Authorization']
		if auth_token != 'Bearer ' + os.environ.get('WS_TOKEN_BACKEND'):
			raise AuthenticationFailed('Invalid token')

		# If the token is valid, return a dummy user object
		return (self.dummy_user(), None)

	def dummy_user(self):
		# Create a dummy user with impossible username for regular users
		return Member(username=';ws;')

# Edits the specified user's is_ingame field
class UpdateMemberIngameStatusAPIView(UpdateAPIView):
	authentication_classes = [WSAuthentication]
	permission_classes = [permissions.IsAuthenticated]
	serializer_class = UpdateMemberIngameStatusSerializer

	def put(self, request, *args, **kwargs):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			user_id = serializer.validated_data['user_id']
			try:
				user = Member.objects.get(id=user_id)
			except:
				return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
			serializer.update(user, serializer.validated_data)
			return Response(serializer.data, status=status.HTTP_200_OK)
		else:
			return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterMatchAPIView(APIView):
	authentication_classes = [WSAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		serializer = RegisterMatchSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterMatch3APIView(APIView):
	authentication_classes = [WSAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def post(self, request):
		serializer = RegisterMatch3Serializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Custom authentication specific to Prometheus
class PrometheusAuthentication(BaseAuthentication):
	def authenticate(self, request):
		# Check if the request contains the expected header
		if 'Authorization' not in request.headers:
			return None

		# Validate the token contained in the header and the expected syntax
		auth_token = request.headers['Authorization']
		if auth_token != 'Bearer ' + os.environ.get('METRICS_TOKEN_BACKEND'):
			raise AuthenticationFailed('Invalid token')

		# If the token is valid, return a dummy user object
		return (self.dummy_user(), None)

	def dummy_user(self):
		# Create a dummy user with impossible username for regular users
		return Member(username=';prometheus;')

# Queries all metrics and returns it in Prometheus format
# Only for Prometheus, hence the custom PrometheusAuthentication class
class MetricsView(APIView):
	authentication_classes = [PrometheusAuthentication]
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		metrics = self.collect_metrics()
		return HttpResponse(metrics, content_type='text/plain')

	def collect_metrics(self):
		# Collect metrics here and format them with Prometheus format
		metrics = []
		metrics += self.collect_total_users()
		metrics += self.collect_total_2fa_users()
		metrics += self.collect_online_users()
		metrics += self.collect_ingame_users()
		metrics += self.collect_users_friends()
		metrics += self.collect_users_elo_pong()
		metrics += self.collect_total_friend_requests()
		metrics += self.collect_total_pong2_matches()
		metrics += self.collect_won_pong2_matches()
		metrics += self.collect_total_pong3_matches()
		metrics += self.collect_won_pong3_matches()
		return '\n'.join(metrics)

	def collect_total_users(self):
		total_users = Member.objects.count()
		metric = [
			'# HELP back_total_users Number of accounts created in the database',
			'# TYPE back_total_users counter',
			f'back_total_users {total_users}'
		]
		return metric

	def collect_total_2fa_users(self):
		total_2fa_users = TOTPDevice.objects.count()
		metric = [
			'# HELP back_total_2fa_users Number of accounts that have 2FA enabled',
			'# TYPE back_total_2fa_users counter',
			f'back_total_2fa_users {total_2fa_users}'
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

	def collect_ingame_users(self):
		ingame_users = Member.objects.get_ingame_users().count()
		metric = [
			'# HELP back_ingame_users Number of currently ingame users',
			'# TYPE back_ingame_users counter',
			f'back_ingame_users {ingame_users}'
		]
		return metric

	def collect_users_friends(self):
		metric = [
			'# HELP back_users_friends Friend count of all users',
			'# TYPE back_users_friends counter'
		]

		users = Member.objects.all()
		for user in users:
			user_friend_count = user.friends.count()
			metric.append(f'back_users_friends{{user="{user.username}"}} {user_friend_count}')

		return metric

	def collect_users_elo_pong(self):
		metric = [
			'# HELP back_users_elo_pong Pong ELO of all users',
			'# TYPE back_users_elo_pong counter'
		]

		users = Member.objects.all()
		for user in users:
			metric.append(f'back_users_elo_pong{{user="{user.username}"}} {user.elo_pong}')

		return metric

	def collect_total_friend_requests(self):
		requests = FriendRequest.objects.all()
		total_friend_requests = requests.count()
		metric = [
			'# HELP back_total_friend_requests Number of pending friend requests',
			'# TYPE back_total_friend_requests counter',
			f'back_total_friend_requests {total_friend_requests}'
		]

		users = Member.objects.all()
		for user in users:
			user_reqs_sent = requests.filter(Q(sender=user)).count()
			user_reqs_recv = requests.filter(Q(recipient=user)).count()
			metric.append(f'back_total_friend_requests{{user="{user.username}",role="sender"}} {user_reqs_sent}')
			metric.append(f'back_total_friend_requests{{user="{user.username}",role="recipient"}} {user_reqs_recv}')

		return metric

	def collect_total_pong2_matches(self):
		matches = Match.objects.all()
		total_pong2_matches = matches.count()
		metric = [
			'# HELP back_total_pong2_matches Number of played 1v1 pong matches',
			'# TYPE back_total_pong2_matches counter',
			f'back_total_pong2_matches {total_pong2_matches}'
		]

		users = Member.objects.all()
		for user in users:
			user_match_count = matches.filter(Q(winner=user) | Q(loser=user)).count()
			metric.append(f'back_total_pong2_matches{{player="{user.username}"}} {user_match_count}')

		return metric

	def collect_won_pong2_matches(self):
		matches = Match.objects.all()
		won_pong2_matches = matches.count()
		metric = [
			'# HELP back_won_pong2_matches Number of won 1v1 pong matches',
			'# TYPE back_won_pong2_matches counter',
			f'back_won_pong2_matches {won_pong2_matches}'
		]

		users = Member.objects.all()
		for user in users:
			user_match_count = matches.filter(Q(winner=user)).count()
			metric.append(f'back_won_pong2_matches{{player="{user.username}"}} {user_match_count}')

		return metric

	def collect_total_pong3_matches(self):
		matches = Match3.objects.all()
		total_pong3_matches = matches.count()
		metric = [
			'# HELP back_total_pong3_matches Number of played 1v2 pong matches',
			'# TYPE back_total_pong3_matches counter',
			f'back_total_pong3_matches {total_pong3_matches}'
		]

		users = Member.objects.all()
		for user in users:
			user_match_count_ball = matches.filter(Q(ball=user)).count()
			user_match_count_paddle = matches.filter(Q(paddle1=user) | Q(paddle2=user)).count()
			metric.append(f'back_total_pong3_matches{{player="{user.username}",role="ball"}} {user_match_count_ball}')
			metric.append(f'back_total_pong3_matches{{player="{user.username}",role="paddle"}} {user_match_count_paddle}')

		return metric

	def collect_won_pong3_matches(self):
		matches = Match3.objects.all()
		won_pong3_matches = matches.count()
		metric = [
			'# HELP back_won_pong3_matches Number of won 1v2 pong matches',
			'# TYPE back_won_pong3_matches counter',
			f'back_won_pong3_matches {won_pong3_matches}'
		]

		users = Member.objects.all()
		for user in users:
			user_match_count_ball = matches.filter(Q(ball_won=True) & Q(ball=user)).count()
			user_match_count_paddle = matches.filter(Q(ball_won=False) & (Q(paddle1=user) | Q(paddle2=user))).count()
			metric.append(f'back_won_pong3_matches{{player="{user.username}",role="ball"}} {user_match_count_ball}')
			metric.append(f'back_won_pong3_matches{{player="{user.username}",role="paddle"}} {user_match_count_paddle}')

		return metric