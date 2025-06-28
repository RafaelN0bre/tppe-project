"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Bed, Bath, Wifi, Car, TreePine, Waves } from "lucide-react"
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

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
  ]

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const response = await apiClient.getProperties()
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
      } else {
        setProperties(mockProperties)
      }
    } catch (error) {
      setProperties(mockProperties)
    } finally {
      setLoading(false)
    }
  }

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
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">TPPE</h1>
            <nav className="hidden md:flex space-x-6">
              {!authLoading && user?.role === "HOST" ? (
                <>
                  <Link href={`/properties?owner_id=${user.id}`} className="text-muted-foreground hover:text-foreground">
                    My Properties
                  </Link>
                  <Link href="/properties/create" className="text-muted-foreground hover:text-foreground">
                    Create Property
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/properties" className="text-muted-foreground hover:text-foreground">
                    Properties
                  </Link>
                  {!authLoading && user && (
                    <Link href="/reservations" className="text-muted-foreground hover:text-foreground">
                      My Reservations
                    </Link>
                  )}
                </>
              )}
            </nav>
          </div>
          <UserMenu />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Find your perfect stay</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover unique properties and book your next vacation rental with ease
          </p>
          <Link href="/properties">
            <Button size="lg" className="text-lg px-8 py-6">
              Explore Properties
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center">Featured Properties</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
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
                        {amenity.name === "WiFi" && <Wifi className="w-3 h-3 mr-1" />}
                        {amenity.name === "Parking" && <Car className="w-3 h-3 mr-1" />}
                        {amenity.name === "Pool" && <Waves className="w-3 h-3 mr-1" />}
                        {amenity.name === "Garden" && <TreePine className="w-3 h-3 mr-1" />}
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
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 TPPE. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
