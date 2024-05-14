from django.contrib import admin
from django.urls import include, path
from rest_framework import routers
from game.urls import router

urlpatterns = [
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
]
