import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'

import django
django.setup()

from work_requests.models import WorkAssignment
from work_requests.serializers import WorkerAssignmentListSerializer
import json

qs = WorkAssignment.objects.select_related(
    'work_request',
    'work_request__customer',
    'work_request__customer__user',
).all()[:3]

print(f"Total assignments in DB: {WorkAssignment.objects.count()}")
print(f"Queried: {qs.count()}")

s = WorkerAssignmentListSerializer(qs, many=True)
print(json.dumps(list(s.data), indent=2, default=str))
