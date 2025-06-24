from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class BookingPeriod(BaseModel):
    check_in_date: str 
    check_out_date: str

class ReservationStatus:
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"

class Reservation(BaseModel):
    Id: Optional[str] = Field(default=None, alias="id")
    property_id: str
    guest_id: str
    period: BookingPeriod
    status: str = ReservationStatus.PENDING
    total_price: float
    guests_count: int

    model_config = ConfigDict(extra="ignore") 