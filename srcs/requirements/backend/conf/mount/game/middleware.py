class UpdateLastActivityMiddleware:
	def __init__(self, get_response):
		self.get_response = get_response

	def __call__(self, request):
		response = self.get_response(request)
		if request.user.is_authenticated:
			if request.user.username and request.user.username != ';prometheus;':
				request.user.update_last_activity()
		return response