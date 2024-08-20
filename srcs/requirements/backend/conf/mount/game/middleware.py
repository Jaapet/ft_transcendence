# TODO: Remove LogHostMiddleware and MiddlewareMixin import

from django.utils.deprecation import MiddlewareMixin

class LogHostMiddleware(MiddlewareMixin):
	def process_request(self, request):
		host = request.get_host()
		print(f"Host header received: {host}")

class UpdateLastActivityMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		response = self.get_response(request)
		if request.user.is_authenticated:
			if request.user.username and request.user.username != ';prometheus;' and request.user.username != ';ws;':
				request.user.update_last_activity()
		return response
