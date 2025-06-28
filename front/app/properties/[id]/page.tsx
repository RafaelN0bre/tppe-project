"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MapPin,
  Users,
  Bed,
  Bath,
  CalendarIcon,
  Wifi,
  Car,
  TreePine,
  Waves,
  Building,
  CableCarIcon as Elevator,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingError, setBookingError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [reservationId, setReservationId] = useState<string | null>(null)
  const [reservations, setReservations] = useState<any[]>([])
  const [reservationsLoading, setReservationsLoading] = useState(false)
  const [updatingReservation, setUpdatingReservation] = useState<string | null>(null)

  // Mock data for fallback
  const mockProperties = [
    {
      id: "1",
      type: "house",
      title: "Beautiful Beach House",
      description: {
        bedrooms: 3,
        bathrooms: 2,
        beds: 4,
        max_guests: 8,
      },
      address: {
        street: "Ocean Drive",
        number: "123",
        neighborhood: "Beachfront",
        city: "Miami",
        state: "FL",
        zip_code: "33139",
      },
      price_per_night: 250,
      amenities: [{ name: "WiFi" }, { name: "Pool" }, { name: "Garden" }],
      has_pool: true,
      has_garden: true,
    },
    {
      id: "2",
      type: "apartment",
      title: "Modern Downtown Apartment",
      description: {
        bedrooms: 2,
        bathrooms: 1,
        beds: 2,
        max_guests: 4,
      },
      address: {
        street: "Main Street",
        number: "456",
        neighborhood: "Downtown",
        city: "New York",
        state: "NY",
        zip_code: "10001",
      },
      price_per_night: 180,
      amenities: [{ name: "WiFi" }, { name: "Elevator" }, { name: "Parking" }],
      has_elevator: true,
      has_parking: true,
    },
    {
      id: "3",
      type: "house",
      title: "Cozy Mountain Cabin",
      description: {
        bedrooms: 2,
        bathrooms: 1,
        beds: 3,
        max_guests: 6,
      },
      address: {
        street: "Pine Ridge Road",
        number: "789",
        neighborhood: "Mountain View",
        city: "Aspen",
        state: "CO",
        zip_code: "81611",
      },
      price_per_night: 320,
      amenities: [{ name: "WiFi" }, { name: "Fireplace" }, { name: "Garden" }],
      has_pool: false,
      has_garden: true,
    },
    {
      id: "4",
      type: "apartment",
      title: "Luxury City Loft",
      description: {
        bedrooms: 1,
        bathrooms: 1,
        beds: 1,
        max_guests: 2,
      },
      address: {
        street: "Broadway",
        number: "1001",
        neighborhood: "SoHo",
        city: "New York",
        state: "NY",
        zip_code: "10012",
      },
      price_per_night: 450,
      amenities: [{ name: "WiFi" }, { name: "Elevator" }, { name: "Gym" }],
      has_elevator: true,
      has_parking: false,
    },
  ]

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string)
      // If user is a HOST, fetch reservations for this property
      if (user?.role === "HOST") {
        fetchReservations(params.id as string)
      }
    }
  }, [params.id, user?.role])

  const fetchProperty = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      if (!apiUrl) {
        console.warn("NEXT_PUBLIC_API_URL not configured, using mock data")
        const mockProperty = mockProperties.find((p) => p.id === id)
        setProperty(mockProperty || null)
        return
      }

      const response = await apiClient.getProperty(id)
      if (response.ok) {
        const data = await response.json()
        setProperty(data)
      } else {
        console.error("Backend returned status:", response.status)
        // Fallback to mock data
        const mockProperty = mockProperties.find((p) => p.id === id)
        setProperty(mockProperty || null)
      }
    } catch (error) {
      console.error("Failed to fetch property:", error)
      // Fallback to mock data
      const mockProperty = mockProperties.find((p) => p.id === id)
      setProperty(mockProperty || null)
    } finally {
      setLoading(false)
    }
  }

  const fetchReservations = async (propertyId: string) => {
    try {
      setReservationsLoading(true)
      const response = await apiClient.getReservations(propertyId)
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      } else {
        console.error("Failed to fetch reservations:", response.status)
      }
    } catch (error) {
      console.error("Error fetching reservations:", error)
    } finally {
      setReservationsLoading(false)
    }
  }

  const updateReservationStatus = async (reservationId: string, status: string) => {
    try {
      setUpdatingReservation(reservationId)
      const response = await apiClient.updateReservation(reservationId, { status })
      
      if (response.ok) {
        // Update the local state to reflect the change
        setReservations(prevReservations => 
          prevReservations.map(reservation => 
            reservation.id === reservationId 
              ? { ...reservation, status } 
              : reservation
          )
        )
      } else {
        const errorData = await response.json()
        console.error("Failed to update reservation:", errorData.detail || "Unknown error")
        // You could add a toast notification here
      }
    } catch (error) {
      console.error("Error updating reservation status:", error)
    } finally {
      setUpdatingReservation(null)
    }
  }

  const handleBooking = async () => {
    if (!isAuthenticated || !user) {
      router.push("/auth/login")
      return
    }

    if (!checkIn || !checkOut) {
      setBookingError("Please select check-in and check-out dates")
      return
    }

    if (guests > property.description.max_guests) {
      setBookingError(`Maximum ${property.description.max_guests} guests allowed`)
      return
    }

    setBookingLoading(true)
    setBookingError("")

    try {
      const response = await apiClient.createReservation({
        property_id: property.id,
        guest_id: user.id, // Now we have the actual user ID
        period: {
          check_in_date: format(checkIn, "yyyy-MM-dd"),
          check_out_date: format(checkOut, "yyyy-MM-dd"),
        },
        guests_count: guests,
      })

      if (response.ok) {
        const reservation = await response.json()
        setReservationId(reservation.id)
        setShowSuccess(true)
      } else {
        const errorData = await response.json()
        setBookingError(errorData.detail || "Booking failed. Please try again.")
      }
    } catch (error) {
      setBookingError("Booking failed. Please check your connection and try again.")
    } finally {
      setBookingLoading(false)
    }
  }

  const getAmenityIcon = (amenityName: string) => {
    switch (amenityName.toLowerCase()) {
      case "wifi":
        return <Wifi className="w-4 h-4" />
      case "parking":
        return <Car className="w-4 h-4" />
      case "pool":
        return <Waves className="w-4 h-4" />
      case "garden":
        return <TreePine className="w-4 h-4" />
      case "elevator":
        return <Elevator className="w-4 h-4" />
      default:
        return <Building className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Link href="/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalNights =
    checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const totalPrice = totalNights * property.price_per_night

  if (showSuccess && reservationId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-green-600">Reservation Confirmed!</h1>
          <p className="mb-2">Your booking was successful.</p>
          <p className="mb-4">Reservation ID: <span className="font-mono text-primary">{reservationId}</span></p>
          <Button className="w-full mb-2" onClick={() => router.push("/reservations")}>View My Reservations</Button>
          <Button variant="outline" className="w-full" onClick={() => setShowSuccess(false)}>Back to Property</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            TPPE
          </Link>
          <div className="flex items-center space-x-4">
            {user?.role === "HOST" && property?.owner_id === user.id && (
              <Link href={`/properties/${property.id}/edit`}>
                <Button variant="outline">Edit Property</Button>
              </Link>
            )}
            <Link href="/properties">
              <Button variant="outline">Back to Properties</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg"></div>

            {/* Property Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="capitalize text-sm">
                  {property.type}
                </Badge>
                <span className="text-2xl font-bold">${property.price_per_night}/night</span>
              </div>

              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>

              <div className="flex items-center text-muted-foreground mb-6">
                <MapPin className="w-5 h-5 mr-2" />
                <span>
                  {property.address.street} {property.address.number}, {property.address.neighborhood},{" "}
                  {property.address.city}, {property.address.state} {property.address.zip_code}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-lg mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {property.description.max_guests} guests
                </div>
                <div className="flex items-center">
                  <Bed className="w-5 h-5 mr-2" />
                  {property.description.bedrooms} bedrooms
                </div>
                <div className="flex items-center">
                  <Bath className="w-5 h-5 mr-2" />
                  {property.description.bathrooms} bathrooms
                </div>
                <div className="flex items-center">
                  <Bed className="w-5 h-5 mr-2" />
                  {property.description.beds} beds
                </div>
              </div>
            </div>

            {/* Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity: any, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      {getAmenityIcon(amenity.name)}
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                  {property.type === "house" && property.has_pool && (
                    <div className="flex items-center space-x-2">
                      <Waves className="w-4 h-4" />
                      <span>Pool</span>
                    </div>
                  )}
                  {property.type === "house" && property.has_garden && (
                    <div className="flex items-center space-x-2">
                      <TreePine className="w-4 h-4" />
                      <span>Garden</span>
                    </div>
                  )}
                  {property.type === "apartment" && property.has_elevator && (
                    <div className="flex items-center space-x-2">
                      <Elevator className="w-4 h-4" />
                      <span>Elevator</span>
                    </div>
                  )}
                  {property.type === "apartment" && property.has_parking && (
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4" />
                      <span>Parking</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              {user?.role === "HOST" ? (
                <>
                  <CardHeader>
                    <CardTitle>Property Reservations</CardTitle>
                    <CardDescription>All bookings for this property</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reservationsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading reservations...</p>
                      </div>
                    ) : reservations.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {reservations.map((reservation: any) => (
                          <div key={reservation.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm">
                                {reservation.guest?.name || `Guest ${reservation.guest_id}`}
                              </span>
                              <Badge 
                                variant={
                                  reservation.status === "confirmed" ? "default" :
                                  reservation.status === "cancelled" ? "destructive" :
                                  reservation.status === "pending" ? "secondary" : "outline"
                                } 
                                className="text-xs"
                              >
                                {reservation.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div>Check-in: {format(new Date(reservation.period.check_in_date), "MMM dd, yyyy")}</div>
                              <div>Check-out: {format(new Date(reservation.period.check_out_date), "MMM dd, yyyy")}</div>
                              <div>{reservation.guests_count} guests</div>
                              <div className="font-medium text-primary">
                                ${reservation.total_price || "N/A"}
                              </div>
                            </div>
                            
                            {/* Action buttons for pending reservations */}
                            {reservation.status === "pending" && (
                              <div className="flex gap-2 mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  onClick={() => updateReservationStatus(reservation.id, "confirmed")}
                                  disabled={updatingReservation === reservation.id}
                                  className="flex-1"
                                >
                                  {updatingReservation === reservation.id ? "Updating..." : "Accept"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateReservationStatus(reservation.id, "cancelled")}
                                  disabled={updatingReservation === reservation.id}
                                  className="flex-1"
                                >
                                  {updatingReservation === reservation.id ? "Updating..." : "Cancel"}
                                </Button>
                              </div>
                            )}
                            
                            {/* Action button for confirmed reservations */}
                            {reservation.status === "confirmed" && (
                              <div className="mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateReservationStatus(reservation.id, "cancelled")}
                                  disabled={updatingReservation === reservation.id}
                                  className="w-full"
                                >
                                  {updatingReservation === reservation.id ? "Updating..." : "Cancel Reservation"}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>No reservations yet</p>
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader>
                    <CardTitle>Book this property</CardTitle>
                    <CardDescription>${property.price_per_night} per night</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookingError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{bookingError}</AlertDescription>
                      </Alert>
                    )}

                    {!isAuthenticated && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You need to{" "}
                          <Link href="/auth/login" className="underline">
                            sign in
                          </Link>{" "}
                          to make a reservation.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Check-in</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkIn ? format(checkIn, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={checkIn}
                              onSelect={setCheckIn}
                              disabled={(date) => Boolean(date < new Date())}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Check-out</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOut ? format(checkOut, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={checkOut}
                              onSelect={setCheckOut}
                              disabled={(date) => Boolean(date < new Date() || (checkIn && date <= checkIn))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="guests">Guests</Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max={property.description.max_guests}
                        value={guests}
                        onChange={(e) => setGuests(Number.parseInt(e.target.value))}
                      />
                    </div>

                    {totalNights > 0 && (
                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between">
                          <span>
                            ${property.price_per_night} × {totalNights} nights
                          </span>
                          <span>${totalPrice}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>${totalPrice}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleBooking}
                      disabled={!checkIn || !checkOut || bookingLoading || !isAuthenticated}
                    >
                      {bookingLoading ? "Booking..." : isAuthenticated ? "Reserve" : "Sign in to Reserve"}
                    </Button>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
