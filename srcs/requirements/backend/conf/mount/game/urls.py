from django.urls import include, path
from rest_framework import routers
from .views import MemberViewSet, MatchViewSet, HelloView

router = routers.DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
	path('', include(router.urls)),
	path('hello/', HelloView.as_view(), name='hello'),
]
