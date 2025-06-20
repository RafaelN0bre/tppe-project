import traceback

from fastapi import Request
from fastapi.responses import JSONResponse

from api.core.responses import ErrorResponse
from api.core.exceptions import BaseAppException

async def app_exception_handler(request: Request, exc: BaseAppException):
    err_response = ErrorResponse(
        code=exc.code,
        message=exc.message,
        detail=exc.detail
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=err_response.model_dump()
    )

async def internal_server_error_handler(request: Request, exc: Exception):
    tb_str = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error": str(exc),
            "traceback": tb_str
        },
    )
