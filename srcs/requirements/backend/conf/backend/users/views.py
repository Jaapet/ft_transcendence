from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from rest_framework import generics
from .models import User
from .serializers import UserSerializer

class UserListCreate(generics.ListCreateAPIView):
	queryset = User.objects.all()
	serializer_class = UserSerializer

"""
@api_view(['GET'])
def getData(request):
	app = User.objects.all()
	serializer = UserSerializer(app, many=True)
	return Response(serializer.data)

@api_view(['POST'])
def postData(request):
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		serializer.save()
	return Response(serializer.data)
"""

"""
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
	userlist = User.objects.all().order_by('firstname').values()
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
"""