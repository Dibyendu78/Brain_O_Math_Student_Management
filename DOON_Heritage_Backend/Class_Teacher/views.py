from rest_framework import viewsets, permissions, serializers
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
        class_ids = self.request.user.class_teacher_profile.class_ids
        return ClassRoom.objects.filter(id__in=class_ids)

class MyClassStudentsViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer
    permission_classes = [IsClassTeacher]

    def get_queryset(self):
        class_ids = self.request.user.class_teacher_profile.class_ids
        return Student.objects.select_related('classroom').filter(classroom_id__in=class_ids)

    def perform_create(self, serializer):
        classroom = serializer.validated_data.get('classroom')
        allowed_class_ids = self.request.user.class_teacher_profile.class_ids
        if classroom.id not in allowed_class_ids:
            raise serializers.ValidationError({"classroom": "You can only add students to your assigned classes."})
        serializer.save()

class ClassTeacherMarksViewSet(viewsets.ModelViewSet):
    serializer_class = StudentMarkSerializer
    permission_classes = [IsClassTeacher]

    def get_queryset(self):
        class_ids = self.request.user.class_teacher_profile.class_ids
        students = Student.objects.filter(classroom_id__in=class_ids).values_list('id', flat=True)
        return StudentMark.objects.select_related('student', 'subject', 'exam').filter(student_id__in=students)

    # Note: A real app would override create/update to ensure teachers dont set marks for students outside their classes.
    # For MVP we filter the queryset.
