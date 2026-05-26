from django.urls import path

from .views import *

urlpatterns = [

    # Wallet
    path("wallet/", WorkerWalletDetailView.as_view(), name="worker-wallet"),
    path("wallet/transactions/", WalletTransactionListView.as_view(), name="wallet-transactions"),

    # Withdrawals
    path("withdrawals/create/", CreateWithdrawalRequestView.as_view(), name="create-withdrawal"),
    path("withdrawals/my/", WithdrawalListView.as_view(), name="my-withdrawals"),
    path("withdrawals/<uuid:withdrawal_id>/approve/", ApproveWithdrawalRequestView.as_view(), name="approve-withdrawal"),

    # Settlements
    path("settlements/create/", CreateSettlementRequestView.as_view(), name="create-settlement"),
    path("settlements/<uuid:settlement_id>/approve/", ApproveSettlementRequestView.as_view(), name="approve-settlement"),
]