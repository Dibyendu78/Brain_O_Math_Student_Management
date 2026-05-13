from rest_framework import viewsets, permissions
from .models import SubjectTeacherProfile, SubjectTeacherClassAssignment
from .serializers import SubjectTeacherProfileSerializer, SubjectTeacherClassAssignmentSerializer
from Student.models import Student, StudentMark, Subject
from Student.serializers import StudentSerializer, StudentMarkSerializer, SubjectSerializer

class IsSubjectTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'subject_teacher_profile'))

class MySubjectsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SubjectTeacherClassAssignmentSerializer
    permission_classes = [IsSubjectTeacher]

    def get_queryset(self):
        return self.request.user.subject_teacher_profile.assignments.select_related('classroom', 'subject').all()

class MySubjectStudentsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsSubjectTeacher]

    def get_queryset(self):
        class_ids = self.request.user.subject_teacher_profile.assignments.values_list('classroom_id', flat=True).distinct()
        return Student.objects.select_related('classroom').filter(classroom_id__in=class_ids)

class SubjectTeacherMarksViewSet(viewsets.ModelViewSet):
    serializer_class = StudentMarkSerializer
    permission_classes = [IsSubjectTeacher]

    def get_queryset(self):
        subject_ids = self.request.user.subject_teacher_profile.assignments.values_list('subject_id', flat=True).distinct()
        return StudentMark.objects.select_related('student', 'subject', 'exam').filter(subject_id__in=subject_ids)
