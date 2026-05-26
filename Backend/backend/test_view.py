import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
settings.ALLOWED_HOSTS.append('testserver')

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from work_requests.models import WorkRequest
from accounts.models import WorkerProfile

User = get_user_model()

# Let's find a worker who is assigned to the request we saw: 8cea124e-e5c1-4ee4-bd7e-23ccd4930d16
wr = WorkRequest.objects.get(request_id="8cea124e-e5c1-4ee4-bd7e-23ccd4930d16")
print(f"Work Request: {wr.title}, Status: {wr.status}")

# Let's print assignments for this work request
print("Assignments:")
for wa in wr.worker_assignments.all():
    print(f"  Assignment: {wa.assignment_id}, Status: {wa.assignment_status}, Worker: {wa.worker.user.email}")
    worker_user = wa.worker.user

    # Let's test the view with this worker
    client = APIClient()
    client.force_authenticate(user=worker_user)
    
    url = f"/api/work-requests/{wr.request_id}/"
    print(f"Testing GET request to {url} as worker {worker_user.email}...")
    response = client.get(url)
    print(f"Response status code: {response.status_code}")
    print(f"Response data: {response.data}")
