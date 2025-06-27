import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Tipos para las zonas de emergencia desde la base de datos
export interface EmergencyZoneDB {
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

export interface EmergencyIncidentDB {
  id: string;
  incident_type: 'medical' | 'accident' | 'cardiac' | 'respiratory' | 'trauma' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lat: number;
  lng: number;
  zone_id: string;
  hospital_id?: string;
  response_time?: number;
  resolved: boolean;
  description?: string;
  reported_at: string;
  resolved_at?: string;
}

// Datos mock para cuando Supabase no está configurado
const mockEmergencyZones: EmergencyZoneDB[] = [
  {
    id: 'zone-ss-centro',
    name: 'Centro Histórico San Salvador',
    municipality: 'San Salvador',
    department: 'San Salvador',
    lat: 13.6929,
    lng: -89.2182,
    radius: 2000,
    population: 85000,
    emergency_rate: 45.2,
    risk_level: 'critical',
    nearest_hospitals: ['1', '2'],
    average_response_time: 8.5,
    monthly_incidents: 32,
    yearly_incidents: 384,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'zone-ss-soyapango',
    name: 'Soyapango Norte',
    municipality: 'Soyapango',
    department: 'San Salvador',
    lat: 13.7420,
    lng: -89.1401,
    radius: 3000,
    population: 120000,
    emergency_rate: 38.7,
    risk_level: 'high',
    nearest_hospitals: ['1'],
    average_response_time: 12.3,
    monthly_incidents: 39,
    yearly_incidents: 464,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'zone-ss-mejicanos',
    name: 'Mejicanos Centro',
    municipality: 'Mejicanos',
    department: 'San Salvador',
    lat: 13.7408,
    lng: -89.2147,
    radius: 2500,
    population: 95000,
    emergency_rate: 41.1,
    risk_level: 'high',
    nearest_hospitals: ['1', '4'],
    average_response_time: 10.8,
    monthly_incidents: 33,
    yearly_incidents: 390,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'zone-sa-centro',
    name: 'Santa Ana Centro',
    municipality: 'Santa Ana',
    department: 'Santa Ana',
    lat: 13.9944,
    lng: -89.5594,
    radius: 2200,
    population: 65000,
    emergency_rate: 28.4,
    risk_level: 'medium',
    nearest_hospitals: ['6'],
    average_response_time: 9.2,
    monthly_incidents: 15,
    yearly_incidents: 185,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'zone-chalatenango',
    name: 'Chalatenango Rural',
    municipality: 'Chalatenango',
    department: 'Chalatenango',
    lat: 14.0333,
    lng: -88.9333,
    radius: 5000,
    population: 45000,
    emergency_rate: 52.3,
    risk_level: 'critical',
    nearest_hospitals: [],
    average_response_time: 25.7,
    monthly_incidents: 20,
    yearly_incidents: 235,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockEmergencyIncidents: EmergencyIncidentDB[] = [
  {
    id: 'inc-001',
    incident_type: 'cardiac',
    severity: 'critical',
    lat: 13.6929,
    lng: -89.2182,
    zone_id: 'zone-ss-centro',
    hospital_id: '1',
    response_time: 7,
    resolved: true,
    description: 'Infarto agudo de miocardio',
    reported_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inc-002',
    incident_type: 'accident',
    severity: 'high',
    lat: 13.7420,
    lng: -89.1401,
    zone_id: 'zone-ss-soyapango',
    hospital_id: '1',
    response_time: 15,
    resolved: true,
    description: 'Accidente de tránsito múltiple',
    reported_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inc-003',
    incident_type: 'trauma',
    severity: 'critical',
    lat: 14.0333,
    lng: -88.9333,
    zone_id: 'zone-chalatenango',
    resolved: false,
    description: 'Trauma múltiple por accidente rural',
    reported_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  }
];

export const useEmergencyData = () => {
  const [emergencyZones, setEmergencyZones] = useState<EmergencyZoneDB[]>([]);
  const [emergencyIncidents, setEmergencyIncidents] = useState<EmergencyIncidentDB[]>([]);
  const [emergencyStats, setEmergencyStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si Supabase está configurado
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
                               import.meta.env.VITE_SUPABASE_ANON_KEY &&
                               import.meta.env.VITE_SUPABASE_URL !== 'https://demo.supabase.co' &&
                               import.meta.env.VITE_SUPABASE_URL.includes('supabase.co');

  const loadEmergencyData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        console.log('⚠️ Supabase not configured - using mock emergency data');
        // Simular carga con datos mock
        setTimeout(() => {
          setEmergencyZones(mockEmergencyZones);
          setEmergencyIncidents(mockEmergencyIncidents);
          setEmergencyStats({
            total_incidents: mockEmergencyIncidents.length,
            total_resolved: mockEmergencyIncidents.filter(i => i.resolved).length,
            average_response_time: 11.2,
            critical_zones: mockEmergencyZones.filter(z => z.risk_level === 'critical').length,
            hospitals_with_emergency: 5,
            last_calculated: new Date().toISOString()
          });
          setLoading(false);
        }, 1000);
        return;
      }

      console.log('🔄 Loading emergency data from Supabase...');

      // Cargar zonas de emergencia
      const { data: zonesData, error: zonesError } = await supabase
        .from('emergency_zones')
        .select('*')
        .eq('active', true)
        .order('emergency_rate', { ascending: false });

      if (zonesError) {
        console.error('Error loading emergency zones:', zonesError);
        throw zonesError;
      }

      // Cargar incidentes de emergencia (si la tabla existe)
      let incidentsData: EmergencyIncidentDB[] = [];
      try {
        const { data: incidents, error: incidentsError } = await supabase
          .from('emergency_incidents')
          .select('*')
          .order('reported_at', { ascending: false })
          .limit(50);

        if (!incidentsError && incidents) {
          incidentsData = incidents;
        }
      } catch (err) {
        console.log('Emergency incidents table not found, using mock data');
        incidentsData = mockEmergencyIncidents;
      }

      // Cargar estadísticas (si la tabla existe)
      let statsData = null;
      try {
        const { data: stats, error: statsError } = await supabase
          .from('emergency_stats')
          .select('*')
          .order('last_calculated', { ascending: false })
          .limit(1)
          .single();

        if (!statsError && stats) {
          statsData = stats;
        }
      } catch (err) {
        console.log('Emergency stats table not found, calculating from data');
      }

      // Si no hay estadísticas, calcularlas
      if (!statsData) {
        statsData = {
          total_incidents: incidentsData.length,
          total_resolved: incidentsData.filter(i => i.resolved).length,
          average_response_time: 11.2,
          critical_zones: zonesData.filter((z: any) => z.risk_level === 'critical' || z.risk_level === 'high').length,
          hospitals_with_emergency: 5,
          last_calculated: new Date().toISOString()
        };
      }

      setEmergencyZones(zonesData || []);
      setEmergencyIncidents(incidentsData);
      setEmergencyStats(statsData);

      console.log('✅ Emergency data loaded successfully');
      console.log(`📊 Loaded ${zonesData?.length || 0} zones, ${incidentsData.length} incidents`);

    } catch (err) {
      console.error('❌ Error loading emergency data:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      
      // Usar datos mock como fallback
      setEmergencyZones(mockEmergencyZones);
      setEmergencyIncidents(mockEmergencyIncidents);
      setEmergencyStats({
        total_incidents: mockEmergencyIncidents.length,
        total_resolved: mockEmergencyIncidents.filter(i => i.resolved).length,
        average_response_time: 11.2,
        critical_zones: mockEmergencyZones.filter(z => z.risk_level === 'critical').length,
        hospitals_with_emergency: 5,
        last_calculated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmergencyData();
  }, []);

  return {
    emergencyZones,
    emergencyIncidents,
    emergencyStats,
    loading,
    error,
    refetch: loadEmergencyData,
    isSupabaseConfigured
  };
};