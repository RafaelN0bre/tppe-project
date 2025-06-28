"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, X, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { format } from "date-fns"

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [property, setProperty] = useState<any>(null)

  const [formData, setFormData] = useState({
    type: "house",
    title: "",
    description: {
      bedrooms: 1,
      bathrooms: 1,
      beds: 1,
      max_guests: 2,
    },
    address: {
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
    },
    price_per_night: 0,
    amenities: [{ name: "" }],
    availability_calendar: {
      available_dates: [] as string[],
      blocked_dates: [] as string[],
    },
    // House specific fields
    has_pool: false,
    has_garden: false,
    // Apartment specific fields
    has_elevator: false,
    has_parking: false,
  })

  useEffect(() => {
    if (params.id) {
      fetchProperty(params.id as string)
    }
  }, [params.id])

  const fetchProperty = async (id: string) => {
    try {
      setFetching(true)
      const response = await apiClient.getProperty(id)
      if (response.ok) {
        const propertyData = await response.json()
        setProperty(propertyData)
        
        // Check if user is the owner
        if (propertyData.owner_id !== user?.id) {
          setError("You can only edit your own properties")
          return
        }

        // Populate form with existing data
        setFormData({
          type: propertyData.type,
          title: propertyData.title,
          description: propertyData.description,
          address: propertyData.address,
          price_per_night: propertyData.price_per_night,
          amenities: propertyData.amenities.length > 0 ? propertyData.amenities : [{ name: "" }],
          availability_calendar: propertyData.availability_calendar || {
            available_dates: [],
            blocked_dates: [],
          },
          has_pool: propertyData.has_pool || false,
          has_garden: propertyData.has_garden || false,
          has_elevator: propertyData.has_elevator || false,
          has_parking: propertyData.has_parking || false,
        })
      } else {
        setError("Property not found")
      }
    } catch (error) {
      setError("Failed to load property")
    } finally {
      setFetching(false)
    }
  }

  // Redirect if not a host
  if (!authLoading && user?.role !== "HOST") {
    router.push("/")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!user) {
      setError("You must be logged in to edit a property")
      setLoading(false)
      return
    }

    try {
      const propertyData = {
        ...formData,
        owner_id: user.id,
      }

      const response = await apiClient.updateProperty(params.id as string, propertyData)

      if (response.ok) {
        router.push(`/properties/${params.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to update property")
      }
    } catch (err) {
      setError("Failed to update property. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const addAmenity = () => {
    setFormData({
      ...formData,
      amenities: [...formData.amenities, { name: "" }],
    })
  }

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    })
  }

  const updateAmenity = (index: number, value: string) => {
    const newAmenities = [...formData.amenities]
    newAmenities[index].name = value
    setFormData({
      ...formData,
      amenities: newAmenities,
    })
  }

  const removeAvailableDate = (dateString: string) => {
    setFormData({
      ...formData,
      availability_calendar: {
        ...formData.availability_calendar,
        available_dates: formData.availability_calendar.available_dates.filter(d => d !== dateString),
      },
    })
  }

  const removeBlockedDate = (dateString: string) => {
    setFormData({
      ...formData,
      availability_calendar: {
        ...formData.availability_calendar,
        blocked_dates: formData.availability_calendar.blocked_dates.filter(d => d !== dateString),
      },
    })
  }

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/properties">
            <Button>Back to Properties</Button>
          </Link>
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
            <Link href={`/properties/${params.id}`}>
              <Button variant="outline">Back to Property</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Property</CardTitle>
            <CardDescription>Update your property information and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Property Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Property Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter property title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per Night ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price_per_night}
                      onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Details</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min="1"
                      value={formData.description.bedrooms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: { ...formData.description, bedrooms: parseInt(e.target.value) || 1 },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min="1"
                      value={formData.description.bathrooms}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: { ...formData.description, bathrooms: parseInt(e.target.value) || 1 },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beds">Beds</Label>
                    <Input
                      id="beds"
                      type="number"
                      min="1"
                      value={formData.description.beds}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: { ...formData.description, beds: parseInt(e.target.value) || 1 },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_guests">Max Guests</Label>
                    <Input
                      id="max_guests"
                      type="number"
                      min="1"
                      value={formData.description.max_guests}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: { ...formData.description, max_guests: parseInt(e.target.value) || 1 },
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      placeholder="Enter street name"
                      value={formData.address.street}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Number</Label>
                    <Input
                      id="number"
                      placeholder="Enter street number"
                      value={formData.address.number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, number: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Neighborhood</Label>
                    <Input
                      id="neighborhood"
                      placeholder="Enter neighborhood"
                      value={formData.address.neighborhood}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, neighborhood: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city"
                      value={formData.address.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="Enter state"
                      value={formData.address.state}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, state: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip_code">ZIP Code</Label>
                    <Input
                      id="zip_code"
                      placeholder="Enter ZIP code"
                      value={formData.address.zip_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          address: { ...formData.address, zip_code: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="space-y-3">
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Enter amenity name"
                        value={amenity.name}
                        onChange={(e) => updateAmenity(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeAmenity(index)}
                        disabled={formData.amenities.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addAmenity}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Amenity
                  </Button>
                </div>
              </div>

              {/* Property Type Specific Features */}
              {formData.type === "house" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">House Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_pool"
                        checked={formData.has_pool}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, has_pool: checked as boolean })
                        }
                      />
                      <Label htmlFor="has_pool">Has Pool</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_garden"
                        checked={formData.has_garden}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, has_garden: checked as boolean })
                        }
                      />
                      <Label htmlFor="has_garden">Has Garden</Label>
                    </div>
                  </div>
                </div>
              )}

              {formData.type === "apartment" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Apartment Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_elevator"
                        checked={formData.has_elevator}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, has_elevator: checked as boolean })
                        }
                      />
                      <Label htmlFor="has_elevator">Has Elevator</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_parking"
                        checked={formData.has_parking}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, has_parking: checked as boolean })
                        }
                      />
                      <Label htmlFor="has_parking">Has Parking</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Availability Calendar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Availability Calendar</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Available Dates */}
                  <div className="space-y-3">
                    <Label>Available Dates</Label>
                    <div className="border rounded-md p-4">
                      <Calendar
                        mode="multiple"
                        selected={formData.availability_calendar.available_dates.map(dateStr => {
                          const [year, month, day] = dateStr.split('-').map(Number)
                          return new Date(year, month - 1, day)
                        })}
                        onSelect={(dates) => {
                          if (dates) {
                            const dateStrings = dates.map(date => format(date, "yyyy-MM-dd"))
                            setFormData({
                              ...formData,
                              availability_calendar: {
                                ...formData.availability_calendar,
                                available_dates: dateStrings,
                              },
                            })
                          }
                        }}
                        className="rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Selected Available Dates ({formData.availability_calendar.available_dates.length}):</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.availability_calendar.available_dates.map((date, index) => {
                          const [year, month, day] = date.split('-').map(Number)
                          const displayDate = new Date(year, month - 1, day)
                          return (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {format(displayDate, "MMM dd, yyyy")}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAvailableDate(date)}
                                className="h-4 w-4 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )
                        })}
                        {formData.availability_calendar.available_dates.length === 0 && (
                          <p className="text-sm text-muted-foreground">No available dates selected</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Blocked Dates */}
                  <div className="space-y-3">
                    <Label>Blocked Dates</Label>
                    <div className="border rounded-md p-4">
                      <Calendar
                        mode="multiple"
                        selected={formData.availability_calendar.blocked_dates.map(dateStr => {
                          const [year, month, day] = dateStr.split('-').map(Number)
                          return new Date(year, month - 1, day)
                        })}
                        onSelect={(dates) => {
                          if (dates) {
                            const dateStrings = dates.map(date => format(date, "yyyy-MM-dd"))
                            setFormData({
                              ...formData,
                              availability_calendar: {
                                ...formData.availability_calendar,
                                blocked_dates: dateStrings,
                              },
                            })
                          }
                        }}
                        className="rounded-md"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Selected Blocked Dates ({formData.availability_calendar.blocked_dates.length}):</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.availability_calendar.blocked_dates.map((date, index) => {
                          const [year, month, day] = date.split('-').map(Number)
                          const displayDate = new Date(year, month - 1, day)
                          return (
                            <Badge key={index} variant="destructive" className="flex items-center gap-1">
                              {format(displayDate, "MMM dd, yyyy")}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBlockedDate(date)}
                                className="h-4 w-4 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          )
                        })}
                        {formData.availability_calendar.blocked_dates.length === 0 && (
                          <p className="text-sm text-muted-foreground">No blocked dates selected</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href={`/properties/${params.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Property"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 