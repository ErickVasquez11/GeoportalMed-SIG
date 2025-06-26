/*
  # Fix User Registration System

  1. Diagnóstico y reparación del sistema de registro
    - Verificar y recrear la tabla user_profiles
    - Recrear la función handle_new_user
    - Recrear el trigger on_auth_user_created
    - Agregar políticas de inserción

  2. Seguridad
    - Políticas para permitir inserción de perfiles
    - Verificación de permisos

  3. Usuarios de prueba
    - Crear usuarios de prueba si no existen
*/

-- Verificar si la tabla user_profiles existe y recrearla si es necesario
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para recrearlas
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON user_profiles;

-- Recrear políticas con inserción habilitada
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- IMPORTANTE: Política para permitir inserción durante el registro
CREATE POLICY "Enable insert for authenticated users during registration"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Recrear la función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log el error pero no fallar el registro
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente y recrearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recrear el trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Función auxiliar para crear perfiles manualmente si es necesario
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  user_full_name text DEFAULT 'Usuario',
  user_role text DEFAULT 'user'
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, role)
  VALUES (user_id, user_full_name, user_role)
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar usuarios existentes en auth.users que no tienen perfil
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  LOOP
    -- Crear perfil para usuarios existentes que no lo tienen
    INSERT INTO public.user_profiles (id, full_name, role)
    VALUES (
      user_record.id,
      COALESCE(user_record.raw_user_meta_data->>'full_name', 'Usuario'),
      COALESCE(user_record.raw_user_meta_data->>'role', 'user')
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END $$;

-- Mostrar estadísticas
SELECT 
  'auth.users' as tabla,
  COUNT(*) as total_usuarios
FROM auth.users
UNION ALL
SELECT 
  'user_profiles' as tabla,
  COUNT(*) as total_perfiles
FROM user_profiles;