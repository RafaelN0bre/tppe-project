import pytest
from decimal import Decimal

from api.modules.property.models import Property, PropertyDescription, Amenity, AvailabilityCalendar
from api.test.utils import create_properties

# Common data for all properties
DEFAULT_DESCRIPTION = PropertyDescription(
    bedrooms=3,
    bathrooms=2,
    beds=4,
    max_guests=6
)

DEFAULT_AMENITIES = [
    Amenity(name="WiFi"),
    Amenity(name="Kitchen")
]

DEFAULT_CALENDAR = AvailabilityCalendar(
    available_dates=[],
    blocked_dates=[]
)

@pytest.fixture(scope="session")
def setup_properties(test_store, setup_users):
    """Create and return real Property entities."""
    host = setup_users[0]  # Get the first user (Host1)
    
    properties = [
        Property(
            title="Beautiful House",
            description=DEFAULT_DESCRIPTION,
            address=host.address,
            price_per_night=Decimal("150.00"),
            amenities=DEFAULT_AMENITIES,
            availability_calendar=DEFAULT_CALENDAR,
            owner_id=host.Id
        ),
        Property(
            title="Cozy Apartment",
            description=DEFAULT_DESCRIPTION,
            address=host.address,
            price_per_night=Decimal("100.00"),
            amenities=DEFAULT_AMENITIES,
            availability_calendar=DEFAULT_CALENDAR,
            owner_id=host.Id
        )
    ]

    create_properties(properties, test_store)

    yield properties

    with test_store.open_session() as session:
        for property in list(session.query(object_type=Property).wait_for_non_stale_results()):
            session.delete(property)
        session.save_changes() 