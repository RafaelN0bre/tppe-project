from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Path, Query

from .dependency import PropertyServiceDep
from .dto import PropertyCreate, PropertyUpdate, PropertyResponse
from api.core.database.dependency import SessionDep
from api.core.responses import DefaultResponse

router = APIRouter(prefix="/properties", tags=["Properties"])

# List all properties (House or Apartment)
@router.get("/", response_model=List[PropertyResponse])
async def list_properties(
    property_service: PropertyServiceDep,
    owner_id: Optional[str] = Query(None, description="Filter properties by owner ID")
) -> List[PropertyResponse]:
    properties = await property_service.list_properties(owner_id=owner_id)
    return [property_obj.to_response() for property_obj in properties]

# Get a property by ID (House or Apartment)
@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: str,
    property_service: PropertyServiceDep
) -> PropertyResponse:
    property_obj = await property_service.get_property(property_id)
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with id {property_id} not found"
        )
    return property_obj.to_response()

# Create a property (House or Apartment)
@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    property_service: PropertyServiceDep
) -> PropertyResponse:
    property_obj = await property_service.create_property(property_data)
    return property_obj.to_response()

# Update a property (House or Apartment)
@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    property_data: PropertyUpdate,
    property_service: PropertyServiceDep
) -> PropertyResponse:
    property_obj = await property_service.update_property(property_id, property_data)
    if not property_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with id {property_id} not found"
        )
    return property_obj.to_response()

# Delete a property
@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: str,
    property_service: PropertyServiceDep
):
    deleted = await property_service.delete_property(property_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with id {property_id} not found"
        )