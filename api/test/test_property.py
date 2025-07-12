def test_create_property(host_http_client, setup_users):
    property_data = {
        "type": "house",
        "title": "New Property",
        "description": {
            "bedrooms": 3,
            "bathrooms": 2,
            "beds": 4,
            "max_guests": 6
        },
        "address": {
            "street": "123 Main St",
            "number": "10",
            "neighborhood": "Downtown",
            "city": "Brasília",
            "state": "DF",
            "zip_code": "70000000"
        },
        "price_per_night": 200.0,
        "amenities": [{"name": "WiFi"}, {"name": "Kitchen"}],
        "availability_calendar": {
            "available_dates": [],
            "blocked_dates": []
        },
        "owner_id": setup_users[0].Id,
        "has_pool": False,
        "has_garden": False
    }
    response = host_http_client.post("/api/properties/", json=property_data)
    assert response.status_code == 201
    assert response.json()["title"] == "New Property"
    assert response.json()["price_per_night"] == 200
    assert response.json()["type"] == "house"


def test_get_property(host_http_client, setup_properties):
    test_property = setup_properties[0]
    response = host_http_client.get(f"/api/properties/{test_property.Id}")
    assert response.status_code == 200
    assert response.json()["title"] == test_property.title


def test_update_property(host_http_client, setup_properties):
    test_property = setup_properties[0]
    updated_data = {
        "type": "house",
        "title": "Updated Property",
        "description": {
            "bedrooms": 4,
            "bathrooms": 3,
            "beds": 5,
            "max_guests": 8
        },
        "address": {
            "street": "456 New St",
            "number": "20",
            "neighborhood": "Uptown",
            "city": "Brasília",
            "state": "DF",
            "zip_code": "70000000"
        },
        "price_per_night": 250.0,
        "amenities": [{"name": "WiFi"}, {"name": "Kitchen"}, {"name": "Pool"}],
        "availability_calendar": {
            "available_dates": [],
            "blocked_dates": []
        },
        "owner_id": test_property.owner_id,
        "has_pool": True,
        "has_garden": True
    }
    response = host_http_client.put(f"/api/properties/{test_property.Id}", json=updated_data)
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Property"
    assert response.json()["price_per_night"] == 250
    assert response.json()["type"] == "house"
    assert response.json()["has_pool"] is True
    assert response.json()["has_garden"] is True


def test_delete_property(host_http_client, setup_properties):
    test_property = setup_properties[0]
    
    # First verify the property exists
    get_response = host_http_client.get(f"/api/properties/{test_property.Id}")
    assert get_response.status_code == 200
    
    # Delete the property
    delete_response = host_http_client.delete(f"/api/properties/{test_property.Id}")
    assert delete_response.status_code == 204
    
    # Verify the property no longer exists
    get_response = host_http_client.get(f"/api/properties/{test_property.Id}")
    assert get_response.status_code == 404 


def test_create_property_with_nonexistent_owner(host_http_client):
    property_data = {
        "type": "house",
        "title": "Orphan Property",
        "description": {
            "bedrooms": 2,
            "bathrooms": 1,
            "beds": 2,
            "max_guests": 3
        },
        "address": {
            "street": "404 Not Found St",
            "number": "0",
            "neighborhood": "Nowhere",
            "city": "Ghost City",
            "state": "ZZ",
            "zip_code": "00000000"
        },
        "price_per_night": 100.0,
        "amenities": [{"name": "WiFi"}],
        "availability_calendar": {
            "available_dates": [],
            "blocked_dates": []
        },
        "owner_id": "users/does-not-exist",
        "has_pool": False,
        "has_garden": False
    }
    response = host_http_client.post("/api/properties/", json=property_data)
    assert response.status_code == 404
    assert response.json()["code"] == "NotFound"
    assert "usuário" in response.json()["message"].lower() or "user" in response.json()["message"].lower()


def test_create_house_property(host_http_client, setup_users):
    property_data = {
        "type": "house",
        "title": "House with Pool",
        "description": {
            "bedrooms": 4,
            "bathrooms": 3,
            "beds": 5,
            "max_guests": 8
        },
        "address": {
            "street": "123 Pool St",
            "number": "1",
            "neighborhood": "Luxury",
            "city": "Brasília",
            "state": "DF",
            "zip_code": "70000000"
        },
        "price_per_night": 500.0,
        "amenities": [{"name": "WiFi"}, {"name": "Pool"}],
        "availability_calendar": {
            "available_dates": [],
            "blocked_dates": []
        },
        "owner_id": setup_users[0].Id,
        "has_pool": True,
        "has_garden": True
    }
    response = host_http_client.post("/api/properties/", json=property_data)
    print(response.json())
    assert response.status_code == 201
    assert response.json()["type"] == "house"
    assert response.json()["has_pool"] is True
    assert response.json()["has_garden"] is True


def test_create_apartment_property(host_http_client, setup_users):
    property_data = {
        "type": "apartment",
        "title": "Apartment with Parking",
        "description": {
            "bedrooms": 2,
            "bathrooms": 1,
            "beds": 2,
            "max_guests": 4
        },
        "address": {
            "street": "456 Tower Ave",
            "number": "10",
            "neighborhood": "Downtown",
            "city": "Brasília",
            "state": "DF",
            "zip_code": "70000000"
        },
        "price_per_night": 300.0,
        "amenities": [{"name": "WiFi"}, {"name": "Parking"}],
        "availability_calendar": {
            "available_dates": [],
            "blocked_dates": []
        },
        "owner_id": setup_users[0].Id,
        "has_elevator": True,
        "has_parking": True
    }
    response = host_http_client.post("/api/properties/", json=property_data)
    assert response.status_code == 201
    assert response.json()["type"] == "apartment"
    assert response.json()["has_elevator"] is True
    assert response.json()["has_parking"] is True