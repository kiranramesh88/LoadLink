from rest_framework import serializers
from decimal import Decimal

from accounts.serializers import *

from .models import *


# =========================================================
# QUESTIONNAIRE TEMPLATE SERIALIZER
# =========================================================

class QuestionnaireTemplateSerializer(serializers.ModelSerializer):

    class Meta:

        model = QuestionnaireTemplate

        fields = "__all__"


# =========================================================
# WORK EVIDENCE SERIALIZER
# =========================================================

class WorkEvidenceSerializer(serializers.ModelSerializer):

    uploaded_by = UserSerializer(
        read_only=True
    )

    class Meta:

        model = WorkEvidence

        fields = "__all__"

        read_only_fields = (
            "evidence_id",
            "uploaded_by",
            "uploaded_at",
        )


# =========================================================
# WORK STATUS LOG SERIALIZER
# =========================================================

class WorkStatusLogSerializer(serializers.ModelSerializer):

    updated_by = UserSerializer(
        read_only=True
    )

    class Meta:

        model = WorkStatusLog

        fields = "__all__"

        read_only_fields = (
            "log_id",
            "updated_by",
            "created_at",
        )


# =========================================================
# WORK ASSIGNMENT SERIALIZER
# =========================================================

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"

class WorkAssignmentSerializer(serializers.ModelSerializer):

    worker = WorkerProfileSerializer(
        read_only=True
    )

    assigned_by = UnionProfileSerializer(
        read_only=True
    )

    class Meta:

        model = WorkAssignment

        fields = "__all__"

        read_only_fields = (
            "assignment_id",
            "assigned_at",
            "accepted_at",
            "completed_at",
        )

class WorkerAssignmentListSerializer(
    serializers.ModelSerializer
):
    customer_name = serializers.SerializerMethodField()

    customer_phone = serializers.SerializerMethodField()

    latitude = serializers.SerializerMethodField()

    longitude = serializers.SerializerMethodField()

    work_address = serializers.SerializerMethodField()

    def get_customer_name(self, obj):

        if obj.assignment_status in ["accepted", "in_progress", "completed"]:

            return (
                obj.work_request.customer
                .user.full_name
            )

        return None


    def get_customer_phone(self, obj):

        if obj.assignment_status in ["accepted", "in_progress", "completed"]:

            return str(

                obj.work_request.customer
                .user.phone_number
            )

        return None


    def get_latitude(self, obj):

        if obj.assignment_status in ["accepted", "in_progress", "completed"]:

            return obj.work_request.latitude

        return None


    def get_longitude(self, obj):

        if obj.assignment_status in ["accepted", "in_progress", "completed"]:

            return obj.work_request.longitude

        return None


    def get_work_address(self, obj):

        if obj.assignment_status in ["accepted", "in_progress", "completed"]:

            return obj.work_request.work_address

        return "Accept assignment to view location"

    my_share = serializers.SerializerMethodField()

    def get_my_share(self, obj):
        total_price = obj.work_request.final_price or obj.work_request.estimated_price

        if not total_price:
            return None

        union = obj.work_request.assigned_union

        if not union:
            return total_price

        total = Decimal(total_price)
        commission_pct = Decimal(union.commission_percentage)
        union_share = (total * commission_pct) / Decimal("100")
        workers_total = total - union_share

        workers_count = WorkAssignment.objects.filter(
            work_request=obj.work_request,
            assignment_status__in=["assigned", "accepted", "in_progress", "completed"]
        ).count()

        if workers_count > 0:
            return float(round(workers_total / workers_count, 2))

        return None

    work_title = serializers.CharField(
        source="work_request.title",
        read_only=True
    )

    work_type = serializers.CharField(
        source="work_request.work_type",
        read_only=True
    )

    work_status = serializers.CharField(
        source="work_request.status",
        read_only=True
    )

    work_request_id = serializers.UUIDField(
        source="work_request.request_id",
        read_only=True
    )

    scheduled_date = serializers.DateField(
        source="work_request.scheduled_date",
        read_only=True
    )

    scheduled_time = serializers.TimeField(
        source="work_request.scheduled_time",
        read_only=True
    )

    # NOTE: work_address is already defined as SerializerMethodField above
    # (provides privacy: hides location until accepted). Do NOT redefine here.

    class Meta:

        model = WorkAssignment

        fields = (
            "assignment_id",
            "work_request_id",
            "assignment_status",
            "is_team_leader",
            "assigned_at",
            "accepted_at",
            "work_title",
            "work_type",
            "work_status",
            "scheduled_date",
            "scheduled_time",
            "work_address",
            "customer_name",
            "customer_phone",
            "latitude",
            "longitude",
            "my_share",
        )


# =========================================================
# WORKER DETAIL SERIALIZER (for team view)
# =========================================================

class WorkerDetailSerializer(serializers.ModelSerializer):
    """Rich worker serializer with nested user info and key stats for team display."""
    full_name          = serializers.CharField(source='user.full_name',     read_only=True)
    phone_number       = serializers.CharField(source='user.phone_number',  read_only=True)
    profile_photo      = serializers.ImageField(source='user.profile_image', read_only=True, use_url=True)

    class Meta:
        model = WorkerProfile
        fields = (
            'worker_id',
            'full_name',
            'phone_number',
            'profile_photo',
            'experience_years',
            'availability_status',
            'verification_status',
            'average_rating',
            'reliability_score',
            'workload_score',
            'total_completed_works',
            'is_team_lead_eligible',
            'is_currently_assigned',
        )


# =========================================================
# ASSIGNED TEAM SERIALIZER
# =========================================================

class AssignedTeamSerializer(serializers.ModelSerializer):

    assigned_by_union = UnionProfileSerializer(
        read_only=True
    )

    team_leader = WorkerDetailSerializer(
        read_only=True
    )

    workers = WorkerDetailSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = AssignedTeam

        fields = "__all__"

        read_only_fields = (
            "team_id",
            "created_at",
            "updated_at",
        )


# =========================================================
# DISPUTE SERIALIZER
# =========================================================

class DisputeSerializer(serializers.ModelSerializer):

    raised_by = UserSerializer(
        read_only=True
    )

    resolved_by = UserSerializer(
        read_only=True
    )

    class Meta:

        model = Dispute

        fields = "__all__"

        read_only_fields = (
            "dispute_id",
            "created_at",
            "updated_at",
        )


# =========================================================
# WORK REQUEST LIST SERIALIZER
# =========================================================

class CustomerBasicSerializer(serializers.ModelSerializer):
    """Lightweight customer serializer with nested user info for list views."""
    full_name    = serializers.CharField(source='user.full_name',    read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)
    email        = serializers.CharField(source='user.email',        read_only=True)

    class Meta:
        model  = CustomerProfile
        fields = (
            'full_name',
            'phone_number',
            'email',
            'business_name',
            'business_type',
        )


class WorkRequestListSerializer(serializers.ModelSerializer):

    customer = CustomerBasicSerializer(read_only=True)

    assigned_union = UnionProfileSerializer(read_only=True)

    class Meta:

        model = WorkRequest

        fields = (
            "request_id",
            "title",
            "work_type",
            "priority",
            "status",
            "estimated_workers",
            "estimated_price",
            "estimated_duration_hours",
            "district",
            "work_address",
            "scheduled_date",
            "scheduled_time",
            "customer",
            "assigned_union",
            "created_at",
        )


# =========================================================
# WORK REQUEST DETAIL SERIALIZER
# =========================================================

class WorkRequestDetailSerializer(serializers.ModelSerializer):

    customer = CustomerBasicSerializer(
        read_only=True
    )

    assigned_union = UnionProfileSerializer(
        read_only=True
    )

    assigned_team = AssignedTeamSerializer(
        read_only=True
    )

    worker_assignments = WorkAssignmentSerializer(
        many=True,
        read_only=True
    )

    status_logs = WorkStatusLogSerializer(
        many=True,
        read_only=True
    )

    evidences = WorkEvidenceSerializer(
        many=True,
        read_only=True
    )

    disputes = DisputeSerializer(
        many=True,
        read_only=True
    )

    payment = PaymentSerializer(
        read_only=True
    )

    my_share = serializers.SerializerMethodField()

    def get_my_share(self, obj):

        request = self.context.get("request")

        if not request or not hasattr(request.user, "role") or request.user.role != "WORKER":
            return None

        total_price = obj.final_price or obj.estimated_price

        if not total_price:
            return None

        union = obj.assigned_union

        if not union:
            return total_price

        total = Decimal(total_price)
        commission_pct = Decimal(union.commission_percentage)
        union_share = (total * commission_pct) / Decimal("100")
        workers_total = total - union_share

        workers_count = obj.worker_assignments.filter(
            assignment_status__in=["assigned", "accepted", "in_progress", "completed"]
        ).count()

        if workers_count > 0:
            return float(round(workers_total / workers_count, 2))

        return None

    class Meta:

        model = WorkRequest

        fields = "__all__"

        read_only_fields = (
            "request_id",
            "estimated_workers",
            "estimated_duration_hours",
            "estimated_weight_kg",
            "estimated_distance_meters",
            "estimated_price",
            "final_price",
            "difficulty_score",
            "system_confidence_score",
            "suggested_team_generated",
            "work_start_time",
            "work_completed_time",
            "created_at",
            "updated_at",
        )


# =========================================================
# CREATE WORK REQUEST SERIALIZER
# =========================================================

class CreateWorkRequestSerializer(serializers.ModelSerializer):

    class Meta:

        model = WorkRequest

        fields = (

            # =========================================
            # BASIC DETAILS
            # =========================================

            "title",
            "description",
            "work_type",
            "priority",

            # =========================================
            # QUESTIONNAIRE
            # =========================================

            "questionnaire_answers",
            "goods_details",

            # =========================================
            # LOCATION
            # =========================================

            "work_address",
            "landmark",
            "district",
            "latitude",
            "longitude",

            # =========================================
            # SCHEDULE
            # =========================================

            "scheduled_date",
            "scheduled_time",
        )

    def validate(self, attrs):

        questionnaire_answers = attrs.get(
            "questionnaire_answers"
        )

        if not questionnaire_answers:

            raise serializers.ValidationError(
                {
                    "questionnaire_answers":
                    "Questionnaire answers are required."
                }
            )

        return attrs


# =========================================================
# UPDATE WORK STATUS SERIALIZER
# =========================================================

class UpdateWorkStatusSerializer(serializers.Serializer):

    status = serializers.CharField()

    remarks = serializers.CharField(
        required=False,
        allow_blank=True
    )


# =========================================================
# ASSIGN TEAM SERIALIZER
# =========================================================

class AssignTeamSerializer(serializers.Serializer):

    worker_ids = serializers.ListField(
        child=serializers.IntegerField()
    )

    team_leader_id = serializers.IntegerField()


# =========================================================
# WORK COMPLETION SERIALIZER
# =========================================================

class WorkCompletionSerializer(serializers.Serializer):

    completion_notes = serializers.CharField()

    completion_image = serializers.ImageField()


# =========================================================
# CREATE DISPUTE SERIALIZER
# =========================================================

class CreateDisputeSerializer(serializers.ModelSerializer):

    class Meta:

        model = Dispute

        fields = (
            "reason",
        )


# =========================================================
# WORKER TEAM PREFERENCE SERIALIZER
# =========================================================

class WorkerTeamPreferenceSerializer(serializers.Serializer):

    preferred_worker_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )

    blocked_worker_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )

    preferred_work_types = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )

    preferred_shift = serializers.CharField(
        required=False
    )


# =========================================================
# QUESTIONNAIRE ANSWER SERIALIZER
# =========================================================

class QuestionnaireAnswerSerializer(serializers.Serializer):

    question_id = serializers.CharField()

    answer = serializers.JSONField()


# =========================================================
# DYNAMIC QUESTIONNAIRE SUBMISSION SERIALIZER
# =========================================================

class DynamicQuestionnaireSubmissionSerializer(
    serializers.Serializer
):

    work_type = serializers.CharField()

    answers = QuestionnaireAnswerSerializer(
        many=True
    )

    scheduled_date = serializers.DateField()

    scheduled_time = serializers.TimeField()

    work_address = serializers.CharField()

    district = serializers.CharField()

    latitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        required=False
    )

    longitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        required=False
    )


class WorkerLocationUpdateSerializer(
    serializers.Serializer
):

    latitude = serializers.FloatField()

    longitude = serializers.FloatField()

class WorkEvidenceSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = WorkEvidence

        fields = "image","notes"

        read_only_fields = (
            "evidence_id",
            "uploaded_by",
            "uploaded_at"
        )


class WorkerReviewSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = WorkerReview

        fields = "__all__"

        read_only_fields = (
            "review_id",
            "customer",
            "worker",
            "work_request",
            "created_at"
        )

class CustomerReviewSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = CustomerReview

        fields = "__all__"

        read_only_fields = (
            "review_id",
            "worker",
            "customer",
            "work_request",
            "created_at"
        )

class LiveWorkerTrackingSerializer(
    serializers.ModelSerializer
):

    worker_name = serializers.CharField(

        source="user.full_name"
    )

    class Meta:

        model = WorkerProfile

        fields = (

            "worker_id",

            "worker_name",

            "current_latitude",

            "current_longitude",

            "availability_status",

            "last_location_updated_at"
        )