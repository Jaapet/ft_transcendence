from django.db import models

class User(models.Model):
	firstname = models.CharField(max_length=100)
	lastname = models.CharField(max_length=100)
	phone = models.IntegerField(null=True)
	join_date = models.DateField(null=True)
	male = models.BooleanField(null=True)

	def __str__(self):
		return f"{self.firstname} {self.lastname} ({self.id})"
