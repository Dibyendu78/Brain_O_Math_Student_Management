from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Student', '0004_remove_classroom_subjects_alter_student_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='exam',
            name='full_marks',
            field=models.PositiveIntegerField(default=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='exam',
            name='classrooms',
            field=models.ManyToManyField(blank=True, related_name='exams', to='Student.classroom'),
        ),
    ]
