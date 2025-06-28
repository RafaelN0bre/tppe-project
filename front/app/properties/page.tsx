"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Users, Bed, Bath, Search, Filter, AlertCircle, Wifi } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api"
import { UserMenu } from "@/components/user-menu"

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyType, setPropertyType] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [apiError, setApiError] = useState("")
  const [usingMockData, setUsingMockData] = useState(false)
  const searchParams = useSearchParams()
  const ownerId = searchParams.get("owner_id")

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
    fetchProperties()
  }, [])

  const testApiConnection = async () => {
    console.log("Testing API connection...")
    const health = await apiClient.healthCheck()
    console.log("Health check result:", health)
    return health
  }

  const fetchProperties = async () => {
    try {
      setApiError("")

      // First test the API connection
      const healthCheck = await testApiConnection()
      if (!healthCheck.ok) {
        throw new Error(`API server not accessible: ${healthCheck.error || "Unknown error"}`)
      }

      const response = await apiClient.getProperties(ownerId || undefined)
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
        setUsingMockData(false)
      } else {
        throw new Error(`API returned status ${response.status}`)
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error)
      setApiError(error instanceof Error ? error.message : "Unknown error")
      // Fallback to mock data
      setProperties(mockProperties)
      setUsingMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const retryConnection = () => {
    setLoading(true)
    fetchProperties()
  }

  const filteredProperties = properties.filter((property: any) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = propertyType === "all" || property.type === propertyType
    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "low" && property.price_per_night < 100) ||
      (priceRange === "medium" && property.price_per_night >= 100 && property.price_per_night < 200) ||
      (priceRange === "high" && property.price_per_night >= 200)

    return matchesSearch && matchesType && matchesPrice
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading properties...</p>
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
        <UserMenu />
      </div>
    </header>

      <div className="container mx-auto px-4 py-8">
        {/* API Status Alert */}
        {(apiError || usingMockData) && (
          <Alert className="mb-6" variant={apiError ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {apiError
                  ? `API Connection Failed: ${apiError}. Showing demo data.`
                  : "Using demo data. Configure NEXT_PUBLIC_API_URL to connect to your API."}
              </span>
              {apiError && (
                <Button variant="outline" size="sm" onClick={retryConnection}>
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">
            {ownerId ? "My Properties" : "Find Properties"}
          </h1>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">Houses</SelectItem>
                <SelectItem value="apartment">Apartments</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="low">Under $100</SelectItem>
                <SelectItem value="medium">$100 - $200</SelectItem>
                <SelectItem value="high">$200+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property: any) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500"></div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="capitalize">
                    {property.type}
                  </Badge>
                  <span className="text-lg font-bold">${property.price_per_night}/night</span>
                </div>
                <CardTitle className="text-xl">{property.title}</CardTitle>
                <CardDescription className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {property.address.city}, {property.address.state}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {property.description.max_guests} guests
                  </div>
                  <div className="flex items-center">
                    <Bed className="w-4 h-4 mr-1" />
                    {property.description.bedrooms} bed
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-4 h-4 mr-1" />
                    {property.description.bathrooms} bath
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {property.amenities.slice(0, 3).map((amenity: any, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <Wifi className="w-3 h-3 mr-1" />
                      {amenity.name}
                    </Badge>
                  ))}
                </div>
                <Link href={`/properties/${property.id}`}>
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No properties found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
