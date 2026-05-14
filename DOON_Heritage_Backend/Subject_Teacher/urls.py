from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MySubjectsViewSet, MySubjectStudentsViewSet, SubjectTeacherMarksViewSet,
    download_marks_template, upload_marks_excel
)

router = DefaultRouter()
router.register(r'my-subjects', MySubjectsViewSet, basename='my-subjects')
router.register(r'students', MySubjectStudentsViewSet, basename='my-subject-students')
router.register(r'marks', SubjectTeacherMarksViewSet, basename='subject-teacher-marks')

urlpatterns = [
    path('marks-template/', download_marks_template, name='subject-teacher-marks-template'),
    path('marks-upload/', upload_marks_excel, name='subject-teacher-marks-upload'),
    path('', include(router.urls)),
]
