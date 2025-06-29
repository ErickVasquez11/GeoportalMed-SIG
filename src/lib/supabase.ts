import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Configuración de Supabase:');
console.log('URL:', supabaseUrl || 'NO ESTÁ CONFIGURADA');
console.log('Key:', supabaseAnonKey ? 'Presente' : 'NO ESTÁ CONFIGURADA');

// Verificar si las variables están correctamente configuradas
const isConfigured = supabaseUrl && 
                     supabaseAnonKey && 
                     supabaseUrl.includes('supabase.co');

if (!isConfigured) {
  console.error('⚠️ Supabase NO está configurado correctamente.');
  console.error('📝 Asegúrate de que en tu archivo .env tienes:');
  console.error('   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=tu-clave-anónima');
  throw new Error('Configuración de Supabase incorrecta.');
}

// Crear cliente solo si está correctamente configurado
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Función para verificar conexión y sesión
export async function verificarSupabase() {
  try {
    // Verificar conexión a la base (ajusta si quieres otra tabla)
    const { count, error } = await supabase.from('medical_centers').select('id', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Error al conectar con la base:', error.message);
    } else {
      console.log(`✅ Conexión exitosa. Centros médicos: ${count}`);
    }

    // Verificar sesión activa
    const { data: sessionData, error: errorAuth } = await supabase.auth.getSession();
    if (errorAuth) {
      console.error('❌ Error en autenticación:', errorAuth.message);
    } else {
      console.log('🔐 Sistema de autenticación listo.');
      if (sessionData.session) {
        console.log('👤 Usuario logueado:', sessionData.session.user.email);
      } else {
        console.log('🛈 No hay usuario logueado.');
      }
    }
  } catch (err) {
    console.error('Error en verificación:', err);
  }
}

// Llamar a esta función al cargar tu app o cuando sea conveniente
verificarSupabase();
