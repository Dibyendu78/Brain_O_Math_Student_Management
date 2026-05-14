import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()
from Student.models import ClassRoom
from Student.serializers import ClassRoomSerializer

try:
    c = ClassRoom.objects.create(name='TestClass_Final1', subject_ids=[1,2])
    print('Created:', c.id, c.name, type(c.subject_ids), c.subject_ids)
    ser = ClassRoomSerializer(c)
    print('Serialized:', ser.data)
except Exception as e:
    print('Exception during create:', e)

print('--- Fetching all classes ---')
try:
    for cls in ClassRoom.objects.all():
        print(cls.id, cls.name, type(cls.subject_ids), cls.subject_ids)
        ser = ClassRoomSerializer(cls)
        # Force evaluation of serialized data
        _ = ser.data
except Exception as e:
    import traceback
    traceback.print_exc()

