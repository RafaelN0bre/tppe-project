import datetime
from typing import Optional, List
from ravendb import DocumentSession

from api.modules.user.model import User
from api.modules.property.model import Property
from api.core.exceptions import NotFoundException, ValidationErrorException

from .dto import ReservationCreate, ReservationUpdate
from .model import Reservation, BookingPeriod, ReservationStatus


class ReservationService:
    def __init__(self, session: DocumentSession):
        self.session = session

    def _date_range_overlap(self, start1, end1, start2, end2):
        return not (end1 < start2 or end2 < start1)

    def _is_period_available(self, property_obj: Property, check_in: str, check_out: str) -> bool:
        check_in_date = datetime.date.fromisoformat(check_in)
        check_out_date = datetime.date.fromisoformat(check_out)

        if check_in_date >= check_out_date:
            raise ValidationErrorException(detail="Check-in date must be before check-out date.")

        # Generate all days in the requested period (check-in inclusive, check-out exclusive)
        requested_days = [
            (check_in_date + datetime.timedelta(days=i)).isoformat()
            for i in range((check_out_date - check_in_date).days)
        ]

        available_set = set(property_obj.availability_calendar.available_dates)
        blocked_set = set(property_obj.availability_calendar.blocked_dates)

        # All requested days must be available and not blocked
        for day in requested_days:
            if day not in available_set or day in blocked_set:
                return False
        return True

    async def create_reservation(self, reservation_data: ReservationCreate) -> Reservation:
        reservation_dict = reservation_data.model_dump()
        property_obj: Property = self.session.load(reservation_dict["property_id"])
        if not property_obj:
            raise NotFoundException(entity=Property.__name__)
        guest = self.session.load(reservation_dict["guest_id"])
        if not guest:
            raise NotFoundException(entity=User.__name__)
        check_in = reservation_dict["period"]["check_in_date"]
        check_out = reservation_dict["period"]["check_out_date"]

        if not self._is_period_available(property_obj, check_in, check_out):
            raise ValidationErrorException(detail="Imóvel não disponível para o período solicitado.")

        check_in_date = datetime.date.fromisoformat(check_in)
        check_out_date = datetime.date.fromisoformat(check_out)

        num_nights = (check_out_date - check_in_date).days
        total_price = num_nights * property_obj.price_per_night

        # Block each reserved day
        reserved_days = [
            (check_in_date + datetime.timedelta(days=i)).isoformat()
            for i in range(num_nights)
        ]
        property_obj.availability_calendar.blocked_dates.extend(reserved_days)

        reservation = Reservation(
            property_id=reservation_dict["property_id"],
            guest_id=reservation_dict["guest_id"],
            period=BookingPeriod(**reservation_dict["period"]),
            guests_count=reservation_dict["guests_count"],
            status=ReservationStatus.PENDING,
            total_price=total_price,
        )
        self.session.store(reservation)
        return reservation

    async def get_reservation(self, reservation_id: str) -> Optional[Reservation]:
        return self.session.load(reservation_id)

    async def update_reservation(self, reservation_id: str, reservation_data: ReservationUpdate) -> Optional[Reservation]:
        reservation = self.session.load(reservation_id)
        if not reservation:
            return None
        data = reservation_data.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(reservation, key, value)
        self.session.store(reservation)
        return reservation

    async def delete_reservation(self, reservation_id: str) -> bool:
        reservation = self.session.load(reservation_id)
        if not reservation:
            return False
        self.session.delete(reservation)
        return True

    async def list_reservations(self, property_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Reservation]:
        query = self.session.query(object_type=Reservation)
        if property_id:
            query = query.where_equals("property_id", property_id)
        if user_id:
            query = query.where_equals("guest_id", user_id)
        return list(query) 