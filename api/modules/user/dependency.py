from fastapi import Depends
from typing import Annotated

from api.core.database.dependency import SessionDep

from .service import UserService

def get_user_service(session: SessionDep) -> UserService:
    return UserService(session)

UserServiceDep = Annotated[UserService, Depends(get_user_service)] 