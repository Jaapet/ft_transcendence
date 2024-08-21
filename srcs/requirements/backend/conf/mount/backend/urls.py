from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
	path('api/', include('game.urls')),
	path('api-auth/', include('rest_framework.urls')),
]

# Allows Django to serve static files and user uploads in DEBUG mode
if settings.DEBUG:
	urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
