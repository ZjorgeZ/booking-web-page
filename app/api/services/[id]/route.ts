import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { Service } from '@/lib/types'

// GET /api/services/[id] - Obtener servicio por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = await queryOne<Service>(
      'SELECT * FROM services WHERE id = $1',
      [id]
    )
    
    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicio' },
      { status: 500 }
    )
  }
}

// PUT /api/services/[id] - Actualizar servicio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, duration_minutes, price, category, image_url, is_active } = body
    
    const service = await queryOne<Service>(
      `UPDATE services 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           duration_minutes = COALESCE($3, duration_minutes),
           price = COALESCE($4, price),
           category = COALESCE($5, category),
           image_url = COALESCE($6, image_url),
           is_active = COALESCE($7, is_active)
       WHERE id = $8
       RETURNING *`,
      [name, description, duration_minutes, price, category, image_url, is_active, id]
    )
    
    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(service)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servicio' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id] - Eliminar servicio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rowCount = await execute('DELETE FROM services WHERE id = $1', [id])
    
    if (rowCount === 0) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Servicio eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Error al eliminar servicio' },
      { status: 500 }
    )
  }
}
