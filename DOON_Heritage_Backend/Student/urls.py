from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ClassRoomViewSet, SubjectViewSet,
    StudentViewSet, ExamViewSet, StudentMarkViewSet, current_user
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'classes', ClassRoomViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'students', StudentViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'marks', StudentMarkViewSet)

urlpatterns = [
    path('admin/', include(router.urls)),
    path('auth/me/', current_user, name='current-user'),
]
