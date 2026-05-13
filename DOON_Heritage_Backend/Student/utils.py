import requests
from django.conf import settings

def send_brevo_email(to_email: str, to_name: str, subject: str, html_content: str, text_content: str = "") -> tuple[bool, str]:
    """Send a single transactional email via Brevo. Returns (success, error_message)."""
    if settings.DEBUG_EMAIL:
        print(f"[DEBUG] Would send email to {to_email} with subject: {subject}")
        return True, ""
    
    if not settings.BREVO_API_KEY:
        error = "[ERROR] BREVO_API_KEY is not set!"
        print(error)
        return False, error
    
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }
    payload = {
        "sender": {"name": settings.OWNER_NAME or "Doon Heritage School", "email": settings.SENDER_EMAIL},
        "to": [{"email": to_email, "name": to_name}],
        "subject": subject,
        "htmlContent": html_content,
    }
    
    if text_content:
        payload["textContent"] = text_content
    
    try:
        resp = requests.post(settings.BREVO_API_URL, json=payload, headers=headers, timeout=10)
        if resp.status_code in (200, 201):
            return True, ""
        else:
            error = f"Brevo API error: {resp.status_code} - {resp.text}"
            print(f"[ERROR] {error}")
            return False, error
    except Exception as e:
        error = f"[ERROR] Failed to send email: {str(e)}"
        print(error)
        return False, error
