import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "backend.settings"
)

# =========================================
# DJANGO SETUP MUST HAPPEN FIRST
# =========================================

from django.core.asgi import (
    get_asgi_application
)

django_asgi_app = (
    get_asgi_application()
)

# =========================================
# IMPORT CHANNELS AFTER DJANGO READY
# =========================================

from channels.routing import (

    ProtocolTypeRouter,

    URLRouter
)

from channels.auth import (
    AuthMiddlewareStack
)

import notifications.routing


application = ProtocolTypeRouter({

    "http": django_asgi_app,

    "websocket": AuthMiddlewareStack(

        URLRouter(

            notifications.routing.websocket_urlpatterns
        )
    ),
})