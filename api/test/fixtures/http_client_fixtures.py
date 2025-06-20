import pytest

from datetime import timedelta
from fastapi.testclient import TestClient

from api.__main__ import app
from api.core.auth.service import create_access_token
from .user_fixtures import HOST_CREDENTIALS, GUEST_CREDENTIALS, ADMIN_CREDENTIALS

@pytest.fixture
def http_client(setup_users):
    yield TestClient(app)

@pytest.fixture
def guest_http_client(http_client):
    access_token = create_access_token(
        data={"sub": GUEST_CREDENTIALS['email']},
        expires_delta=timedelta(minutes=15)
    )
    http_client.headers.update({"Authorization": f"Bearer {access_token}"})
    return http_client

@pytest.fixture
def host_http_client(http_client):
    access_token = create_access_token(
        data={"sub": HOST_CREDENTIALS['email']},
        expires_delta=timedelta(minutes=15)
    )
    http_client.headers.update({"Authorization": f"Bearer {access_token}"})
    return http_client

@pytest.fixture
def admin_http_client(http_client):
    access_token = create_access_token(
        data={"sub": ADMIN_CREDENTIALS['email']},
        expires_delta=timedelta(minutes=15)
    )
    http_client.headers.update({"Authorization": f"Bearer {access_token}"})
    return http_client