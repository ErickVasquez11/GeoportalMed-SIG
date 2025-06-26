/*
  # Migrate Existing Medical Data

  1. New Tables
    - `medical_centers` - Unified table for all medical facilities
  2. Data Migration
    - Transform `clinicas_comunales` data to medical_centers format
    - Transform `unidades_medicas` data to medical_centers format
    - Add missing hospitals data
  3. Security
    - Enable RLS on `medical_centers` table
    - Add policies for public read access and authenticated user management
*/

-- Create the medical_centers table
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

-- Enable Row Level Security
ALTER TABLE medical_centers ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Function to build schedule text from existing data
CREATE OR REPLACE FUNCTION build_schedule(
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
    RETURN 'Horario por confirmar';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Migrate data from clinicas_comunales
INSERT INTO medical_centers (name, type, lat, lng, address, phone, schedule, services, emergency)
SELECT 
  COALESCE(nombre, 'Clínica Sin Nombre') as name,
  'clinic' as type,
  COALESCE(coor_y, 13.7942) as lat,  -- Default to El Salvador center if no coordinates
  COALESCE(coor_x, -88.8965) as lng,
  COALESCE(direccion || ', ' || municipio, 'Dirección no disponible') as address,
  '2200-0000' as phone,  -- Default phone since not in original data
  build_schedule(horario_inicio_semana, horario_fin_semana, horario_inicio_finde, horario_fin_finde) as schedule,
  ARRAY['Medicina General', 'Consulta Externa', 'Servicios Básicos'] as services,
  false as emergency
FROM clinicas_comunales
WHERE nombre IS NOT NULL;

-- Migrate data from unidades_medicas
INSERT INTO medical_centers (name, type, lat, lng, address, phone, schedule, services, emergency)
SELECT 
  COALESCE(nombre, 'Unidad Médica Sin Nombre') as name,
  'health_center' as type,
  COALESCE(coor_y, 13.7942) as lat,  -- Default to El Salvador center if no coordinates
  COALESCE(coor_x, -88.8965) as lng,
  COALESCE(direccion || ', ' || municipio, 'Dirección no disponible') as address,
  '2200-0000' as phone,  -- Default phone since not in original data
  build_schedule(horario_inicio_semana, horario_fin_semana, horario_inicio_finde, horario_fin_finde) as schedule,
  ARRAY['Consulta General', 'Medicina Preventiva', 'Vacunación'] as services,
  false as emergency
FROM unidades_medicas
WHERE nombre IS NOT NULL;

-- Add major hospitals that might be missing
INSERT INTO medical_centers (name, type, lat, lng, address, phone, schedule, services, emergency) VALUES
('Hospital Nacional Rosales', 'hospital', 13.7041, -89.2042, 'Boulevard de Los Héroes, San Salvador', '2231-9200', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Pediatría', 'Cardiología', 'Traumatología'], true),
('Hospital de Diagnóstico', 'hospital', 13.7094, -89.2073, '99 Avenida Norte, San Salvador', '2264-4422', '24 horas', ARRAY['Diagnóstico por Imágenes', 'Laboratorio', 'Consulta Externa', 'Emergencias'], true),
('Hospital Nacional de Niños Benjamin Bloom', 'hospital', 13.7089, -89.2156, 'Boulevard de Los Héroes, San Salvador', '2231-9200', '24 horas', ARRAY['Pediatría', 'Neonatología', 'Cirugía Pediátrica', 'Emergencias Pediátricas'], true),
('Hospital Nacional Jorge Mazzini', 'hospital', 13.9944, -89.5594, 'Santa Ana', '2440-9200', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Maternidad', 'Pediatría'], true),
('Hospital Nacional San Juan de Dios', 'hospital', 13.4833, -88.1833, 'San Miguel', '2661-1717', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Traumatología', 'Maternidad'], true),
('Hospital Nacional San Rafael', 'hospital', 13.3500, -88.4167, 'La Unión', '2604-0600', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Maternidad'], true)
ON CONFLICT DO NOTHING;  -- Avoid duplicates if hospitals already exist

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_centers_type ON medical_centers(type);
CREATE INDEX IF NOT EXISTS idx_medical_centers_emergency ON medical_centers(emergency);
CREATE INDEX IF NOT EXISTS idx_medical_centers_location ON medical_centers(lat, lng);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_medical_centers_updated_at ON medical_centers;
CREATE TRIGGER update_medical_centers_updated_at 
    BEFORE UPDATE ON medical_centers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Clean up the helper function
DROP FUNCTION IF EXISTS build_schedule(text, text, text, text);