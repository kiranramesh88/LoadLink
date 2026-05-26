from django.db.models.signals import (
    post_save
)

from django.dispatch import receiver

from accounts.models import (

    WorkerProfile,

    UnionProfile
)

from .models import (

    WorkerWallet,

    UnionWallet
)


@receiver(post_save, sender=WorkerProfile)

def create_worker_wallet(

    sender,

    instance,

    created,

    **kwargs
):

    if created:

        WorkerWallet.objects.create(

            worker=instance
        )


@receiver(post_save, sender=UnionProfile)

def create_union_wallet(

    sender,

    instance,

    created,

    **kwargs
):

    if created:

        UnionWallet.objects.create(

            union=instance
        )