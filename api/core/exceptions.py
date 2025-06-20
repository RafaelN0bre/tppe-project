from typing import Any
from fastapi import status

class BaseAppException(Exception):
    def __init__(self,
                 status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
                 code: str = "InternalServerError",
                 message: str = "Um erro inesperado ocorreu.",
                 detail: Any = None):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.detail = detail

class NotFoundException(BaseAppException):
    def __init__(self, entity: str = "Recurso", detail: Any = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NotFound",
            message=f"{entity} não encontrado(a).",
            detail=detail
        )

class AssetNotFoundException(BaseAppException):
    def __init__(self, entityType: str = "Logo", detail: Any = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="AssetNotFound",
            message=f"{entityType} não encontrado(a).",
            detail=detail
        )

class UnauthorizedException(BaseAppException):
    def __init__(self, detail: Any = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="Unauthorized",
            message="Autenticação Necessária.",
            detail=detail
        )

class ForbiddenException(BaseAppException):
    def __init__(self, detail: Any = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="Forbidden",
            message="Permissões Insuficientes.",
            detail=detail
        )

class ValidationErrorException(BaseAppException):
    def __init__(self, detail: Any = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code="ValidationError",
            message="Erro de Validação dos dados enviados.",
            detail=detail
        )

class EntityAlreadyExistsException(BaseAppException):
    def __init__(self, entity: str = "Recurso", detail: Any = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="EntityAlreadyExists",
            message=f"Entidade {entity} já existe.",
            detail=detail
        )

class ApplicationEntityCannotBeDeletedException(BaseAppException):
    def __init__(self, detail: Any = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="ApplicationEntityCannotBeDeleted",
            message="A entidade não pode ser deletada por ser um objeto da aplicação.",
            detail=detail
        )

class ApplicationEntityCannotBeCreatedException(BaseAppException):
    def __init__(self, detail: Any = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            code="ApplicationEntityCannotBeCreated",
            message="A entidade não pode ser criada por ser um objeto da aplicação.",
            detail=detail
        )
