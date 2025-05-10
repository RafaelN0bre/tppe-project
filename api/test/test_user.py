import pytest 

@pytest.mark.skip(reason="Applying TDD")
def test_create_user(client):
    user_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "cpf": "12345678901",
        "phones": [{"country_code": "+1", "area_code": "202", "number": "5550123"}],
        "address": {"street": "123 Main St", "number": "10", "neighborhood": "Downtown", "city": "Brasília", "state": "DF", "zip_code": "70000000"},
        "role": "GUEST"
    }
    response = client.post("/users/", json=user_data)
    assert response.status_code == 201
    assert response.json()["name"] == "John Doe"
    assert response.json()["email"] == "john.doe@example.com"


@pytest.mark.skip(reason="Applying TDD")
def test_get_user(client, setup_user):
    response = client.get(f"/users/{setup_user['id']}")
    assert response.status_code == 200
    assert response.json()["name"] == setup_user["name"]


@pytest.mark.skip(reason="Applying TDD")
def test_update_user(client, setup_user):
    updated_data = {
        "name": "John Updated",
        "email": "john.updated@example.com"
    }
    response = client.put(f"/users/{setup_user['id']}", json=updated_data)
    assert response.status_code == 200
    assert response.json()["name"] == "John Updated"
    assert response.json()["email"] == "john.updated@example.com"
