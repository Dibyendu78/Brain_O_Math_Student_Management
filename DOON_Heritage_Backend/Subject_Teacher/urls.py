from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MySubjectsViewSet, MySubjectStudentsViewSet, SubjectTeacherMarksViewSet
)

router = DefaultRouter()
router.register(r'my-subjects', MySubjectsViewSet, basename='my-subjects')
router.register(r'students', MySubjectStudentsViewSet, basename='my-subject-students')
router.register(r'marks', SubjectTeacherMarksViewSet, basename='subject-teacher-marks')

urlpatterns = [
    path('', include(router.urls)),
]
