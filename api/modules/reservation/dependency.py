from typing import Annotated
from fastapi import Depends

from api.core.database.dependency import SessionDep

from .service import ReservationService

def get_reservation_service(session: SessionDep):
    return ReservationService(session) 


ReservationServiceDep = Annotated[ReservationService, Depends(get_reservation_service)] 