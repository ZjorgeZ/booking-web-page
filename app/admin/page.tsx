"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Booking, Service, Staff, Customer } from "@/lib/types"

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/staff").then((r) => r.json()),
      fetch("/api/customers").then((r) => r.json()),
    ])
      .then(([bookingsData, servicesData, staffData, customersData]) => {
        setBookings(Array.isArray(bookingsData) ? bookingsData : [])
        setServices(Array.isArray(servicesData) ? servicesData : [])
        setStaff(Array.isArray(staffData) ? staffData : [])
        setCustomers(Array.isArray(customersData) ? customersData : [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const todayBookings = bookings.filter(
    (b) => format(new Date(b.booking_date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  )

  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed")

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .reduce((sum, b) => sum + Number(b.total_price || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reservas hoy</CardDescription>
            <CardTitle className="text-4xl">{todayBookings.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {confirmedBookings.length} confirmadas, {pendingBookings.length} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total reservas</CardDescription>
            <CardTitle className="text-4xl">{bookings.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">En el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Clientes</CardDescription>
            <CardTitle className="text-4xl">{customers.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos</CardDescription>
            <CardTitle className="text-4xl">${totalRevenue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Reservas confirmadas/completadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximas reservas</CardTitle>
            <CardDescription>Reservas pendientes y confirmadas</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.filter(b => b.status !== "cancelled" && b.status !== "completed").length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay reservas próximas</p>
            ) : (
              <div className="space-y-4">
                {bookings
                  .filter((b) => b.status !== "cancelled" && b.status !== "completed")
                  .slice(0, 5)
                  .map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{booking.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.booking_date), "d MMM", { locale: es })} - {booking.start_time?.slice(0, 5)}
                        </p>
                      </div>
                      <Badge
                        variant={booking.status === "confirmed" ? "default" : "secondary"}
                      >
                        {booking.status === "pending" && "Pendiente"}
                        {booking.status === "confirmed" && "Confirmada"}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicios populares</CardTitle>
            <CardDescription>Servicios más reservados</CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay servicios configurados</p>
            ) : (
              <div className="space-y-4">
                {services.slice(0, 5).map((service) => {
                  const serviceBookings = bookings.filter((b) => b.service_id === service.id).length
                  return (
                    <div key={service.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">${service.price}</p>
                      </div>
                      <Badge variant="outline">{serviceBookings} reservas</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
