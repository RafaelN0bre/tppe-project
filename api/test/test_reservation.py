import pytest
from datetime import date, timedelta

def make_period(start, end):
    return {"check_in_date": start.isoformat(), "check_out_date": end.isoformat()}

def set_property_availability(property_obj, start=None, end=None):
    """
    Helper to set the available_dates for a property. If start and end are None, clears availability.
    """
    if start and end:
        property_obj.availability_calendar.available_dates = [
            f"{start.isoformat()},{end.isoformat()}"
        ]
    else:
        property_obj.availability_calendar.available_dates = []

def test_create_reservation_success(guest_http_client, setup_users, setup_properties, test_store):
    property_obj = setup_properties[0]
    guest_obj = setup_users[1]

    # Set available_dates as a list of individual dates for the next 10 days
    today = date.today()
    available_days = [(today + timedelta(days=i)).isoformat() for i in range(10)]
    property_obj.availability_calendar.available_dates = available_days

    from api.test.utils import create_properties
    create_properties([property_obj], test_store)

    # Reserve a period that is fully available
    period = make_period(today, today + timedelta(days=2))
    reservation_data = {
        "property_id": property_obj.Id,
        "period": period,
        "guests_count": 2,
        "guest_id": guest_obj.Id
    }
    response = guest_http_client.post("/api/reservations/", json=reservation_data)
    assert response.status_code == 201, response.json()
    data = response.json()
    assert data["property_id"] == property_obj.Id
    assert data["guests_count"] == 2
    assert data["status"] == "pending"

def test_create_reservation_property_not_found(guest_http_client, setup_users):
    guest_obj = setup_users[1]

    period = make_period(date.today(), date.today() + timedelta(days=2))
    reservation_data = {
        "property_id": "properties/does-not-exist",
        "period": period,
        "guests_count": 2,
        "guest_id": guest_obj.Id
    }
    response = guest_http_client.post("/api/reservations/", json=reservation_data)
    assert response.status_code == 404
    assert response.json()["code"] == "NotFound"

def test_create_reservation_unavailable_period(test_store, guest_http_client, setup_users, setup_properties):
    property_obj = setup_properties[0]
    guest_obj = setup_users[1]

    set_property_availability(property_obj)
    from api.test.utils import create_properties
    create_properties([property_obj], test_store)
    period = make_period(date.today(), date.today() + timedelta(days=2))
    reservation_data = {
        "property_id": property_obj.Id,
        "period": period,
        "guests_count": 2,
        "guest_id": guest_obj.Id
    }
    response = guest_http_client.post("/api/reservations/", json=reservation_data)
    assert response.status_code == 422
    assert "não disponível" in response.json()["detail"].lower()

def test_list_reservations(guest_http_client):
    response = guest_http_client.get("/api/reservations/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_reservation_not_found(guest_http_client):
    response = guest_http_client.get("/api/reservations/does-not-exist")
    assert response.status_code == 404
    assert response.json()["code"] == "NotFound"

@pytest.mark.parametrize(
    "available_days, period_start, period_end, expected_status",
    [
        # Caso 1: período totalmente disponível
        (
            [(date.today() + timedelta(days=i)).isoformat() for i in range(10)],
            date.today(),
            date.today() + timedelta(days=2),
            201
        ),
        # Caso 2: período parcialmente disponível (um dia faltando)
        (
            [(date.today() + timedelta(days=i)).isoformat() for i in range(1, 10)],
            date.today(),
            date.today() + timedelta(days=2),
            422
        ),
        # Caso 3: período totalmente indisponível
        (
            [],
            date.today(),
            date.today() + timedelta(days=2),
            422
        ),
    ]
)
def test_create_reservation_parametrized(
    guest_http_client, setup_users, setup_properties, test_store,
    available_days, period_start, period_end, expected_status
):
    property_obj = setup_properties[0]
    guest_obj = setup_users[1]

    property_obj.availability_calendar.available_dates = available_days

    from api.test.utils import create_properties
    create_properties([property_obj], test_store)

    period = {
        "check_in_date": period_start.isoformat(),
        "check_out_date": period_end.isoformat()
    }
    reservation_data = {
        "property_id": property_obj.Id,
        "period": period,
        "guests_count": 2,
        "guest_id": guest_obj.Id
    }
    response = guest_http_client.post("/api/reservations/", json=reservation_data)
    assert response.status_code == expected_status 