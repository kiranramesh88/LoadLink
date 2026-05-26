from django.urls import path

from .consumers import *

websocket_urlpatterns = [

    path(

        "ws/notifications/",

        NotificationConsumer.as_asgi()
    ),
    path(

    "ws/live-tracking/<uuid:request_id>/",

    LiveLocationConsumer.as_asgi()
    ),
    path(

    "ws/union-dashboard/",

    UnionDashboardConsumer.as_asgi()
),
]