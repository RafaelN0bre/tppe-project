from typing import Any, Optional
from pydantic import BaseModel, Field

class DefaultResponse(BaseModel):
    data: Any | None = None
    message: str
    metadata: Any | None = None

class PaginationMetadata(BaseModel):
    page: int
    per_page: int
    total_pages: int
    total_records: int

class PaginatedResponse(DefaultResponse):
    metadata: PaginationMetadata

class ErrorResponse(BaseModel):
    code: str = Field(..., json_schema_extra={"example": "ValidationError"})
    message: str = Field(..., json_schema_extra={"example": "Erro de Validação dos dados enviados."})
    detail: Optional[Any] = Field(None, json_schema_extra={"example": {"field": "email", "error": "Invalid email format"}})
