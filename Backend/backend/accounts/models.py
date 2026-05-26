from django.db import models
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager
)
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
import uuid

# Create your models here.


class UserManager(BaseUserManager):

    def create_user(self, phone_number, password=None, **extra_fields):

        if not phone_number:
            raise ValueError("Phone number is required")

        user = self.model(
            phone_number=phone_number,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "SUPER_ADMIN")
        extra_fields.setdefault("is_verified", True)

        return self.create_user(
            phone_number,
            password,
            **extra_fields
        )
    

class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("CUSTOMER", "Customer"),
        ("WORKER", "Worker"),
        ("UNION_ADMIN", "Union Admin"),
        ("SUPER_ADMIN", "Super Admin"),
    )

    LANGUAGE_CHOICES = (
        ("en", "English"),
        ("ml", "Malayalam"),
    )

    GENDER_CHOICES = (
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    phone_number = PhoneNumberField(
        unique=True
    )

    email = models.EmailField(
        unique=True,
        blank=True,
        null=True
    )

    full_name = models.CharField(
        max_length=255
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True
    )

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
        null=True
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    role = models.CharField(
        max_length=30,
        choices=ROLE_CHOICES
    )

    language = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        default="en"
    )

    current_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True
    )

    current_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        blank=True,
        null=True
    )

    address = models.TextField(
        blank=True,
        null=True
    )

    district = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    state = models.CharField(
        max_length=100,
        default="Kerala"
    )

    is_active = models.BooleanField(
        default=True
    )

    is_staff = models.BooleanField(
        default=False
    )

    is_verified = models.BooleanField(
        default=False
    )

    is_online = models.BooleanField(
        default=False
    )

    is_blocked = models.BooleanField(
        default=False
    )

    notification_enabled = models.BooleanField(
        default=True
    )

    last_active = models.DateTimeField(
        auto_now=True
    )

    date_joined = models.DateTimeField(
        default=timezone.now
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    USERNAME_FIELD = "phone_number"

    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.full_name
    
class CustomerProfile(models.Model):

    PAYMENT_CHOICES = (
        ("cash", "Cash"),
        ("upi", "UPI"),
        ("hybrid", "Hybrid"),
    )

    BUSINESS_TYPE_CHOICES = (
        ("textile", "Textile Shop"),
        ("wholesale", "Wholesale Market"),
        ("vegetable", "Vegetable Market"),
        ("hardware", "Hardware"),
        ("construction", "Construction"),
        ("household", "Household"),
        ("other", "Other"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="customer_profile"
    )

    # =====================================================
    # PROFILE COMPLETION FIELDS
    # =====================================================

    business_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    business_type = models.CharField(
        max_length=50,
        choices=BUSINESS_TYPE_CHOICES,
        blank=True,
        null=True
    )

    gst_number = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    emergency_contact = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    # =====================================================
    # PAYMENT PREFERENCE
    # =====================================================

    preferred_payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_CHOICES,
        default="cash"
    )

    # =====================================================
    # SAVED ADDRESSES
    # =====================================================

    saved_addresses = models.JSONField(
        default=list,
        blank=True
    )

    # =====================================================
    # OPERATIONAL ANALYTICS
    # =====================================================

    total_completed_works = models.PositiveIntegerField(
        default=0
    )

    total_amount_spent = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    dispute_count = models.PositiveIntegerField(
        default=0
    )

    customer_rating = models.FloatField(
        default=5.0
    )

    # =====================================================
    # PROFILE STATUS
    # =====================================================

    is_profile_completed = models.BooleanField(
        default=False
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
        return self.user.full_name
    

class UnionProfile(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="union_profile"
    )

    # =====================================================
    # BASIC AUTO CREATED FIELDS
    # =====================================================

    union_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    union_code = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        null=True
    )

    # =====================================================
    # PROFILE COMPLETION FIELDS
    # =====================================================

    operational_area = models.CharField(
        max_length=255,
        blank=True,
        null=True
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

    district = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    union_address = models.TextField(
        blank=True,
        null=True
    )

    registration_number = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    verification_document = models.FileField(
        upload_to="union_documents/",
        blank=True,
        null=True
    )

    # =====================================================
    # COMMISSION & WALLET
    # =====================================================

    commission_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00
    )

    wallet_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    # =====================================================
    # OPERATIONAL ANALYTICS
    # =====================================================

    total_workers = models.PositiveIntegerField(
        default=0
    )

    total_completed_works = models.PositiveIntegerField(
        default=0
    )

    total_earnings = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    active_workers = models.PositiveIntegerField(
        default=0
    )

    dispute_cases = models.PositiveIntegerField(
        default=0
    )

    operational_radius_km = models.PositiveIntegerField(
        default=10
    )

    # =====================================================
    # APPROVAL STATUS
    # =====================================================

    approval_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    is_active_union = models.BooleanField(
        default=True
    )

    # =====================================================
    # PROFILE COMPLETION TRACKING
    # =====================================================

    is_profile_completed = models.BooleanField(
        default=False
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

        if self.union_name:
            return self.union_name

        return self.user.full_name
    

class WorkerProfile(models.Model):

    AVAILABILITY_CHOICES = (
        ("available", "Available"),
        ("busy", "Busy"),
        ("offline", "Offline"),
    )

    VERIFICATION_CHOICES = (
        ("pending", "Pending"),
        ("verified", "Verified"),
        ("rejected", "Rejected"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="worker_profile"
    )

    union = models.ForeignKey(
        UnionProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="workers"
    )

    worker_id = models.CharField(
        max_length=50,
        unique=True
    )

    # ============================================
    # PROFILE COMPLETION FIELDS
    # ============================================

    aadhaar_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        null=True
    )

    aadhaar_document = models.FileField(
        upload_to="worker_documents/",
        blank=True,
        null=True
    )

    emergency_contact = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    experience_years = models.PositiveIntegerField(
        default=0,
        blank=True,
        null=True
    )

    # ============================================
    # WORK STATUS
    # ============================================

    availability_status = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default="offline"
    )

    workload_score = models.FloatField(
        default=0
    )

    total_completed_works = models.PositiveIntegerField(
        default=0
    )

    total_earnings = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0
    )

    wallet_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    today_work_count = models.PositiveIntegerField(
        default=0
    )

    weekly_work_count = models.PositiveIntegerField(
        default=0
    )

    idle_time_hours = models.PositiveIntegerField(
        default=0
    )

    average_rating = models.FloatField(
        default=5.0
    )

    dispute_count = models.PositiveIntegerField(
        default=0
    )

    reliability_score = models.FloatField(
        default=100
    )

    last_work_completed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    is_team_lead_eligible = models.BooleanField(
        default=False
    )

    is_currently_assigned = models.BooleanField(
        default=False
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_CHOICES,
        default="pending"
    )

    joined_union_at = models.DateTimeField(
        auto_now_add=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    current_latitude = models.DecimalField(
    max_digits=10,
    decimal_places=7,
    null=True,
    blank=True
    )

    current_longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    last_location_updated_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.user.full_name
    
class OTP(models.Model):

    PURPOSE_CHOICES = (
        ("registration", "Registration"),
        ("login", "Login"),
        ("password_reset", "Password Reset"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="otps"
    )

    otp_code = models.CharField(
        max_length=10
    )

    purpose = models.CharField(
        max_length=30,
        choices=PURPOSE_CHOICES
    )

    is_verified = models.BooleanField(
        default=False
    )

    expires_at = models.DateTimeField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.phone_number} - {self.otp_code}"

