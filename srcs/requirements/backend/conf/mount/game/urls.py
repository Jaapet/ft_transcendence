from django.urls import include, path
from rest_framework import routers
from .views import (
	MemberViewSet,
	MemberAPIView,
	FriendRequestViewSet,
	RegisterMemberAPIView,
	CheckFriendshipStatusAPIView,
	SendFriendRequestAPIView,
	DeleteFriendRequestAPIView,
	AcceptFriendRequestAPIView,
	DeclineFriendRequestAPIView,
	RemoveFriendAPIView,
	MatchViewSet
)
from rest_framework_simplejwt import views as jwt_views

# Every route defined here will be prefixed with api/
# Check ../backend/urls.py for more info

router = routers.DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'friend_requests', FriendRequestViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
	path('user/', MemberAPIView.as_view(), name='login'),
	path('register/', RegisterMemberAPIView.as_view(), name='register'),
	path('friend_request/send', SendFriendRequestAPIView.as_view(), name='send_friend_request'),
	path('friend_request/delete', DeleteFriendRequestAPIView.as_view(), name='delete_friend_request'),
	path('friend_request/accept', AcceptFriendRequestAPIView.as_view(), name='accept_friend_request'),
	path('friend_request/decline', DeclineFriendRequestAPIView.as_view(), name='decline_friend_request'),
#	path('friends/', FRIEND LIST),
	path('friends/remove', RemoveFriendAPIView.as_view(), name='remove_friend'),
	path('friends/friendship_status', CheckFriendshipStatusAPIView.as_view(), name='friendship_status')
]
