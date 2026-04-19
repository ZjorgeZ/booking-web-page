import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db'
import type { Service } from '@/lib/types'

// GET /api/services - Obtener todos los servicios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false'
    
    let sql = 'SELECT * FROM services'
    if (activeOnly) {
      sql += ' WHERE is_active = true'
    }
    sql += ' ORDER BY category, name'
    
    const services = await query<Service>(sql)
    return NextResponse.json(services)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    )
  }
}

// POST /api/services - Crear nuevo servicio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, duration_minutes, price, category, image_url } = body
    
    if (!name || !duration_minutes || price === undefined) {
      return NextResponse.json(
        { error: 'Nombre, duración y precio son requeridos' },
        { status: 400 }
      )
    }
    
    const service = await queryOne<Service>(
      `INSERT INTO services (name, description, duration_minutes, price, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, duration_minutes, price, category, image_url]
    )
    
    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Error al crear servicio' },
      { status: 500 }
    )
  }
}
