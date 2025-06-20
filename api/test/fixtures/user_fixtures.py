import pytest

from api.test.utils import create_users
from api.core.auth.service import hash_password
from api.modules.user.enum import UserRole
from api.modules.user.model import User, Phone, Address


HOST_CREDENTIALS = {
    'email': "host@host.com",
    'password': '123'
}

GUEST_CREDENTIALS = {
    "email": "guest1@guest.com",
    "password": "123"
}

ADMIN_CREDENTIALS = {
    "email": "admin@admin.com",
    "password": "123"
}   

# Common data for all users
DEFAULT_PHONE = Phone(
    country_code="+55",
    area_code="61",
    number="999999999"
)

DEFAULT_ADDRESS = Address(
    street="Quadra 1",
    number="1",
    neighborhood="Asa Norte",
    city="Brasília",
    state="DF",
    zip_code="70000000"
)

@pytest.fixture(scope="session")
def setup_users(test_store):
    """Create and return real User entities."""
    users = [
        User(
            name="Host1",
            email=HOST_CREDENTIALS['email'],
            cpf="12345678901",
            phones=[DEFAULT_PHONE],
            address=DEFAULT_ADDRESS,
            role=UserRole.HOST,
            password=hash_password(HOST_CREDENTIALS['password']),
        ),
        User(
            name="Guest1",
            email=GUEST_CREDENTIALS['email'],
            cpf="23456789012",
            phones=[DEFAULT_PHONE],
            address=DEFAULT_ADDRESS,
            role=UserRole.GUEST,
            password=hash_password(GUEST_CREDENTIALS['password']),
        ),
        User(
            name="Guest2",
            email="guest2@guest.com",
            cpf="34567890123",
            phones=[DEFAULT_PHONE],
            address=DEFAULT_ADDRESS,
            role=UserRole.GUEST,
            password=hash_password("123"),
        ),
        User(
            name="Host2",
            email="host2@host.com",
            cpf="45678901234",
            phones=[DEFAULT_PHONE],
            address=DEFAULT_ADDRESS,
            role=UserRole.HOST,
            password=hash_password("123"),
        ),
        User(
            name="Admin",
            email=ADMIN_CREDENTIALS['email'],
            cpf="56789012345",
            phones=[DEFAULT_PHONE],
            address=DEFAULT_ADDRESS,
            role=UserRole.ADMIN,
            password=hash_password(ADMIN_CREDENTIALS['password']),
        )
    ]

    create_users(users, test_store)

    yield users

    with test_store.open_session() as session:
        for user in list(session.query(object_type=User).wait_for_non_stale_results()):
            session.delete(user)
        session.save_changes()
