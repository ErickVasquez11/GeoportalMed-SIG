import { createClient } from '@supabase/supabase-js';

// Obtener variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('URL:', supabaseUrl || 'NOT SET');
console.log('Key:', supabaseAnonKey ? 'Present' : 'NOT SET');

// Verificar si las variables están configuradas correctamente
const isConfigured = supabaseUrl && 
                    supabaseAnonKey && 
                    supabaseUrl !== 'https://ijppxtiavgsbijwpfrqi.supabase.co' &&
                    supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcHB4dGlhdmdzYmlqd3BmcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDE3MTQsImV4cCI6MjA2NTI3NzcxNH0.cPlGztYWCKynZ06HXaqGa3Z5-ZFscXu-drhA1feDV0M' &&
                    supabaseUrl.includes('supabase.co');

if (!isConfigured) {
  console.warn('⚠️ Supabase not configured properly. Please check your .env file.');
  console.warn('📝 Make sure you have:');
  console.warn('   VITE_SUPABASE_URL=https://ijppxtiavgsbijwpfrqi.supabase.co');
  console.warn('   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcHB4dGlhdmdzYmlqd3BmcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDE3MTQsImV4cCI6MjA2NTI3NzcxNH0.cPlGztYWCKynZ06HXaqGa3Z5-ZFscXu-drhA1feDV0M');
} else {
  console.log('✅ Supabase configured correctly');
}

// Crear cliente con valores por defecto si no están configurados
export const supabase = createClient(
  supabaseUrl || 'https://ijppxtiavgsbijwpfrqi.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcHB4dGlhdmdzYmlqd3BmcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDE3MTQsImV4cCI6MjA2NTI3NzcxNH0.cPlGztYWCKynZ06HXaqGa3Z5-ZFscXu-drhA1feDV0M',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Test connection solo si está configurado
if (isConfigured) {
  console.log('🔄 Testing Supabase connection...');
  
  // Test básico de conexión
  supabase.from('medical_centers').select('count', { count: 'exact', head: true })
    .then(({ count, error }) => {
      if (error) {
        console.error('❌ Error connecting to Supabase:', error.message);
        console.error('🔍 Check your database URL and API key');
      } else {
        console.log('✅ Connected to Supabase successfully');
        console.log(`📊 Found ${count} medical centers in database`);
      }
    })
    .catch((err) => {
      console.error('❌ Connection test failed:', err);
    });

  // Test de autenticación
  supabase.auth.getSession()
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Auth test failed:', error.message);
      } else {
        console.log('🔐 Auth system ready');
        if (data.session) {
          console.log('👤 User already logged in:', data.session.user.email);
        }
      }
    })
    .catch((err) => {
      console.error('❌ Auth test error:', err);
    });
} else {
  console.log('🔄 Running in demo mode - Supabase not configured');
  console.log('📝 To connect to real data, configure your .env file with:');
  console.log('    VITE_SUPABASE_URL=https://ijppxtiavgsbijwpfrqi.supabase.co');
  console.log('   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqcHB4dGlhdmdzYmlqd3BmcnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3MDE3MTQsImV4cCI6MjA2NTI3NzcxNH0.cPlGztYWCKynZ06HXaqGa3Z5-ZFscXu-drhA1feDV0M');
}

export { isConfigured as isSupabaseConfigured };