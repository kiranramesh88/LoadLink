import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from work_requests.models import WorkRequest
from work_requests.serializers import WorkRequestDetailSerializer
import json

# Let's list a few request_ids
for wr in WorkRequest.objects.all():
    print(f"Request ID: {wr.request_id}, Status: {wr.status}")
    try:
        s = WorkRequestDetailSerializer(wr)
        # Access .data to trigger serialization
        data = s.data
        print(f"Successfully serialized. Title: {data.get('title')}")
    except Exception as e:
        print(f"Serialization failed for request {wr.request_id}: {str(e)}")
        import traceback
        traceback.print_exc()
