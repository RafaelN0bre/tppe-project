from typing import Optional, List
from ravendb import DocumentSession

from api.core.exceptions import NotFoundException

from .model import Apartment, House, Property
from .dto import PropertyCreate, PropertyUpdate

class PropertyService:
    def __init__(self, session: DocumentSession):
        self.session = session

    async def create_property(self, property_data: PropertyCreate) -> Property:
        # Ensure owner exists
        owner = self.session.load(property_data.owner_id)
        if not owner:
            raise NotFoundException(entity="Usuário")
        property_dict = property_data.model_dump()
        if property_dict.get("type") == "house":
            property_obj = House(**property_dict)
        elif property_dict.get("type") == "apartment":
            property_obj = Apartment(**property_dict)
        else:
            raise ValueError("Invalid property type")
        self.session.store(property_obj)
        return property_obj

    async def get_property(self, property_id: str) -> Optional[Property]:
        return self.session.load(property_id)

    async def update_property(self, property_id: str, property_data: PropertyUpdate) -> Optional[Property]:
        property_obj = self.session.load(property_id)
        if not property_obj:
            return None
        updated_property = property_data.apply_to(property_obj)
        self.session.store(updated_property)
        return updated_property

    async def delete_property(self, property_id: str) -> bool:
        property_obj = self.session.load(property_id)
        if not property_obj:
            return False
        self.session.delete(property_obj)
        return True

    async def list_properties(self) -> List[Property]:
        return list(self.session.query(object_type=Property)) 