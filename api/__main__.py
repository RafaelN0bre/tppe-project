from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.core.exceptions import BaseAppException
from api.core.auth.router import router as auth_router
from api.core.exception_handlers import app_exception_handler, internal_server_error_handler

from api.modules.user.router import router as user_router
from api.modules.property.router import router as property_router
from api.modules.reservation.router import router as reservation_router

app = FastAPI(
    title="TPPE API",
    description="API for the TPPE project",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(500, internal_server_error_handler)
app.add_exception_handler(BaseAppException, app_exception_handler)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(property_router, prefix="/api")
app.include_router(reservation_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to TPPE API"}