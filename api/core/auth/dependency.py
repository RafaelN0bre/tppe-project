from fastapi.security import OAuth2PasswordBearer
import jwt

from typing import Callable, Annotated
from fastapi import Depends

from api.core.settings import settings
from api.modules.user.model import User
from api.modules.user.enum import UserRole
from api.core.database.dependency import SessionDep
from api.core.exceptions import ForbiddenException, UnauthorizedException

from .service import verify_password

OAuth2Dep = Annotated[str, Depends(OAuth2PasswordBearer(tokenUrl="auth/token"))]

def authenticate_user(
    get_user: Callable,
    email: str,
    password: str
) -> User | bool:
    user = get_user(email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def get_current_user(
    token: OAuth2Dep,
    session: SessionDep
) -> User:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_email = payload.get("sub")

        if not user_email:
            raise UnauthorizedException(detail="Payload Inválido.")
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException(detail="Token Expirado.")
    except jwt.PyJWTError:
        raise UnauthorizedException(detail="Token Inválido.")

    users = list(session.query(object_type=User).where_equals("email", user_email).wait_for_non_stale_results())
    user = users[0] if users else None

    if not user:
        raise UnauthorizedException(detail="Credenciais Inválidas.")

    return user

AuthenticatedUser = Annotated[User, Depends(get_current_user)]

def require_roles(allowed_roles: list[UserRole]) -> Callable:
    async def role_dependency(user: AuthenticatedUser):
        if user.role not in allowed_roles:
            raise ForbiddenException()
        return user

    return Depends(role_dependency)

GuestDep = Annotated[User, require_roles(UserRole.GUEST)]
HostDep = Annotated[User, require_roles([UserRole.HOST])]
AdminDep = Annotated[User, require_roles([UserRole.ADMIN])]
