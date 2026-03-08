from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
import csv
import io
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import ClassRoom, Subject, Student, Exam, StudentMark
from .serializers import (
    UserSerializer, ClassRoomSerializer, SubjectSerializer,
    StudentSerializer, ExamSerializer, StudentMarkSerializer
)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    user = request.user
    roles = []
    if user.is_superuser:
        roles.append('admin')
    if hasattr(user, 'class_teacher_profile'):
        roles.append('class_teacher')
    if hasattr(user, 'subject_teacher_profile'):
        roles.append('subject_teacher')
        
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'name': f"{user.first_name} {user.last_name}".strip(),
        'roles': roles
    })

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class IsSuperAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_superuser)

from Class_Teacher.models import ClassTeacherProfile
from Subject_Teacher.models import SubjectTeacherProfile

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]

    def create(self, request, *args, **kwargs):
        data = request.data
        user = User.objects.create(
            username=data.get('username'),
            email=data.get('email', ''),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', '')
        )
        if 'password' in data:
            user.set_password(data['password'])
            user.save()
            
        role = data.get('role')
        if role == 'class_teacher' or role == 'both':
            ctp = ClassTeacherProfile.objects.create(user=user)
            if 'classes' in data:
                ctp.classes.set(data['classes'])
                
        if role == 'subject_teacher' or role == 'both':
            stp = SubjectTeacherProfile.objects.create(user=user)
            if 'subjects' in data:
                stp.subjects.set(data['subjects'])
            if 'classes' in data:
                stp.classes.set(data['classes'])
            
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        data = request.data
        
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        
        if 'password' in data and data['password']:
            user.set_password(data['password'])
            
        user.save()
        
        role = data.get('role')
        # Simple role toggle logic
        if role == 'class_teacher' or role == 'both':
            ctp, _ = ClassTeacherProfile.objects.get_or_create(user=user)
            if 'classes' in data:
                ctp.classes.set(data['classes'])
        else:
            ClassTeacherProfile.objects.filter(user=user).delete()
            
        if role == 'subject_teacher' or role == 'both':
            stp, _ = SubjectTeacherProfile.objects.get_or_create(user=user)
            if 'subjects' in data:
                stp.subjects.set(data['subjects'])
            if 'classes' in data:
                stp.classes.set(data['classes'])
        else:
            SubjectTeacherProfile.objects.filter(user=user).delete()

        serializer = self.get_serializer(user)
        return Response(serializer.data)

class ClassRoomViewSet(viewsets.ModelViewSet):
    queryset = ClassRoom.objects.all()
    serializer_class = ClassRoomSerializer
    permission_classes = [IsSuperAdmin]

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsSuperAdminOrReadOnly]

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsSuperAdmin]

    @action(detail=False, methods=['post'])
    def upload_csv(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        if not csv_file.name.lower().endswith('.csv'):
            return Response({'error': 'File is not CSV type.'}, status=status.HTTP_400_BAD_REQUEST)

        data_set = csv_file.read().decode('UTF-8')
        io_string = io.StringIO(data_set)

        # Try to detect header row; if missing, assume order: class, roll_number, name, email
        has_header = False
        try:
            has_header = csv.Sniffer().has_header(data_set)
        except Exception:
            pass

        created_count = 0
        updated_count = 0

        if has_header:
            reader = csv.DictReader(io_string)
            for row in reader:
                # Support different header names
                name = (row.get('name') or row.get('Name') or row.get('student_name') or row.get('Student Name'))
                if not name:
                    continue

                class_name = (row.get('class_name') or row.get('class') or row.get('Class') or row.get('Class Name') or 'Unknown')
                roll_number = (row.get('roll_number') or row.get('roll') or row.get('Roll Number') or row.get('Roll'))
                email = (row.get('email') or row.get('Email'))

                classroom, _ = ClassRoom.objects.get_or_create(name=class_name)

                student = None
                if roll_number:
                    student = Student.objects.filter(classroom=classroom, roll_number=roll_number).first()
                if not student:
                    student = Student.objects.filter(classroom=classroom, name=name).first()

                if student:
                    student.name = name
                    student.roll_number = roll_number or None
                    student.email = email or None
                    student.save()
                    updated_count += 1
                else:
                    Student.objects.create(
                        name=name,
                        email=email or None,
                        roll_number=roll_number,
                        classroom=classroom
                    )
                    created_count += 1
        else:
            # No header row: assume columns [class, roll_number, name, email?]
            reader = csv.reader(io_string)
            for row in reader:
                if not row or all(not col.strip() for col in row):
                    continue

                class_name = row[0].strip() if len(row) > 0 else ''
                roll_number = row[1].strip() if len(row) > 1 else ''
                name = row[2].strip() if len(row) > 2 else ''
                email = row[3].strip() if len(row) > 3 else ''

                if not name:
                    continue

                classroom, _ = ClassRoom.objects.get_or_create(name=class_name or 'Unknown')

                student = None
                if roll_number:
                    student = Student.objects.filter(classroom=classroom, roll_number=roll_number).first()
                if not student:
                    student = Student.objects.filter(classroom=classroom, name=name).first()

                if student:
                    student.name = name
                    student.roll_number = roll_number or None
                    student.email = email or None
                    student.save()
                    updated_count += 1
                else:
                    Student.objects.create(
                        name=name,
                        email=email or None,
                        roll_number=roll_number,
                        classroom=classroom
                    )
                    created_count += 1

        return Response(
            {'message': f'Successfully processed {created_count} created and {updated_count} updated students.'},
            status=status.HTTP_200_OK
        )

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer
    permission_classes = [IsSuperAdminOrReadOnly]

class StudentMarkViewSet(viewsets.ModelViewSet):
    queryset = StudentMark.objects.all()
    serializer_class = StudentMarkSerializer
    permission_classes = [IsSuperAdmin]
