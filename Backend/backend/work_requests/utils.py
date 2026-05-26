from django.utils import timezone


# =========================================================
# GENERATE WORK TITLE
# =========================================================

def generate_work_title(work_type):

    titles = {

        "shop_unloading":
        "Shop Unloading Work",

        "market_loading":
        "Market Loading Work",

        "household_shifting":
        "Household Shifting Work",

        "construction":
        "Construction Material Work",

        "warehouse":
        "Warehouse Loading Work",
    }

    return titles.get(
        work_type,
        "General Loading Work"
    )


# =========================================================
# GENERATE PRIORITY LABEL
# =========================================================

def determine_priority(
    estimated_workers,
    estimated_duration
):

    if (
        estimated_workers >= 8
        or
        estimated_duration >= 6
    ):

        return "high"

    elif (
        estimated_workers >= 4
    ):

        return "medium"

    return "low"


# =========================================================
# CHECK WORK EXPIRY
# =========================================================

def is_work_expired(work_request):

    scheduled_datetime = timezone.datetime.combine(

        work_request.scheduled_date,

        work_request.scheduled_time
    )

    scheduled_datetime = timezone.make_aware(
        scheduled_datetime
    )

    return timezone.now() > scheduled_datetime


# =========================================================
# GENERATE SYSTEM CONFIDENCE SCORE
# =========================================================

def generate_confidence_score(
    estimated_workers,
    questionnaire_answers
):

    score = 50

    answer_count = len(
        questionnaire_answers
    )

    score += answer_count * 5

    if estimated_workers >= 5:

        score += 20

    if score > 100:

        score = 100

    return round(score, 2)

import uuid
import decimal

from datetime import (
    datetime,
    date,
    time
)


# =========================================================
# SAFE JSON SERIALIZER
# =========================================================

def serialize_questionnaire_answers(data):

    # =====================================================
    # UUID
    # =====================================================

    if isinstance(data, uuid.UUID):

        return str(data)

    # =====================================================
    # DATETIME
    # =====================================================

    elif isinstance(data, datetime):

        return data.isoformat()

    # =====================================================
    # DATE
    # =====================================================

    elif isinstance(data, date):

        return data.isoformat()

    # =====================================================
    # TIME
    # =====================================================

    elif isinstance(data, time):

        return data.isoformat()

    # =====================================================
    # DECIMAL
    # =====================================================

    elif isinstance(data, decimal.Decimal):

        return float(data)

    # =====================================================
    # DICTIONARY
    # =====================================================

    elif isinstance(data, dict):

        return {

            key: serialize_questionnaire_answers(value)

            for key, value in data.items()
        }

    # =====================================================
    # LIST
    # =====================================================

    elif isinstance(data, list):

        return [

            serialize_questionnaire_answers(item)

            for item in data
        ]

    # =====================================================
    # TUPLE
    # =====================================================

    elif isinstance(data, tuple):

        return [

            serialize_questionnaire_answers(item)

            for item in data
        ]

    # =====================================================
    # SET
    # =====================================================

    elif isinstance(data, set):

        return [

            serialize_questionnaire_answers(item)

            for item in data
        ]

    # =====================================================
    # BOOLEAN / STRING / INTEGER / FLOAT / NONE
    # =====================================================

    elif isinstance(
        data,
        (
            bool,
            str,
            int,
            float,
            type(None)
        )
    ):

        return data

    # =====================================================
    # FALLBACK
    # =====================================================

    return str(data)