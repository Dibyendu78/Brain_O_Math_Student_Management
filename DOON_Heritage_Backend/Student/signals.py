from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import threading
from django.conf import settings
from .utils import send_brevo_email

@receiver(post_save, sender=User)
def send_teacher_welcome_email(sender, instance, created, **kwargs):
    if created and hasattr(instance, '_raw_password') and hasattr(instance, '_role_for_email'):
        # Prepare email content
        role = instance._role_for_email
        role_name = "Class Teacher" if role == "class_teacher" else "Subject Teacher" if role == "subject_teacher" else "Teacher"
        
        context = {
            'name': instance.first_name + " " + instance.last_name if instance.first_name else instance.username,
            'role_name': role_name,
            'username': instance.username,
            'password': instance._raw_password,
            'login_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000/login'),
        }
        
        # We only send if email is provided
        if instance.email:
            # Run in a separate thread so we don't block the API response
            def send_email_task():
                html_message = render_to_string('mail.html', context)
                text_message = strip_tags(html_message)
                
                subject = f"Welcome to Doon Heritage School - Your {role_name} Credentials"
                
                send_brevo_email(
                    to_email=instance.email,
                    to_name=context['name'],
                    subject=subject,
                    html_content=html_message,
                    text_content=text_message
                )
            
            thread = threading.Thread(target=send_email_task)
            thread.start()
