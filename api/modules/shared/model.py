from pydantic import BaseModel

class Phone(BaseModel):
    country_code: str
    area_code: str
    number: str


class Address(BaseModel):
    street: str
    number: str
    neighborhood: str
    city: str
    state: str
    zip_code: str