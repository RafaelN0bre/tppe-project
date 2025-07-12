from selenium.webdriver.common.by import By
from .base_page import BasePage

class LandingPage(BasePage):
    # Locators for elements on the landing page
    MY_PROPERTIES_BUTTON = (By.CSS_SELECTOR, "a[href*='properties?owner_id=']")  # Adjust selector as needed
    CREATE_PROPERTY_BUTTON = (By.CSS_SELECTOR, "a[href='/properties/create']")  # Adjust selector as needed
    EXPLORE_PROPERTIES_BUTTON = (By.CSS_SELECTOR, "a[href='/properties']")  # Adjust selector as needed

    def navigate_to_my_properties(self):
        """Click on the 'My Properties' button"""
        self.click(self.MY_PROPERTIES_BUTTON)

    def navigate_to_create_property(self):
        """Click on the 'Create Property' button"""
        self.click(self.CREATE_PROPERTY_BUTTON)

    def navigate_to_explore_properties(self):
        """Click on the 'Explore Properties' button"""
        self.click(self.EXPLORE_PROPERTIES_BUTTON)
