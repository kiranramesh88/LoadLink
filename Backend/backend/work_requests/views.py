from django.shortcuts import get_object_or_404
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from finance.services import (
    process_payment_split
)
from django.db.models import Q
from work_requests.services import (

    calculate_distance_km,

    estimate_eta_minutes
)

from backend import settings
from .utils import serialize_questionnaire_answers
from rest_framework.parsers import (
    MultiPartParser,
    FormParser
)
import razorpay

client = razorpay.Client(auth=(settings.RAZR_KEY_ID,settings.RAZR_SECRET_KEY))
from accounts.models import *

from .models import *

from .serializers import *

from .services import *


# =========================================================
# GET QUESTIONNAIRE
# =========================================================

class QuestionnaireTemplateListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        work_type = request.GET.get("work_type")

        questions = QuestionnaireTemplate.objects.filter(
            work_type=work_type,
            is_active=True
        ).order_by("order")

        serializer = QuestionnaireTemplateSerializer(
            questions,
            many=True
        )

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )


# =========================================================
# CREATE WORK REQUEST
# =========================================================

class CreateWorkRequestView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = DynamicQuestionnaireSubmissionSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = request.user

            if user.role != "CUSTOMER":

                return Response(
                    {
                        "success": False,
                        "message": "Only customers can create requests"
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            customer_profile = user.customer_profile

            validated_data = serializer.validated_data

            # =================================================
            # INTERPRET QUESTIONNAIRE
            # =================================================

            interpreted_data = interpret_questionnaire_answers(
                validated_data
            )

            # =================================================
            # CALCULATE ESTIMATIONS
            # =================================================

            estimation_data = calculate_estimation_details(
                interpreted_data
            )
            matched_union = find_matching_union(

                validated_data.get("latitude"),

                validated_data.get("longitude")
            )

            # =================================================
            # FALLBACK: assign to first approved union if no
            # geo-match found (prevents orphaned requests)
            # =================================================

            if not matched_union:
                from accounts.models import UnionProfile
                # Fallback: any active union (no approval check in dev)
                matched_union = UnionProfile.objects.filter(
                    is_active_union=True
                ).first()
            # =================================================
            # CREATE WORK REQUEST
            # =================================================

            work_request = WorkRequest.objects.create(

                customer=customer_profile,

                assigned_union=matched_union,

                title=interpreted_data.get(
                    "title"
                ),

                description=interpreted_data.get(
                    "description"
                ),

                work_type=validated_data.get(
                    "work_type"
                ),

                questionnaire_answers= serialize_questionnaire_answers(validated_data),

                interpreted_requirements=interpreted_data,

                goods_details=interpreted_data.get(
                    "goods_details"
                ),

                estimated_workers=estimation_data.get(
                    "estimated_workers"
                ),

                estimated_duration_hours=estimation_data.get(
                    "estimated_duration_hours"
                ),

                estimated_weight_kg=estimation_data.get(
                    "estimated_weight_kg"
                ),

                estimated_distance_meters=estimation_data.get(
                    "estimated_distance_meters"
                ),

                estimated_price=estimation_data.get(
                    "estimated_price"
                ),

                difficulty_score=estimation_data.get(
                    "difficulty_score"
                ),

                priority=estimation_data.get(
                    "priority"
                ),

                work_address=validated_data.get(
                    "work_address"
                ),

                district=validated_data.get(
                    "district"
                ),

                latitude=validated_data.get(
                    "latitude"
                ),

                longitude=validated_data.get(
                    "longitude"
                ),

                scheduled_date=validated_data.get(
                    "scheduled_date"
                ),

                scheduled_time=validated_data.get(
                    "scheduled_time"
                ),
            )

            # =================================================
            # CREATE STATUS LOG
            # =================================================

            WorkStatusLog.objects.create(
                work_request=work_request,
                updated_by=user,
                status="created",
                remarks="Work request created"
            )

            return Response(
                {
                    "success": True,
                    "message": "Work request created successfully",
                    "data": WorkRequestDetailSerializer(
                        work_request
                    ).data
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
# CUSTOMER WORK REQUEST LIST
# =========================================================

class CustomerWorkRequestListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role != "CUSTOMER":

            return Response(
                {
                    "success": False,
                    "message": "Only customers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        requests = WorkRequest.objects.filter(
            customer=user.customer_profile
        ).order_by("-created_at")

        serializer = WorkRequestListSerializer(
            requests,
            many=True
        )

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )


# =========================================================
# UNION REQUEST LIST
# =========================================================

class UnionRequestListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role != "UNION_ADMIN":

            return Response(
                {
                    "success": False,
                    "message": "Only union admins allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Return ALL requests for this union OR unassigned (null assigned_union)
        from django.db.models import Q
        qs = WorkRequest.objects.filter(
            Q(assigned_union=user.union_profile) | Q(assigned_union__isnull=True)
        ).order_by("-created_at")

        # Optional ?status= query param
        status_param = request.GET.get("status")
        if status_param:
            qs = qs.filter(status=status_param)

        serializer = WorkRequestListSerializer(qs, many=True)

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )



# =========================================================
# WORK REQUEST DETAIL
# =========================================================

class WorkRequestDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, request_id):
        print(f"[DEBUG GET DETAIL] user={request.user.id} ({request.user.full_name}, {request.user.phone_number}), role={request.user.role}")

        work_request = get_object_or_404(
            WorkRequest,
            request_id=request_id
        )

        serializer = WorkRequestDetailSerializer(
            work_request
        )

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )


# =========================================================
# GENERATE SUGGESTED TEAM
# =========================================================

class GenerateSuggestedTeamView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        # =================================================
        # CHECK ROLE
        # =================================================

        if user.role != "UNION_ADMIN":

            return Response(
                {
                    "success": False,
                    "message": "Only unions can generate teams"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =================================================
        # GET WORK REQUEST
        # =================================================

        work_request = get_object_or_404(
            WorkRequest,
            request_id=request_id
        )

        # =================================================
        # VERIFY REQUEST OWNERSHIP
        # =================================================

        if work_request.assigned_union != user.union_profile:

            return Response(
                {
                    "success": False,
                    "message":
                    "This request is not assigned "
                    "to your union"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =================================================
        # PREVENT DUPLICATE GENERATION
        # =================================================

        if work_request.suggested_team_generated:

            return Response(
                {
                    "success": False,
                    "message":
                    "Team already generated"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =================================================
        # GENERATE BALANCED WORKER LIST
        # =================================================

        suggested_workers = suggest_worker_team(
            work_request
        )

        # =================================================
        # REQUIRED TEAM SIZE
        # =================================================

        required_workers = (
            work_request.estimated_workers
        )

        # =================================================
        # LIMIT TO REQUIRED COUNT
        # =================================================

        worker_profiles = suggested_workers[
            :required_workers
        ]

        # =================================================
        # NO WORKERS FOUND
        # =================================================

        if not worker_profiles:

            return Response(
                {
                    "success": False,
                    "message":
                    "No eligible workers available"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =================================================
        # CREATE ASSIGNED TEAM
        # =================================================

        if AssignedTeam.objects.filter(
                work_request=work_request
                ).exists():

                return Response(
                    {
                        "success": False,
                        "message":
                        "Team already generated "
                        "for this request"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        assigned_team = AssignedTeam.objects.create(

            work_request=work_request,

            assigned_by_union=user.union_profile,

            total_workers=len(worker_profiles),

            system_generated=True,

            workload_balance_score=95
        )

        # =================================================
        # ASSIGN WORKERS
        # =================================================

        assigned_team.workers.set(
            worker_profiles
        )

        for worker in worker_profiles:

            WorkAssignment.objects.create(

                work_request=work_request,

                worker=worker,

                assigned_by=user.union_profile,

                assignment_status="assigned",

                is_team_leader=(
                    worker == assigned_team.team_leader
                )
            )

        # =================================================
        # RANDOM TEAM LEADER
        # =================================================
        selected_leader = generate_team_leader(
            worker_profiles
        )

        assigned_team.team_leader = (
            selected_leader
        )

        # =================================================
        # UPDATE LEADER FLAGS
        # =================================================

        WorkAssignment.objects.filter(

            work_request=work_request

        ).update(

            is_team_leader=False
        )

        WorkAssignment.objects.filter(

            work_request=work_request,

            worker=selected_leader

        ).update(

            is_team_leader=True
        )

        assigned_team.save()

        # =================================================
        # UPDATE WORKERS
        # =================================================

        for worker in worker_profiles:

            worker.is_currently_assigned = True

            worker.today_work_count += 1

            worker.weekly_work_count += 1

            worker.save()

        # =================================================
        # UPDATE WORK REQUEST
        # =================================================

        work_request.assigned_team = assigned_team

        work_request.status = "team_suggested"

        work_request.suggested_team_generated = True

        work_request.save()

        # =================================================
        # CREATE STATUS LOG
        # =================================================

        WorkStatusLog.objects.create(

            work_request=work_request,

            updated_by=user,

            status="team_generated",

            remarks=(
                "System generated balanced "
                "worker team"
            )
        )

        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return Response(
            {
                "success": True,

                "message":
                "Suggested team generated successfully",

                "data":
                WorkRequestDetailSerializer(
                    work_request
                ).data
            },
            status=status.HTTP_200_OK
        )
# =========================================================
# CONFIRM TEAM
# =========================================================

class ConfirmAssignedTeamView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        if user.role != "UNION_ADMIN":

            return Response(
                {
                    "success": False,
                    "message": "Only union admins allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        work_request = get_object_or_404(
            WorkRequest,
            request_id=request_id
        )

        work_request.assigned_union = (
        user.union_profile
        )

        assigned_team = work_request.assigned_team

        assigned_team.status = "approved"

        assigned_team.save()

        # =================================================
        # CREATE WORK ASSIGNMENTS
        # =================================================


        WorkStatusLog.objects.create(
            work_request=work_request,
            updated_by=user,
            status="workers_assigned",
            remarks="Workers assigned successfully"
        )

        return Response(
            {
                "success": True,
                "message": "Team confirmed successfully"
            }
        )


# =========================================================
# WORKER ASSIGNED WORKS
# =========================================================

class WorkerAssignedWorksView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message": "Only workers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        assignments = WorkAssignment.objects.filter(
            worker=user.worker_profile
        ).order_by("-assigned_at")

        serializer = WorkAssignmentSerializer(
            assignments,
            many=True
        )

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )


# =========================================================
# UPDATE WORK STATUS
# =========================================================

class UpdateWorkStatusView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        serializer = UpdateWorkStatusSerializer(
            data=request.data
        )

        if serializer.is_valid():

            work_request = get_object_or_404(
                WorkRequest,
                request_id=request_id
            )

            new_status = serializer.validated_data[
                "status"
            ]

            remarks = serializer.validated_data.get(
                "remarks"
            )

            work_request.status = new_status

            if new_status == "in_progress":

                work_request.work_start_time = timezone.now()

                # Also update assignments status to in_progress
                work_request.worker_assignments.filter(
                    assignment_status__in=["assigned", "accepted"]
                ).update(assignment_status="in_progress")

            if new_status == "completed":

                work_request.work_completed_time = timezone.now()

            work_request.save()

            WorkStatusLog.objects.create(
                work_request=work_request,
                updated_by=request.user,
                status=new_status,
                remarks=remarks
            )

            return Response(
                {
                    "success": True,
                    "message": "Work status updated"
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
# UPLOAD WORK EVIDENCE
# =========================================================

class UploadCompletionEvidenceView(APIView):

    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser
    ]

    def post(self, request, request_id):

        user = request.user

        print(f"[DEBUG] UploadCompletionEvidenceView: request_id={request_id}")
        print(f"[DEBUG] user={user.id} ({user.phone_number}), role={user.role}")
        if hasattr(user, "worker_profile") and user.worker_profile:
            print(f"[DEBUG] worker_profile={user.worker_profile.worker_id}")
            # Check all assignments for this request
            from work_requests.models import WorkAssignment
            all_assigns = WorkAssignment.objects.filter(work_request__request_id=request_id)
            print(f"[DEBUG] all assignments count: {all_assigns.count()}")
            for a in all_assigns:
                print(f"[DEBUG] - worker={a.worker.worker_id} ({a.worker.user.full_name}), leader={a.is_team_leader}, status={a.assignment_status}")
        else:
            print(f"[DEBUG] user has no worker_profile")

        # =============================================
        # ONLY WORKERS
        # =============================================

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only workers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =============================================
        # VALIDATE TEAM LEADER
        # =============================================

        assignment = WorkAssignment.objects.filter(

            work_request__request_id=request_id,

            worker=user.worker_profile,

            is_team_leader=True,

            assignment_status__in=["assigned", "accepted", "in_progress"]

        ).first()

        if not assignment:

            return Response(
                {
                    "success": False,
                    "message":
                    "Only active team leader allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        work_request = assignment.work_request

        serializer = WorkEvidenceSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save(

            uploaded_by=user,

            work_request=work_request,

            evidence_type="completion"
        )

        return Response(
            {
                "success": True,
                "message":
                "Completion evidence uploaded"
            }
        )

# =========================================================
# COMPLETE WORK
# =========================================================

class MarkWorkCompletedView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only workers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        assignment = WorkAssignment.objects.filter(

            work_request__request_id=request_id,

            worker=user.worker_profile,

            is_team_leader=True,

            assignment_status__in=["assigned", "accepted", "in_progress"]

        ).first()

        if not assignment:

            return Response(
                {
                    "success": False,
                    "message":
                    "Only active team leader allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        work_request = assignment.work_request

        # =============================================
        # CHECK COMPLETION EVIDENCE
        # =============================================

        evidence_exists = WorkEvidence.objects.filter(

            work_request=work_request,

            evidence_type="completion"

        ).exists()

        if not evidence_exists:

            return Response(
                {
                    "success": False,
                    "message":
                    "Upload completion evidence first"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =============================================
        # UPDATE STATUS
        # =============================================

        work_request.status = (
            "work_completion_pending"
        )

        work_request.save()

        WorkStatusLog.objects.create(

            work_request=work_request,

            updated_by=user,

            status="completion_pending",

            remarks=(
                "Team leader marked work complete"
            )
        )

        return Response(
            {
                "success": True,
                "message":
                "Waiting for customer confirmation"
            }
        )


# =========================================================
# CONFIRM WORK COMPLETION
# =========================================================

class ConfirmWorkCompletionView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        if user.role != "CUSTOMER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only customers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        work_request = get_object_or_404(

            WorkRequest,

            request_id=request_id,

            customer=user.customer_profile
        )

        if (
            work_request.status
            !=
            "work_completion_pending"
        ):

            return Response(
                {
                    "success": False,
                    "message":
                    "Completion not pending"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =============================================
        # FINAL COMPLETE
        # =============================================

        work_request.status = "payment_pending"

        Payment.objects.create(

            work_request=work_request,

            customer=user.customer_profile,

            amount=work_request.estimated_price,

            payment_method=(
                user.customer_profile
                .preferred_payment_method
            )
        )

        work_request.save()

        # =============================================
        # UPDATE ASSIGNMENTS
        # =============================================

        WorkAssignment.objects.filter(

            work_request=work_request

        ).update(

            assignment_status="completed"
        )

        # =============================================
        # RELEASE WORKERS
        # =============================================

        workers = WorkerProfile.objects.filter(

            work_assignments__work_request=
            work_request

        ).distinct()

        for worker in workers:

            worker.is_currently_assigned = False

            worker.availability_status = (
                "available"
            )

            worker.total_completed_works += 1

            worker.save()

        # =============================================
        # STATUS LOG
        # =============================================

        WorkStatusLog.objects.create(

            work_request=work_request,

            updated_by=user,

            status="completed",

            remarks=(
                "Customer confirmed completion"
            )
        )

        return Response(
            {
                "success": True,
                "message":
                "Payment pending, Awaiting customer payment"
            }
        )
    
class ConfirmCashPaidView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        if user.role != "CUSTOMER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only customers allowed"
                },
                status=403
            )

        payment = get_object_or_404(

            Payment,

            work_request__request_id=request_id,

            customer=user.customer_profile
        )

        if payment.payment_method != "cash":
            payment.payment_method = "cash"

        payment.customer_payment_confirmed = (
            True
        )

        payment.save()

        # =========================================
        # CHECK BOTH CONFIRMED
        # =========================================

        finalize_cash_payment(payment)

        return Response(
            {
                "success": True,
                "message":
                "Customer cash confirmation saved"
            }
        )
    
class ConfirmCashReceivedView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only workers allowed"
                },
                status=403
            )

        assignment = WorkAssignment.objects.filter(

            work_request__request_id=request_id,

            worker=user.worker_profile,

            is_team_leader=True

        ).first()

        if not assignment:

            return Response(
                {
                    "success": False,
                    "message":
                    "Only team leader allowed"
                },
                status=403
            )

        payment = get_object_or_404(

            Payment,

            work_request=assignment.work_request
        )

        if payment.payment_method != "cash":

            return Response(
                {
                    "success": False,
                    "message":
                    "Not a cash payment"
                },
                status=400
            )

        if payment.worker_payment_confirmed:
            return Response(
                {
                    "success": False,
                    "message": "Already confirmed"
                },
                status=400
            )

        payment.worker_payment_confirmed = (
            True
        )

        payment.save()

        finalize_cash_payment(payment)

        return Response(
            {
                "success": True,
                "message":
                "Cash received confirmation saved"
            }
        )    
# =========================================================
# CREATE DISPUTE
# =========================================================

class CreateDisputeView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        work_request = get_object_or_404(
            WorkRequest,
            request_id=request_id
        )

        serializer = CreateDisputeSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                work_request=work_request,
                raised_by=request.user
            )

            work_request.status = "disputed"

            work_request.save()

            WorkStatusLog.objects.create(
                work_request=work_request,
                updated_by=request.user,
                status="disputed",
                remarks="Dispute raised"
            )

            return Response(
                {
                    "success": True,
                    "message": "Dispute created successfully",
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
    
class WorkerAssignmentsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message": "Only workers allowed"
                },
                status=403
            )

        assignments = WorkAssignment.objects.filter(

            worker=user.worker_profile

        ).select_related(
            "work_request",
            "work_request__customer",
            "work_request__customer__user",
        ).order_by("-assigned_at")

        serializer = WorkerAssignmentListSerializer(assignments, many=True)

        return Response(
            {
                "success": True,
                "data": serializer.data
            }
        )

# =========================================================
# ACCEPT WORK ASSIGNMENT
# =========================================================

class AcceptWorkAssignmentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):

        user = request.user

        # =================================================
        # ONLY WORKERS
        # =================================================

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only workers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =================================================
        # GET ASSIGNMENT
        # =================================================

        assignment = get_object_or_404(

            WorkAssignment,

            assignment_id=assignment_id,

            worker=user.worker_profile
        )

        # =================================================
        # VALIDATE STATUS
        # =================================================

        if assignment.assignment_status != "assigned":

            return Response(
                {
                    "success": False,
                    "message":
                    "Assignment already responded"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =================================================
        # ACCEPT ASSIGNMENT
        # =================================================

        assignment.assignment_status = "accepted"

        assignment.accepted_at = timezone.now()

        assignment.save()

        # =================================================
        # GET WORK REQUEST
        # =================================================

        work_request = assignment.work_request

        # =================================================
        # CHECK ALL ACCEPTED
        # =================================================

        total_assignments = (

            WorkAssignment.objects.filter(

                work_request=work_request

            ).exclude(

                assignment_status="rejected"

            ).count()
        )

        accepted_assignments = (
            WorkAssignment.objects.filter(

                work_request=work_request,

                assignment_status="accepted"

            ).count()
        )

        # =================================================
        # ALL ACCEPTED
        # =================================================

        if total_assignments == accepted_assignments:

            work_request.status = "team_confirmed"

            work_request.save()

            WorkStatusLog.objects.create(

                work_request=work_request,

                updated_by=user,

                status="team_confirmed",

                remarks=(
                    "All workers accepted "
                    "the assignment"
                )
            )

        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return Response(
            {
                "success": True,

                "message":
                "Assignment accepted successfully"
            },
            status=status.HTTP_200_OK
        )
    
# =========================================================
# REJECT WORK ASSIGNMENT
# =========================================================

class RejectWorkAssignmentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):

        user = request.user

        # =================================================
        # ONLY WORKERS
        # =================================================

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only workers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =================================================
        # GET ASSIGNMENT
        # =================================================

        assignment = get_object_or_404(

            WorkAssignment,

            assignment_id=assignment_id,

            worker=user.worker_profile
        )

        # =================================================
        # VALIDATE STATUS
        # =================================================

        if assignment.assignment_status != "assigned":

            return Response(
                {
                    "success": False,
                    "message":
                    "Assignment already responded"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =================================================
        # REJECT ASSIGNMENT
        # =================================================

        assignment.assignment_status = "rejected"

        assignment.save()

        rejected_worker = assignment.worker

        rejected_worker.is_currently_assigned = False

        rejected_worker.save()

        work_request = assignment.work_request

        assigned_team = work_request.assigned_team

        # =================================================
        # REMOVE WORKER FROM TEAM
        # =================================================

        assigned_team.workers.remove(
            rejected_worker
        )
        
        if assigned_team.team_leader == rejected_worker:

            remaining_workers = (
                assigned_team.workers.all()
            )

        if remaining_workers.exists():

            new_leader = generate_team_leader(
                remaining_workers
            )

            assigned_team.team_leader = (
                new_leader
            )

            # =========================================
            # UPDATE ASSIGNMENT LEADER FLAGS
            # =========================================

            WorkAssignment.objects.filter(

                work_request=work_request

            ).update(

                is_team_leader=False
            )

            WorkAssignment.objects.filter(

                work_request=work_request,

                worker=new_leader

            ).update(

                is_team_leader=True
            )

            assigned_team.save()
        # =================================================
        # REPLACE WORKER
        # =================================================

        new_assignment = (
            replace_rejected_worker(

                work_request,

                rejected_worker
            )
        )

        # =================================================
        # CREATE STATUS LOG
        # =================================================

        WorkStatusLog.objects.create(

            work_request=work_request,

            updated_by=user,

            status="worker_rejected",

            remarks=(
                f"{user.full_name} "
                f"rejected assignment"
            )
        )

        # =================================================
        # RESPONSE
        # =================================================

        return Response(
            {
                "success": True,

                "message":
                "Assignment rejected successfully",

                "replacement_found":
                bool(new_assignment)
            }
        )
    

class UpdateWorkerLocationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message": "Only workers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = WorkerLocationUpdateSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        worker = user.worker_profile

        worker.current_latitude = serializer.validated_data[
            "latitude"
        ]

        worker.current_longitude = serializer.validated_data[
            "longitude"
        ]

        worker.last_location_updated_at = timezone.now()

        worker.save()

        # =================================================
        # CHECK ACTIVE WORK ASSIGNMENTS
        # =================================================

        assignments = WorkAssignment.objects.filter(

            worker=worker,

            assignment_status="accepted"
        )

        arrived_requests = []

        for assignment in assignments:

            work_request = assignment.work_request

            if (
                work_request.status
                ==
                "workers_on_the_way"
            ):

                arrived = check_workers_arrived(
                    work_request
                )

                if arrived:

                    arrived_requests.append(
                        str(work_request.request_id)
                    )

        return Response(
            {
                "success": True,
                "message": "Location updated",
                "arrived_requests": arrived_requests
            }
        )

class MarkWorkersOnTheWayView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        # =============================================
        # ONLY WORKERS
        # =============================================

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only workers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =============================================
        # GET TEAM LEADER ASSIGNMENT
        # =============================================

        assignment = WorkAssignment.objects.filter(

            work_request__request_id=request_id,

            worker=user.worker_profile,

            is_team_leader=True,

            assignment_status="accepted"

        ).first()

        # =============================================
        # VALIDATE TEAM LEADER
        # =============================================

        if not assignment:

            return Response(
                {
                    "success": False,
                    "message":
                    "Only accepted team leader "
                    "can mark on the way"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        work_request = assignment.work_request

        # =============================================
        # VALIDATE STATUS
        # =============================================

        if work_request.status != "team_confirmed":

            return Response(
                {
                    "success": False,
                    "message":
                    "Team not fully confirmed"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =============================================
        # UPDATE STATUS
        # =============================================

        work_request.status = (
            "workers_on_the_way"
        )

        work_request.save()

        # =============================================
        # CREATE STATUS LOG
        # =============================================

        WorkStatusLog.objects.create(

            work_request=work_request,

            updated_by=user,

            status="workers_on_the_way",

            remarks=(
                "Workers started traveling"
            )
        )

        # =============================================
        # FINAL RESPONSE
        # =============================================

        return Response(
            {
                "success": True,
                "message":
                "Workers marked on the way"
            }
        )

class ConfirmWorkStartView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        if user.role != "CUSTOMER":

            return Response(
                {
                    "success": False,
                    "message": "Only customers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        work_request = get_object_or_404(

            WorkRequest,

            request_id=request_id,

            customer=user.customer_profile
        )

        if work_request.status != "workers_arrived":

            return Response(
                {
                    "success": False,
                    "message": (
                        "Workers have not arrived yet"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        work_request.status = "in_progress"

        work_request.work_start_time = timezone.now()

        work_request.save()

        WorkAssignment.objects.filter(

            work_request=work_request,

            assignment_status="accepted"

        ).update(

            assignment_status="in_progress"
        )

        WorkStatusLog.objects.create(

            work_request=work_request,

            updated_by=user,

            status="work_started",

            remarks="Customer confirmed work start"
        )

        return Response(
            {
                "success": True,
                "message": "Work started successfully"
            }
        )
    
class MarkWorkersArrivedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        user = request.user
        if user.role != "CUSTOMER":
            return Response(
                {"success": False, "message": "Only customers allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        work_request = get_object_or_404(
            WorkRequest,
            request_id=request_id,
            customer=user.customer_profile
        )

        if work_request.status != "workers_on_the_way":
            return Response(
                {"success": False, "message": "Work status must be workers_on_the_way"},
                status=status.HTTP_400_BAD_REQUEST
            )

        work_request.status = "workers_arrived"
        work_request.save()

        # Create status log
        WorkStatusLog.objects.create(
            work_request=work_request,
            updated_by=user,
            status="workers_arrived",
            remarks="Customer manually marked workers as arrived"
        )

        return Response(
            {"success": True, "message": "Workers marked as arrived successfully"}
        )

class ConfirmWorkStartView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        # =============================================
        # ONLY CUSTOMER
        # =============================================

        if user.role != "CUSTOMER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only customers allowed"
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =============================================
        # GET WORK REQUEST
        # =============================================

        work_request = get_object_or_404(

            WorkRequest,

            request_id=request_id,

            customer=user.customer_profile
        )

        # =============================================
        # VALIDATE ARRIVAL
        # =============================================

        if work_request.status != "workers_arrived":

            return Response(
                {
                    "success": False,
                    "message":
                    "Workers have not arrived yet"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =============================================
        # START WORK
        # =============================================

        work_request.status = "in_progress"

        work_request.work_start_time = (
            timezone.now()
        )

        work_request.save()

        # =============================================
        # UPDATE ASSIGNMENTS
        # =============================================

        WorkAssignment.objects.filter(

            work_request=work_request,

            assignment_status__in=[
                "accepted",
                "in_progress"
            ]

        ).update(

            assignment_status="in_progress"
        )

        # =============================================
        # CREATE STATUS LOG
        # =============================================

        WorkStatusLog.objects.create(

            work_request=work_request,

            updated_by=user,

            status="work_started",

            remarks=(
                "Customer confirmed "
                "work start"
            )
        )

        # =============================================
        # RESPONSE
        # =============================================

        return Response(
            {
                "success": True,
                "message":
                "Work started successfully"
            }
        )
    
class CreatePaymentOrderView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        work_request = get_object_or_404(

            WorkRequest,

            request_id=request_id,

            customer=user.customer_profile
        )

        amount = int(
            work_request.estimated_price * 100
        )

        order = client.order.create({

            "amount": amount,

            "currency": "INR",

            "payment_capture": 1
        })

        try:
            payment = Payment.objects.get(work_request=work_request)
            payment.amount = work_request.estimated_price
            payment.payment_method = "online"
            payment.razorpay_order_id = order["id"]
            payment.save()
        except Payment.DoesNotExist:
            payment = Payment.objects.create(
                work_request=work_request,
                customer=user.customer_profile,
                amount=work_request.estimated_price,
                payment_method="online",
                razorpay_order_id=order["id"]
            )

        return Response(
            {
                "success": True,

                "order_id": order["id"],

                "amount": amount,

                "key":
                settings.RAZR_KEY_ID
            }
        )

class VerifyPaymentView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        razorpay_order_id = request.data.get(
            "razorpay_order_id"
        )

        razorpay_payment_id = request.data.get(
            "razorpay_payment_id"
        )

        razorpay_signature = request.data.get(
            "razorpay_signature"
        )

        payment = Payment.objects.get(
            razorpay_order_id=razorpay_order_id
        )

        payment.payment_status = "success"

        payment.razorpay_payment_id = (
            razorpay_payment_id
        )

        payment.razorpay_signature = (
            razorpay_signature
        )

        payment.paid_at = timezone.now()

        payment.save()

        process_payment_split(

            payment.work_request,

            payment_method="online"
        )

        work_request = payment.work_request

        work_request.status = "completed"

        work_request.save()

        return Response(
            {
                "success": True,
                "message":
                "Payment successful"
            }
        )
    

class SubmitWorkerReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        if user.role != "CUSTOMER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only customers allowed"
                },
                status=403
            )

        work_request = get_object_or_404(

            WorkRequest,

            request_id=request_id,

            customer=user.customer_profile,

            status="completed"
        )

        worker_id = request.data.get(
            "worker_id"
        )

        rating = request.data.get(
            "rating"
        )

        review_text = request.data.get(
            "review"
        )

        worker = get_object_or_404(

            WorkerProfile,

            worker_id=worker_id
        )

        review, created = (
            WorkerReview.objects.get_or_create(

                work_request=work_request,

                customer=user.customer_profile,

                worker=worker,

                defaults={

                    "rating": rating,

                    "review": review_text
                }
            )
        )

        if not created:

            return Response(
                {
                    "success": False,
                    "message":
                    "Review already submitted"
                },
                status=400
            )

        return Response(
            {
                "success": True,
                "message":
                "Worker review submitted"
            }
        )
    
class SubmitCustomerReviewView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):

        user = request.user

        if user.role != "WORKER":

            return Response(
                {
                    "success": False,
                    "message":
                    "Only workers allowed"
                },
                status=403
            )

        work_request = get_object_or_404(

            WorkRequest,

            request_id=request_id,

            status="completed"
        )

        assignment = WorkAssignment.objects.filter(

            work_request=work_request,

            worker=user.worker_profile

        ).exists()

        if not assignment:

            return Response(
                {
                    "success": False,
                    "message":
                    "You did not work on this request"
                },
                status=403
            )

        rating = request.data.get(
            "rating"
        )

        review_text = request.data.get(
            "review"
        )

        review, created = (
            CustomerReview.objects.get_or_create(

                work_request=work_request,

                worker=user.worker_profile,

                customer=work_request.customer,

                defaults={

                    "rating": rating,

                    "review": review_text
                }
            )
        )

        if not created:

            return Response(
                {
                    "success": False,
                    "message":
                    "Review already submitted"
                },
                status=400
            )

        return Response(
            {
                "success": True,
                "message":
                "Customer review submitted"
            }
        )
    
class LiveTrackingView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(

        self,

        request,

        request_id
    ):

        work_request = (
            get_object_or_404(

                WorkRequest,

                request_id=request_id
            )
        )

        # ====================================
        # SECURITY
        # ====================================

        if (

            request.user
            !=
            work_request.customer.user
        ):

            return Response(
                {
                    "success": False,

                    "message":
                    "Unauthorized"
                },
                status=403
            )

        assignments = (
            WorkAssignment.objects.filter(

                work_request=work_request,

                assignment_status=
                "accepted"
            )
        )

        response_data = []

        for assignment in assignments:

            worker = assignment.worker

            serializer = (
                LiveWorkerTrackingSerializer(
                    worker
                )
            )

            worker_data = (
                serializer.data
            )

            # =================================
            # DISTANCE
            # =================================

            if (

                worker.current_latitude
                and
                worker.current_longitude
            ):

                distance = (
                    calculate_distance_km(

                        worker.current_latitude,

                        worker.current_longitude,

                        work_request.latitude,

                        work_request.longitude
                    )
                )

                worker_data[
                    "distance_km"
                ] = round(distance, 2)

                worker_data[
                    "eta_minutes"
                ] = (
                    estimate_eta_minutes(
                        distance
                    )
                )

            response_data.append(
                worker_data
            )

        return Response(
            {
                "success": True,

                "workers":
                response_data
            }
        )
    
class UnionRealtimeDashboardView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        user = request.user

        if user.role != "UNION_ADMIN":

            return Response(
                {
                    "success": False,

                    "message":
                    "Only unions allowed"
                },
                status=403
            )

        union = (
            user.union_profile
        )

        # ====================================
        # WORKERS
        # ====================================

        workers = (
            union.workers.all()
        )

        online_workers = (
            workers.filter(

                availability_status=
                "available"
            ).count()
        )

        busy_workers = (
            workers.filter(

                availability_status=
                "busy"
            ).count()
        )

        offline_workers = (
            workers.filter(

                availability_status=
                "offline"
            ).count()
        )

        # ====================================
        # ACTIVE REQUESTS
        # ====================================

        active_requests = (
            WorkRequest.objects.filter(

                assigned_union=union,

                status__in=[

                    "team_assigned",

                    "workers_on_the_way",

                    "workers_arrived",

                    "work_started"
                ]
            )
        )

        # ====================================
        # PAYMENTS
        # ====================================

        pending_payments = (
            Payment.objects.filter(

                work_request__assigned_union=
                union,

                payment_status="pending"
            ).count()
        )

        # ====================================
        # ACTIVE WORKS
        # ====================================

        active_work_data = []

        for work in active_requests:

            active_work_data.append({

                "request_id":
                str(work.request_id),

                "customer_name":
                work.customer.user.full_name,

                "status":
                work.status,

                "estimated_price":
                str(work.estimated_price),

                "latitude":
                work.latitude,

                "longitude":
                work.longitude
            })

        return Response({

            "success": True,

            "dashboard": {

                "online_workers":
                online_workers,

                "busy_workers":
                busy_workers,

                "offline_workers":
                offline_workers,

                "active_requests":
                active_requests.count(),

                "pending_payments":
                pending_payments,

                "active_works":
                active_work_data
            }
        })


# =========================================================
# UNION — LIST ALL DISPUTES FOR THIS UNION'S REQUESTS
# =========================================================

class UnionDisputeListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role != "UNION_ADMIN":
            return Response(
                {"success": False, "message": "Only union admins allowed"},
                status=403
            )

        union = user.union_profile

        disputes = Dispute.objects.filter(
            work_request__assigned_union=union
        ).select_related(
            "work_request", "raised_by", "resolved_by"
        ).order_by("-created_at")

        serializer = DisputeSerializer(disputes, many=True)

        return Response({
            "success": True,
            "data": serializer.data
        })


# =========================================================
# UNION — RESOLVE A DISPUTE
# =========================================================

class ResolveDisputeView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, dispute_id):

        user = request.user

        if user.role != "UNION_ADMIN":
            return Response(
                {"success": False, "message": "Only union admins allowed"},
                status=403
            )

        dispute = get_object_or_404(Dispute, dispute_id=dispute_id)

        if dispute.work_request.assigned_union != user.union_profile:
            return Response(
                {"success": False, "message": "Not your union's dispute"},
                status=403
            )

        resolution_notes = request.data.get("resolution_notes", "")

        dispute.status = "resolved"
        dispute.resolved_by = user
        dispute.resolution_notes = resolution_notes
        dispute.resolved_at = timezone.now()
        dispute.save()

        # Restore request to payment_pending if it was disputed
        work_request = dispute.work_request
        if work_request.status == "disputed":
            work_request.status = "payment_pending"
            work_request.save()

            WorkStatusLog.objects.create(
                work_request=work_request,
                updated_by=user,
                status="payment_pending",
                remarks=f"Dispute resolved: {resolution_notes}"
            )

        return Response({
            "success": True,
            "message": "Dispute resolved successfully"
        })