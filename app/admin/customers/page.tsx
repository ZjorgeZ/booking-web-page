"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Customer } from "@/lib/types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/customers")
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando clientes...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <Input
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardContent>
      </Card>

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No hay clientes registrados</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de clientes</CardTitle>
            <CardDescription>{filteredCustomers.length} clientes encontrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    {customer.phone && (
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{customer.total_bookings || 0} reservas</Badge>
                    {customer.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Cliente desde {format(new Date(customer.created_at), "MMM yyyy", { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
