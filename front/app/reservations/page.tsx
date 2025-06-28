"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user?.id) {
      fetchReservations(user.id)
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchReservations = async (userId: string) => {
    try {
      const response = await apiClient.getReservations(undefined, userId)
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading reservations...</p>
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
              <Button variant="outline">Browse Properties</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reservations</h1>
          <p className="text-muted-foreground">Manage your upcoming and past bookings</p>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No reservations yet</h2>
            <p className="text-muted-foreground mb-6">Start exploring amazing properties to book your first stay!</p>
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {reservations.map((reservation: any) => (
              <Card key={reservation.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Reservation #{reservation.id.slice(0, 8)}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        Property ID: {reservation.property_id}
                      </CardDescription>
                    </div>
                    <Badge className={`${getStatusColor(reservation.status)} text-white`}>{reservation.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">CHECK-IN</h4>
                      <p className="font-medium">{new Date(reservation.period.check_in_date).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">CHECK-OUT</h4>
                      <p className="font-medium">{new Date(reservation.period.check_out_date).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">GUESTS</h4>
                      <p className="font-medium flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {reservation.guests_count}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Price</p>
                      <p className="text-xl font-bold">${reservation.total_price}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/properties/${reservation.property_id}`}>
                        <Button variant="outline">View Property</Button>
                      </Link>
                      {reservation.status === "confirmed" && <Button variant="destructive">Cancel</Button>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
