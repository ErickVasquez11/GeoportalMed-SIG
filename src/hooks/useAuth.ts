import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co';

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('🔄 Initializing authentication...');
      
      try {
        if (!isSupabaseConfigured) {
          console.log('⚠️ Supabase not configured - using mock admin user');
          
          // Crear usuario mock para desarrollo
          const mockUser = {
            id: 'mock-admin-id',
            email: 'admin@demo.com',
            user_metadata: {
              full_name: 'Administrador Demo',
              role: 'admin'
            }
          } as User;

          const mockProfile = {
            id: 'mock-admin-id',
            full_name: 'Administrador Demo',
            role: 'admin' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          if (mounted) {
            setUser(mockUser);
            setUserProfile(mockProfile);
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // Para Supabase configurado, obtener sesión
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // Crear perfil básico sin consultar la base de datos
            const basicProfile = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'Usuario',
              role: (session.user.user_metadata?.role || 'user') as 'user' | 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setUserProfile(basicProfile);
            setIsAdmin(basicProfile.role === 'admin');
          } else {
            setUserProfile(null);
            setIsAdmin(false);
          }
          
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in initializeAuth:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Inicializar inmediatamente
    initializeAuth();

    // Configurar listener solo si Supabase está configurado
    let subscription: any = null;
    
    if (isSupabaseConfigured) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event);
          
          if (!mounted) return;
          
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const basicProfile = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'Usuario',
              role: (session.user.user_metadata?.role || 'user') as 'user' | 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setUserProfile(basicProfile);
            setIsAdmin(basicProfile.role === 'admin');
          } else {
            setUserProfile(null);
            setIsAdmin(false);
          }
        }
      );
      
      subscription = authSubscription;
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []); // Sin dependencias para evitar bucles

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (err) {
      console.error('Error in signOut:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // En modo mock, simular login exitoso para admin
      if (email === '' && password === '') {
        const mockUser = {
          id: 'mock-admin-id',
          email: '',
          user_metadata: {
            full_name: 'Administrador Demo',
            role: 'admin'
          }
        } as User;

        const mockProfile = {
          id: 'mock-admin-id',
          full_name: 'Administrador Demo',
          role: 'admin' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setUser(mockUser);
        setUserProfile(mockProfile);
        setIsAdmin(true);

        return { data: { user: mockUser }, error: null };
      } else {
        return { data: null, error: new Error('Credenciales incorrectas') };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error in signIn:', err);
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      return { data: null, error: new Error('Registro no disponible en modo demo') };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'user'
          }
        }
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error in signUp:', err);
      return { data: null, error: err };
    }
  };

  return {
    user,
    userProfile,
    loading,
    isAdmin,
    signOut,
    signIn,
    signUp,
    isSupabaseConfigured
  };
};