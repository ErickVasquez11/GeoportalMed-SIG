/*
  # Create Medical Centers Table

  1. New Tables
    - `medical_centers`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `type` (text, not null) - hospital, clinic, or health_center
      - `lat` (numeric, not null) - latitude coordinate
      - `lng` (numeric, not null) - longitude coordinate
      - `address` (text, not null)
      - `phone` (text, not null)
      - `schedule` (text, not null)
      - `services` (text array, not null)
      - `emergency` (boolean, default false)
      - `created_at` (timestamp with timezone, default now())
      - `updated_at` (timestamp with timezone, default now())

  2. Security
    - Enable RLS on `medical_centers` table
    - Add policy for public read access (medical centers are public information)
    - Add policies for authenticated users to manage centers

  3. Sample Data
    - Insert sample medical centers data for El Salvador
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

-- Insert sample data
INSERT INTO medical_centers (name, type, lat, lng, address, phone, schedule, services, emergency) VALUES
-- San Salvador - Hospitales
('Hospital Nacional Rosales', 'hospital', 13.7041, -89.2042, 'Boulevard de Los Héroes, San Salvador', '2231-9200', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Pediatría', 'Cardiología', 'Traumatología'], true),
('Hospital de Diagnóstico', 'hospital', 13.7094, -89.2073, '99 Avenida Norte, San Salvador', '2264-4422', '24 horas', ARRAY['Diagnóstico por Imágenes', 'Laboratorio', 'Consulta Externa', 'Emergencias'], true),
('Hospital Nacional de Niños Benjamin Bloom', 'hospital', 13.7089, -89.2156, 'Boulevard de Los Héroes, San Salvador', '2231-9200', '24 horas', ARRAY['Pediatría', 'Neonatología', 'Cirugía Pediátrica', 'Emergencias Pediátricas'], true),

-- San Salvador - Clínicas Comunales
('Clínica Comunal San Jacinto', 'clinic', 13.7156, -89.2125, 'Calle Antigua a Zacatecoluca #24, San Salvador', '2235-8900', 'Lunes a Viernes 7:00 AM - 6:00 PM', ARRAY['Medicina General', 'Pediatría', 'Ginecología', 'Odontología'], false),
('Clínica Comunal Antiguo Cuscatlán', 'clinic', 13.6683, -89.2506, 'Antiguo Cuscatlán, La Libertad', '2243-7400', 'Lunes a Sábado 7:00 AM - 5:00 PM', ARRAY['Medicina General', 'Especialidades', 'Laboratorio', 'Rayos X'], false),
('Clínica Comunal San Miguel', 'clinic', 13.4856, -88.1789, 'Centro de San Miguel', '2661-5500', 'Lunes a Sábado 8:00 AM - 5:00 PM', ARRAY['Medicina General', 'Especialidades', 'Laboratorio', 'Farmacia'], false),

-- Unidades Médicas (Centros de Salud)
('Unidad Médica Soyapango', 'health_center', 13.7420, -89.1401, 'Soyapango, San Salvador', '2277-4500', 'Lunes a Viernes 7:00 AM - 4:00 PM', ARRAY['Consulta General', 'Vacunación', 'Control Prenatal', 'Medicina Preventiva'], false),
('Unidad Médica Santa Ana Centro', 'health_center', 13.9956, -89.5625, 'Centro de Santa Ana', '2447-8800', 'Lunes a Viernes 7:00 AM - 4:00 PM', ARRAY['Consulta General', 'Odontología', 'Laboratorio', 'Planificación Familiar'], false),
('Unidad Médica La Libertad', 'health_center', 13.4889, -89.3222, 'La Libertad Centro', '2335-1200', 'Lunes a Viernes 7:00 AM - 4:00 PM', ARRAY['Consulta General', 'Medicina Preventiva', 'Vacunación', 'Control de Niño Sano'], false),
('Unidad Médica Usulután', 'health_center', 13.3500, -88.4500, 'Usulután Centro', '2662-0800', 'Lunes a Viernes 7:00 AM - 4:00 PM', ARRAY['Consulta General', 'Medicina Preventiva', 'Vacunación', 'Nutrición'], false),

-- Hospitales Regionales
('Hospital Nacional Jorge Mazzini', 'hospital', 13.9944, -89.5594, 'Santa Ana', '2440-9200', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Maternidad', 'Pediatría'], true),
('Hospital Nacional San Juan de Dios', 'hospital', 13.4833, -88.1833, 'San Miguel', '2661-1717', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Traumatología', 'Maternidad'], true),
('Hospital Nacional San Rafael', 'hospital', 13.3500, -88.4167, 'La Unión', '2604-0600', '24 horas', ARRAY['Emergencias', 'Cirugía', 'Medicina Interna', 'Maternidad'], true),

-- Más Unidades Médicas distribuidas
('Unidad Médica Ahuachapán', 'health_center', 13.9167, -89.8500, 'Ahuachapán Centro', '2413-2400', 'Lunes a Viernes 7:00 AM - 4:00 PM', ARRAY['Consulta General', 'Medicina Preventiva', 'Vacunación', 'Odontología'], false),
('Unidad Médica Chalatenango', 'health_center', 14.0333, -88.9333, 'Chalatenango Centro', '2301-2100', 'Lunes a Viernes 7:00 AM - 4:00 PM', ARRAY['Consulta General', 'Medicina Preventiva', 'Vacunación', 'Control Prenatal'], false),
('Unidad Médica Cojutepeque', 'health_center', 13.7167, -88.9333, 'Cojutepeque, Cuscatlán', '2372-1800', 'Lunes a Viernes 7:00 AM - 4:00 PM', ARRAY['Consulta General', 'Medicina Preventiva', 'Vacunación', 'Laboratorio Básico'], false);

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
CREATE TRIGGER update_medical_centers_updated_at 
    BEFORE UPDATE ON medical_centers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();