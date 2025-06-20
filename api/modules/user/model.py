from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict, SecretStr

from .enum import UserRole
from ..shared.model import Address, Phone

class User(BaseModel):
    Id: Optional[str] = Field(default=None, alias="id")
    name: str
    email: EmailStr
    cpf: str
    password: str
    phones: List[Phone]
    address: Address
    role: UserRole

    model_config = ConfigDict(extra="ignore")

    def to_response(self):
        from .dto import UserResponse
        user_data = self.model_dump(by_alias=True)
        user_data.pop('password', None)
        return UserResponse(**user_data)
