"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { BusinessHours } from "@/lib/types"

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

export default function SettingsPage() {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchBusinessHours()
  }, [])

  async function fetchBusinessHours() {
    try {
      const res = await fetch("/api/business-hours")
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setBusinessHours(data)
      } else {
        // Initialize with default hours
        setBusinessHours(
          [1, 2, 3, 4, 5, 6].map((day) => ({
            id: 0,
            day_of_week: day,
            open_time: "09:00",
            close_time: "18:00",
            is_closed: day === 0
          }))
        )
      }
    } catch (error) {
      console.error("Error fetching business hours:", error)
    } finally {
      setLoading(false)
    }
  }

  function updateHours(dayOfWeek: number, field: string, value: string | boolean) {
    setBusinessHours((prev) =>
      prev.map((h) =>
        h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
      )
    )
  }

  async function saveBusinessHours() {
    setSaving(true)
    try {
      const res = await fetch("/api/business-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(businessHours)
      })

      if (res.ok) {
        alert("Horarios guardados correctamente")
        fetchBusinessHours()
      }
    } catch (error) {
      console.error("Error saving business hours:", error)
      alert("Error al guardar los horarios")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-8">Configuración</h1>

      <div className="grid gap-6">
        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Horario de atención</CardTitle>
            <CardDescription>Configura los horarios de apertura y cierre</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const hours = businessHours.find((h) => h.day_of_week === day) || {
                  day_of_week: day,
                  open_time: "09:00",
                  close_time: "18:00",
                  is_closed: day === 0
                }
                return (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-24 font-medium">{dayNames[day]}</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hours.is_closed}
                        onChange={(e) => updateHours(day, "is_closed", !e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-muted-foreground">Abierto</span>
                    </div>
                    {!hours.is_closed && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Desde:</Label>
                          <Input
                            type="time"
                            value={hours.open_time?.slice(0, 5) || "09:00"}
                            onChange={(e) => updateHours(day, "open_time", e.target.value)}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Hasta:</Label>
                          <Input
                            type="time"
                            value={hours.close_time?.slice(0, 5) || "18:00"}
                            onChange={(e) => updateHours(day, "close_time", e.target.value)}
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="mt-6">
              <Button onClick={saveBusinessHours} disabled={saving}>
                {saving ? "Guardando..." : "Guardar horarios"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Database Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle>Conexión a base de datos</CardTitle>
            <CardDescription>Información sobre la conexión PostgreSQL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Para conectar tu base de datos PostgreSQL de Railway, configura la siguiente variable de entorno:
              </p>
              <code className="text-sm bg-background px-2 py-1 rounded">DATABASE_URL</code>
              <p className="text-sm text-muted-foreground mt-4">
                Formato: <code className="bg-background px-1 rounded">postgresql://user:password@host:port/database</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
