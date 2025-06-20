import jwt

from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request

from api.core.settings import settings
from api.modules.user.model import User
from api.core.responses import DefaultResponse
from api.core.database.dependency import SessionDep

from .dependency import AuthenticatedUser
from .service import create_access_token, create_refresh_token, verify_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/token")
async def login_for_access_token(request: Request, session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    users = list(session.query(object_type=User).where_equals("email", form_data.username).wait_for_non_stale_results())
    user = users[0] if users else None
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token
    }


@router.get("/me")
async def get_current_user(
    user: AuthenticatedUser,
    session: SessionDep
) -> DefaultResponse:

    return DefaultResponse(
        message="Dados de usuário com cliente retornados com sucesso",
        data=user.to_response(),
    )

@router.post("/refresh")
async def refresh_access_token(
    request: Request,
    session: SessionDep,
    refresh_token: str = Query(..., description="Refresh token to get new access token")
):
    try:
        payload = jwt.decode(refresh_token, settings.secret_key, algorithms=[settings.algorithm])
        user_email = payload.get("sub")
        token_type = payload.get("type")

        if not user_email or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        users = list(session.query(object_type=User).where_equals("email", user_email).wait_for_non_stale_results())
        user = users[0] if users else None
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists",
            )

        new_access_token = create_access_token(data={"sub": user.email})

        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )