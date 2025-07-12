from pydantic import BaseModel
from typing import Optional, List, Union, Literal

from ..shared.model import Address

class PropertyDescriptionMixin(BaseModel):
    bedrooms: int
    bathrooms: int
    beds: int
    max_guests: int

class AmenityMixin(BaseModel):
    name: str

class AvailabilityCalendarMixin(BaseModel):
    available_dates: List[str] = []
    blocked_dates: List[str] = []

# Base DTO
class PropertyBase(BaseModel):
    type: str
    title: str
    description: PropertyDescriptionMixin
    address: Address
    price_per_night: float
    amenities: List[AmenityMixin]
    availability_calendar: AvailabilityCalendarMixin
    owner_id: str

    def apply_to(self, property_obj):
        data = self.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(property_obj, key, value)
        return property_obj

# CREATE DTOs
class HouseCreate(PropertyBase):
    type: Literal["house"]
    has_pool: bool = False
    has_garden: bool = False

class ApartmentCreate(PropertyBase):
    type: Literal["apartment"]
    has_elevator: bool = False
    has_parking: bool = False

PropertyCreate = Union[HouseCreate, ApartmentCreate]

# UPDATE DTOs
class HouseUpdate(PropertyBase):
    type: Literal["house"]
    has_pool: Optional[bool] = None
    has_garden: Optional[bool] = None

class ApartmentUpdate(PropertyBase):
    type: Literal["apartment"]
    has_elevator: Optional[bool] = None
    has_parking: Optional[bool] = None

PropertyUpdate = Union[HouseUpdate, ApartmentUpdate]

# RESPONSE DTOs
class HouseResponse(PropertyBase):
    id: str
    type: Literal["house"]
    has_pool: bool = False
    has_garden: bool = False

class ApartmentResponse(PropertyBase):
    id: str
    type: Literal["apartment"]
    has_elevator: bool = False
    has_parking: bool = False

PropertyResponse = Union[HouseResponse, ApartmentResponse] 