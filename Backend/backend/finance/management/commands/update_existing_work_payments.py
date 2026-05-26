from decimal import Decimal

from django.core.management.base import (
    BaseCommand
)

from django.utils import timezone

from work_requests.models import Payment

from work_requests.models import (
    WorkAssignment
)


class Command(BaseCommand):

    help = (
        "Update worker earnings "
        "for existing completed works"
    )

    def handle(self, *args, **kwargs):

        payments = Payment.objects.filter(

            payment_status="success"
        )

        updated_count = 0

        for payment in payments:

            work_request = (
                payment.work_request
            )

            union = (
                work_request.assigned_union
            )

            # ============================
            # SKIP ALREADY UPDATED
            # ============================

            if getattr(

                payment,

                "earnings_distributed",

                False
            ):

                continue

            assignments = (
                WorkAssignment.objects.filter(

                    work_request=work_request,

                    assignment_status__in=[

                        "accepted",

                        "completed",

                        "in_progress"
                    ]
                )
            )

            total_workers = (
                assignments.count()
            )

            if total_workers == 0:

                continue

            total_amount = Decimal(
                payment.amount
            )

            commission_percentage = Decimal(

                union.commission_percentage
            )

            union_commission = (

                total_amount *

                commission_percentage

            ) / Decimal("100")

            worker_pool = (
                total_amount -
                union_commission
            )

            worker_share = (
                worker_pool /
                total_workers
            )

            # ============================
            # UPDATE UNION
            # ============================

            union.wallet_balance += (
                union_commission
            )

            union.total_earnings += (
                union_commission
            )

            union.save()

            # ============================
            # UPDATE WORKERS
            # ============================

            for assignment in assignments:

                worker = assignment.worker

                worker.wallet_balance += (
                    worker_share
                )

                worker.total_earnings += (
                    worker_share
                )

                worker.total_completed_works += 1

                worker.last_work_completed_at = (
                    timezone.now()
                )

                worker.is_currently_assigned = (
                    False
                )

                worker.save()

            # ============================
            # MARK DISTRIBUTED
            # ============================

            payment.earnings_distributed = True

            payment.save()

            updated_count += 1

            self.stdout.write(

                self.style.SUCCESS(

                    f"Updated payment "
                    f"{payment.payment_id}"
                )
            )

        self.stdout.write(

            self.style.SUCCESS(

                f"\nCompleted.\n"

                f"Updated {updated_count} "
                f"payments."
            )
        )