import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PopulationZone {
  id: string;
  name: string;
  municipality: string;
  department: string;
  lat: number;
  lng: number;
  radius: number;
  population: number;
  population_density: number;
  density_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  area_km2: number;
  urban_percentage: number;
  rural_percentage: number;
  growth_rate: number;
  age_groups: {
    children: number;
    adults: number;
    elderly: number;
  };
  economic_activity: string[];
  infrastructure_level: 'basic' | 'intermediate' | 'advanced';
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Datos mock para cuando Supabase no está configurado
const mockPopulationZones: PopulationZone[] = [
  {
    id: 'pop-ss-metro',
    name: 'Área Metropolitana San Salvador',
    municipality: 'San Salvador',
    department: 'San Salvador',
    lat: 13.7042,
    lng: -89.2042,
    radius: 5000,
    population: 316090,
    population_density: 11175.4,
    density_level: 'very_high',
    area_km2: 28.3,
    urban_percentage: 95.2,
    rural_percentage: 4.8,
    growth_rate: 0.8,
    age_groups: {
      children: 85000,
      adults: 205000,
      elderly: 26090
    },
    economic_activity: ['Comercio', 'Servicios', 'Industria', 'Gobierno'],
    infrastructure_level: 'advanced',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pop-sa-centro',
    name: 'Santa Ana Centro',
    municipality: 'Santa Ana',
    department: 'Santa Ana',
    lat: 13.9944,
    lng: -89.5594,
    radius: 4000,
    population: 245421,
    population_density: 2845.6,
    density_level: 'high',
    area_km2: 86.2,
    urban_percentage: 78.5,
    rural_percentage: 21.5,
    growth_rate: 1.2,
    age_groups: {
      children: 68000,
      adults: 155000,
      elderly: 22421
    },
    economic_activity: ['Agricultura', 'Comercio', 'Servicios', 'Industria Textil'],
    infrastructure_level: 'intermediate',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pop-sm-centro',
    name: 'San Miguel Centro',
    municipality: 'San Miguel',
    department: 'San Miguel',
    lat: 13.4833,
    lng: -88.1833,
    radius: 4500,
    population: 218410,
    population_density: 1892.3,
    density_level: 'medium',
    area_km2: 115.4,
    urban_percentage: 72.8,
    rural_percentage: 27.2,
    growth_rate: 1.5,
    age_groups: {
      children: 62000,
      adults: 138000,
      elderly: 18410
    },
    economic_activity: ['Agricultura', 'Ganadería', 'Comercio', 'Servicios'],
    infrastructure_level: 'intermediate',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const usePopulationData = () => {
  const [populationZones, setPopulationZones] = useState<PopulationZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co' &&
                               import.meta.env.VITE_SUPABASE_URL.includes('supabase.co');

  const loadPopulationData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.log('⚠️ Supabase not configured - using mock population data');
        // Simular carga con datos mock
        setTimeout(() => {
          setPopulationZones(mockPopulationZones);
          setLoading(false);
        }, 1000);
        return;
      }

      console.log('🔄 Loading population data from Supabase...');

      // Cargar zonas de densidad poblacional
      const { data: zonesData, error: zonesError } = await supabase
        .from('population_density_zones')
        .select('*')
        .eq('active', true)
        .order('population_density', { ascending: false });

      if (zonesError) {
        console.error('Error loading population zones:', zonesError);
        throw zonesError;
      }

      setPopulationZones(zonesData || []);

      console.log('✅ Population data loaded successfully');
      console.log(`📊 Loaded ${zonesData?.length || 0} population zones`);

    } catch (err) {
      console.error('❌ Error loading population data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Usar datos mock como fallback
      setPopulationZones(mockPopulationZones);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPopulationData();
  }, []);

  return {
    populationZones,
    loading,
    error,
    refetch: loadPopulationData,
    isSupabaseConfigured
  };
};