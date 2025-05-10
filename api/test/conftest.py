import pytest
from fastapi.testclient import TestClient
from api.__main__ import app 

@pytest.fixture
def client():
    client = TestClient(app)
    return client