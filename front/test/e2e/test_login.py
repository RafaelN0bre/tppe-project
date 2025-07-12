import time
import pytest

from selenium.webdriver.common.by import By

from pages.login_page import LoginPage

VALID_USER = {
    "email": "host@host.com",
    "password": "123"
}

INVALID_USER = {
    "email": "wrong@example.com",
    "password": "wrongpass"
}

class TestLogin:
    @pytest.mark.parametrize("user,expected_result", [
        (VALID_USER, True),     # Valid credentials should succeed
        (INVALID_USER, False)   # Invalid credentials should fail
    ])
    def test_login(self, browser, user, expected_result):
        """Test successful and failed logins"""
        # Navigate to login page
        browser.get("http://localhost:3000/auth/login")  
        
        login_page = LoginPage(browser)
        login_page.login(user["email"], user["password"])
        time.sleep(2)
        if expected_result:
            # Check if redirected to home page
            assert browser.current_url == "http://localhost:3000/"  # Adjust if needed
        else:
            # Check for the error message
            error_message = browser.find_element(By.CSS_SELECTOR, "div[data-slot='alert-description']").text
            assert "Invalid credentials" in error_message  # Error shown
