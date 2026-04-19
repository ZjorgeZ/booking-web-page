-- =============================================
-- BOOKING WEB PAGE - PostgreSQL Database Schema
-- Para usar en Railway PostgreSQL
-- =============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: services (Servicios disponibles)
-- =============================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: staff (Personal/Empleados)
-- =============================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(100) DEFAULT 'employee',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: staff_services (Relación staff-servicios)
-- =============================================
CREATE TABLE IF NOT EXISTS staff_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE(staff_id, service_id)
);

-- =============================================
-- TABLA: customers (Clientes)
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA: bookings (Reservas)
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);

-- =============================================
-- TABLA: business_hours (Horarios de negocio)
-- =============================================
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    UNIQUE(day_of_week)
);

-- =============================================
-- TABLA: admin_users (Usuarios administradores)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES para mejorar rendimiento
-- =============================================
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_staff ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);

-- =============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
    BEFORE UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Horarios de negocio (Lunes a Viernes 9:00-18:00, Sábado 9:00-14:00)
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '09:00', '18:00', true),   -- Domingo (cerrado)
(1, '09:00', '18:00', false),  -- Lunes
(2, '09:00', '18:00', false),  -- Martes
(3, '09:00', '18:00', false),  -- Miércoles
(4, '09:00', '18:00', false),  -- Jueves
(5, '09:00', '18:00', false),  -- Viernes
(6, '09:00', '14:00', false)   -- Sábado
ON CONFLICT (day_of_week) DO NOTHING;

-- Servicios de ejemplo
INSERT INTO services (name, description, duration_minutes, price, category, is_active) VALUES
('Consulta General', 'Consulta general con especialista', 30, 50.00, 'Consultas', true),
('Consulta Premium', 'Consulta extendida con análisis completo', 60, 100.00, 'Consultas', true),
('Tratamiento Básico', 'Tratamiento estándar', 45, 75.00, 'Tratamientos', true),
('Tratamiento Avanzado', 'Tratamiento completo con seguimiento', 90, 150.00, 'Tratamientos', true),
('Sesión de Evaluación', 'Evaluación inicial completa', 60, 80.00, 'Evaluaciones', true)
ON CONFLICT DO NOTHING;

-- Staff de ejemplo
INSERT INTO staff (name, email, phone, role, is_active) VALUES
('Dr. Juan García', 'juan.garcia@example.com', '+34 600 000 001', 'specialist', true),
('Dra. María López', 'maria.lopez@example.com', '+34 600 000 002', 'specialist', true),
('Carlos Rodríguez', 'carlos.rodriguez@example.com', '+34 600 000 003', 'assistant', true)
ON CONFLICT (email) DO NOTHING;
