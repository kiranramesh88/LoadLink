from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.permissions import (
    IsAuthenticated
)

from django.shortcuts import (
    get_object_or_404
)

from .models import *

from .serializers import *

from django.utils import timezone

# Create your views here.


class WorkerWalletDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "WORKER":
            return Response({"success": False, "message": "Only workers allowed"}, status=403)
        try:
            wallet = user.worker_profile.wallet
            return Response({"success": True, "data": WorkerWalletSerializer(wallet).data})
        except Exception:
            return Response({"success": True, "data": {"available_balance": "0.00", "pending_balance": "0.00", "cash_in_hand_due": "0.00", "total_earned": "0.00"}})


class WalletTransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "WORKER":
            return Response({"success": False, "message": "Only workers allowed"}, status=403)
        try:
            wallet = user.worker_profile.wallet
            transactions = WalletTransaction.objects.filter(worker_wallet=wallet).order_by("-created_at")[:50]
            return Response({"success": True, "data": WalletTransactionSerializer(transactions, many=True).data})
        except Exception:
            return Response({"success": True, "data": []})


class WithdrawalListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != "WORKER":
            return Response({"success": False, "message": "Only workers allowed"}, status=403)
        withdrawals = WithdrawalRequest.objects.filter(worker=user.worker_profile).order_by("-created_at")
        return Response({"success": True, "data": WithdrawalRequestSerializer(withdrawals, many=True).data})


class CreateSettlementRequestView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

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

        wallet = (
            user.worker_profile.wallet
        )

        amount = request.data.get(
            "amount"
        )

        if float(amount) <= 0:

            return Response(
                {
                    "success": False,

                    "message":
                    "Invalid amount"
                },
                status=400
            )

        if float(amount) > float(
            wallet.cash_in_hand_due
        ):

            return Response(
                {
                    "success": False,

                    "message":
                    "Amount exceeds due"
                },
                status=400
            )

        serializer = (
            SettlementRequestSerializer(

                data=request.data
            )
        )

        if serializer.is_valid():

            settlement = (
                serializer.save(

                    worker=
                    user.worker_profile,

                    union=
                    user.worker_profile.union
                )
            )

            return Response(
                {
                    "success": True,

                    "data":
                    SettlementRequestSerializer(
                        settlement
                    ).data
                }
            )

        return Response(
            serializer.errors,
            status=400
        )
    

class ApproveSettlementRequestView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(

        self,

        request,

        settlement_id
    ):

        user = request.user

        if user.role != "UNION":

            return Response(
                {
                    "success": False,

                    "message":
                    "Only unions allowed"
                },
                status=403
            )

        settlement = (
            get_object_or_404(

                SettlementRequest,

                settlement_id=
                settlement_id,

                union=
                user.union_profile,

                status="pending"
            )
        )

        settlement.status = (
            "approved"
        )

        settlement.approved_at = (
            timezone.now()
        )

        settlement.save()

        # ====================================
        # UPDATE WORKER WALLET
        # ====================================

        wallet = (
            settlement.worker.wallet
        )

        wallet.cash_in_hand_due -= (
            settlement.amount
        )

        wallet.save()

        # Update Worker Profile Analytics
        worker = settlement.worker
        worker.save()

        # Credit Union Wallet
        union_wallet = settlement.union.wallet
        union_wallet.available_balance += settlement.amount
        union_wallet.pending_balance -= settlement.amount
        union_wallet.save()

        # Update Union Profile Analytics
        union = settlement.union
        union.wallet_balance = union_wallet.available_balance
        union.save()

        # Create Transaction for Union
        WalletTransaction.objects.create(
            union_wallet=union_wallet,
            amount=settlement.amount,
            transaction_type="credit",
            description="Union manual settlement received"
        )

        # ====================================
        # CREATE TRANSACTION
        # ====================================

        WalletTransaction.objects.create(

            worker_wallet=wallet,

            amount=settlement.amount,

            transaction_type=
            "settlement",

            description=
            "Cash settlement approved"
        )

        return Response(
            {
                "success": True,

                "message":
                "Settlement approved"
            }
        )
class CreateWithdrawalRequestView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        user = request.user

        amount = float(

            request.data.get(
                "amount"
            )
        )

        # ====================================
        # MINIMUM WITHDRAWAL
        # ====================================

        if amount < 500:

            return Response(
                {
                    "success": False,

                    "message":
                    "Minimum withdrawal is ₹500"
                },
                status=400
            )

        # ====================================
        # WORKER
        # ====================================

        if user.role == "WORKER":

            wallet = (
                user.worker_profile.wallet
            )

            if amount > float(
                wallet.available_balance
            ):

                return Response(
                    {
                        "success": False,

                        "message":
                        "Insufficient balance"
                    },
                    status=400
                )

            serializer = (
                WithdrawalRequestSerializer(

                    data=request.data
                )
            )

            if serializer.is_valid():

                withdrawal = (
                    serializer.save(

                        worker=
                        user.worker_profile
                    )
                )

                return Response(
                    {
                        "success": True,

                        "data":
                        WithdrawalRequestSerializer(
                            withdrawal
                        ).data
                    }
                )

            return Response(
                serializer.errors,
                status=400
            )

        # ====================================
        # UNION
        # ====================================

        elif user.role == "UNION":

            wallet = (
                user.union_profile.wallet
            )

            if amount > float(
                wallet.available_balance
            ):

                return Response(
                    {
                        "success": False,

                        "message":
                        "Insufficient balance"
                    },
                    status=400
                )

            serializer = (
                WithdrawalRequestSerializer(

                    data=request.data
                )
            )

            if serializer.is_valid():

                withdrawal = (
                    serializer.save(

                        union=
                        user.union_profile
                    )
                )

                return Response(
                    {
                        "success": True,

                        "data":
                        WithdrawalRequestSerializer(
                            withdrawal
                        ).data
                    }
                )

            return Response(
                serializer.errors,
                status=400
            )

        return Response(
            {
                "success": False,

                "message":
                "Invalid role"
            },
            status=403
        )
    

class ApproveWithdrawalRequestView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(

        self,

        request,

        withdrawal_id
    ):

        user = request.user

        # ====================================
        # ONLY UNION CAN APPROVE
        # ====================================

        if user.role != "UNION":

            return Response(
                {
                    "success": False,

                    "message":
                    "Only unions allowed"
                },
                status=403
            )

        withdrawal = (
            get_object_or_404(

                WithdrawalRequest,

                withdrawal_id=
                withdrawal_id,

                status="pending"
            )
        )

        # ====================================
        # WORKER WITHDRAWAL
        # ====================================

        if withdrawal.worker:

            wallet = (
                withdrawal.worker.wallet
            )

        # ====================================
        # UNION WITHDRAWAL
        # ====================================

        else:

            wallet = (
                withdrawal.union.wallet
            )

        # ====================================
        # DEBIT WALLET
        # ====================================

        wallet.available_balance -= (
            withdrawal.amount
        )

        wallet.save()

        # Update Profile Analytics
        if withdrawal.worker:
            worker = withdrawal.worker
            worker.wallet_balance = wallet.available_balance
            worker.save()
        else:
            union = withdrawal.union
            union.wallet_balance = wallet.available_balance
            union.save()

        # ====================================
        # UPDATE STATUS
        # ====================================

        withdrawal.status = (
            "approved"
        )

        withdrawal.approved_at = (
            timezone.now()
        )

        withdrawal.save()

        # ====================================
        # CREATE TRANSACTION
        # ====================================

        WalletTransaction.objects.create(

            worker_wallet=(
                wallet
                if withdrawal.worker
                else None
            ),

            union_wallet=(
                wallet
                if withdrawal.union
                else None
            ),

            amount=withdrawal.amount,

            transaction_type=
            "withdrawal",

            description=
            "Withdrawal approved"
        )

        return Response(
            {
                "success": True,

                "message":
                "Withdrawal approved"
            }
        ) 