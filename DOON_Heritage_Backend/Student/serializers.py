from rest_framework import serializers
from .models import ClassRoom, Subject, Student, Exam, StudentMark
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    class_teacher_classes = serializers.SerializerMethodField()
    subject_teacher_classes = serializers.SerializerMethodField()
    classes = serializers.SerializerMethodField() # Keep for backward compatibility if needed
    subjects = serializers.SerializerMethodField()
    subject_assignments = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'classes', 'class_teacher_classes', 'subject_teacher_classes', 'subjects', 'subject_assignments']

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
            classes.update(obj.class_teacher_profile.class_ids or [])
        if hasattr(obj, 'subject_teacher_profile'):
            classes.update([a.classroom_id for a in obj.subject_teacher_profile.assignments.all()])
        return list(classes)

    def get_class_teacher_classes(self, obj):
        if hasattr(obj, 'class_teacher_profile'):
            return obj.class_teacher_profile.class_ids or []
        return []

    def get_subject_teacher_classes(self, obj):
        if hasattr(obj, 'subject_teacher_profile'):
            return list(set([a.classroom_id for a in obj.subject_teacher_profile.assignments.all()]))
        return []

    def get_subjects(self, obj):
        if hasattr(obj, 'subject_teacher_profile'):
            return list(set([a.subject_id for a in obj.subject_teacher_profile.assignments.all()]))
        return []
        
    def get_subject_assignments(self, obj):
        assignments = {}
        if hasattr(obj, 'subject_teacher_profile'):
            for assignment in obj.subject_teacher_profile.assignments.all():
                class_id = assignment.classroom_id
                subject_id = assignment.subject_id
                if class_id not in assignments:
                    assignments[class_id] = []
                assignments[class_id].append(subject_id)
        return assignments

class ClassRoomSerializer(serializers.ModelSerializer):
    subject_ids = serializers.ListField(
        child=serializers.IntegerField(),
        default=list,
        help_text="List of subject IDs"
    )

    class Meta:
        model = ClassRoom
        fields = ['id', 'name', 'subject_ids']

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    email = serializers.EmailField(allow_blank=True, required=False, allow_null=True)

    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'roll_number', 'parent_name', 'parent_mobile_number', 'date_of_birth', 'residential_address', 'height_in_cm', 'classroom', 'classroom_name']

    def validate_email(self, value):
        if value == '':
            return None
        return value

class ExamSerializer(serializers.ModelSerializer):
    class_ids = serializers.PrimaryKeyRelatedField(
        source='classrooms',
        queryset=ClassRoom.objects.all(),
        many=True,
        write_only=True
    )
    classroom_ids = serializers.SerializerMethodField()
    classroom_names = serializers.SerializerMethodField()

    class Meta:
        model = Exam
        fields = ['id', 'name', 'date', 'full_marks', 'class_ids', 'classroom_ids', 'classroom_names']

    def get_classroom_ids(self, obj):
        return list(obj.classrooms.values_list('id', flat=True))

    def get_classroom_names(self, obj):
        return list(obj.classrooms.values_list('name', flat=True))

class StudentMarkSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = StudentMark
        fields = ['id', 'student', 'student_name', 'exam', 'exam_name', 'subject', 'subject_name', 'marks']
