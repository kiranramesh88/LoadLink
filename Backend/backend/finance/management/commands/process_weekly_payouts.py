from django.core.management.base import (
    BaseCommand
)

from finance.models import (

    WorkerWallet,

    UnionWallet,

    WithdrawalRequest,

    WalletTransaction
)

from django.utils import timezone


class Command(BaseCommand):

    help = (
        "Process weekly payouts"
    )

    def handle(self, *args, **kwargs):

        # =====================================
        # WORKER WALLETS
        # =====================================

        worker_wallets = (
            WorkerWallet.objects.filter(

                available_balance__gte=500
            )
        )

        for wallet in worker_wallets:

            amount = (
                wallet.available_balance
            )

            # =================================
            # CREATE WITHDRAWAL REQUEST
            # =================================

            withdrawal = (
                WithdrawalRequest.objects.create(

                    worker=wallet.worker,

                    amount=amount,

                    account_holder_name=
                    wallet.worker.user.full_name,

                    bank_name="AUTO",

                    account_number="AUTO",

                    ifsc_code="AUTO",

                    status="approved",

                    approved_at=
                    timezone.now()
                )
            )

            # =================================
            # DEBIT WALLET
            # =================================

            wallet.available_balance = 0

            wallet.save()

            # =================================
            # TRANSACTION
            # =================================

            WalletTransaction.objects.create(

                worker_wallet=wallet,

                amount=amount,

                transaction_type=
                "withdrawal",

                description=
                "Weekly auto payout"
            )

            self.stdout.write(

                self.style.SUCCESS(

                    f"Worker payout processed "
                    f"{wallet.worker.user.full_name}"
                )
            )

        # =====================================
        # UNION WALLETS
        # =====================================

        union_wallets = (
            UnionWallet.objects.filter(

                available_balance__gte=500
            )
        )

        for wallet in union_wallets:

            amount = (
                wallet.available_balance
            )

            withdrawal = (
                WithdrawalRequest.objects.create(

                    union=wallet.union,

                    amount=amount,

                    account_holder_name=
                    wallet.union.union_name,

                    bank_name="AUTO",

                    account_number="AUTO",

                    ifsc_code="AUTO",

                    status="approved",

                    approved_at=
                    timezone.now()
                )
            )

            wallet.available_balance = 0

            wallet.save()

            WalletTransaction.objects.create(

                union_wallet=wallet,

                amount=amount,

                transaction_type=
                "withdrawal",

                description=
                "Weekly union auto payout"
            )

            self.stdout.write(

                self.style.SUCCESS(

                    f"Union payout processed "
                    f"{wallet.union.union_name}"
                )
            )

        self.stdout.write(

            self.style.SUCCESS(
                "Weekly payout completed"
            )
        )