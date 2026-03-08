from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MyClassesViewSet, MyClassStudentsViewSet, ClassTeacherMarksViewSet
)

router = DefaultRouter()
router.register(r'my-classes', MyClassesViewSet, basename='my-classes')
router.register(r'students', MyClassStudentsViewSet, basename='my-class-students')
router.register(r'marks', ClassTeacherMarksViewSet, basename='class-teacher-marks')

urlpatterns = [
    path('', include(router.urls)),
]
