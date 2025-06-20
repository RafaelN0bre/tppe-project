import jwt

from fastapi import status

from api.core.settings import settings
from api.test.fixtures.user_fixtures import ADMIN_CREDENTIALS

class TestAuth:
    def test_login_with_valid_credentials_returns_tokens(self, http_client):
        response = http_client.post(
            "/api/auth/token",
            data={
                "username": ADMIN_CREDENTIALS["email"],
                "password": ADMIN_CREDENTIALS["password"]
            }
        )
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_with_invalid_credentials_returns_unauthorized(self, http_client):
        response = http_client.post(
            "/api/auth/token",
            data={
                "username": ADMIN_CREDENTIALS["email"],
                "password": "wrong_password"
            }
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_token_with_valid_token_returns_new_access_token(self, http_client):
        login_response = http_client.post(
            "/api/auth/token",
            data={
                "username": ADMIN_CREDENTIALS["email"],
                "password": ADMIN_CREDENTIALS["password"]
            }
        )
        refresh_token = login_response.json()["refresh_token"]

        refresh_response = http_client.post(
            "/api/auth/refresh",
            params={"refresh_token": refresh_token}
        )
        assert refresh_response.status_code == status.HTTP_200_OK
        refresh_data = refresh_response.json()
        assert "access_token" in refresh_data
        assert refresh_data["token_type"] == "bearer"

    def test_refresh_token_with_invalid_token_returns_unauthorized(self, http_client):
        invalid_response = http_client.post(
            "/api/auth/refresh",
            params={"refresh_token": "invalid_token"}
        )
        assert invalid_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_refresh_token_with_expired_token_returns_unauthorized(self, http_client):
        expired_token = jwt.encode(
            {
                "sub": ADMIN_CREDENTIALS["email"],
                "type": "refresh",
                "exp": 1  # Already expired
            },
            settings.secret_key,
            algorithm=settings.algorithm
        )
        expired_response = http_client.post(
            "/api/auth/refresh",
            params={"refresh_token": expired_token}
        )
        assert expired_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_protected_endpoint_with_invalid_token_returns_unauthorized(self, http_client):
        http_client.headers.update({"Authorization": "Bearer invalid_token"})
        response = http_client.get("/api/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_protected_endpoint_without_token_returns_unauthorized(self, http_client):
        if "Authorization" in http_client.headers:
            del http_client.headers["Authorization"]
        response = http_client.get("/api/auth/me")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED