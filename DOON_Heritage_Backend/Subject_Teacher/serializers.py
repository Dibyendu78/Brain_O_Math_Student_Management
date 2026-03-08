from rest_framework import serializers
from .models import SubjectTeacherProfile
from Student.serializers import UserSerializer, SubjectSerializer

class SubjectTeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)
    
    class Meta:
        model = SubjectTeacherProfile
        fields = ['id', 'user', 'subjects']
