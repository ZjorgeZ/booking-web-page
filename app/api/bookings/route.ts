import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import type { Booking, BookingWithDetails, Service, Customer } from '@/lib/types'

// GET /api/bookings - Obtener todas las reservas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const staffId = searchParams.get('staff_id')
    
    let sql = `
      SELECT 
        b.*,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        s.name as service_name,
        s.duration_minutes as service_duration,
        st.name as staff_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN staff st ON b.staff_id = st.id
      WHERE 1=1
    `
    const params: unknown[] = []
    let paramIndex = 1
    
    if (status) {
      sql += ` AND b.status = $${paramIndex++}`
      params.push(status)
    }
    
    if (date) {
      sql += ` AND b.booking_date = $${paramIndex++}`
      params.push(date)
    }
    
    if (staffId) {
      sql += ` AND b.staff_id = $${paramIndex++}`
      params.push(staffId)
    }
    
    sql += ' ORDER BY b.booking_date DESC, b.start_time ASC'
    
    const bookings = await query<BookingWithDetails>(sql, params)
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Error al obtener reservas' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Crear nueva reserva
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      service_id, 
      staff_id, 
      booking_date, 
      start_time, 
      notes 
    } = body
    
    // Validaciones
    if (!customer_name || !customer_email || !service_id || !booking_date || !start_time) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    // Obtener servicio para calcular hora de fin y precio
    const service = await queryOne<Service>(
      'SELECT * FROM services WHERE id = $1 AND is_active = true',
      [service_id]
    )
    
    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado o no disponible' },
        { status: 404 }
      )
    }
    
    // Calcular hora de fin
    const [hours, minutes] = start_time.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + service.duration_minutes
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    const end_time = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
    
    // Verificar disponibilidad
    const conflictingBooking = await queryOne<Booking>(
      `SELECT id FROM bookings 
       WHERE booking_date = $1 
       AND status NOT IN ('cancelled')
       AND (
         (start_time <= $2 AND end_time > $2)
         OR (start_time < $3 AND end_time >= $3)
         OR (start_time >= $2 AND end_time <= $3)
       )
       ${staff_id ? 'AND staff_id = $4' : ''}`,
      staff_id ? [booking_date, start_time, end_time, staff_id] : [booking_date, start_time, end_time]
    )
    
    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'El horario seleccionado no está disponible' },
        { status: 409 }
      )
    }
    
    // Crear o obtener cliente
    let customer = await queryOne<Customer>(
      'SELECT * FROM customers WHERE email = $1',
      [customer_email]
    )
    
    if (!customer) {
      customer = await queryOne<Customer>(
        `INSERT INTO customers (name, email, phone)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [customer_name, customer_email, customer_phone]
      )
    }
    
    // Crear reserva
    const booking = await queryOne<Booking>(
      `INSERT INTO bookings (customer_id, service_id, staff_id, booking_date, start_time, end_time, notes, total_price, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [customer!.id, service_id, staff_id || null, booking_date, start_time, end_time, notes, service.price]
    )
    
    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Error al crear reserva' },
      { status: 500 }
    )
  }
}
