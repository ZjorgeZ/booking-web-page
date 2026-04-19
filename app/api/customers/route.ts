import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import type { Customer } from '@/lib/types'

// GET /api/customers - Obtener todos los clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    let sql = 'SELECT * FROM customers'
    const params: unknown[] = []
    
    if (search) {
      sql += ' WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1'
      params.push(`%${search}%`)
    }
    
    sql += ' ORDER BY created_at DESC'
    
    const customers = await query<Customer>(sql, params)
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, notes } = body
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nombre y email son requeridos' },
        { status: 400 }
      )
    }
    
    const customer = await queryOne<Customer>(
      `INSERT INTO customers (name, email, phone, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, notes]
    )
    
    return NextResponse.json(customer, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating customer:', error)
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      return NextResponse.json(
        { error: 'Ya existe un cliente con ese email' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}
