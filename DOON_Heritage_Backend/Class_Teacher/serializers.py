from rest_framework import serializers
from .models import ClassTeacherProfile
from Student.serializers import UserSerializer, ClassRoomSerializer

class ClassTeacherProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    classes = ClassRoomSerializer(many=True, read_only=True)
    
    class Meta:
        model = ClassTeacherProfile
        fields = ['id', 'user', 'classes']
