from django.urls import include, path
from rest_framework import routers
from .views import (
	MemberViewSet,
	MemberAPIView,
	RegisterMemberAPIView,
	SendFriendRequestAPIView,
	AcceptFriendRequestAPIView,
	DeclineFriendRequestAPIView,
	MatchViewSet
)
from rest_framework_simplejwt import views as jwt_views

# Every route defined here will be prefixed with api/
# Check ../backend/urls.py for more info

router = routers.DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
	path('user/', MemberAPIView.as_view(), name='login'),
	path('register/', RegisterMemberAPIView.as_view(), name='register'),
	path('friend_request/send', SendFriendRequestAPIView.as_view(), name='send_friend_request'),
	path('friend_request/accept', AcceptFriendRequestAPIView.as_view(), name='accept_friend_request'),
	path('friend_request/decline', DeclineFriendRequestAPIView.as_view(), name='decline_friend_request')
]
