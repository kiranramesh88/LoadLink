import json

from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from accounts.models import WorkerProfile
from django.utils import timezone


@database_sync_to_async
def _set_worker_offline(worker_id):
    worker = WorkerProfile.objects.filter(worker_id=worker_id).first()
    if worker:
        worker.availability_status = "offline"
        worker.last_location_updated_at = timezone.now()
        worker.save()


@database_sync_to_async
def _update_worker_location(worker_id, latitude, longitude):
    worker = WorkerProfile.objects.filter(worker_id=worker_id).first()
    if worker:
        worker.current_latitude = latitude
        worker.current_longitude = longitude
        worker.last_location_updated_at = timezone.now()
        if worker.availability_status == "offline":
            worker.availability_status = "available"
        worker.save()


@database_sync_to_async
def _get_user_role(user_id):
    from accounts.models import User
    try:
        return User.objects.get(id=user_id).role
    except Exception:
        return None


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    Per-user WebSocket notification channel.
    Authenticates via JWT token in the query string:
      ws://host/ws/notifications/?token=<access_token>

    Group names:
      - WORKER      → worker_{user_id}
      - CUSTOMER    → customer_{user_id}
      - UNION_ADMIN → union_admin_{user_id}
    """

    async def connect(self):
        from rest_framework_simplejwt.tokens import UntypedToken
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

        query_string = self.scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token_list = params.get("token", [])

        if not token_list:
            await self.close(code=4001)
            return

        try:
            validated_token = UntypedToken(token_list[0])
            user_id = str(validated_token["user_id"])
        except (InvalidToken, TokenError):
            await self.close(code=4001)
            return

        self.user_id = user_id

        # Determine role-based group name
        role = await _get_user_role(user_id)
        if role == "CUSTOMER":
            self.group_name = f"customer_{user_id}"
        elif role in ("UNION_ADMIN", "SUPER_ADMIN"):
            self.group_name = f"union_admin_{user_id}"
        else:
            # Default: worker group (also covers WORKER role)
            self.group_name = f"worker_{user_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"[WS] NotificationConsumer connected: {self.group_name}")

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print("[WS] NotificationConsumer disconnected")

    # ----------------------------------------------------------------
    # Event handlers — called by channel_layer.group_send(type=...)
    # ----------------------------------------------------------------

    async def send_notification(self, event):
        """Generic notification handler used for all role types."""
        await self.send(text_data=json.dumps({
            "type": event.get("notification_type", "notification"),
            "title": event.get("title", ""),
            "message": event.get("message", ""),
            "data": event.get("data", {}),
        }))

    async def work_assignment(self, event):
        """New work assignment pushed from backend signals."""
        await self.send(text_data=json.dumps({
            "type": "work_assignment",
            "data": event.get("data", {}),
            "message": event.get("message", "New work assigned"),
        }))

    async def work_status_update(self, event):
        """Work lifecycle status change."""
        await self.send(text_data=json.dumps({
            "type": "work_status_update",
            "data": event.get("data", {}),
        }))


class LiveLocationConsumer(AsyncWebsocketConsumer):
    """
    Live GPS tracking for a specific work request.
    Workers send their lat/lng; customers receive the broadcast.
    URL: ws://host/ws/live-tracking/<request_id>/
    """

    async def connect(self):
        self.request_id = self.scope["url_route"]["kwargs"]["request_id"]
        self.group_name = f"work_tracking_{self.request_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"[WS] Tracking connected: {self.request_id}")

    async def disconnect(self, close_code):
        if hasattr(self, "worker_id"):
            await _set_worker_offline(self.worker_id)

        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print(f"[WS] Tracking disconnected: {self.request_id}")

    async def receive(self, text_data):
        data = json.loads(text_data)

        worker_id = data.get("worker_id")
        latitude = data.get("latitude")
        longitude = data.get("longitude")

        self.worker_id = worker_id

        await _update_worker_location(worker_id, latitude, longitude)

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "location_update",
                "worker_id": worker_id,
                "latitude": latitude,
                "longitude": longitude,
            }
        )

    async def location_update(self, event):
        await self.send(text_data=json.dumps({
            "worker_id": event["worker_id"],
            "latitude": event["latitude"],
            "longitude": event["longitude"],
        }))


class UnionDashboardConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.group_name = "union_dashboard"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print("[WS] Union dashboard connected")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        print("[WS] Union dashboard disconnected")

    async def dashboard_update(self, event):
        await self.send(text_data=json.dumps({
            "type": event["event_type"],
            "message": event["message"],
            "data": event["data"],
        }))