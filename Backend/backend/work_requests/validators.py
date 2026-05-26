from django.core.exceptions import ValidationError

from django.utils import timezone

from datetime import timedelta

from .models import (
    WorkRequest
)


# =========================================================
# VALIDATE WORKER COUNT
# =========================================================

def validate_worker_count(value):

    if value <= 0:

        raise ValidationError(
            "At least one worker is required."
        )

    if value > 50:

        raise ValidationError(
            "Worker count exceeds allowed limit."
        )


# =========================================================
# VALIDATE ESTIMATED PRICE
# =========================================================

def validate_price(value):

    if value < 0:

        raise ValidationError(
            "Price cannot be negative."
        )

    if value > 1000000:

        raise ValidationError(
            "Price exceeds allowed limit."
        )


# =========================================================
# VALIDATE WORK DURATION
# =========================================================

def validate_work_duration(value):

    if value <= 0:

        raise ValidationError(
            "Work duration must be greater than zero."
        )

    if value > 24:

        raise ValidationError(
            "Work duration cannot exceed 24 hours."
        )


# =========================================================
# VALIDATE FUTURE DATE
# =========================================================

def validate_future_date(value):

    if value < timezone.now().date():

        raise ValidationError(
            "Scheduled date cannot be in the past."
        )


# =========================================================
# VALIDATE FUTURE TIME
# =========================================================

def validate_future_datetime(
    scheduled_date,
    scheduled_time
):

    scheduled_datetime = timezone.datetime.combine(
        scheduled_date,
        scheduled_time
    )

    scheduled_datetime = timezone.make_aware(
        scheduled_datetime
    )

    if scheduled_datetime < timezone.now():

        raise ValidationError(
            "Scheduled time must be in the future."
        )


# =========================================================
# VALIDATE DISTRICT
# =========================================================

def validate_district(value):

    allowed_districts = [

        "Thiruvananthapuram",
        "Kollam",
        "Pathanamthitta",
        "Alappuzha",
        "Kottayam",
        "Idukki",
        "Ernakulam",
        "Thrissur",
        "Palakkad",
        "Malappuram",
        "Kozhikode",
        "Wayanad",
        "Kannur",
        "Kasaragod",
    ]

    if value not in allowed_districts:

        raise ValidationError(
            "Invalid district selected."
        )


# =========================================================
# VALIDATE QUESTIONNAIRE ANSWERS
# =========================================================

def validate_questionnaire_answers(value):

    if not isinstance(value, dict):

        raise ValidationError(
            "Questionnaire answers must be a dictionary."
        )

    if len(value) == 0:

        raise ValidationError(
            "Questionnaire answers cannot be empty."
        )


# =========================================================
# VALIDATE GOODS DETAILS
# =========================================================

def validate_goods_details(value):

    if not isinstance(value, dict):

        raise ValidationError(
            "Goods details must be a dictionary."
        )


# =========================================================
# VALIDATE LATITUDE
# =========================================================

def validate_latitude(value):

    if value < -90 or value > 90:

        raise ValidationError(
            "Invalid latitude value."
        )


# =========================================================
# VALIDATE LONGITUDE
# =========================================================

def validate_longitude(value):

    if value < -180 or value > 180:

        raise ValidationError(
            "Invalid longitude value."
        )


# =========================================================
# VALIDATE WORK STATUS TRANSITION
# =========================================================

def validate_status_transition(
    current_status,
    new_status
):

    valid_transitions = {

        "pending": [
            "union_review",
            "cancelled"
        ],

        "union_review": [
            "team_suggested",
            "cancelled"
        ],

        "team_suggested": [
            "team_confirmed",
            "cancelled"
        ],

        "team_confirmed": [
            "workers_notified",
            "cancelled"
        ],

        "workers_notified": [
            "accepted",
            "cancelled"
        ],

        "accepted": [
            "in_progress",
            "cancelled"
        ],

        "in_progress": [
            "completion_pending",
            "disputed"
        ],

        "completion_pending": [
            "completed",
            "disputed"
        ],

        "disputed": [
            "completed"
        ]
    }

    allowed_statuses = valid_transitions.get(
        current_status,
        []
    )

    if new_status not in allowed_statuses:

        raise ValidationError(
            f"Cannot change status from "
            f"{current_status} to {new_status}"
        )


# =========================================================
# VALIDATE WORK REQUEST CANCELLATION
# =========================================================

def validate_work_cancellation(work_request):

    restricted_statuses = [

        "completed",

        "in_progress",

        "completion_pending"
    ]

    if work_request.status in restricted_statuses:

        raise ValidationError(
            "Cannot cancel work at current stage."
        )


# =========================================================
# VALIDATE TEAM SIZE
# =========================================================

def validate_team_size(
    selected_workers,
    required_workers
):

    if len(selected_workers) < required_workers:

        raise ValidationError(
            "Insufficient workers selected."
        )


# =========================================================
# VALIDATE EVIDENCE IMAGE
# =========================================================

def validate_evidence_image(image):

    max_size = 5 * 1024 * 1024

    allowed_extensions = [

        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    ]

    if image.size > max_size:

        raise ValidationError(
            "Image size exceeds 5MB limit."
        )

    extension = image.name.lower()

    if not any(

        extension.endswith(ext)

        for ext in allowed_extensions
    ):

        raise ValidationError(
            "Unsupported image format."
        )


# =========================================================
# VALIDATE DUPLICATE ACTIVE REQUEST
# =========================================================

def validate_duplicate_active_request(
    customer,
    work_type
):

    existing_request = WorkRequest.objects.filter(

        customer=customer,

        work_type=work_type,

        status__in=[

            "pending",

            "union_review",

            "team_suggested",

            "team_confirmed",

            "workers_notified",

            "accepted",

            "in_progress"
        ]

    ).exists()

    if existing_request:

        raise ValidationError(
            "You already have an active request "
            "for this work type."
        )