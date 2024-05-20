from django import forms
from django.db import models
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError
from django.template.response import TemplateResponse
from .models import Member, Match

# The content of this file is only used on Django Admin
# You can ignore it for correction

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

	def change_view(self, request, object_id, form_url='', extra_context=None):
		extra_context = extra_context or {}
		member = self.get_object(request, object_id)
		matches = Match.objects.filter(models.Q(winner=member) | models.Q(loser=member))

		# Get default context from the changelist
		ModelForm = self.get_form(request, member)
		form = ModelForm(instance=member)
		adminForm = admin.helpers.AdminForm(
			form,
			list(self.get_fieldsets(request, member)),
			self.prepopulated_fields,
			self.get_readonly_fields(request, member),
			model_admin=self,
		)
		media = self.media + adminForm.media

		# Get inline instances
		inline_instances = self.get_inline_instances(request, obj=member)

		# Get inline formsets
		inline_formsets = []
		for inline_instance in inline_instances:
			inline_formset = inline_instance.get_formset(request, obj=member)
			if inline_formset:
				inline_formsets.append(inline_formset)

		extra_context.update({
			'matches': matches,
			'opts': self.model._meta,
			'original': member,
			'title': 'Change member',
			'app_label': self.model._meta.app_label,
			'adminform': adminForm,
			'object_id': object_id,
			'media': media,
			'is_popup': False,
			'add': False,
			'change': True,
			'has_add_permission': self.has_add_permission(request),
			'has_change_permission': self.has_change_permission(request, member),
			'has_delete_permission': self.has_delete_permission(request, member),
			'has_view_permission': self.has_view_permission(request, member),
			'save_as': self.save_as,
			'show_save': True,
			'inline_admin_formsets': inline_formsets,
			'has_editable_inline_admin_formsets': bool(inline_formsets),
		})
		return TemplateResponse(request, "admin/MemberMatchList.html", extra_context)
admin.site.register(Member, MemberAdmin)

class MatchAdmin(admin.ModelAdmin):
	list_display = ("winner", "loser", "start_datetime", "end_datetime")
admin.site.register(Match, MatchAdmin)