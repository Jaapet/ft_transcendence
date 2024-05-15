from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError
from .models import Member, Match

# New member form
class MemberCreationForm(forms.ModelForm):
	password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
	password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput)

	class Meta:
		model = Member
		fields = ["username", "email", "is_admin"]

	def clean_password2(self):
		# Check that the two passwords match
		password1 = self.cleaned_data.get("password1")
		password2 = self.cleaned_data.get("password2")
		if password1 and password2 and password1 != password2:
			raise ValidationError("Passwords don't match")
		return password2

	def save(self, commit=True):
		# Save the provided password in hashed format
		user = super().save(commit=False)
		user.set_password(self.cleaned_data["password1"])
		if commit:
			user.save()
		return user

# Change member form
class MemberChangeForm(forms.ModelForm):
	password = ReadOnlyPasswordHashField()

	class Meta:
		model = Member
		fields = ["username", "email", "password", "is_admin"]

# Display member in admin
class MemberAdmin(BaseUserAdmin):
	form = MemberChangeForm
	add_form = MemberCreationForm

	# The fields to be used in displaying the User model.
	# These override the definitions on the base UserAdmin
	# that reference specific fields on auth.User.
	list_display = ["username", "email", "join_date", "is_admin"]
	list_filter = ["is_admin"]
	fieldsets = [
		(None, {"fields": ["username", "email", "password"]}),
		("Other info", {"fields": ["avatar"]}),
		("Permissions", {"fields": ["is_superuser", "is_admin"]})
	]
	# add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
	# overrides get_fieldsets to use this attribute when creating a user.
	add_fieldsets = [(None, {
		"classes": ["wide"],
		"fields": ["username", "email", "password1", "password2"]
	})]
	search_fields = ["username", "email"]
	ordering = ["username"]
	filter_horizontal = []
admin.site.register(Member, MemberAdmin)

class MatchAdmin(admin.ModelAdmin):
	list_display = ("player1", "player2", "start_datetime", "end_datetime")
admin.site.register(Match, MatchAdmin)