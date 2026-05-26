import uuid

from django.db import models

from accounts.models import User
# Create your models here.


class Notification(models.Model):

    NOTIFICATION_TYPE_CHOICES = (

        ("assignment", "Assignment"),

        ("team_confirmed", "Team Confirmed"),

        ("worker_on_the_way", "Worker On The Way"),

        ("workers_arrived", "Workers Arrived"),

        ("work_started", "Work Started"),

        ("payment", "Payment"),

        ("withdrawal", "Withdrawal"),

        ("settlement", "Settlement"),

        ("general", "General"),
    )

    notification_id = models.UUIDField(

        primary_key=True,

        default=uuid.uuid4,

        editable=False
    )

    recipient = models.ForeignKey(

        User,

        on_delete=models.CASCADE,

        related_name="notifications"
    )

    title = models.CharField(

        max_length=255
    )

    message = models.TextField()

    notification_type = models.CharField(

        max_length=50,

        choices=NOTIFICATION_TYPE_CHOICES,

        default="general"
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return (
            f"{self.recipient.full_name} "
            f"- {self.title}"
        )
