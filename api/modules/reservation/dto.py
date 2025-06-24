from typing import Optional
from pydantic import BaseModel
from decimal import Decimal

class BookingPeriodDTO(BaseModel):
    check_in_date: str
    check_out_date: str

class ReservationBase(BaseModel):
    property_id: str
    guest_id: str
    period: BookingPeriodDTO
    guests_count: int

class ReservationCreate(ReservationBase):
    pass

class ReservationUpdate(BaseModel):
    period: Optional[BookingPeriodDTO] = None
    guests_count: Optional[int] = None
    status: Optional[str] = None

class ReservationResponse(ReservationBase):
    id: str
    guest_id: str
    status: str
    total_price: Decimal 