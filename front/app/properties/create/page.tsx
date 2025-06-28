"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"

export default function CreatePropertyPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
      available_dates: [],
      blocked_dates: [],
    },
    // House specific fields
    has_pool: false,
    has_garden: false,
    // Apartment specific fields
    has_elevator: false,
    has_parking: false,
  })

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
      setError("You must be logged in to create a property")
      setLoading(false)
      return
    }

    try {
      const propertyData = {
        ...formData,
        owner_id: user.id,
      }

      const response = await apiClient.createProperty(propertyData)

      if (response.ok) {
        const property = await response.json()
        router.push(`/properties/${property.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Failed to create property")
      }
    } catch (err) {
      setError("Failed to create property. Please try again.")
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
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
            <Link href="/properties">
              <Button variant="outline">Back to Properties</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Property</CardTitle>
            <CardDescription>Add your property to start hosting guests</CardDescription>
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

              {/* Property Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="max_guests">Maximum Guests</Label>
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
                      placeholder="Street name"
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
                      placeholder="123"
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
                      placeholder="Neighborhood"
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
                      placeholder="City"
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
                      placeholder="State"
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
                      placeholder="12345"
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
                <div className="space-y-2">
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="e.g., WiFi, Pool, Parking"
                        value={amenity.name}
                        onChange={(e) => updateAmenity(index, e.target.value)}
                        required
                      />
                      {formData.amenities.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAmenity(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addAmenity} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Amenity
                  </Button>
                </div>
              </div>

              {/* Property Type Specific Features */}
              {formData.type === "house" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">House Features</h3>
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Property..." : "Create Property"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 