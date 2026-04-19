import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import type { BusinessHours, Booking, Service, TimeSlot } from '@/lib/types'

// GET /api/bookings/available-slots - Obtener horarios disponibles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('service_id')
    const staffId = searchParams.get('staff_id')
    
    if (!date || !serviceId) {
      return NextResponse.json(
        { error: 'Se requiere fecha y servicio' },
        { status: 400 }
      )
    }
    
    // Obtener servicio
    const service = await queryOne<Service>(
      'SELECT * FROM services WHERE id = $1 AND is_active = true',
      [serviceId]
    )
    
    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }
    
    // Obtener día de la semana (0 = Domingo, 1 = Lunes, etc.)
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()
    
    // Obtener horario de negocio
    const businessHours = await queryOne<BusinessHours>(
      'SELECT * FROM business_hours WHERE day_of_week = $1',
      [dayOfWeek]
    )
    
    if (!businessHours || businessHours.is_closed) {
      return NextResponse.json({ slots: [], message: 'Cerrado este día' })
    }
    
    // Obtener reservas existentes para ese día
    let bookingsQuery = `
      SELECT start_time, end_time FROM bookings 
      WHERE booking_date = $1 AND status NOT IN ('cancelled')
    `
    const bookingsParams: unknown[] = [date]
    
    if (staffId) {
      bookingsQuery += ' AND staff_id = $2'
      bookingsParams.push(staffId)
    }
    
    const existingBookings = await query<{ start_time: string; end_time: string }>(
      bookingsQuery,
      bookingsParams
    )
    
    // Generar slots disponibles
    const slots: TimeSlot[] = []
    const [openHour, openMin] = businessHours.open_time.split(':').map(Number)
    const [closeHour, closeMin] = businessHours.close_time.split(':').map(Number)
    
    const openMinutes = openHour * 60 + openMin
    const closeMinutes = closeHour * 60 + closeMin
    const slotDuration = 30 // Slots cada 30 minutos
    
    for (let minutes = openMinutes; minutes + service.duration_minutes <= closeMinutes; minutes += slotDuration) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      
      // Calcular hora de fin del slot
      const endMinutes = minutes + service.duration_minutes
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      const endTimeString = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
      
      // Verificar si hay conflicto con reservas existentes
      const hasConflict = existingBookings.some(booking => {
        const bookingStart = booking.start_time.substring(0, 5)
        const bookingEnd = booking.end_time.substring(0, 5)
        
        return (
          (timeString >= bookingStart && timeString < bookingEnd) ||
          (endTimeString > bookingStart && endTimeString <= bookingEnd) ||
          (timeString <= bookingStart && endTimeString >= bookingEnd)
        )
      })
      
      // Verificar si el slot ya pasó (para hoy)
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      let isPast = false
      
      if (date === today) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        isPast = minutes <= currentMinutes
      }
      
      slots.push({
        time: timeString,
        available: !hasConflict && !isPast
      })
    }
    
    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Error fetching available slots:', error)
    return NextResponse.json(
      { error: 'Error al obtener horarios disponibles' },
      { status: 500 }
    )
  }
}
