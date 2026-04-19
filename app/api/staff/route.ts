import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import type { Staff } from '@/lib/types'

// GET /api/staff - Obtener todo el personal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') !== 'false'
    const serviceId = searchParams.get('service_id')
    
    let sql = 'SELECT * FROM staff'
    const params: unknown[] = []
    let paramIndex = 1
    
    const conditions: string[] = []
    
    if (activeOnly) {
      conditions.push(`is_active = true`)
    }
    
    if (serviceId) {
      conditions.push(`id IN (SELECT staff_id FROM staff_services WHERE service_id = $${paramIndex++})`)
      params.push(serviceId)
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    
    sql += ' ORDER BY name'
    
    const staff = await query<Staff>(sql, params)
    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Error al obtener personal' },
      { status: 500 }
    )
  }
}

// POST /api/staff - Crear nuevo miembro del personal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role, avatar_url } = body
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }
    
    const staff = await queryOne<Staff>(
      `INSERT INTO staff (name, email, phone, role, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, role || 'employee', avatar_url]
    )
    
    return NextResponse.json(staff, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating staff:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe un miembro con ese email' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear miembro del personal' },
      { status: 500 }
    )
  }
}
