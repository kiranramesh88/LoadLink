from rest_framework import serializers

from .models import *


class WorkerWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkerWallet
        fields = ("available_balance", "pending_balance", "cash_in_hand_due", "total_earned", "updated_at")


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ("transaction_id", "transaction_type", "amount", "description", "created_at")


class SettlementRequestSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = SettlementRequest

        fields = "__all__"

        read_only_fields = (

            "settlement_id",

            "worker",

            "union",

            "status",

            "approved_at",

            "created_at"
        )

class WithdrawalRequestSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = WithdrawalRequest

        fields = "__all__"

        read_only_fields = (

            "withdrawal_id",

            "worker",

            "union",

            "status",

            "approved_at",

            "created_at"
        )