def test_create_user(admin_http_client):
    user_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "cpf": "12345678901",
        "phones": [{"country_code": "+1", "area_code": "202", "number": "5550123"}],
        "address": {"street": "123 Main St", "number": "10", "neighborhood": "Downtown", "city": "Brasília", "state": "DF", "zip_code": "70000000"},
        "role": "GUEST",
        "password": "123",
        "password_confirmation": "123"
    }
    response = admin_http_client.post("/api/users/", json=user_data)
    print(response.json())
    assert response.status_code == 201
    assert response.json()["name"] == "John Doe"
    assert response.json()["email"] == "john.doe@example.com"


def test_get_user(admin_http_client, setup_users):
    test_user = setup_users[0]  # Get the first user from the list
    response = admin_http_client.get(f"/api/users/{test_user.Id}")
    print(response.json())
    assert response.status_code == 200
    assert response.json()["name"] == test_user.name


def test_update_user(admin_http_client, setup_users):
    test_user = setup_users[0]  # Get the first user from the list
    updated_data = {
        "name": "John Updated",
        "email": "john.updated@example.com",
        "cpf": test_user.cpf,
        "phones": [{"country_code": "+1", "area_code": "202", "number": "5550123"}],
        "address": {
            "street": "123 Main St",
            "number": "10",
            "neighborhood": "Downtown",
            "city": "Brasília",
            "state": "DF",
            "zip_code": "70000000"
        },
        "role": test_user.role.value,
        "password": "123",
        "password_confirmation": "123"
    }
    response = admin_http_client.put(f"/api/users/{test_user.Id}", json=updated_data)
    print(response.json())
    assert response.status_code == 200
    assert response.json()["name"] == "John Updated"
    assert response.json()["email"] == "john.updated@example.com"


def test_delete_user(admin_http_client, setup_users):
    test_user = setup_users[0]  # Get the first user from the list
    
    # First verify the user exists
    get_response = admin_http_client.get(f"/api/users/{test_user.Id}")
    assert get_response.status_code == 200
    
    # Delete the user
    delete_response = admin_http_client.delete(f"/api/users/{test_user.Id}")
    assert delete_response.status_code == 204
    
    # Verify the user no longer exists
    get_response = admin_http_client.get(f"/api/users/{test_user.Id}")
    assert get_response.status_code == 404
