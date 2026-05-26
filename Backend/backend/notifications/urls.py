from django.urls import path

from .views import (

    MyNotificationsView,

    MarkNotificationReadView
)

urlpatterns = [

    path(

        "my-notifications/",

        MyNotificationsView.as_view(),

        name="my-notifications"
    ),

    path(

        "<uuid:notification_id>/mark-read/",

        MarkNotificationReadView.as_view(),

        name="mark-read"
    ),
]