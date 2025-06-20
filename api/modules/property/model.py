from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

from ..shared.model import Address

class PropertyDescription(BaseModel):
    bedrooms: int
    bathrooms: int
    beds: int
    max_guests: int

class Amenity(BaseModel):
    name: str

class AvailabilityCalendar(BaseModel):
    available_dates: List[str] = []
    blocked_dates: List[str] = []

class Property(BaseModel):
    Id: Optional[str] = Field(default=None, alias="id")  # RavenDB string id
    type: str = Field(..., description="Type of property (house or apartment)")
    title: str
    description: PropertyDescription
    address: Address
    price_per_night: float
    amenities: List[Amenity]
    availability_calendar: AvailabilityCalendar
    owner_id: str

    model_config = ConfigDict(extra="ignore")

    def to_response(self):
        from .dto import HouseResponse, ApartmentResponse
        data = self.model_dump(by_alias=True)
        if self.type == "house":
            return HouseResponse(**data)
        elif self.type == "apartment":
            return ApartmentResponse(**data)
        else:
            raise ValueError("Unknown property type")

class House(Property):
    type: Literal["house"] = "house"
    has_pool: bool = False
    has_garden: bool = False

class Apartment(Property):
    type: Literal["apartment"] = "apartment"
    has_elevator: bool = False
    has_parking: bool = False 