-- SQL para crear un usuario administrador en Supabase
-- Ejecuta este código en el SQL Editor de tu dashboard de Supabase

-- 1. Crear el usuario en auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@geoportal.sv',  -- Cambia este email por el que quieras
  crypt('admin123', gen_salt('bf')),  -- Cambia esta contraseña
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administrador del Sistema", "role": "admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Obtener el ID del usuario recién creado
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Buscar el ID del usuario por email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'admin@geoportal.sv';
  
  -- Crear el perfil en user_profiles si no existe
  IF user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, full_name, role)
    VALUES (user_id, 'Administrador del Sistema', 'admin')
    ON CONFLICT (id) DO UPDATE SET
      full_name = 'Administrador del Sistema',
      role = 'admin',
      updated_at = now();
    
    RAISE NOTICE 'Usuario administrador creado con ID: %', user_id;
  ELSE
    RAISE NOTICE 'No se pudo encontrar el usuario creado';
  END IF;
END $$;

-- 3. Verificar que el usuario fue creado correctamente
SELECT 
  au.email,
  au.email_confirmed_at,
  up.full_name,
  up.role,
  up.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE au.email = 'admin@geoportal.sv';

-- 4. (Opcional) Crear usuarios adicionales de prueba
-- Descomenta las siguientes líneas si quieres crear más usuarios

/*
-- Usuario regular de prueba
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'usuario@geoportal.sv',
  crypt('usuario123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Usuario de Prueba", "role": "user"}',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Crear perfil para el usuario regular
DO $$
DECLARE
  user_id uuid;
BEGIN
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'usuario@geoportal.sv';
  
  IF user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, full_name, role)
    VALUES (user_id, 'Usuario de Prueba', 'user')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
*/

-- 5. Mostrar todos los usuarios creados
SELECT 
  au.email,
  up.full_name,
  up.role,
  au.email_confirmed_at IS NOT NULL as email_confirmado,
  up.created_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY up.role DESC, au.created_at;