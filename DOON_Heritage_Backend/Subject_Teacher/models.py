from django.db import models
from django.contrib.auth.models import User
from Student.models import Subject, ClassRoom

# Custom QuerySet for query optimization
class OptimizedSubjectTeacherAssignmentQuerySet(models.QuerySet):
    def with_relations(self):
        """Optimize SubjectTeacherClassAssignment queries"""
        return self.select_related('classroom', 'subject')

class SubjectTeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subject_teacher_profile')

    def __str__(self):
        return f"{self.user.username} - Subject Teacher"

class SubjectTeacherClassAssignment(models.Model):
    teacher = models.ForeignKey(SubjectTeacherProfile, on_delete=models.CASCADE, related_name='assignments')
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    objects = OptimizedSubjectTeacherAssignmentQuerySet.as_manager()

    class Meta:
        unique_together = ('teacher', 'classroom', 'subject')

    def __str__(self):
        return f"{self.teacher.user.username} - {self.classroom.name} - {self.subject.name}"
