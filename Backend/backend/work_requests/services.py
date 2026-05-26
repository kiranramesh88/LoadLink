from django.db.models import Q
from django.utils import timezone
from finance.services import process_payment_split
from accounts.models import (
    WorkerProfile
)
import math
from .models import *

from accounts.models import UnionProfile



def calculate_distance(

    lat1,
    lon1,

    lat2,
    lon2
):

    R = 6371

    lat1 = math.radians(float(lat1))
    lon1 = math.radians(float(lon1))

    lat2 = math.radians(float(lat2))
    lon2 = math.radians(float(lon2))

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (

        math.sin(dlat / 2) ** 2

        +

        math.cos(lat1)

        *

        math.cos(lat2)

        *

        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return R * c

def calculate_distance_km(
    lat1,
    lon1,
    lat2,
    lon2
):

    R = 6371

    lat1 = math.radians(float(lat1))
    lon1 = math.radians(float(lon1))

    lat2 = math.radians(float(lat2))
    lon2 = math.radians(float(lon2))

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        math.sin(dlat / 2) ** 2
        +
        math.cos(lat1)
        *
        math.cos(lat2)
        *
        math.sin(dlon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return R * c

def estimate_eta_minutes(

    distance_km
):

    # =====================================
    # AVERAGE SPEED ASSUMPTION
    # =====================================

    avg_speed_kmh = 25

    # =====================================
    # CONVERT TO HOURS
    # =====================================

    eta_hours = (
        distance_km / avg_speed_kmh
    )

    # =====================================
    # CONVERT TO MINUTES
    # =====================================

    eta_minutes = (
        eta_hours * 60
    )

    return round(eta_minutes)

def check_workers_arrived(
    work_request
):

    assignments = WorkAssignment.objects.filter(

        work_request=work_request,

        assignment_status__in=[

            "accepted",

            "in_progress"
        ]
    )

    # =================================================
    # NO ACTIVE ASSIGNMENTS
    # =================================================

    if not assignments.exists():

        return False

    # =================================================
    # CHECK EACH WORKER
    # =================================================

    for assignment in assignments:

        worker = assignment.worker

        print("\n===================")

        print(worker.user.full_name)

        print(worker.current_latitude)

        print(worker.current_longitude)

        # =============================================
        # LOCATION NOT UPDATED
        # =============================================

        if (

            worker.current_latitude is None

            or

            worker.current_longitude is None
        ):

            print("LOCATION MISSING")

            return False

        # =============================================
        # CALCULATE DISTANCE
        # =============================================

        distance = calculate_distance_km(

            float(worker.current_latitude),

            float(worker.current_longitude),

            float(work_request.latitude),

            float(work_request.longitude)
        )

        print("DISTANCE:")

        print(distance)

        # =============================================
        # WORKER TOO FAR
        # =============================================

        if distance > 0.1:

            print("WORKER TOO FAR")

            return False

    # =================================================
    # ALL WORKERS ARRIVED
    # =================================================

    print("ALL WORKERS ARRIVED")

    work_request.status = "workers_arrived"

    work_request.save()

    return True
# =========================================================
# FIND APPROPRIATE UNION
# =========================================================

def find_matching_union(

    customer_latitude,
    customer_longitude):

    unions = UnionProfile.objects.filter(

        approval_status="approved",

        is_active_union=True,

        latitude__isnull=False,

        longitude__isnull=False
    )

    nearest_union = None

    minimum_distance = float("inf")

    for union in unions:

        distance = calculate_distance(

            customer_latitude,
            customer_longitude,

            union.latitude,
            union.longitude
        )

        # =============================================
        # OPTIONAL OPERATIONAL RADIUS CHECK
        # =============================================

        if (
            distance <=
            union.operational_radius_km
        ):

            if distance < minimum_distance:

                minimum_distance = distance

                nearest_union = union

    return nearest_union


# =========================================================
# INTERPRET QUESTIONNAIRE ANSWERS
# =========================================================

def interpret_questionnaire_answers(validated_data):

    answers = validated_data.get(
        "answers",
        []
    )

    work_type = validated_data.get(
        "work_type"
    )

    interpreted_data = {

        "title": "",

        "description": "",

        "goods_details": {},

        "estimated_workers": 1,

        "priority": "medium",

        "difficulty": "low",
    }

    parsed_answers = {}

    # =====================================================
    # CONVERT ANSWERS TO DICTIONARY
    # =====================================================

    for item in answers:

        question_id = str(
            item.get("question_id")
        )

        answer = item.get("answer")

        parsed_answers[question_id] = answer

    interpreted_data[
        "goods_details"
    ] = parsed_answers

    # =====================================================
    # WORK TYPE INTERPRETATION
    # =====================================================

    if work_type == "shop_unloading":

        interpreted_data[
            "title"
        ] = "Shop Unloading Work"

        interpreted_data[
            "description"
        ] = (
            "Unloading goods for shop/business"
        )

    elif work_type == "market_loading":

        interpreted_data[
            "title"
        ] = "Market Loading Work"

        interpreted_data[
            "description"
        ] = (
            "Loading/unloading market goods"
        )

    elif work_type == "household_shifting":

        interpreted_data[
            "title"
        ] = "Household Shifting"

        interpreted_data[
            "description"
        ] = (
            "Household shifting and lifting"
        )

    elif work_type == "construction":

        interpreted_data[
            "title"
        ] = "Construction Material Work"

        interpreted_data[
            "description"
        ] = (
            "Construction loading/unloading"
        )

    else:

        interpreted_data[
            "title"
        ] = "General Loading Work"

        interpreted_data[
            "description"
        ] = (
            "General loading and unloading work"
        )

    return interpreted_data


# =========================================================
# CALCULATE WORK ESTIMATION
# =========================================================

def calculate_estimation_details(interpreted_data):

    goods_details = interpreted_data.get(
        "goods_details",
        {}
    )

    estimated_workers = 2

    estimated_duration_hours = 2

    estimated_weight_kg = 100

    estimated_distance_meters = 20

    estimated_price = 500

    difficulty_score = 20

    priority = "medium"

    # =====================================================
    # SIMPLE RULE-BASED ESTIMATION ENGINE
    # =====================================================

    total_quantity = 0

    for value in goods_details.values():

        if isinstance(value, int):

            total_quantity += value

        elif isinstance(value, float):

            total_quantity += value

    # =====================================================
    # WORKER ESTIMATION
    # =====================================================

    if total_quantity >= 500:

        estimated_workers = 8

        estimated_duration_hours = 6

        estimated_price = 5000

        difficulty_score = 90

        priority = "high"

    elif total_quantity >= 200:

        estimated_workers = 5

        estimated_duration_hours = 4

        estimated_price = 3000

        difficulty_score = 70

        priority = "medium"

    elif total_quantity >= 100:

        estimated_workers = 3

        estimated_duration_hours = 3

        estimated_price = 1500

        difficulty_score = 50

    else:

        estimated_workers = 2

        estimated_duration_hours = 2

        estimated_price = 700

        difficulty_score = 30

    return {

        "estimated_workers":
        estimated_workers,

        "estimated_duration_hours":
        estimated_duration_hours,

        "estimated_weight_kg":
        estimated_weight_kg,

        "estimated_distance_meters":
        estimated_distance_meters,

        "estimated_price":
        estimated_price,

        "difficulty_score":
        difficulty_score,

        "priority":
        priority,
    }


# =========================================================
# CALCULATE WORKLOAD SCORE
# =========================================================

def calculate_workload_score(worker):

    score = 100

    # =====================================================
    # REDUCE SCORE BASED ON CURRENT LOAD
    # =====================================================

    score -= (
        worker.today_work_count * 10
    )

    score -= (
        worker.weekly_work_count * 5
    )

    # =====================================================
    # BOOST IDLE WORKERS
    # =====================================================

    score += (
        worker.idle_time_hours * 2
    )

    # =====================================================
    # RELIABILITY BONUS
    # =====================================================

    score += (
        worker.reliability_score * 0.2
    )

    # =====================================================
    # RATING BONUS
    # =====================================================

    score += (
        worker.average_rating * 2
    )

    # =====================================================
    # PENALIZE DISPUTES
    # =====================================================

    score -= (
        worker.dispute_count * 5
    )

    return round(score, 2)


# =========================================================
# CHECK TEAM PREFERENCE COMPATIBILITY
# =========================================================

def calculate_preference_match_score(
    worker,
    selected_workers
):

    # MVP VERSION
    # Preference system disabled temporarily

    return 50


# =========================================================
# MAIN TEAM SUGGESTION ENGINE
# =========================================================

def suggest_worker_team(work_request):

    required_workers = (
        work_request.estimated_workers
    )

    district = work_request.district

    work_type = work_request.work_type

    assigned_union = (
        work_request.assigned_union
    )

    # =====================================================
    # FILTER AVAILABLE WORKERS
    # =====================================================

    available_workers = WorkerProfile.objects.filter(

        union=assigned_union,

        user__district=district,

        availability_status="available",

        verification_status="verified",

        is_currently_assigned=False,

        user__is_verified=True

    ).select_related(
        "user",
        "union"
    )

    worker_scores = []

    selected_workers = []

    # =====================================================
    # CALCULATE SCORES
    # =====================================================

    for worker in available_workers:

        workload_score = (
            calculate_workload_score(
                worker
            )
        )

        preference_score = (
            calculate_preference_match_score(
                worker,
                selected_workers
            )
        )

        final_score = (

            workload_score * 0.70

            +

            preference_score * 0.30
        )

        # =================================================
        # PREFERRED WORK TYPE BONUS
        # =================================================

        preferred_types = getattr(
            worker,
            "preferred_work_types",
            []
        )

        if work_type in preferred_types:

            final_score += 10

        worker_scores.append({

            "worker": worker,

            "score": round(
                final_score,
                2
            )
        })

    # =====================================================
    # SORT BY SCORE
    # =====================================================

    sorted_workers = sorted(

        worker_scores,

        key=lambda x: x["score"],

        reverse=True
    )

    # =====================================================
    # SELECT REQUIRED WORKERS
    # =====================================================

    final_team = []

    for item in sorted_workers:

        if len(final_team) >= required_workers:

            break

        final_team.append(
            item["worker"]
        )

    return final_team

# =========================================================
# GENERATE TEAM LEADER
# =========================================================

def generate_team_leader(selected_workers):

    if not selected_workers:

        return None

    leader = max(

        selected_workers,

        key=lambda worker: (

            worker.reliability_score,

            worker.average_rating,

            worker.total_completed_works
        )
    )

    return leader


# =========================================================
# UPDATE WORKER WORKLOAD
# =========================================================

def update_worker_workload(worker):

    current_time = timezone.now()

    if worker.last_work_completed_at:

        idle_duration = (
            current_time -
            worker.last_work_completed_at
        )

        worker.idle_time_hours = round(

            idle_duration.total_seconds() / 3600,

            2
        )

    else:

        worker.idle_time_hours = 100

    workload_score = calculate_workload_score(
        worker
    )

    worker.workload_score = workload_score

    worker.save()

    return worker


# =========================================================
# BULK UPDATE ALL WORKERS
# =========================================================

def refresh_all_worker_workloads():

    workers = WorkerProfile.objects.all()

    for worker in workers:

        update_worker_workload(worker)

    return True


# =========================================================
# ESTIMATE WORK COMPLEXITY
# =========================================================

def estimate_work_complexity(work_request):

    complexity = 0

    complexity += (
        work_request.estimated_workers * 10
    )

    complexity += (
        work_request.estimated_duration_hours * 5
    )

    complexity += (
        work_request.difficulty_score
    )

    if work_request.priority == "urgent":

        complexity += 20

    return round(complexity, 2)


def replace_rejected_worker(

    work_request,

    rejected_worker
):

    assigned_team = work_request.assigned_team

    existing_workers = (
        assigned_team.workers.all()
    )

    # =====================================================
    # FIND AVAILABLE REPLACEMENT
    # =====================================================

    replacement_worker = WorkerProfile.objects.filter(

        union=work_request.assigned_union,

        availability_status="available",

        verification_status="verified",

        is_currently_assigned=False,

        user__is_verified=True

    ).exclude(

        id__in=existing_workers.values_list(
            "id",
            flat=True
        )

    ).exclude(

        id=rejected_worker.id

    ).first()

    # =====================================================
    # NO REPLACEMENT FOUND
    # =====================================================

    if not replacement_worker:

        return None

    # =====================================================
    # ADD TO TEAM
    # =====================================================

    assigned_team.workers.add(
        replacement_worker
    )

    replacement_worker.is_currently_assigned = True

    replacement_worker.save()

    # =====================================================
    # CREATE NEW ASSIGNMENT
    # =====================================================

    new_assignment = (
        WorkAssignment.objects.create(

            work_request=work_request,

            worker=replacement_worker,

            assigned_by=work_request.assigned_union,

            assignment_status="assigned",

            is_team_leader=False
        )
    )

    return new_assignment


from django.utils import timezone


def finalize_cash_payment(payment):

    if payment.payment_status == "success":
        return

    if (
        payment.customer_payment_confirmed
        and
        payment.worker_payment_confirmed
    ):

        payment.payment_status = "success"

        payment.paid_at = timezone.now()

        payment.save()

        work_request = payment.work_request

        work_request.status = "completed"

        work_request.save()

        process_payment_split(
            work_request,
            payment_method="cash"
        )

        return True

    return False