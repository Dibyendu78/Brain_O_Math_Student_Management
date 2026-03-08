from rest_framework import viewsets, permissions
from .models import SubjectTeacherProfile
from .serializers import SubjectTeacherProfileSerializer
from Student.models import Student, StudentMark, Subject
from Student.serializers import StudentSerializer, StudentMarkSerializer, SubjectSerializer

class IsSubjectTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'subject_teacher_profile'))

class MySubjectsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubjectSerializer
    permission_classes = [IsSubjectTeacher]

    def get_queryset(self):
        return self.request.user.subject_teacher_profile.subjects.all()

class MySubjectStudentsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsSubjectTeacher]

    def get_queryset(self):
        classes = self.request.user.subject_teacher_profile.classes.all()
        return Student.objects.filter(classroom__in=classes)

class SubjectTeacherMarksViewSet(viewsets.ModelViewSet):
    serializer_class = StudentMarkSerializer
    permission_classes = [IsSubjectTeacher]

    def get_queryset(self):
        subjects = self.request.user.subject_teacher_profile.subjects.all()
        return StudentMark.objects.filter(subject__in=subjects)
