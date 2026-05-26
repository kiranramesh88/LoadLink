from .models import Notification

from asgiref.sync import (
    async_to_sync
)

from channels.layers import (
    get_channel_layer
)


def create_notification(

    recipient,

    title,

    message,

    notification_type="general"
):

    notification = (
        Notification.objects.create(

            recipient=recipient,

            title=title,

            message=message,

            notification_type=
            notification_type
        )
    )

    # ========================================
    # REALTIME WEBSOCKET EVENT
    # ========================================

    channel_layer = (
        get_channel_layer()
    )

    async_to_sync(
        channel_layer.group_send
    )(

        # f"user_{recipient.id}",
        "test_notifications",

        {

            "type":
            "send_notification",

            "title":
            title,

            "message":
            message,

            "notification_type":
            notification_type
        }
    )

    return notification

def send_union_dashboard_update(

    event_type,

    message,

    data={}
):

    print("FUNCTION STARTED")

    channel_layer = (
        get_channel_layer()
    )

    print(channel_layer)

    async_to_sync(
        channel_layer.group_send
    )(

        "union_dashboard",

        {

            "type":
            "dashboard_update",

            "event_type":
            event_type,

            "message":
            message,

            "data":
            data
        }
    )

    print("GROUP SEND COMPLETED")