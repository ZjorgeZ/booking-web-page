import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db'
import type { Booking, BookingWithDetails } from '@/lib/types'

// GET /api/bookings/[id] - Obtener reserva por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await queryOne<BookingWithDetails>(
      `SELECT 
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
      WHERE b.id = $1`,
      [id]
    )
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Error al obtener reserva' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Actualizar reserva
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, staff_id, booking_date, start_time } = body
    
    const booking = await queryOne<Booking>(
      `UPDATE bookings 
       SET status = COALESCE($1, status),
           notes = COALESCE($2, notes),
           staff_id = COALESCE($3, staff_id),
           booking_date = COALESCE($4, booking_date),
           start_time = COALESCE($5, start_time)
       WHERE id = $6
       RETURNING *`,
      [status, notes, staff_id, booking_date, start_time, id]
    )
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Error al actualizar reserva' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Cancelar/eliminar reserva
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // En lugar de eliminar, marcamos como cancelada
    const booking = await queryOne<Booking>(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [id]
    )
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Reserva cancelada correctamente' })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Error al cancelar reserva' },
      { status: 500 }
    )
  }
}
