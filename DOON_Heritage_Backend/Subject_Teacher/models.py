from django.db import models
from django.contrib.auth.models import User
from Student.models import Subject, ClassRoom

class SubjectTeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subject_teacher_profile')
    subjects = models.ManyToManyField(Subject, related_name='subject_teachers')
    classes = models.ManyToManyField(ClassRoom, related_name='subject_teachers')

    def __str__(self):
        return f"{self.user.username} - Subject Teacher"
