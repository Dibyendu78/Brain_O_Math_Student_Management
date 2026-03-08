from django.db import models
from django.contrib.auth.models import User
from Student.models import ClassRoom

class ClassTeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='class_teacher_profile')
    classes = models.ManyToManyField(ClassRoom, related_name='class_teachers')

    def __str__(self):
        return f"{self.user.username} - Class Teacher"
