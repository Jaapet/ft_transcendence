from django.urls import include, path
from rest_framework import routers
from .views import (
	HealthCheckAPIView,
	CustomTokenObtainPairView,
	Enable2FAView,
	Disable2FAView,
	Verify2FAView,
	MemberViewSet,
	MemberAPIView,
	RegisterMemberAPIView,
	UpdateMemberAPIView,
	UpdateMemberIngameStatusAPIView,
	LeaderboardsAPIView,
	FriendListAPIView,
	FriendRequestViewSet,
	CheckFriendshipStatusAPIView,
	CheckOnlineStatusAPIView,
	SendFriendRequestAPIView,
	DeleteFriendRequestAPIView,
	AcceptFriendRequestAPIView,
	DeclineFriendRequestAPIView,
	RemoveFriendAPIView,
	MatchViewSet,
	Match3ViewSet,
	LastThreeMatchesAPIView,
	RegisterMatchAPIView,
	RegisterMatch3APIView,
	MetricsView
)
from rest_framework_simplejwt import views as jwt_views

# Every route defined here will be prefixed with api/
# Check ../backend/urls.py for more info

router = routers.DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'friend_requests', FriendRequestViewSet)
router.register(r'pong2_matches', MatchViewSet)
router.register(r'pong3_matches', Match3ViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('health/', HealthCheckAPIView.as_view(), name='health_check'),
	path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
	path('user/', MemberAPIView.as_view(), name='login'),
	path('register/', RegisterMemberAPIView.as_view(), name='register'),
	path('enable_2fa/', Enable2FAView.as_view(), name='enable_2fa'),
	path('disable_2fa/', Disable2FAView.as_view(), name='disable_2fa'),
	path('verify_2fa/', Verify2FAView.as_view(), name='verify_2fa'),
	path('edit/', UpdateMemberAPIView.as_view(), name='edit'),
	path('edit_ingame_status', UpdateMemberIngameStatusAPIView.as_view(), name='edit_ingame_status'),
	path('leaderboards/', LeaderboardsAPIView.as_view(), name='leaderboards'),
	path('last_matches/', LastThreeMatchesAPIView.as_view(), name='last_matches'),
	path('user_status', CheckOnlineStatusAPIView.as_view(), name='user_status'),
	path('friend_request/send', SendFriendRequestAPIView.as_view(), name='send_friend_request'),
	path('friend_request/delete', DeleteFriendRequestAPIView.as_view(), name='delete_friend_request'),
	path('friend_request/accept', AcceptFriendRequestAPIView.as_view(), name='accept_friend_request'),
	path('friend_request/decline', DeclineFriendRequestAPIView.as_view(), name='decline_friend_request'),
	path('friends/', FriendListAPIView.as_view(), name="friend_list"),
	path('friends/remove', RemoveFriendAPIView.as_view(), name='remove_friend'),
	path('friends/friendship_status', CheckFriendshipStatusAPIView.as_view(), name='friendship_status'),
	path('game/pong2/save', RegisterMatchAPIView.as_view(), name='register_pong2_game'),
	path('game/pong3/save', RegisterMatch3APIView.as_view(), name='register_pong3_game'),
	path('metrics', MetricsView.as_view(), name='metrics')
]
