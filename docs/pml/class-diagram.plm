@startuml
class User {
  + id: uuid.UUID
  + name: str
  + email: str
  + cpf: str
  + phones: list[Phone]
  + address: Address
  + role: UserRole
}

enum UserRole {
  GUEST
  HOST
  ADMIN
}

abstract class Property {
  + id: uuid.UUID
  + title: str
  + description: PropertyDescription
  + address: Address
  + price_per_night: Decimal
  + amenities: list[Amenity]
  + availability_calendar: AvailabilityCalendar
}

class House extends Property {
  + has_pool: bool
  + has_garden: bool
}

class Apartment extends Property {
  + has_elevator: bool
  + has_parking: bool
}

class Reservation {
  + id: uuid.UUID
  + property: Property
  + guest: User
  + period: BookingPeriod
  + status: ReservationStatus
  + total_price: Decimal
  + guests_count: int
}

class PropertyDescription {
  + bedrooms: int
  + bathrooms: int
  + beds: int
  + max_guests: int
}

class Address {
  + street: str
  + number: str
  + neighborhood: str
  + city: str
  + state: str
  + zip_code: str
}

class Phone {
  + country_code: str
  + area_code: str
  + number: str
}

class Amenity {
  + name: str
}

class DateRange {
  + startDate: Date
  + endDate: Date
}

class AvailabilityCalendar {
  + available_dates: list[DateRange]
  + blocked_dates: list[DateRange]
}

class BookingPeriod {
  + check_in_date: date
  + check_out_date: date
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

' Relationships
User "1" --> "0..*" Reservation : guest
User "1" --> "0..*" Property : owns
User "1" --> "0..*" Phone : phones
Property "1" --> "0..*" Reservation : reservations
UserRole <-- "1" User : role
PropertyDescription <-- "1" Property : description
Address <-- "1" User : address
Address <-- "1" Property : address
Amenity "0..*" --> "1" Property : amenities
AvailabilityCalendar <-- "1" Property : availability_calendar
AvailabilityCalendar "1" --> "0..*" DateRange : contains
BookingPeriod <-- "1" Reservation : period
ReservationStatus <-- "1" Reservation : status
@enduml