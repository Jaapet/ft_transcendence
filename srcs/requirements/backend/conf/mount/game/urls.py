from django.urls import include, path
from rest_framework import routers
from .views import MemberViewSet, MemberAPIView, RegisterMemberAPIView, MatchViewSet
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
]
