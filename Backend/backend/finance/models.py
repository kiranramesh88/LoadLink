from django.db import models
import uuid

from django.db import models

from accounts.models import (

    WorkerProfile,

    UnionProfile
)

from work_requests.models import (
    WorkRequest
)
# Create your models here.


class WorkerWallet(models.Model):

    worker = models.OneToOneField(

        WorkerProfile,

        on_delete=models.CASCADE,

        related_name="wallet"
    )

    available_balance = models.DecimalField(

        max_digits=12,

        decimal_places=2,

        default=0
    )

    pending_balance = models.DecimalField(

        max_digits=12,

        decimal_places=2,

        default=0
    )

    cash_in_hand_due = models.DecimalField(

        max_digits=12,

        decimal_places=2,

        default=0
    )

    total_earned = models.DecimalField(

        max_digits=12,

        decimal_places=2,

        default=0
    )

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    updated_at = models.DateTimeField(

        auto_now=True
    )

    def __str__(self):

        return (
            f"{self.worker.user.full_name} Wallet"
        )
    

class UnionWallet(models.Model):

    union = models.OneToOneField(

        UnionProfile,

        on_delete=models.CASCADE,

        related_name="wallet"
    )

    available_balance = models.DecimalField(

        max_digits=12,

        decimal_places=2,

        default=0
    )

    pending_balance = models.DecimalField(

        max_digits=12,

        decimal_places=2,

        default=0
    )

    total_earned = models.DecimalField(

        max_digits=12,

        decimal_places=2,

        default=0
    )

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    updated_at = models.DateTimeField(

        auto_now=True
    )

    def __str__(self):

        return (
            f"{self.union.union_name} Wallet"
        )
    
class WalletTransaction(models.Model):

    TRANSACTION_TYPE_CHOICES = (

        ("credit", "Credit"),

        ("debit", "Debit"),

        ("withdrawal", "Withdrawal"),

        ("settlement", "Settlement"),

        ("auto_deduction", "Auto Deduction"),
    )

    transaction_id = models.UUIDField(

        primary_key=True,

        default=uuid.uuid4,

        editable=False
    )

    worker_wallet = models.ForeignKey(

        WorkerWallet,

        on_delete=models.CASCADE,

        null=True,

        blank=True
    )

    union_wallet = models.ForeignKey(

        UnionWallet,

        on_delete=models.CASCADE,

        null=True,

        blank=True
    )

    work_request = models.ForeignKey(

        WorkRequest,

        on_delete=models.SET_NULL,

        null=True,

        blank=True
    )

    transaction_type = models.CharField(

        max_length=30,

        choices=TRANSACTION_TYPE_CHOICES
    )

    amount = models.DecimalField(

        max_digits=12,

        decimal_places=2
    )

    description = models.TextField()

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.transaction_type} - "
            f"{self.amount}"
        )
    

class SettlementRequest(models.Model):

    STATUS_CHOICES = (

        ("pending", "Pending"),

        ("approved", "Approved"),

        ("rejected", "Rejected"),
    )

    settlement_id = models.UUIDField(

        primary_key=True,

        default=uuid.uuid4,

        editable=False
    )

    worker = models.ForeignKey(

        WorkerProfile,

        on_delete=models.CASCADE,

        related_name="settlement_requests"
    )

    union = models.ForeignKey(

        UnionProfile,

        on_delete=models.CASCADE
    )

    amount = models.DecimalField(

        max_digits=12,

        decimal_places=2
    )

    payment_reference = models.CharField(

        max_length=255,

        blank=True,

        null=True
    )

    proof_image = models.ImageField(

        upload_to="settlement_proofs/",

        blank=True,

        null=True
    )

    remarks = models.TextField(

        blank=True,

        null=True
    )

    status = models.CharField(

        max_length=30,

        choices=STATUS_CHOICES,

        default="pending"
    )

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    approved_at = models.DateTimeField(

        null=True,

        blank=True
    )

    def __str__(self):

        return (
            f"{self.worker.user.full_name} "
            f"- {self.amount}"
        )
    

class WithdrawalRequest(models.Model):

    STATUS_CHOICES = (

        ("pending", "Pending"),

        ("approved", "Approved"),

        ("rejected", "Rejected"),
    )

    withdrawal_id = models.UUIDField(

        primary_key=True,

        default=uuid.uuid4,

        editable=False
    )

    worker = models.ForeignKey(

        WorkerProfile,

        on_delete=models.CASCADE,

        null=True,

        blank=True
    )

    union = models.ForeignKey(

        UnionProfile,

        on_delete=models.CASCADE,

        null=True,

        blank=True
    )

    amount = models.DecimalField(

        max_digits=12,

        decimal_places=2
    )

    account_holder_name = models.CharField(

        max_length=255
    )

    bank_name = models.CharField(

        max_length=255
    )

    account_number = models.CharField(

        max_length=50
    )

    ifsc_code = models.CharField(

        max_length=20
    )

    upi_id = models.CharField(

        max_length=255,

        blank=True,

        null=True
    )

    remarks = models.TextField(

        blank=True,

        null=True
    )

    status = models.CharField(

        max_length=30,

        choices=STATUS_CHOICES,

        default="pending"
    )

    created_at = models.DateTimeField(

        auto_now_add=True
    )

    approved_at = models.DateTimeField(

        null=True,

        blank=True
    )

    def __str__(self):

        if self.worker:

            return (
                f"{self.worker.user.full_name}"
            )

        return (
            f"{self.union.union_name}"
        )