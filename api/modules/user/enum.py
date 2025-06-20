from enum import Enum

class UserRole(str, Enum):
    GUEST = "GUEST"
    HOST = "HOST"
    ADMIN = "ADMIN" 