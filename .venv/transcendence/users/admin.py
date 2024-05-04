from django.contrib import admin
from .models import User

class UserAdmin(admin.ModelAdmin):
	list_display = ("firstname", "lastname", "join_date",)

admin.site.register(User, UserAdmin)