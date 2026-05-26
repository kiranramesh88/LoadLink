from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    User,
    CustomerProfile,
    WorkerProfile,
    UnionProfile,
    OTP
)


# =========================================================
# USER SERIALIZER
# =========================================================

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "phone_number",
            "email",
            "full_name",
            "profile_image",
            "gender",
            "date_of_birth",
            "role",
            "language",
            "current_latitude",
            "current_longitude",
            "address",
            "district",
            "state",
            "is_verified",
            "is_online",
            "notification_enabled",
            "date_joined",
        ]

        read_only_fields = [
            "id",
            "is_verified",
            "date_joined",
        ]


# =========================================================
# CUSTOMER PROFILE SERIALIZER
# =========================================================

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile

        fields = "__all__"

        read_only_fields = [
            "user",
            "total_completed_works",
            "total_amount_spent",
            "dispute_count",
            "customer_rating",
            "created_at",
            "updated_at",
        ]


# =========================================================
# UNION PROFILE SERIALIZER
# =========================================================

class UnionProfileSerializer(serializers.ModelSerializer):


    class Meta:
        model = UnionProfile

        fields = "__all__"

        read_only_fields = [
            "wallet_balance",
            "total_workers",
            "total_completed_works",
            "total_earnings",
            "active_workers",
            "dispute_cases",
            "approval_status",
            "created_at",
            "updated_at",
        ]


# =========================================================
# WORKER PROFILE SERIALIZER
# =========================================================

class WorkerProfileSerializer(serializers.ModelSerializer):


    union_name = serializers.CharField(
        source="union.union_name",
        read_only=True
    )

    class Meta:
        model = WorkerProfile

        fields = "__all__"

        read_only_fields = [
            "workload_score",
            "total_completed_works",
            "total_earnings",
            "wallet_balance",
            "today_work_count",
            "weekly_work_count",
            "idle_time_hours",
            "average_rating",
            "dispute_count",
            "reliability_score",
            "last_work_completed_at",
            "is_currently_assigned",
            "verification_status",
            "joined_union_at",
            "created_at",
            "updated_at",
        ]


# =========================================================
# OTP SERIALIZER
# =========================================================

class OTPSerializer(serializers.ModelSerializer):

    class Meta:
        model = OTP

        fields = "__all__"

        read_only_fields = [
            "is_verified",
            "created_at",
        ]


# =========================================================
# REGISTER SERIALIZER
# =========================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    class Meta:
        model = User

        fields = [
            "phone_number",
            "email",
            "password",
            "full_name",
            "role",
            "language",
        ]

    def create(self, validated_data):

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        return user


# =========================================================
# LOGIN SERIALIZER
# =========================================================

class LoginSerializer(serializers.Serializer):

    phone_number = serializers.CharField()
    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        phone_number = attrs.get("phone_number")
        password = attrs.get("password")

        user = authenticate(
            phone_number=phone_number,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid credentials"
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "User account is disabled"
            )
        
        if not user.is_verified:
            raise serializers.ValidationError(
            "Please verify your account before login"
            )

        refresh = RefreshToken.for_user(user)

        return {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


# =========================================================
# CHANGE PASSWORD SERIALIZER
# =========================================================

class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(
        write_only=True
    )

    new_password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    def validate(self, attrs):

        user = self.context["request"].user

        if not user.check_password(attrs["old_password"]):

            raise serializers.ValidationError(
                {
                    "old_password": "Old password is incorrect"
                }
            )

        return attrs


# =========================================================
# FORGOT PASSWORD SERIALIZER
# =========================================================

class ForgotPasswordSerializer(serializers.Serializer):

    phone_number = serializers.CharField()

    def validate_phone_number(self, value):

        if not User.objects.filter(
            phone_number=value
        ).exists():

            raise serializers.ValidationError(
                "User with this phone number does not exist"
            )

        return value


# =========================================================
# RESET PASSWORD SERIALIZER
# =========================================================

class ResetPasswordSerializer(serializers.Serializer):

    phone_number = serializers.CharField()

    otp_code = serializers.CharField()

    new_password = serializers.CharField(
        min_length=6
    )


# =========================================================
# OTP VERIFY SERIALIZER
# =========================================================

class OTPVerifySerializer(serializers.Serializer):

    phone_number = serializers.CharField()

    otp_code = serializers.CharField()


# =========================================================
# UPDATE LOCATION SERIALIZER
# =========================================================

class UpdateLocationSerializer(serializers.Serializer):

    current_latitude = serializers.FloatField()

    current_longitude = serializers.FloatField()


# =========================================================
# LANGUAGE UPDATE SERIALIZER
# =========================================================

class LanguageUpdateSerializer(serializers.Serializer):

    language = serializers.ChoiceField(
        choices=[
            ("en", "English"),
            ("ml", "Malayalam")
        ]
    )


# =========================================================
# WORKER AVAILABILITY SERIALIZER
# =========================================================

class WorkerAvailabilitySerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkerProfile

        fields = [
            "availability_status"
        ]


# =========================================================
# PROFILE UPDATE SERIALIZER
# =========================================================

class ProfileUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "full_name",
            "email",
            "profile_image",
            "gender",
            "date_of_birth",
            "language",
            "address",
            "district",
            "state",
            "notification_enabled",
        ]