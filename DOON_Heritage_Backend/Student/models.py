from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

# Custom QuerySets for query optimization
class OptimizedStudentQuerySet(models.QuerySet):
    def with_classroom(self):
        """Optimize Student queries by prefetching classroom"""
        return self.select_related('classroom')

class OptimizedStudentMarkQuerySet(models.QuerySet):
    def with_relations(self):
        """Optimize StudentMark queries by prefetching all related objects"""
        return self.select_related('student', 'exam', 'subject')

class OptimizedSubjectTeacherAssignmentQuerySet(models.QuerySet):
    def with_relations(self):
        """Optimize SubjectTeacherClassAssignment queries"""
        return self.select_related('classroom', 'subject')

class ClassRoom(models.Model):
    name = models.CharField(max_length=50, unique=True)
    # Store subject IDs as an array
    subject_ids = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Student(models.Model):
    name = models.CharField(
        max_length=200,
        validators=[RegexValidator(regex=r'^[A-Za-z\s]+$', message='Name can only contain alphabets and spaces.')]
    )
    email = models.EmailField(blank=True, null=True)
    roll_number = models.CharField(max_length=50, blank=True, null=True)
    parent_name = models.CharField(max_length=200, blank=True, null=True)
    parent_mobile_number = models.CharField(
        max_length=20, 
        blank=True, 
        null=True,
        validators=[RegexValidator(regex=r'^\d{10}$', message='Mobile number must be exactly 10 digits.')]
    )
    date_of_birth = models.DateField(blank=True, null=True)
    residential_address = models.TextField(blank=True, null=True)
    height_in_cm = models.CharField(max_length=20, blank=True, null=True)
    classroom = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='students')

    objects = OptimizedStudentQuerySet.as_manager()

    class Meta:
        unique_together = ('classroom', 'roll_number')

    def __str__(self):
        return self.name

class Exam(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateField()
    full_marks = models.PositiveIntegerField()
    classrooms = models.ManyToManyField(ClassRoom, related_name='exams', blank=True)

    def __str__(self):
        return f"{self.name} - {self.date}"

class StudentMark(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='marks')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='marks')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='marks')
    marks = models.DecimalField(max_digits=5, decimal_places=2)

    objects = OptimizedStudentMarkQuerySet.as_manager()

    class Meta:
        unique_together = ('student', 'exam', 'subject')

    def __str__(self):
        return f"{self.student.name} - {self.subject.name} - {self.marks}"
