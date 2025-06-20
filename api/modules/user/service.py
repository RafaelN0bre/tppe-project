from typing import Optional, List
from ravendb import DocumentSession

from api.core.auth.service import hash_password

from .model import User
from .dto import UserCreate, UserUpdate

class UserService:
    def __init__(self, session: DocumentSession):
        self.session = session

    async def create_user(self, user_data: UserCreate) -> User:
        user_dict = user_data.model_dump(exclude={"password_confirmation"})
        user_dict["password"] = hash_password(user_data.password.get_secret_value())
        user = User(**user_dict)
        self.session.store(user)
        return user

    async def get_user(self, user_id: str) -> Optional[User]:
        return self.session.load(user_id)

    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        user = self.session.load(user_id)
        if not user:
            return None
        
        if user_data.password:
            user_data.password = hash_password(user_data.password.get_secret_value())
        
        updated_user = user_data.apply_to(user)
        self.session.store(updated_user)
        return updated_user

    async def delete_user(self, user_id: str) -> bool:
        user = self.session.load(user_id)
        if not user:
            return False
        
        self.session.delete(user)
        return True

    async def list_users(self) -> List[User]:
        return list(self.session.query(object_type=User)) 