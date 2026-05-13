from rest_framework import serializers
from .models import ClassTeacherProfile

class ClassTeacherProfileSerializer(serializers.ModelSerializer):
    class_ids = serializers.ListField(
        child=serializers.IntegerField(),
        default=list,
        help_text="List of classroom IDs"
    )
    
    class Meta:
        model = ClassTeacherProfile
        fields = ['id', 'user', 'class_ids']
