-- PARTE 3: Insertar datos iniciales
-- Ejecuta este script después de 002-create-indexes.sql

-- Horarios de negocio
INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '09:00', '18:00', true),
(1, '09:00', '18:00', false),
(2, '09:00', '18:00', false),
(3, '09:00', '18:00', false),
(4, '09:00', '18:00', false),
(5, '09:00', '18:00', false),
(6, '09:00', '14:00', false)
ON CONFLICT (day_of_week) DO NOTHING;

-- Servicios
INSERT INTO services (name, description, duration_minutes, price, category, is_active) VALUES
('Consulta General', 'Consulta general con especialista', 30, 50.00, 'Consultas', true),
('Consulta Premium', 'Consulta extendida con análisis completo', 60, 100.00, 'Consultas', true),
('Tratamiento Básico', 'Tratamiento estándar', 45, 75.00, 'Tratamientos', true),
('Tratamiento Avanzado', 'Tratamiento completo con seguimiento', 90, 150.00, 'Tratamientos', true),
('Sesión de Evaluación', 'Evaluación inicial completa', 60, 80.00, 'Evaluaciones', true)
ON CONFLICT DO NOTHING;

-- Staff
INSERT INTO staff (name, email, phone, role, is_active) VALUES
('Dr. Juan García', 'juan.garcia@example.com', '+34 600 000 001', 'specialist', true),
('Dra. María López', 'maria.lopez@example.com', '+34 600 000 002', 'specialist', true),
('Carlos Rodríguez', 'carlos.rodriguez@example.com', '+34 600 000 003', 'assistant', true)
ON CONFLICT (email) DO NOTHING;
