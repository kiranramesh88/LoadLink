from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import (
    User,
    CustomerProfile,
    WorkerProfile,
    UnionProfile
)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):

    if created:

        if instance.role == "CUSTOMER":

            CustomerProfile.objects.create(
                user=instance
            )

        elif instance.role == "WORKER":

            WorkerProfile.objects.create(
                user=instance,
                worker_id=f"WRK-{str(instance.id)[:6]}"
            )

        elif instance.role == "UNION_ADMIN":

            UnionProfile.objects.create(
                user=instance,
                union_name=f"{instance.full_name} Union",
                union_code=f"UN-{str(instance.id)[:5]}",
                operational_area="Not Assigned",
                district="Not Assigned",
                union_address="Not Added"
            )
            