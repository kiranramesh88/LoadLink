from django.utils import timezone
from decimal import Decimal

from finance.models import (

    WorkerWallet,

    UnionWallet,

    WalletTransaction
)

from work_requests.models import (
    WorkAssignment
)


def process_payment_split(

    work_request,

    payment_method
):

    # ============================================
    # GET UNION
    # ============================================

    union = work_request.assigned_union

    # ============================================
    # TOTAL AMOUNT
    # ============================================

    total_amount = Decimal(

        work_request.estimated_price
    )

    # ============================================
    # UNION COMMISSION %
    # ============================================

    commission_percentage = Decimal(

        union.commission_percentage
    )

    # ============================================
    # UNION SHARE
    # ============================================

    union_share = (

        total_amount *

        commission_percentage

    ) / Decimal("100")

    # ============================================
    # TOTAL WORKER SHARE
    # ============================================

    workers_total_share = (

        total_amount - union_share
    )

    # ============================================
    # ACCEPTED WORKERS
    # ============================================

    assignments = (
        WorkAssignment.objects.filter(
            work_request=work_request,
            assignment_status__in=["accepted", "in_progress", "completed"]
        )
    )

    total_workers = assignments.count()

    if total_workers == 0:

        return

    # ============================================
    # EACH WORKER SHARE
    # ============================================

    each_worker_share = (

        workers_total_share /

        total_workers
    )

    # ============================================
    # ============================================
    # PROCESS UNION WALLET
    # ============================================

    union_wallet = union.wallet

    if payment_method == "online":

        union_wallet.available_balance += union_share
        union_wallet.total_earned += union_share

        WalletTransaction.objects.create(
            union_wallet=union_wallet,
            work_request=work_request,
            transaction_type="credit",
            amount=union_share,
            description="Union commission credited"
        )

    elif payment_method == "cash":

        union_wallet.pending_balance += union_share
        union_wallet.total_earned += union_share

        WalletTransaction.objects.create(
            union_wallet=union_wallet,
            work_request=work_request,
            transaction_type="credit",
            amount=union_share,
            description="Union commission pending (Cash job)"
        )

    union_wallet.save()

    # Update Union Profile Analytics
    union.total_earnings += union_share
    union.total_completed_works += 1
    union.wallet_balance = union_wallet.available_balance
    union.save()

    # ============================================
    # PROCESS EACH WORKER
    # ============================================

    for assignment in assignments:

        worker = assignment.worker

        wallet = worker.wallet

        # ========================================
        # ONLINE PAYMENT
        # ========================================

        if payment_method == "online":

            remaining_amount = (
                process_auto_deduction(
                    worker,
                    union,
                    each_worker_share
                )
            )

            wallet.available_balance += remaining_amount
            wallet.total_earned += each_worker_share

        # ========================================
        # CASH PAYMENT
        # ========================================

        elif payment_method == "cash":

            wallet.total_earned += each_worker_share

            wallet.cash_in_hand_due += (
                union_share / total_workers
            )

        # ========================================
        # CREATE TRANSACTION
        # ========================================

        WalletTransaction.objects.create(

            worker_wallet=wallet,

            work_request=work_request,

            transaction_type="credit",

            amount=each_worker_share,

            description=(
                "Work payment credited"
            )
        )

        wallet.save()
        
        # Update Worker Profile Analytics
        worker.wallet_balance = wallet.available_balance
        worker.total_earnings = wallet.total_earned
        # total_completed_works is already updated in ConfirmWorkCompletionView
        worker.last_work_completed_at = timezone.now()
        worker.save()

    # ============================================
    # UPDATE CUSTOMER PROFILE
    # ============================================

    customer = work_request.customer
    if customer:
        customer.total_amount_spent += total_amount
        customer.total_completed_works += 1
        customer.save()


def process_auto_deduction(

    worker,

    union,

    earned_amount
):

    wallet = worker.wallet

    union_wallet = union.wallet

    # =========================================
    # NO DUE
    # =========================================

    if wallet.cash_in_hand_due <= 0:

        return earned_amount

    # =========================================
    # HOW MUCH TO DEDUCT
    # =========================================

    deduction_amount = min(

        wallet.cash_in_hand_due,

        earned_amount
    )

    # =========================================
    # REDUCE WORKER DUE
    # =========================================

    wallet.cash_in_hand_due -= (
        deduction_amount
    )

    # =========================================
    # CREDIT UNION
    # =========================================

    union_wallet.available_balance += deduction_amount
    union_wallet.pending_balance -= deduction_amount

    union_wallet.save()

    union = union_wallet.union
    union.wallet_balance = union_wallet.available_balance
    union.save()

    # =========================================
    # CREATE UNION TRANSACTION
    # =========================================

    WalletTransaction.objects.create(

        union_wallet=union_wallet,

        transaction_type=
        "credit",

        amount=deduction_amount,

        description=
        "Auto deduction settlement received"
    )

    # =========================================
    # CREATE WORKER TRANSACTION
    # =========================================

    WalletTransaction.objects.create(

        worker_wallet=wallet,

        transaction_type=
        "auto_deduction",

        amount=deduction_amount,

        description=
        "Auto deducted for overdue settlement"
    )

    # =========================================
    # REMAINING WORKER EARNING
    # =========================================

    remaining_earning = (

        earned_amount - deduction_amount
    )

    wallet.save()
    
    # Sync Worker Profile
    worker.wallet_balance = wallet.available_balance
    worker.total_earnings = wallet.total_earned
    worker.save()

    return remaining_earning


def distribute_work_payment(
    payment
):
    # Deprecated: process_payment_split handles all settlements and balance updates now
    pass