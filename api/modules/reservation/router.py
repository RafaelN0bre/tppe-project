from typing import List, Optional
from fastapi import APIRouter, status, Query

from api.core.exceptions import NotFoundException
from api.modules.reservation.model import Reservation

from .dependency import ReservationServiceDep
from .dto import ReservationCreate, ReservationUpdate, ReservationResponse

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get("/", response_model=List[ReservationResponse])
async def list_reservations(
    reservation_service: ReservationServiceDep,
    property_id: Optional[str] = Query(None, description="Filter reservations by property ID"),
    user_id: Optional[str] = Query(None, description="Filter reservations by user ID")
) -> List[ReservationResponse]:
    reservations = await reservation_service.list_reservations(property_id=property_id, user_id=user_id)
    return [ReservationResponse(**r.model_dump(by_alias=True)) for r in reservations]

@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(reservation_id: str, reservation_service: ReservationServiceDep) -> ReservationResponse:
    reservation = await reservation_service.get_reservation(reservation_id)
    if not reservation:
        raise NotFoundException(entity=Reservation.__class__, detail=f"Reservation with id {reservation_id} not found")
    return ReservationResponse(**reservation.model_dump(by_alias=True))

@router.post("/", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_reservation(reservation_data: ReservationCreate, reservation_service: ReservationServiceDep):
    reservation = await reservation_service.create_reservation(reservation_data)
    return ReservationResponse(**reservation.model_dump(by_alias=True))

@router.put("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(reservation_id: str, reservation_data: ReservationUpdate, reservation_service: ReservationServiceDep):
    reservation = await reservation_service.update_reservation(reservation_id, reservation_data)
    if not reservation:
        raise NotFoundException(entity=Reservation.__class__, detail=f"Reservation with id {reservation_id} not found")
    return ReservationResponse(**reservation.model_dump(by_alias=True))

@router.delete("/{reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reservation(reservation_id: str, reservation_service: ReservationServiceDep):
    deleted = await reservation_service.delete_reservation(reservation_id)
    if not deleted:
        raise NotFoundException(entity=Reservation.__class__, detail=f"Reservation with id {reservation_id} not found") 