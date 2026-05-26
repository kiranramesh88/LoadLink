from django.db import models

# Create your models here.


import uuid

from django.db import models
from django.utils import timezone

from accounts.models import (
    User,
    CustomerProfile,
    WorkerProfile,
    UnionProfile
)


# =========================================================
# QUESTIONNAIRE TEMPLATE
# =========================================================

class QuestionnaireTemplate(models.Model):

    FIELD_TYPE_CHOICES = (
        ("text", "Text"),
        ("number", "Number"),
        ("single_choice", "Single Choice"),
        ("multiple_choice", "Multiple Choice"),
        ("boolean", "Boolean"),
    )

    WORK_TYPE_CHOICES = (
        ("shop_unloading", "Shop Unloading"),
        ("market_loading", "Market Loading"),
        ("household_shifting", "Household Shifting"),
        ("construction", "Construction"),
        ("warehouse", "Warehouse"),
        ("other", "Other"),
    )

    question_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    work_type = models.CharField(
        max_length=100,
        choices=WORK_TYPE_CHOICES
    )

    question = models.CharField(
        max_length=500
    )

    field_type = models.CharField(
        max_length=50,
        choices=FIELD_TYPE_CHOICES
    )

    options = models.JSONField(
        default=list,
        blank=True
    )

    is_required = models.BooleanField(
        default=True
    )

    order = models.PositiveIntegerField(
        default=0
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.question


# =========================================================
# WORK REQUEST
# =========================================================

class WorkRequest(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("union_review", "Union Review"),
        ("team_suggested", "Team Suggested"),
        ("team_confirmed", "Team Confirmed"),
        ("workers_notified", "Workers Notified"),
        ("accepted", "Accepted"),
        ("workers_on_the_way", "Workers On The Way"),
        ("workers_arrived", "Workers Arrived"),
        ("in_progress", "In Progress"),
        ("completion_pending", "Completion Pending"),
        ("payment_pending","Payment Pending"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("disputed", "Disputed"),
    )

    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    )

    WORK_TYPE_CHOICES = (
        ("shop_unloading", "Shop Unloading"),
        ("market_loading", "Market Loading"),
        ("household_shifting", "Household Shifting"),
        ("construction", "Construction"),
        ("warehouse", "Warehouse"),
        ("other", "Other"),
    )

    request_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    customer = models.ForeignKey(
        CustomerProfile,
        on_delete=models.CASCADE,
        related_name="work_requests"
    )

    assigned_union = models.ForeignKey(
        UnionProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_requests"
    )

    # =====================================================
    # WORK DETAILS
    # =====================================================

    title = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    work_type = models.CharField(
        max_length=100,
        choices=WORK_TYPE_CHOICES
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    # =====================================================
    # QUESTIONNAIRE GENERATED DATA
    # =====================================================

    questionnaire_answers = models.JSONField(
        default=dict,
        blank=True
    )

    interpreted_requirements = models.JSONField(
        default=dict,
        blank=True
    )

    goods_details = models.JSONField(
        default=dict,
        blank=True
    )

    # =====================================================
    # WORK ESTIMATION
    # =====================================================

    estimated_workers = models.PositiveIntegerField(
        default=1
    )

    estimated_duration_hours = models.FloatField(
        default=1
    )

    estimated_weight_kg = models.FloatField(
        default=0
    )

    estimated_distance_meters = models.FloatField(
        default=0
    )

    estimated_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    final_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    difficulty_score = models.FloatField(
        default=0
    )

    # =====================================================
    # LOCATION DETAILS
    # =====================================================

    work_address = models.TextField()

    landmark = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    district = models.CharField(
        max_length=100
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True
    )

    # =====================================================
    # SCHEDULE DETAILS
    # =====================================================

    scheduled_date = models.DateField()

    scheduled_time = models.TimeField()

    work_start_time = models.DateTimeField(
        blank=True,
        null=True
    )

    work_completed_time = models.DateTimeField(
        blank=True,
        null=True
    )

    # =====================================================
    # SYSTEM GENERATED TEAM DATA
    # =====================================================

    suggested_team_generated = models.BooleanField(
        default=False
    )

    system_confidence_score = models.FloatField(
        default=0
    )

    # =====================================================
    # STATUS
    # =====================================================

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default="pending"
    )

    cancellation_reason = models.TextField(
        blank=True,
        null=True
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return self.title


# =========================================================
# ASSIGNED TEAM
# =========================================================

class AssignedTeam(models.Model):

    TEAM_STATUS_CHOICES = (
        ("suggested", "Suggested"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("active", "Active"),
        ("completed", "Completed"),
    )

    team_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    work_request = models.OneToOneField(
        WorkRequest,
        on_delete=models.CASCADE,
        related_name="assigned_team"
    )

    assigned_by_union = models.ForeignKey(
        UnionProfile,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_teams"
    )

    team_leader = models.ForeignKey(
        WorkerProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leading_teams"
    )

    workers = models.ManyToManyField(
        WorkerProfile,
        related_name="assigned_teams"
    )

    total_workers = models.PositiveIntegerField(
        default=0
    )

    preference_match_score = models.FloatField(
        default=0
    )

    workload_balance_score = models.FloatField(
        default=0
    )

    system_generated = models.BooleanField(
        default=True
    )

    union_modified = models.BooleanField(
        default=False
    )

    status = models.CharField(
        max_length=20,
        choices=TEAM_STATUS_CHOICES,
        default="suggested"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return f"Team - {self.work_request.title}"


# =========================================================
# WORK ASSIGNMENT
# =========================================================

class WorkAssignment(models.Model):

    ASSIGNMENT_STATUS_CHOICES = (
        ("assigned", "Assigned"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
    )

    assignment_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    work_request = models.ForeignKey(
        WorkRequest,
        on_delete=models.CASCADE,
        related_name="worker_assignments"
    )

    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="work_assignments"
    )

    assigned_by = models.ForeignKey(
        UnionProfile,
        on_delete=models.SET_NULL,
        null=True
    )

    assignment_status = models.CharField(
        max_length=30,
        choices=ASSIGNMENT_STATUS_CHOICES,
        default="assigned"
    )

    is_team_leader = models.BooleanField(
    default=False
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True
    )

    accepted_at = models.DateTimeField(
        blank=True,
        null=True
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    def __str__(self):

        return f"{self.worker.user.full_name} - {self.work_request.title}"


# =========================================================
# WORK STATUS LOG
# =========================================================

class WorkStatusLog(models.Model):

    STATUS_CHOICES = (
        ("created", "Created"),
        ("team_generated", "Team Generated"),
        ("workers_assigned", "Workers Assigned"),
        ("workers_arrived", "Workers Arrived"),
        ("work_started", "Work Started"),
        ("completion_requested", "Completion Requested"),
        ("completed", "Completed"),
        ("disputed", "Disputed"),
    )

    log_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    work_request = models.ForeignKey(
        WorkRequest,
        on_delete=models.CASCADE,
        related_name="status_logs"
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES
    )

    remarks = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.work_request.title} - {self.status}"


# =========================================================
# WORK EVIDENCE
# =========================================================

class WorkEvidence(models.Model):

    EVIDENCE_TYPE_CHOICES = (
        ("arrival", "Arrival"),
        ("start", "Start"),
        ("completion", "Completion"),
        ("damage", "Damage"),
        ("dispute", "Dispute"),
    )

    evidence_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    work_request = models.ForeignKey(
        WorkRequest,
        on_delete=models.CASCADE,
        related_name="evidences"
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    evidence_type = models.CharField(
        max_length=50,
        choices=EVIDENCE_TYPE_CHOICES
    )

    image = models.ImageField(
        upload_to="work_evidences/"
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.evidence_type


# =========================================================
# DISPUTE
# =========================================================

class Dispute(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("under_review", "Under Review"),
        ("resolved", "Resolved"),
        ("rejected", "Rejected"),
    )

    dispute_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    work_request = models.ForeignKey(
        WorkRequest,
        on_delete=models.CASCADE,
        related_name="disputes"
    )

    raised_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="pending"
    )

    resolution_notes = models.TextField(
        blank=True,
        null=True
    )

    resolved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_disputes"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return f"Dispute - {self.work_request.title}"
    

class Payment(models.Model):

    PAYMENT_METHOD_CHOICES = (

        ("cash", "Cash"),

        ("online", "Online"),
    )

    PAYMENT_STATUS_CHOICES = (

        ("pending", "Pending"),

        ("success", "Success"),

        ("failed", "Failed"),
    )

    payment_id = models.UUIDField(

        primary_key=True,

        default=uuid.uuid4,

        editable=False
    )

    work_request = models.OneToOneField(

        WorkRequest,

        on_delete=models.CASCADE,

        related_name="payment"
    )

    customer = models.ForeignKey(

        CustomerProfile,

        on_delete=models.CASCADE
    )

    amount = models.DecimalField(

        max_digits=12,

        decimal_places=2
    )

    payment_method = models.CharField(

        max_length=20,

        choices=PAYMENT_METHOD_CHOICES
    )

    payment_status = models.CharField(

        max_length=20,

        choices=PAYMENT_STATUS_CHOICES,

        default="pending"
    )

    # =============================================
    # CASH PAYMENT CONFIRMATION
    # =============================================

    customer_payment_confirmed = (
        models.BooleanField(default=False)
    )

    worker_payment_confirmed = (
        models.BooleanField(default=False)
    )

    # =============================================
    # RAZORPAY
    # =============================================

    razorpay_order_id = models.CharField(

        max_length=255,

        blank=True,

        null=True
    )

    earnings_distributed = models.BooleanField(
        default=False
    )

    razorpay_payment_id = models.CharField(

        max_length=255,

        blank=True,

        null=True
    )

    razorpay_signature = models.TextField(

        blank=True,

        null=True
    )

    paid_at = models.DateTimeField(

        null=True,

        blank=True
    )

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    def __str__(self):

        return str(self.payment_id)
    

class WorkerReview(models.Model):

    review_id = models.UUIDField(

        primary_key=True,

        default=uuid.uuid4,

        editable=False
    )

    work_request = models.ForeignKey(

        WorkRequest,

        on_delete=models.CASCADE,

        related_name="worker_reviews"
    )

    customer = models.ForeignKey(

        CustomerProfile,

        on_delete=models.CASCADE
    )

    worker = models.ForeignKey(

        WorkerProfile,

        on_delete=models.CASCADE,

        related_name="received_reviews"
    )

    rating = models.IntegerField()

    review = models.TextField(

        blank=True,

        null=True
    )

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    class Meta:

        unique_together = (
            "work_request",
            "customer",
            "worker"
        )

    def __str__(self):

        return (
            f"{self.customer} -> "
            f"{self.worker}"
        )
    

class CustomerReview(models.Model):

    review_id = models.UUIDField(

        primary_key=True,

        default=uuid.uuid4,

        editable=False
    )

    work_request = models.ForeignKey(

        WorkRequest,

        on_delete=models.CASCADE,

        related_name="customer_reviews"
    )

    worker = models.ForeignKey(

        WorkerProfile,

        on_delete=models.CASCADE
    )

    customer = models.ForeignKey(

        CustomerProfile,

        on_delete=models.CASCADE,

        related_name="received_reviews"
    )

    rating = models.IntegerField()

    review = models.TextField(

        blank=True,

        null=True
    )

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    class Meta:

        unique_together = (
            "work_request",
            "worker",
            "customer"
        )

    def __str__(self):

        return (
            f"{self.worker} -> "
            f"{self.customer}"
        )