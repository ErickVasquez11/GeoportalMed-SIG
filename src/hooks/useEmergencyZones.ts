import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface EmergencyZone {
  id: string;
  name: string;
  municipality: string;
  department: string;
  lat: number;
  lng: number;
  radius: number;
  population: number;
  emergency_rate: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  nearest_hospitals: string[];
  average_response_time: number;
  monthly_incidents: number;
  yearly_incidents: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmergencyZones = () => {
  const [emergencyZones, setEmergencyZones] = useState<EmergencyZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co' &&
                               import.meta.env.VITE_SUPABASE_URL.includes('supabase.co');

  const fetchEmergencyZones = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.log('⚠️ Supabase not configured - emergency zones not available');
        setEmergencyZones([]);
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching emergency zones from Supabase...');
      const { data, error } = await supabase
        .from('emergency_zones')
        .select('*')
        .eq('active', true)
        .order('emergency_rate', { ascending: false });

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Successfully fetched', data?.length || 0, 'emergency zones from Supabase');
      setEmergencyZones(data || []);
    } catch (err) {
      console.error('❌ Error fetching emergency zones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setEmergencyZones([]);
    } finally {
      setLoading(false);
    }
  };

  const addEmergencyZone = async (zone: Omit<EmergencyZone, 'id' | 'created_at' | 'updated_at'>) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado');
    }

    try {
      console.log('🔄 Adding emergency zone to Supabase...');
      const { data, error } = await supabase
        .from('emergency_zones')
        .insert([zone])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Emergency zone added successfully');
      setEmergencyZones(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('❌ Error adding emergency zone:', err);
      throw err;
    }
  };

  const updateEmergencyZone = async (id: string, updates: Partial<EmergencyZone>) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado');
    }

    try {
      console.log('🔄 Updating emergency zone in Supabase...');
      const { data, error } = await supabase
        .from('emergency_zones')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Emergency zone updated successfully');
      setEmergencyZones(prev => 
        prev.map(zone => 
          zone.id === id 
            ? { ...zone, ...updates }
            : zone
        )
      );

      return data;
    } catch (err) {
      console.error('❌ Error updating emergency zone:', err);
      throw err;
    }
  };

  const deleteEmergencyZone = async (id: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase no está configurado');
    }

    try {
      console.log('🔄 Deleting emergency zone from Supabase...');
      const { error } = await supabase
        .from('emergency_zones')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('✅ Emergency zone deleted successfully');
      setEmergencyZones(prev => prev.filter(zone => zone.id !== id));
    } catch (err) {
      console.error('❌ Error deleting emergency zone:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchEmergencyZones();
  }, []);

  return {
    emergencyZones,
    loading,
    error,
    refetch: fetchEmergencyZones,
    addEmergencyZone,
    updateEmergencyZone,
    deleteEmergencyZone,
    isSupabaseConfigured
  };
};