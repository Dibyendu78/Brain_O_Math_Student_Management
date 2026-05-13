from rest_framework import serializers
from .models import SubjectTeacherProfile, SubjectTeacherClassAssignment
from Student.serializers import UserSerializer

class SubjectTeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = SubjectTeacherProfile
        fields = ['id', 'user']

class SubjectTeacherClassAssignmentSerializer(serializers.ModelSerializer):
    classroom_name = serializers.CharField(source='classroom.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = SubjectTeacherClassAssignment
        fields = ['id', 'teacher', 'classroom', 'classroom_name', 'subject', 'subject_name']
