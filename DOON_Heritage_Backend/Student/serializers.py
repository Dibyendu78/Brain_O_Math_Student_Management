from rest_framework import serializers
from .models import ClassRoom, Subject, Student, Exam, StudentMark
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    classes = serializers.SerializerMethodField()
    subjects = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'classes', 'subjects']

    def get_role(self, obj):
        roles = []
        if hasattr(obj, 'class_teacher_profile'):
            roles.append('class_teacher')
        if hasattr(obj, 'subject_teacher_profile'):
            roles.append('subject_teacher')
        if 'class_teacher' in roles and 'subject_teacher' in roles:
            return 'both'
        return roles[0] if roles else 'none'

    def get_classes(self, obj):
        classes = set()
        if hasattr(obj, 'class_teacher_profile'):
            classes.update(obj.class_teacher_profile.classes.values_list('id', flat=True))
        if hasattr(obj, 'subject_teacher_profile'):
            classes.update(obj.subject_teacher_profile.classes.values_list('id', flat=True))
        return list(classes)

    def get_subjects(self, obj):
        if hasattr(obj, 'subject_teacher_profile'):
            return list(obj.subject_teacher_profile.subjects.values_list('id', flat=True))
        return []

class ClassRoomSerializer(serializers.ModelSerializer):
    subjects = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = ClassRoom
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    email = serializers.EmailField(allow_blank=True, required=False, allow_null=True)

    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'roll_number', 'classroom', 'classroom_name']

    def validate_email(self, value):
        if value == '':
            return None
        return value

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = '__all__'

class StudentMarkSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = StudentMark
        fields = ['id', 'student', 'student_name', 'exam', 'exam_name', 'subject', 'subject_name', 'marks']
