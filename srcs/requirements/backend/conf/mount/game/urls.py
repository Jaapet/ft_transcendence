from django.urls import include, path
from rest_framework import routers
from .views import MemberViewSet, MatchViewSet, MemberAPIView
from rest_framework_simplejwt import views as jwt_views

router = routers.DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('user/', MemberAPIView.as_view(), name='login'),
	path('token/', jwt_views.TokenObtainPairView.as_view(), name='token_obtain_pair'),
	path('token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
]
