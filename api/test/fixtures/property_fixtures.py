import pytest

from api.test.utils import create_properties

from api.modules.property.model import House, Apartment, Property, PropertyDescription, Amenity, AvailabilityCalendar

# Common data for all properties
default_description = PropertyDescription(
    bedrooms=3,
    bathrooms=2,
    beds=4,
    max_guests=6
)

default_amenities = [
    Amenity(name="WiFi"),
    Amenity(name="Kitchen")
]

default_calendar = AvailabilityCalendar(
    available_dates=[],
    blocked_dates=[]
)

@pytest.fixture(scope="session")
def setup_properties(test_store, setup_users):
    """
    Create and return real Property entities (House and Apartment).
    Uses setup_users to set the owner_id for each property.
    """
    assert setup_users, "setup_users must provide at least one user."
    host = setup_users[0]  # Use the first user as the property owner

    properties = [
        House(
            title="Beautiful House",
            description=default_description,
            address=host.address,
            price_per_night=150,
            amenities=default_amenities,
            availability_calendar=default_calendar,
            owner_id=host.Id,
            has_pool=True,
            has_garden=True
        ),
        Apartment(
            title="Cozy Apartment",
            description=default_description,
            address=host.address,
            price_per_night=100,
            amenities=default_amenities,
            availability_calendar=default_calendar,
            owner_id=host.Id,
            has_elevator=True,
            has_parking=True
        )
    ]

    create_properties(properties, test_store)

    yield properties

    with test_store.open_session() as session:
        for property in list(session.query(object_type=Property).wait_for_non_stale_results()):
            session.delete(property)
        session.save_changes() 