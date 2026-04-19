"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Service, Staff, AvailableSlot } from "@/lib/types"

export function BookingForm() {
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  })

  useEffect(() => {
    fetchServices()
    fetchStaff()
  }, [])

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots()
    }
  }, [selectedService, selectedDate, selectedStaff])

  async function fetchServices() {
    try {
      const res = await fetch("/api/services")
      const data = await res.json()
      setServices(data)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  async function fetchStaff() {
    try {
      const res = await fetch("/api/staff")
      const data = await res.json()
      setStaff(data)
    } catch (error) {
      console.error("Error fetching staff:", error)
    }
  }

  async function fetchAvailableSlots() {
    if (!selectedService || !selectedDate) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        service_id: selectedService.id.toString(),
        date: format(selectedDate, "yyyy-MM-dd"),
        ...(selectedStaff && { staff_id: selectedStaff.id.toString() })
      })
      const res = await fetch(`/api/bookings/available-slots?${params}`)
      const data = await res.json()
      setAvailableSlots(data)
    } catch (error) {
      console.error("Error fetching slots:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedService || !selectedSlot || !customerData.name || !customerData.email) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: selectedService.id,
          staff_id: selectedSlot.staff_id,
          customer_name: customerData.name,
          customer_email: customerData.email,
          customer_phone: customerData.phone,
          booking_date: format(selectedDate!, "yyyy-MM-dd"),
          start_time: selectedSlot.start_time,
          notes: customerData.notes
        })
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const error = await res.json()
        alert(error.error || "Error al crear la reserva")
      }
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Error al crear la reserva")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Reserva Confirmada</h2>
          <p className="text-muted-foreground mb-4">
            Hemos enviado los detalles de tu reserva a {customerData.email}
          </p>
          <div className="bg-muted p-4 rounded-lg text-left mb-6">
            <p><strong>Servicio:</strong> {selectedService?.name}</p>
            <p><strong>Fecha:</strong> {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
            <p><strong>Hora:</strong> {selectedSlot?.start_time}</p>
          </div>
          <Button onClick={() => window.location.reload()}>Hacer otra reserva</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 4 && (
              <div className={`w-16 h-1 mx-2 ${step > s ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Selecciona un servicio</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedService?.id === service.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedService(service)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{service.duration_minutes} min</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">${service.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {services.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No hay servicios disponibles. Por favor, configura los servicios en el panel de administración.
            </p>
          )}
          <div className="flex justify-end mt-6">
            <Button onClick={() => setStep(2)} disabled={!selectedService}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Staff and Date */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Selecciona fecha y profesional</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label className="mb-2 block">Profesional (opcional)</Label>
              <Select
                value={selectedStaff?.id.toString() || "any"}
                onValueChange={(value) => {
                  if (value === "any") {
                    setSelectedStaff(null)
                  } else {
                    const staffMember = staff.find((s) => s.id.toString() === value)
                    setSelectedStaff(staffMember || null)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Cualquier profesional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Cualquier profesional</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-6">
                <Label className="mb-2 block">Fecha</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={es}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Horarios disponibles</Label>
              {!selectedDate && (
                <p className="text-muted-foreground">Selecciona una fecha para ver los horarios disponibles</p>
              )}
              {selectedDate && loading && <p className="text-muted-foreground">Cargando horarios...</p>}
              {selectedDate && !loading && availableSlots.length === 0 && (
                <p className="text-muted-foreground">No hay horarios disponibles para esta fecha</p>
              )}
              {selectedDate && !loading && availableSlots.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={selectedSlot?.start_time === slot.start_time && selectedSlot?.staff_id === slot.staff_id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.start_time.slice(0, 5)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button onClick={() => setStep(3)} disabled={!selectedSlot}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Customer Info */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Tus datos</h2>
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <Input
                  id="notes"
                  value={customerData.notes}
                  onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                  placeholder="Alguna preferencia o comentario"
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={!customerData.name || !customerData.email}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6">Confirmar reserva</h2>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Resumen de tu reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servicio:</span>
                <span className="font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duración:</span>
                <span>{selectedService?.duration_minutes} minutos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha:</span>
                <span>{selectedDate && format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hora:</span>
                <span>{selectedSlot?.start_time.slice(0, 5)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profesional:</span>
                <span>{selectedSlot?.staff_name}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span>{customerData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{customerData.email}</span>
              </div>
              {customerData.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span>{customerData.phone}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">${selectedService?.price}</span>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => setStep(3)}>
              Atrás
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Confirmando..." : "Confirmar Reserva"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
