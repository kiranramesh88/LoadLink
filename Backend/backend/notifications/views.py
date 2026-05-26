from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.permissions import (
    IsAuthenticated
)

from .models import Notification

from .serializers import (
    NotificationSerializer
)
# Create your views here.

class MyNotificationsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        notifications = (
            Notification.objects.filter(

                recipient=request.user

            ).order_by(
                "-created_at"
            )
        )

        serializer = (
            NotificationSerializer(

                notifications,

                many=True
            )
        )

        return Response(
            serializer.data
        )
    
class MarkNotificationReadView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(

        self,

        request,

        notification_id
    ):

        notification = (
            Notification.objects.filter(

                notification_id=
                notification_id,

                recipient=request.user
            ).first()
        )

        if not notification:

            return Response(
                {
                    "success": False,

                    "message":
                    "Notification not found"
                },
                status=404
            )

        notification.is_read = True

        notification.save()

        return Response(
            {
                "success": True
            }
        )