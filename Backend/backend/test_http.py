import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import requests

User = get_user_model()
user = User.objects.get(email="worker12@test.com")
access_token = str(RefreshToken.for_user(user).access_token)

# The request_id we want to test
request_id = "8cea124e-e5c1-4ee4-bd7e-23ccd4930d16"
url = f"http://127.0.0.1:8000/api/work-requests/{request_id}/"

headers = {
    "Authorization": f"Bearer {access_token}"
}

print(f"Sending GET to {url} with auth token...")
try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text[:1000]}")
except Exception as e:
    print(f"HTTP request failed: {e}")
