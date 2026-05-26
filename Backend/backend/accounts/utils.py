import random
import requests

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from datetime import timedelta

from .models import OTP


# ======================================================
# GENERATE OTP
# ======================================================

def generate_otp():

    return str(random.randint(100000, 999999))


# ======================================================
# CREATE OTP
# ======================================================

def send_email_otp(user, otp_code):

    subject = "LoadLink Verification Code"

    message = f"""
Hello {user.full_name},

Your OTP verification code is:

{otp_code}

This OTP will expire in 5 minutes.

- LaborOS Team
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False
    )


# ======================================================
# SEND SMS OTP
# ======================================================

def send_sms_otp(user, otp_code):

    phone = str(user.phone_number)[-10:]

    url = "https://www.fast2sms.com/dev/bulkV2"

    payload = {
        "route": "q",

        "message": f"Your LoadLink OTP is {otp_code}",

        "language": "english",

        "numbers": phone,
    }

    headers = {
        "authorization": settings.FAST2SMS_API_KEY
    }

    response = requests.post(
        url,
        data=payload,
        headers=headers
    )

    print("FAST2SMS RESPONSE:")
    print(response.json())

    return response.json()

# ======================================================
# MAIN OTP FUNCTION
# ======================================================

def create_and_send_otp(user, purpose):

    # ----------------------------------------------
    # DELETE OLD OTPs
    # ----------------------------------------------

    OTP.objects.filter(
        user=user,
        purpose=purpose,
        is_verified=False
    ).delete()

    # ----------------------------------------------
    # GENERATE OTP
    # ----------------------------------------------

    if settings.DEBUG:

        otp_code = "123456"

    else:

        otp_code = generate_otp()

    # ----------------------------------------------
    # STORE OTP
    # ----------------------------------------------

    OTP.objects.create(
        user=user,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=timezone.now() + timedelta(minutes=5)
    )

    # ----------------------------------------------
    # SEND EMAIL
    # ----------------------------------------------

    if user.email:

        send_email_otp(
            user,
            otp_code
        )

    # ----------------------------------------------
    # SEND SMS
    # ----------------------------------------------

    send_sms_otp(
        user,
        otp_code
    )

    return otp_code


# ======================================================
# USER RESPONSE FORMATTER
# ======================================================

def success_response(message, data=None):

    return {
        "success": True,
        "message": message,
        "data": data
    }


def error_response(message, errors=None):

    return {
        "success": False,
        "message": message,
        "errors": errors
    }