from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from .models import User

def main(request):
	template = loader.get_template('main.html')
	return HttpResponse(template.render())

def testing(request):
	template = loader.get_template('template.html')
	context = {
		'fruits': ['Watermelon', 'Melon', 'Pineapple', 'Peach', 'Pear', 'Apple', 'Persimmon', 'Dekopon', 'Grape', 'Strawberry', 'Cherry'],
	}
	return HttpResponse(template.render(context, request))

def users(request):
	userlist = User.objects.all().values()
	template = loader.get_template('user_list.html')
	context = {
		'userlist': userlist
	}
	return HttpResponse(template.render(context, request))

def details(request, id):
	user = User.objects.get(id=id)
	template = loader.get_template('details.html')
	context = {
		'user': user
	}
	return HttpResponse(template.render(context, request))
