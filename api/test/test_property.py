import pytest
from decimal import Decimal

def test_create_property(host_http_client):
    property_data = {
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
        "price_per_night": "200.00",
        "amenities": [{"name": "WiFi"}, {"name": "Kitchen"}],
        "availability_calendar": {
            "available_dates": [],
            "blocked_dates": []
        }
    }
    response = host_http_client.post("/api/properties/", json=property_data)
    print(response.json())
    assert response.status_code == 201
    assert response.json()["title"] == "New Property"
    assert response.json()["price_per_night"] == "200.00"


def test_get_property(host_http_client, setup_properties):
    test_property = setup_properties[0]
    response = host_http_client.get(f"/api/properties/{test_property.Id}")
    assert response.status_code == 200
    assert response.json()["title"] == test_property.title


def test_update_property(host_http_client, setup_properties):
    test_property = setup_properties[0]
    updated_data = {
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
        "price_per_night": "250.00",
        "amenities": [{"name": "WiFi"}, {"name": "Kitchen"}, {"name": "Pool"}],
        "availability_calendar": {
            "available_dates": [],
            "blocked_dates": []
        }
    }
    response = host_http_client.put(f"/api/properties/{test_property.Id}", json=updated_data)
    print(response.json())
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Property"
    assert response.json()["price_per_night"] == "250.00"


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