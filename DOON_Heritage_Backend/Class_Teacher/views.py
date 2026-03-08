from rest_framework import viewsets, permissions
from .models import ClassTeacherProfile
from .serializers import ClassTeacherProfileSerializer
from Student.models import Student, StudentMark, ClassRoom
from Student.serializers import StudentSerializer, StudentMarkSerializer, ClassRoomSerializer

class IsClassTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and hasattr(request.user, 'class_teacher_profile'))

class MyClassesViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ClassRoomSerializer
    permission_classes = [IsClassTeacher]

    def get_queryset(self):
        return self.request.user.class_teacher_profile.classes.all()

class MyClassStudentsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsClassTeacher]

    def get_queryset(self):
        classes = self.request.user.class_teacher_profile.classes.all()
        return Student.objects.filter(classroom__in=classes)

class ClassTeacherMarksViewSet(viewsets.ModelViewSet):
    serializer_class = StudentMarkSerializer
    permission_classes = [IsClassTeacher]

    def get_queryset(self):
        classes = self.request.user.class_teacher_profile.classes.all()
        students = Student.objects.filter(classroom__in=classes)
        return StudentMark.objects.filter(student__in=students)

    # Note: A real app would override create/update to ensure teachers dont set marks for students outside their classes.
    # For MVP we filter the queryset.
