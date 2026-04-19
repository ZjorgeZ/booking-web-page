export interface Service {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  category: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  customer_id: string
  service_id: string
  staff_id: string | null
  booking_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes: string | null
  total_price: number | null
  created_at: string
  updated_at: string
}

export interface BookingWithDetails extends Booking {
  customer_name: string
  customer_email: string
  customer_phone: string | null
  service_name: string
  service_duration: number
  staff_name: string | null
}

export interface BusinessHours {
  id: string
  day_of_week: number
  open_time: string
  close_time: string
  is_closed: boolean
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface CreateBookingRequest {
  customer_name: string
  customer_email: string
  customer_phone?: string
  service_id: string
  staff_id?: string
  booking_date: string
  start_time: string
  notes?: string
}
