from fastapi import Depends
from typing import Annotated

from api.core.database.dependency import SessionDep

from .service import PropertyService

def get_property_service(session: SessionDep) -> PropertyService:
    return PropertyService(session)

PropertyServiceDep = Annotated[PropertyService, Depends(get_property_service)] 