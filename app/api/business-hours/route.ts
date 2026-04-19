import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import type { BusinessHours } from '@/lib/types'

// GET /api/business-hours - Obtener horarios de negocio
export async function GET() {
  try {
    const hours = await query<BusinessHours>(
      'SELECT * FROM business_hours ORDER BY day_of_week'
    )
    return NextResponse.json(hours)
  } catch (error) {
    console.error('Error fetching business hours:', error)
    return NextResponse.json(
      { error: 'Error al obtener horarios' },
      { status: 500 }
    )
  }
}

// PUT /api/business-hours - Actualizar horarios
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { day_of_week, open_time, close_time, is_closed } = body
    
    if (day_of_week === undefined) {
      return NextResponse.json(
        { error: 'Día de la semana es requerido' },
        { status: 400 }
      )
    }
    
    const hours = await queryOne<BusinessHours>(
      `UPDATE business_hours 
       SET open_time = COALESCE($1, open_time),
           close_time = COALESCE($2, close_time),
           is_closed = COALESCE($3, is_closed)
       WHERE day_of_week = $4
       RETURNING *`,
      [open_time, close_time, is_closed, day_of_week]
    )
    
    if (!hours) {
      // Crear si no existe
      const newHours = await queryOne<BusinessHours>(
        `INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [day_of_week, open_time || '09:00', close_time || '18:00', is_closed || false]
      )
      return NextResponse.json(newHours, { status: 201 })
    }
    
    return NextResponse.json(hours)
  } catch (error) {
    console.error('Error updating business hours:', error)
    return NextResponse.json(
      { error: 'Error al actualizar horarios' },
      { status: 500 }
    )
  }
}
