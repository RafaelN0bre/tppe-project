from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver

class PropertyPage:
    def __init__(self, driver: WebDriver):
        self.driver = driver

    # Locators for property creation
    PROPERTY_TYPE_SELECT = (By.CSS_SELECTOR, "button[data-slot='select-trigger']")  # Button to open property type dropdown
    PROPERTY_TYPE_OPTION = (By.CSS_SELECTOR, "option[value='house']")  # Adjust value as needed
    TITLE_INPUT = (By.ID, "title")
    PRICE_INPUT = (By.ID, "price")
    BEDROOMS_INPUT = (By.ID, "bedrooms")
    BATHROOMS_INPUT = (By.ID, "bathrooms")
    BEDS_INPUT = (By.ID, "beds")
    MAX_GUESTS_INPUT = (By.ID, "max_guests")
    STREET_INPUT = (By.ID, "street")
    NUMBER_INPUT = (By.ID, "number")
    NEIGHBORHOOD_INPUT = (By.ID, "neighborhood")
    CITY_INPUT = (By.ID, "city")
    STATE_INPUT = (By.ID, "state")
    ZIP_CODE_INPUT = (By.ID, "zip_code")
    AMENITIES_INPUT = (By.CSS_SELECTOR, "input[placeholder='e.g., WiFi, Pool, Parking']")  # Adjust selector as needed
    HAS_POOL_CHECKBOX = (By.ID, "has_pool")
    HAS_GARDEN_CHECKBOX = (By.ID, "has_garden")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")

    def fill_property_details(self, title: str, price: float, bedrooms: int, bathrooms: int, beds: int, max_guests: int,
                              street: str, number: str, neighborhood: str, city: str, state: str, zip_code: str,
                              amenities: str, has_pool: bool = False, has_garden: bool = False):

        # Fill in the property details
        self.driver.find_element(*self.TITLE_INPUT).send_keys(title)
        self.driver.find_element(*self.PRICE_INPUT).send_keys(str(price))
        self.driver.find_element(*self.BEDROOMS_INPUT).send_keys(str(bedrooms))
        self.driver.find_element(*self.BATHROOMS_INPUT).send_keys(str(bathrooms))
        self.driver.find_element(*self.BEDS_INPUT).send_keys(str(beds))
        self.driver.find_element(*self.MAX_GUESTS_INPUT).send_keys(str(max_guests))
        self.driver.find_element(*self.STREET_INPUT).send_keys(street)
        self.driver.find_element(*self.NUMBER_INPUT).send_keys(number)
        self.driver.find_element(*self.NEIGHBORHOOD_INPUT).send_keys(neighborhood)
        self.driver.find_element(*self.CITY_INPUT).send_keys(city)
        self.driver.find_element(*self.STATE_INPUT).send_keys(state)
        self.driver.find_element(*self.ZIP_CODE_INPUT).send_keys(zip_code)
        self.driver.find_element(*self.AMENITIES_INPUT).send_keys(amenities)

        # Check amenities
        if has_pool:
            self.driver.find_element(*self.HAS_POOL_CHECKBOX).click()
        if has_garden:
            self.driver.find_element(*self.HAS_GARDEN_CHECKBOX).click()

    def submit_property(self):
        self.driver.find_element(*self.SUBMIT_BUTTON).click()
