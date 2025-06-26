/*
  # Crear tabla medical_centers y migrar datos existentes

  1. Nueva Tabla
    - `medical_centers` con estructura completa para el geoportal
    - Campos: id, name, type, lat, lng, address, phone, schedule, services, emergency
    - Tipos: hospital, clinic, health_center
    
  2. Migración de Datos
    - Migra todos los datos de `clinicas_comunales` como tipo 'clinic'
    - Migra todos los datos de `unidades_medicas` como tipo 'health_center'
    - Agrega hospitales importantes que podrían faltar
    
  3. Seguridad
    - Habilita RLS (Row Level Security)
    - Políticas para lectura pública y escritura autenticada
    
  4. Optimización
    - Índices para mejor rendimiento
    - Trigger para actualizar timestamp automáticamente
*/

-- Crear la tabla medical_centers
CREATE TABLE IF NOT EXISTS medical_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('hospital', 'clinic', 'health_center')),
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  schedule text NOT NULL,
  services text[] NOT NULL DEFAULT '{}',
  emergency boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE medical_centers ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Medical centers are publicly readable"
  ON medical_centers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert medical centers"
  ON medical_centers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update medical centers"
  ON medical_centers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete medical centers"
  ON medical_centers
  FOR DELETE
  TO authenticated
  USING (true);

-- Función auxiliar para construir horarios desde los datos existentes
CREATE OR REPLACE FUNCTION build_schedule_from_existing(
  inicio_semana text,
  fin_semana text,
  inicio_finde text,
  fin_finde text
) RETURNS text AS $$
BEGIN
  IF inicio_semana IS NOT NULL AND fin_semana IS NOT NULL THEN
    IF inicio_finde IS NOT NULL AND fin_finde IS NOT NULL THEN
      RETURN 'Lunes a Viernes ' || inicio_semana || ' - ' || fin_semana || ', Fines de semana ' || inicio_finde || ' - ' || fin_finde;
    ELSE
      RETURN 'Lunes a Viernes ' || inicio_semana || ' - ' || fin_semana;
    END IF;
  ELSE
    RETURN 'Lunes a Viernes 7:00 AM - 4:00 PM';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- MIGRAR DATOS DE CLINICAS_COMUNALES
INSERT INTO medical_centers (name, type, lat, lng, address, phone, schedule, services, emergency)
SELECT 
  COALESCE(TRIM(nombre), 'Clínica Comunal') as name,
  'clinic' as type,
  COALESCE(coor_y, 13.7942) as lat,  -- Coordenada Y es latitud
  COALESCE(coor_x, -88.8965) as lng, -- Coordenada X es longitud
  CASE 
    WHEN direccion IS NOT NULL AND municipio IS NOT NULL THEN 
      TRIM(direccion) || ', ' || TRIM(municipio)
    WHEN direccion IS NOT NULL THEN 
      TRIM(direccion)
    WHEN municipio IS NOT NULL THEN 
      TRIM(municipio)
    ELSE 
      'Dirección no disponible'
  END as address,
  '2200-0000' as phone,  -- Teléfono por defecto ya que no está en los datos originales
  build_schedule_from_existing(
    horario_inicio_semana, 
    horario_fin_semana, 
    horario_inicio_finde, 
    horario_fin_finde
  ) as schedule,
  ARRAY['Medicina General', 'Consulta Externa', 'Servicios Comunitarios'] as services,
  false as emergency
FROM clinicas_comunales
WHERE nombre IS NOT NULL AND TRIM(nombre) != '';

-- MIGRAR DATOS DE UNIDADES_MEDICAS
INSERT INTO medical_centers (name, type, lat, lng, address, phone, schedule, services, emergency)
SELECT 
  COALESCE(TRIM(nombre), 'Unidad Médica') as name,
  'health_center' as type,
  COALESCE(coor_y, 13.7942) as lat,  -- Coordenada Y es latitud
  COALESCE(coor_x, -88.8965) as lng, -- Coordenada X es longitud
  CASE 
    WHEN direccion IS NOT NULL AND municipio IS NOT NULL THEN 
      TRIM(direccion) || ', ' || TRIM(municipio)
    WHEN direccion IS NOT NULL THEN 
      TRIM(direccion)
    WHEN municipio IS NOT NULL THEN 
      TRIM(municipio)
    ELSE 
      'Dirección no disponible'
  END as address,
  '2200-0000' as phone,  -- Teléfono por defecto ya que no está en los datos originales
  build_schedule_from_existing(
    horario_inicio_semana, 
    horario_fin_semana, 
    horario_inicio_finde, 
    horario_fin_finde
  ) as schedule,
  ARRAY['Consulta General', 'Medicina Preventiva', 'Vacunación', 'Control de Salud'] as services,
  false as emergency
FROM unidades_medicas
WHERE nombre IS NOT NULL AND TRIM(nombre) != '';

-- AGREGAR HOSPITALES PRINCIPALES DE EL SALVADOR
INSERT INTO medical_centers (name, type, lat, lng, address, phone, schedule, services, emergency) VALUES
-- Hospitales de San Salvador
('Hospital Nacional Rosales', 'hospital', 13.7041, -89.2042, 'Boulevard de Los Héroes, San Salvador', '2231-9200', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Pediatría', 'Cardiología', 'Traumatología'], true),
('Hospital de Diagnóstico', 'hospital', 13.7094, -89.2073, '99 Avenida Norte, San Salvador', '2264-4422', '24 horas', ARRAY['Diagnóstico por Imágenes', 'Laboratorio', 'Consulta Externa', 'Emergencias'], true),
('Hospital Nacional de Niños Benjamin Bloom', 'hospital', 13.7089, -89.2156, 'Boulevard de Los Héroes, San Salvador', '2231-9200', '24 horas', ARRAY['Pediatría', 'Neonatología', 'Cirugía Pediátrica', 'Emergencias Pediátricas'], true),
('Hospital Nacional de Maternidad', 'hospital', 13.7025, -89.2089, 'San Salvador', '2231-9200', '24 horas', ARRAY['Maternidad', 'Ginecología', 'Obstetricia', 'Emergencias Obstétricas'], true),

-- Hospitales Regionales
('Hospital Nacional Jorge Mazzini', 'hospital', 13.9944, -89.5594, 'Santa Ana', '2440-9200', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Maternidad', 'Pediatría'], true),
('Hospital Nacional San Juan de Dios', 'hospital', 13.4833, -88.1833, 'San Miguel', '2661-1717', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Traumatología', 'Maternidad'], true),
('Hospital Nacional San Rafael', 'hospital', 13.3500, -88.4167, 'La Unión', '2604-0600', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Maternidad'], true),
('Hospital Nacional Francisco Menéndez', 'hospital', 13.9167, -89.8500, 'Ahuachapán', '2413-2200', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Maternidad'], true),
('Hospital Nacional Chalatenango', 'hospital', 14.0333, -88.9333, 'Chalatenango', '2301-2200', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna'], true),

-- Hospitales Especializados
('Hospital Nacional de Neumología y Medicina Familiar', 'hospital', 13.7156, -89.2125, 'San Salvador', '2235-8900', '24 horas', ARRAY['Neumología', 'Medicina Familiar', 'Consulta Externa'], false),
('Hospital Nacional Psiquiátrico', 'hospital', 13.7200, -89.2300, 'San Salvador', '2226-7000', '24 horas', ARRAY['Psiquiatría', 'Salud Mental', 'Emergencias Psiquiátricas'], true)

ON CONFLICT DO NOTHING;  -- Evitar duplicados si ya existen hospitales

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_medical_centers_type ON medical_centers(type);
CREATE INDEX IF NOT EXISTS idx_medical_centers_emergency ON medical_centers(emergency);
CREATE INDEX IF NOT EXISTS idx_medical_centers_location ON medical_centers(lat, lng);
CREATE INDEX IF NOT EXISTS idx_medical_centers_name ON medical_centers(name);

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_medical_centers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_medical_centers_updated_at ON medical_centers;
CREATE TRIGGER update_medical_centers_updated_at 
    BEFORE UPDATE ON medical_centers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_medical_centers_updated_at();

-- Limpiar función auxiliar
DROP FUNCTION IF EXISTS build_schedule_from_existing(text, text, text, text);

-- Verificar los datos migrados
SELECT 
  type,
  COUNT(*) as cantidad,
  COUNT(CASE WHEN emergency = true THEN 1 END) as con_emergencias
FROM medical_centers 
GROUP BY type
ORDER BY type;

-- Mostrar algunos ejemplos de los datos migrados
SELECT 
  name,
  type,
  address,
  schedule,
  array_length(services, 1) as num_servicios
FROM medical_centers 
ORDER BY type, name
LIMIT 10;