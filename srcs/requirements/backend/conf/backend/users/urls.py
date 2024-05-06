from django.urls import path
from .views import UserListCreate

urlpatterns = [
	path('', UserListCreate.as_view(), name='user-list-create'),
#	path('', views.main, name='main'),
#	path('testing/', views.testing, name='testing'),
#	path('users/', views.users, name='users'),
#	path('users/details/<int:id>', views.details, name='details'),
]