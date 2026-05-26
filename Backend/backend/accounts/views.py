from django.shortcuts import render
from accounts.utils import (
    success_response,
    error_response
)   

# Create your views here.

from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .utils import create_and_send_otp

from .models import (
    User,
    CustomerProfile,
    WorkerProfile,
    UnionProfile,
    OTP
)

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    CustomerProfileSerializer,
    WorkerProfileSerializer,
    UnionProfileSerializer,
    OTPVerifySerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ProfileUpdateSerializer,
    LanguageUpdateSerializer,
    WorkerAvailabilitySerializer,
    UpdateLocationSerializer,
    ChangePasswordSerializer
)


# =========================================================
# REGISTER VIEW
# =========================================================

class RegisterView(APIView):

    def post(self, request): 

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            create_and_send_otp(
                user,
                "registration"
            )


            return Response(
                {
                    "success": True,
                    "message": "Account created successfully. OTP sent for verification.",
                    "data": {
                    "phone_number": str(user.phone_number),
                    "email": user.email
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# LOGIN VIEW
# =========================================================

class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            return Response(
                {
                    "success": True,
                    "message": "Login successful",
                    "data": serializer.validated_data
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# LOGOUT VIEW
# =========================================================

class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        try:

            refresh_token = request.data.get("refresh")

            token = RefreshToken(refresh_token)

            token.blacklist()

            return Response(
                {
                    "success": True,
                    "message": "Logout successful"
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            return Response(
                {
                    "success": False,
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )


# =========================================================
# CURRENT USER VIEW
# =========================================================

class CurrentUserView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        data = UserSerializer(user).data

        if user.role == "CUSTOMER":
            data["profile"] = CustomerProfileSerializer(
                user.customer_profile
            ).data

        elif user.role == "WORKER":
            data["profile"] = WorkerProfileSerializer(
                user.worker_profile
            ).data
            
            from finance.serializers import WorkerWalletSerializer
            if hasattr(user.worker_profile, "wallet"):
                data["wallet"] = WorkerWalletSerializer(
                    user.worker_profile.wallet
                ).data

        elif user.role == "UNION_ADMIN":
            data["profile"] = UnionProfileSerializer(
                user.union_profile
            ).data

        return Response(
            {
                "success": True,
                "data": data
            }
        )


# =========================================================
# CUSTOMER PROFILE VIEW
# =========================================================

class CustomerProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        profile = request.user.customer_profile

        serializer = CustomerProfileSerializer(profile)

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )

    def put(self, request):

        profile = request.user.customer_profile

        serializer = CustomerProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Customer profile updated",
                    "data": serializer.data
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# WORKER PROFILE VIEW
# =========================================================

class WorkerProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        profile = request.user.worker_profile

        serializer = WorkerProfileSerializer(profile)

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )

    def put(self, request):

        profile = request.user.worker_profile

        serializer = WorkerProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Worker profile updated",
                    "data": serializer.data
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# UNION PROFILE VIEW
# =========================================================

class UnionProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        profile = request.user.union_profile

        serializer = UnionProfileSerializer(profile)

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )

    def put(self, request):

        profile = request.user.union_profile

        serializer = UnionProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Union profile updated",
                    "data": serializer.data
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# UPDATE USER PROFILE VIEW
# =========================================================

class UpdateProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def put(self, request):

        serializer = ProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            # Return the FULL user object so the frontend can hydrate correctly
            full_user_data = UserSerializer(request.user).data

            return Response(
                {
                    "success": True,
                    "message": "Profile updated successfully",
                    "data": full_user_data
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# UPDATE LANGUAGE VIEW
# =========================================================

class UpdateLanguageView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request):

        serializer = LanguageUpdateSerializer(
            data=request.data
        )

        if serializer.is_valid():

            request.user.language = serializer.validated_data["language"]

            request.user.save()

            return Response(
                {
                    "success": True,
                    "message": "Language updated successfully"
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# UPDATE LOCATION VIEW
# =========================================================

class UpdateLocationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        return self.patch(request)

    def patch(self, request):

        serializer = UpdateLocationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            request.user.current_latitude = serializer.validated_data[
                "current_latitude"
            ]

            request.user.current_longitude = serializer.validated_data[
                "current_longitude"
            ]

            request.user.save()

            return Response(
                {
                    "success": True,
                    "message": "Location updated successfully"
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# WORKER AVAILABILITY VIEW
# =========================================================

class WorkerAvailabilityView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request):

        profile = request.user.worker_profile

        serializer = WorkerAvailabilitySerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "success": True,
                    "message": "Availability updated",
                    "data": serializer.data
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# CHANGE PASSWORD VIEW
# =========================================================

class ChangePasswordView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():

            request.user.set_password(
                serializer.validated_data["new_password"]
            )

            request.user.save()

            return Response(
                {
                    "success": True,
                    "message": "Password changed successfully"
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# FORGOT PASSWORD VIEW
# =========================================================

class ForgotPasswordView(APIView):

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            phone_number = serializer.validated_data[
                "phone_number"
            ]

            # ==========================================
            # GET USER
            # ==========================================

            user = User.objects.get(
                phone_number=phone_number
            )

            # ==========================================
            # SEND REAL OTP
            # ==========================================

            create_and_send_otp(
                user,
                "password_reset"
            )

            return Response(
                {
                    "success": True,
                    "message": "OTP sent successfully"
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )
# =========================================================
# VERIFY OTP VIEW
# =========================================================

class VerifyOTPView(APIView):

    def post(self, request):

        serializer = OTPVerifySerializer(
            data=request.data
        )


        if serializer.is_valid():

            phone_number = serializer.validated_data["phone_number"]

            otp_code = serializer.validated_data["otp_code"]

            user = get_object_or_404(
                User,
                phone_number=phone_number
            )

            otp = OTP.objects.filter(
                user=user,
                otp_code=otp_code,
                is_verified=False
            ).last()

            if not otp:

                return Response(
                    {
                        "success": False,
                        "message": "Invalid OTP"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if otp.purpose == "registration" and user.is_verified:

                return Response(
                    {
                        "success": False,
                        "message": "Account already verified"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if otp.expires_at < timezone.now():

                return Response(
                    {
                        "success": False,
                        "message": "OTP expired"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            otp.is_verified = True

            otp.save()

            user.is_verified = True

            user.save()

            return Response(
                {
                    "success": True,
                    "message": "OTP verified successfully"
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# RESET PASSWORD VIEW
# =========================================================

class ResetPasswordView(APIView):

    def post(self, request):

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            phone_number = serializer.validated_data["phone_number"]

            otp_code = serializer.validated_data["otp_code"]

            new_password = serializer.validated_data["new_password"]

            user = get_object_or_404(
                User,
                phone_number=phone_number
            )

            otp = OTP.objects.filter(
                user=user,
                otp_code=otp_code,
                is_verified=True
            ).last()

            if not otp:

                return Response(
                    {
                        "success": False,
                        "message": "OTP verification required"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)

            user.save()

            return Response(
                {
                    "success": True,
                    "message": "Password reset successful"
                }
            )

        return Response(
            {
                "success": False,
                "errors": serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# RESEND OTP VIEW
# =========================================================

class ResendOTPView(APIView):

    def post(self, request):

        phone_number = request.data.get("phone_number")

        purpose = request.data.get("purpose", "registration")

        if not phone_number:

            return Response(
                {
                    "success": False,
                    "message": "Phone number is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            user = User.objects.get(
                phone_number=phone_number
            )

            if purpose == "registration" and user.is_verified:

                return Response(
                    {
                        "success": False,
                        "message": "Account is already verified"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            create_and_send_otp(
                user,
                purpose
            )

            return Response(
                {
                    "success": True,
                    "message": "OTP resent successfully"
                },
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:

            return Response(
                {
                    "success": False,
                    "message": "User not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

