import time
import pytest

from pages.login_page import LoginPage
from pages.property_page import PropertyPage  # Ensure you have this import

VALID_HOST_USER = {
    "email": "host@host.com",
    "password": "123"
}

class TestCreateProperty:
    @pytest.mark.parametrize("property_data,expected_result", [
        (
            {
                "title": "Beautiful Beach House",
                "price": 150.00,
                "bedrooms": 3,
                "bathrooms": 2,
                "beds": 3,
                "max_guests": 6,
                "street": "Ocean Drive",
                "number": "123",
                "neighborhood": "Sunny Beach",
                "city": "Miami",
                "state": "FL",
                "zip_code": "33139",
                "amenities": "WiFi, Pool, Parking",
                "has_pool": True,
                "has_garden": False
            },
            True  # Expecting success
        ),
        # You can add more test cases here for failure scenarios if needed
    ])
    def test_create_property(self, browser, property_data, expected_result):
        """Test creating a property as a host"""
        # Navigate to login page
        browser.get("http://localhost:3000/auth/login")  
        
        login_page = LoginPage(browser)
        login_page.login(VALID_HOST_USER["email"], VALID_HOST_USER["password"])
        time.sleep(2)  # Wait for login to complete

        browser.get("http://localhost:3000/properties/create")  # Adjust URL as needed

        property_page = PropertyPage(browser)

        # Fill in the property details
        property_page.fill_property_details(
            title=property_data["title"],
            price=property_data["price"],
            bedrooms=property_data["bedrooms"],
            bathrooms=property_data["bathrooms"],
            beds=property_data["beds"],
            max_guests=property_data["max_guests"],
            street=property_data["street"],
            number=property_data["number"],
            neighborhood=property_data["neighborhood"],
            city=property_data["city"],
            state=property_data["state"],
            zip_code=property_data["zip_code"],
            amenities=property_data["amenities"],
            has_pool=property_data["has_pool"],
            has_garden=property_data["has_garden"]
        )

        # Submit the property creation form
        property_page.submit_property()

        time.sleep(2)  # Wait for the property to be created

        # Verify that the property was created successfully
        if expected_result:
            current_url = browser.current_url
            assert "/properties/properties-" in current_url
        else:
            assert "Error creating property" in browser.page_source  # Adjust for failure case
