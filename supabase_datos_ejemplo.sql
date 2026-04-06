-- ============================================================
-- Script SQL para insertar datos de ejemplo en Supabase
-- Ejecuta esto en: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. INSERTAR SERVICIOS DE EJEMPLO
INSERT INTO servicios (nombre, descripcion, precio, duracion_min, buffer_min, imagen_url, activo, categoria) VALUES
('Masaje Relajante', 'Masaje de cuerpo completo con aceites esenciales aromáticos para liberar tensiones y promover la relajación profunda', 150000, 60, 15, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop', true, 'Masaje'),

('Facial Luminosidad Dorada', 'Tratamiento facial premium con oro de 24k que ilumina, rejuvenece y revitaliza la piel del rostro', 180000, 75, 15, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&h=400&fit=crop', true, 'Facial'),

('Aromaterapia & Relajación', 'Sesión de aromaterapia con aceites esenciales puros combinada con técnicas de relajación profunda', 120000, 45, 10, 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&h=400&fit=crop', true, 'Bienestar'),

('Masaje Descontracturante', 'Masaje terapéutico profundo enfocado en liberar nudos musculares y aliviar dolores crónicos', 160000, 60, 15, 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop', true, 'Masaje'),

('Reflexología Podal', 'Masaje terapéutico en pies que estimula puntos reflejos conectados con todo el cuerpo', 90000, 45, 10, 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=400&fit=crop', true, 'Masaje'),

('Ritual Cuerpo Completo', 'Experiencia completa: exfoliación, envoltura corporal, masaje relajante e hidratación profunda', 280000, 120, 20, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=400&fit=crop', true, 'Premium'),

('Ritual de Piedras Calientes', 'Masaje con piedras volcánicas calientes que relajan músculos profundos y equilibran la energía', 200000, 90, 15, 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600&h=400&fit=crop', true, 'Premium');

-- 2. INSERTAR TESTIMONIOS DE EJEMPLO
INSERT INTO testimonios (nombre, rating, texto, activo) VALUES
('María González', 5, 'Una experiencia transformadora. El masaje relajante superó todas mis expectativas. El ambiente es perfecto y el personal muy profesional.', true),

('Laura Martínez', 5, 'El facial de luminosidad es increíble. Mi piel quedó radiante y el tratamiento fue muy relajante. Definitivamente volveré.', true),

('Ana Rodríguez', 5, 'El ritual de cuerpo completo es una maravilla. Salí renovada y con una sensación de paz que duró días. Totalmente recomendado.', true),

('Carolina Silva', 4, 'Excelente servicio y atención. El masaje descontracturante me ayudó mucho con mis dolores de espalda. Muy profesionales.', true);

-- 3. VERIFICAR QUE LOS DATOS SE INSERTARON CORRECTAMENTE
SELECT 'Servicios insertados:' as info, COUNT(*) as total FROM servicios;
SELECT 'Testimonios insertados:' as info, COUNT(*) as total FROM testimonios;

-- 4. VER LOS SERVICIOS ACTIVOS
SELECT id, nombre, precio, duracion_min, categoria, activo FROM servicios WHERE activo = true ORDER BY nombre;

-- 5. VER LOS TESTIMONIOS ACTIVOS
SELECT nombre, rating, LEFT(texto, 50) || '...' as texto_preview FROM testimonios WHERE activo = true;
