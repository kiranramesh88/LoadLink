from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import WorkAssignment, WorkStatusLog, WorkRequest


# =========================================================
# HELPER — push to a group safely
# =========================================================

def _push(group, payload):
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(group, payload)
    except Exception as e:
        print(f"[Signal] WS push failed ({group}): {e}")


# =========================================================
# WORKER ASSIGNMENT CREATED → notify worker + customer
# =========================================================

@receiver(post_save, sender=WorkAssignment)
def on_assignment_created(sender, instance, created, **kwargs):
    if not created:
        return

    work = instance.work_request

    # ── Log ──────────────────────────────────────────────
    WorkStatusLog.objects.get_or_create(
        work_request=work,
        status="workers_assigned",
        defaults={
            "updated_by": instance.assigned_by.user if instance.assigned_by else None,
            "remarks": f"{instance.worker.user.full_name} assigned to work",
        }
    )

    # ── Push to Worker ────────────────────────────────────
    _push(
        f"worker_{instance.worker.user.id}",
        {
            "type": "work_assignment",
            "message": f"New work assigned: {work.title}",
            "data": {
                "assignment_id": str(instance.assignment_id),
                "work_request_id": str(work.request_id),
                "title": work.title,
                "work_type": work.work_type,
                "work_address": work.work_address,
                "district": work.district,
                "scheduled_date": str(work.scheduled_date or ""),
                "scheduled_time": str(work.scheduled_time or ""),
                "estimated_price": str(work.estimated_price or ""),
                "is_team_leader": instance.is_team_leader,
            },
        }
    )

    # ── Push team_confirmed to Customer ──────────────────
    # (triggered once per team confirm; first assignment is enough)
    if work.customer:
        customer_user_id = str(work.customer.user.id)
        _push(
            f"customer_{customer_user_id}",
            {
                "type": "send_notification",
                "notification_type": "team_confirmed",
                "title": "Team Confirmed! 🎉",
                "message": f"Your team is ready for '{work.title}'",
                "data": {
                    "work_request_id": str(work.request_id),
                    "work_type": work.work_type,
                    "district": work.district,
                    "scheduled_date": str(work.scheduled_date or ""),
                },
            }
        )


# =========================================================
# STATUS LOG SAVED → push live status update to customer
# =========================================================

@receiver(post_save, sender=WorkStatusLog)
def on_status_log_created(sender, instance, created, **kwargs):
    if not created:
        return

    work = instance.work_request
    if not work.customer:
        return

    customer_user_id = str(work.customer.user.id)
    _push(
        f"customer_{customer_user_id}",
        {
            "type": "send_notification",
            "notification_type": "work_status_update",
            "title": f"Status Update: {instance.status.replace('_', ' ').title()}",
            "message": instance.remarks or f"Work status changed to {instance.status}",
            "data": {
                "work_request_id": str(work.request_id),
                "status": instance.status,
                "title": work.title,
            },
        }
    )


# =========================================================
# NEW WORK REQUEST → broadcast to union dashboard
# =========================================================

@receiver(post_save, sender=WorkRequest)
def broadcast_new_request_to_union(sender, instance, created, **kwargs):
    if not created:
        return

    _push(
        "union_dashboard",
        {
            "type": "dashboard_update",
            "event_type": "new_request",
            "message": f"New work request: {instance.work_type}",
            "data": {
                "request_id": str(instance.request_id),
                "title": instance.title or instance.work_type,
                "work_type": instance.work_type,
                "district": instance.district,
                "work_address": instance.work_address,
                "estimated_workers": instance.estimated_workers,
                "estimated_price": str(instance.estimated_price or ""),
                "priority": instance.priority,
                "scheduled_date": str(instance.scheduled_date or ""),
                "created_at": instance.created_at.isoformat(),
                "assigned_union": str(instance.assigned_union_id) if instance.assigned_union_id else None,
            },
        }
    )