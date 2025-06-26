import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MedicalCenter } from '../types';
import { medicalCenters as mockData } from '../data/medicalCenters';

export const useMedicalCenters = () => {
  const [medicalCenters, setMedicalCenters] = useState<MedicalCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co' &&
                               import.meta.env.VITE_SUPABASE_URL.includes('supabase.co');

  const fetchMedicalCenters = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.log('⚠️ Supabase not configured - using mock data');
        // Usar datos mock si Supabase no está configurado
        setTimeout(() => {
          setMedicalCenters(mockData);
          setLoading(false);
        }, 1000); // Simular carga
        return;
      }

      console.log('🔄 Fetching medical centers from Supabase...');
      const { data, error } = await supabase
        .from('medical_centers')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Successfully fetched', data?.length || 0, 'medical centers from Supabase');

      // Transformar los datos de Supabase al formato de la aplicación
      const transformedData: MedicalCenter[] = data.map(center => ({
        id: center.id,
        name: center.name,
        type: center.type,
        lat: parseFloat(center.lat),
        lng: parseFloat(center.lng),
        address: center.address,
        phone: center.phone,
        schedule: center.schedule,
        services: Array.isArray(center.services) ? center.services : [],
        emergency: center.emergency
      }));

      setMedicalCenters(transformedData);
    } catch (err) {
      console.error('❌ Error fetching medical centers:', err);
      
      // En caso de error, usar datos mock como fallback
      console.log('🔄 Using mock data as fallback');
      setMedicalCenters(mockData);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const addMedicalCenter = async (center: Omit<MedicalCenter, 'id'>) => {
    if (!isSupabaseConfigured) {
      // En modo mock, simular adición
      const newCenter: MedicalCenter = {
        ...center,
        id: Date.now().toString()
      };
      setMedicalCenters(prev => [...prev, newCenter]);
      return newCenter;
    }

    try {
      console.log('🔄 Adding medical center to Supabase...');
      const { data, error } = await supabase
        .from('medical_centers')
        .insert([{
          name: center.name,
          type: center.type,
          lat: center.lat,
          lng: center.lng,
          address: center.address,
          phone: center.phone,
          schedule: center.schedule,
          services: center.services,
          emergency: center.emergency
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Medical center added successfully');

      const newCenter: MedicalCenter = {
        id: data.id,
        name: data.name,
        type: data.type,
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lng),
        address: data.address,
        phone: data.phone,
        schedule: data.schedule,
        services: Array.isArray(data.services) ? data.services : [],
        emergency: data.emergency
      };

      setMedicalCenters(prev => [...prev, newCenter]);
      return newCenter;
    } catch (err) {
      console.error('❌ Error adding medical center:', err);
      throw err;
    }
  };

  const updateMedicalCenter = async (id: string, updates: Partial<MedicalCenter>) => {
    if (!isSupabaseConfigured) {
      // En modo mock, simular actualización
      setMedicalCenters(prev => 
        prev.map(center => 
          center.id === id 
            ? { ...center, ...updates }
            : center
        )
      );
      return;
    }

    try {
      console.log('🔄 Updating medical center in Supabase...');
      const { data, error } = await supabase
        .from('medical_centers')
        .update({
          name: updates.name,
          type: updates.type,
          lat: updates.lat,
          lng: updates.lng,
          address: updates.address,
          phone: updates.phone,
          schedule: updates.schedule,
          services: updates.services,
          emergency: updates.emergency,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('✅ Medical center updated successfully');

      setMedicalCenters(prev => 
        prev.map(center => 
          center.id === id 
            ? { ...center, ...updates }
            : center
        )
      );

      return data;
    } catch (err) {
      console.error('❌ Error updating medical center:', err);
      throw err;
    }
  };

  const deleteMedicalCenter = async (id: string) => {
    if (!isSupabaseConfigured) {
      // En modo mock, simular eliminación
      setMedicalCenters(prev => prev.filter(center => center.id !== id));
      return;
    }

    try {
      console.log('🔄 Deleting medical center from Supabase...');
      const { error } = await supabase
        .from('medical_centers')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      console.log('✅ Medical center deleted successfully');
      setMedicalCenters(prev => prev.filter(center => center.id !== id));
    } catch (err) {
      console.error('❌ Error deleting medical center:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMedicalCenters();
  }, []);

  return {
    medicalCenters,
    loading,
    error,
    refetch: fetchMedicalCenters,
    addMedicalCenter,
    updateMedicalCenter,
    deleteMedicalCenter,
    isSupabaseConfigured
  };
};