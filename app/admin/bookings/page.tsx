"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Booking } from "@/lib/types"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings")
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error("Error updating booking:", error)
    }
  }

  const filteredBookings = bookings
    .filter((b) => filter === "all" || b.status === filter)
    .filter((b) =>
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.customer_email?.toLowerCase().includes(search.toLowerCase())
    )

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    confirmed: "default",
    completed: "outline",
    cancelled: "destructive"
  }

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmada",
    completed: "Completada",
    cancelled: "Cancelada"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando reservas...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reservas</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xs"
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="confirmed">Confirmadas</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de reservas</CardTitle>
          <CardDescription>{filteredBookings.length} reservas encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay reservas</p>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{booking.customer_name}</p>
                      <Badge variant={statusColors[booking.status]}>
                        {statusLabels[booking.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.service_name} - {format(new Date(booking.booking_date), "EEEE d 'de' MMMM", { locale: es })} a las {booking.start_time?.slice(0, 5)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.customer_email} {booking.customer_phone && `| ${booking.customer_phone}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg mr-4">${booking.total_price}</p>
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(booking.id, "confirmed")}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStatus(booking.id, "cancelled")}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(booking.id, "completed")}
                      >
                        Completar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
