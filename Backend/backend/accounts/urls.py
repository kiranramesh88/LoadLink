from django.urls import path

from .views import *

urlpatterns = [

    # AUTH
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),

    # OTP
    path("verify-otp/", VerifyOTPView.as_view()),
    path("resend-otp/", ResendOTPView.as_view()),

    # PASSWORD
    path("forgot-password/", ForgotPasswordView.as_view()),
    path("reset-password/", ResetPasswordView.as_view()),
    path("change-password/", ChangePasswordView.as_view()),

    # CURRENT USER
    path("me/", CurrentUserView.as_view()),

    # PROFILE
    path("update-profile/", UpdateProfileView.as_view()),

    # CUSTOMER
    path("customer/profile/", CustomerProfileView.as_view()),

    # WORKER
    path("worker/profile/", WorkerProfileView.as_view()),
    path(
        "worker/update-availability/",
        WorkerAvailabilityView.as_view()
    ),

    # UNION
    path("union/profile/", UnionProfileView.as_view()),

    # LOCATION
    path("update-location/", UpdateLocationView.as_view()),

    # LANGUAGE
    path("update-language/", UpdateLanguageView.as_view()),
]