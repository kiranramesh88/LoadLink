from django.urls import path

from .views import *


urlpatterns = [

    # =====================================================
    # QUESTIONNAIRE
    # =====================================================

    path(

        "questionnaire/",

        QuestionnaireTemplateListView.as_view(),

        name="questionnaire-list"
    ),

    # =====================================================
    # CREATE WORK REQUEST
    # =====================================================

    path(

        "create/",

        CreateWorkRequestView.as_view(),

        name="create-work-request"
    ),

    # =====================================================
    # CUSTOMER REQUESTS
    # =====================================================

    path(

        "my-requests/",

        CustomerWorkRequestListView.as_view(),

        name="customer-work-requests"
    ),

    # =====================================================
    # UNION REQUESTS
    # =====================================================

    path(

        "union/requests/",

        UnionRequestListView.as_view(),

        name="union-requests"
    ),

    # =====================================================
    # WORK REQUEST DETAIL
    # =====================================================

    path(

        "<uuid:request_id>/",

        WorkRequestDetailView.as_view(),

        name="work-request-detail"
    ),

    # =====================================================
    # GENERATE TEAM
    # =====================================================

    path(

        "<uuid:request_id>/generate-team/",

        GenerateSuggestedTeamView.as_view(),

        name="generate-team"
    ),

    # =====================================================
    # CONFIRM TEAM
    # =====================================================

    path(

        "<uuid:request_id>/confirm-team/",

        ConfirmAssignedTeamView.as_view(),

        name="confirm-team"
    ),

    # =====================================================
    # WORKER ASSIGNMENTS
    # =====================================================

    path(

        "worker/assignments/",

        WorkerAssignedWorksView.as_view(),

        name="worker-assignments"
    ),

    # =====================================================
    # UPDATE STATUS
    # =====================================================

    path(

        "<uuid:request_id>/update-status/",

        UpdateWorkStatusView.as_view(),

        name="update-work-status"
    ),

    # =====================================================
    # UPLOAD EVIDENCE
    # =====================================================
    path(

    "<uuid:request_id>/upload-completion-evidence/",

    UploadCompletionEvidenceView.as_view(),

    name="upload-completion-evidence"
    ),

    # =====================================================
    # COMPLETE WORK
    # =====================================================

    path(

        "<uuid:request_id>/mark-completed/",

        MarkWorkCompletedView.as_view(),

        name="mark-work-completed"
    ),

    

    # =====================================================
    # CONFIRM COMPLETION
    # =====================================================

    path(

        "<uuid:request_id>/confirm-completion/",

        ConfirmWorkCompletionView.as_view(),

        name="confirm-work-completion"
    ),

    # =====================================================
    # CREATE DISPUTE
    # =====================================================

    path(

        "<uuid:request_id>/dispute/",

        CreateDisputeView.as_view(),

        name="create-dispute"
    ),

    path(

    "my-assignments/",

    WorkerAssignmentsView.as_view(),

    name="my-assignments"
),
path(

    "assignments/<uuid:assignment_id>/accept/",

    AcceptWorkAssignmentView.as_view(),

    name="accept-assignment"
),
path(

    "assignments/<uuid:assignment_id>/reject/",

    RejectWorkAssignmentView.as_view(),

    name="reject-assignment"
),
path(
    "workers/update-location/",
    UpdateWorkerLocationView.as_view(),
    name="update-worker-location"
),

path(
    "<uuid:request_id>/on-the-way/",
    MarkWorkersOnTheWayView.as_view(),
    name="workers-on-the-way"
),

path(
    "<uuid:request_id>/confirm-work-start/",
    ConfirmWorkStartView.as_view(),
    name="confirm-work-start"
),
path(
    "<uuid:request_id>/confirm-work-start/",
    ConfirmWorkStartView.as_view(),
    name="confirm-work-start"
),
path(
    "<uuid:request_id>/mark-arrived/",
    MarkWorkersArrivedView.as_view(),
    name="mark-workers-arrived"
),
path(

    "<uuid:request_id>/confirm-cash-paid/",

    ConfirmCashPaidView.as_view(),

    name="confirm-cash-paid"
),

path(

    "<uuid:request_id>/confirm-cash-received/",

    ConfirmCashReceivedView.as_view(),

    name="confirm-cash-received"
),
path(

    "payments/create-order/<uuid:request_id>/",

    CreatePaymentOrderView.as_view(),

    name="create-payment-order"
),

path(

    "payments/verify/",

    VerifyPaymentView.as_view(),

    name="verify-payment"
),
path(

    "<uuid:request_id>/review-worker/",

    SubmitWorkerReviewView.as_view(),

    name="review-worker"
),

path(

    "<uuid:request_id>/review-customer/",

    SubmitCustomerReviewView.as_view(),

    name="review-customer"
),
path(

    "<uuid:request_id>/live-tracking/",

    LiveTrackingView.as_view(),

    name="live-tracking"
),
path(

    "union/dashboard/",

    UnionRealtimeDashboardView.as_view(),

    name="union-dashboard"
),

# =====================================================
# UNION — DISPUTES
# =====================================================

path(
    "union/disputes/",
    UnionDisputeListView.as_view(),
    name="union-disputes"
),

path(
    "disputes/<uuid:dispute_id>/resolve/",
    ResolveDisputeView.as_view(),
    name="resolve-dispute"
),
]