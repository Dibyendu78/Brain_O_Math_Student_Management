from django.db import models
from django.contrib.auth.models import User

class ClassTeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='class_teacher_profile')
    # Store classroom IDs as an array
    class_ids = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user.username} - Class Teacher"
