from django.apps import AppConfig


class WorkRequestsConfig(AppConfig):

    default_auto_field = "django.db.models.BigAutoField"

    name = "work_requests"

    def ready(self):

        import work_requests.signals