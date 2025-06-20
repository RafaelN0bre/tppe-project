# dto.py

from typing import Optional, List
from typing_extensions import Self
from pydantic import BaseModel, EmailStr, Field, SecretStr, model_validator, ConfigDict

from .model import User
from .enum import UserRole
from ..shared.model import Address, Phone

class PasswordMixin(BaseModel):
    password: SecretStr
    password_confirmation: SecretStr

    @model_validator(mode='after')
    def check_passwords_match(self) -> Self:
        if self.password != self.password_confirmation:
            raise ValueError('Passwords do not match')
        return self

# ----------------------
# 🔹 CREATE DTO
# ----------------------
class UserCreate(PasswordMixin, BaseModel):
    name: str
    email: EmailStr
    cpf: str
    phones: List[Phone]
    address: Address
    role: UserRole

    model_config = ConfigDict(extra="ignore")

    def to_entity(self) -> User:
        return User(**self.model_dump())


# ----------------------
# 🔹 PATCH DTO
# ----------------------
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    cpf: Optional[str] = None
    phones: Optional[List[Phone]] = None
    address: Optional[Address] = None
    role: Optional[UserRole] = None
    password: Optional[SecretStr] = None
    password_confirmation: Optional[SecretStr] = None

    @model_validator(mode='after')
    def check_passwords_match(self) -> Self:
        if self.password is not None and self.password_confirmation is not None:
            if self.password != self.password_confirmation:
                raise ValueError('Passwords do not match')
        return self

    def apply_to(self, user: User) -> User:
        data = self.model_dump(exclude_unset=True, exclude={"password_confirmation"})
        for key, value in data.items():
            setattr(user, key, value)
        return user


# ----------------------
# 🔹 RESPONSE DTO
# ----------------------
class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    cpf: str
    phones: List[Phone]
    address: Address
    role: UserRole

    def to_entity(self) -> User:
        return User(**self.model_dump(by_alias=True))
