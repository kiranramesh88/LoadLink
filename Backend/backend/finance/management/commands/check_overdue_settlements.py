from django.core.management.base import (
    BaseCommand
)

from finance.models import (
    WorkerWallet
)


class Command(BaseCommand):

    help = (
        "Check overdue settlements"
    )

    def handle(self, *args, **kwargs):

        wallets = (
            WorkerWallet.objects.filter(

                cash_in_hand_due__gt=0
            )
        )

        for wallet in wallets:

            worker = wallet.worker

            # =================================
            # WARNING LEVEL
            # =================================

            if wallet.cash_in_hand_due >= 3000:

                worker.is_available = False

                worker.save()

                self.stdout.write(

                    self.style.WARNING(

                        f"{worker.user.full_name} "
                        f"blocked for overdue dues"
                    )
                )

            else:

                self.stdout.write(

                    self.style.WARNING(

                        f"{worker.user.full_name} "
                        f"has pending settlement"
                    )
                )