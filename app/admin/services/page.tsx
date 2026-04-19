"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Service } from "@/lib/types"

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    price: 0
  })

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      const res = await fetch("/api/services")
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching services:", error)
    } finally {
      setLoading(false)
    }
  }

  function openDialog(service?: Service) {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description || "",
        duration_minutes: service.duration_minutes,
        price: Number(service.price)
      })
    } else {
      setEditingService(null)
      setFormData({ name: "", description: "", duration_minutes: 30, price: 0 })
    }
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services"
      const method = editingService ? "PUT" : "POST"
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setDialogOpen(false)
        fetchServices()
      }
    } catch (error) {
      console.error("Error saving service:", error)
    }
  }

  async function deleteService(id: number) {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) return
    try {
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }

  async function toggleActive(service: Service) {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...service, is_active: !service.is_active })
      })
      if (res.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error("Error updating service:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando servicios...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Servicios</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>Nuevo servicio</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingService ? "Editar servicio" : "Nuevo servicio"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Modifica los datos del servicio" : "Añade un nuevo servicio a tu catálogo"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingService ? "Guardar cambios" : "Crear servicio"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No hay servicios configurados</p>
            <Button onClick={() => openDialog()}>Crear primer servicio</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className={!service.is_active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-muted-foreground">
                    {service.duration_minutes} minutos
                  </div>
                  <div className="text-2xl font-bold text-primary">${service.price}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openDialog(service)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(service)}
                  >
                    {service.is_active ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteService(service.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
