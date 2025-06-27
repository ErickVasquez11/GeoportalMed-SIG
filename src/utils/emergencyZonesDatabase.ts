import { supabase } from '../lib/supabase';

// Tipos para las zonas de emergencia en la base de datos
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

// Función para obtener zonas de emergencia desde Supabase
export const fetchEmergencyZones = async (): Promise<EmergencyZoneDB[]> => {
  try {
    const { data, error } = await supabase
      .from('emergency_zones')
      .select('*')
      .eq('active', true)
      .order('emergency_rate', { ascending: false });

    if (error) {
      console.error('Error fetching emergency zones:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Error in fetchEmergencyZones:', err);
    return [];
  }
};

// Función para obtener incidentes de emergencia desde Supabase
export const fetchEmergencyIncidents = async (): Promise<EmergencyIncidentDB[]> => {
  try {
    const { data, error } = await supabase
      .from('emergency_incidents')
      .select('*')
      .order('reported_at', { ascending: false })
      .limit(50); // Últimos 50 incidentes

    if (error) {
      console.error('Error fetching emergency incidents:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Error in fetchEmergencyIncidents:', err);
    return [];
  }
};

// Función para obtener estadísticas de emergencia
export const fetchEmergencyStats = async () => {
  try {
    const { data, error } = await supabase
      .from('emergency_stats')
      .select('*')
      .order('last_calculated', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching emergency stats:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in fetchEmergencyStats:', err);
    return null;
  }
};

// Función para crear una nueva zona de emergencia
export const createEmergencyZone = async (zone: Omit<EmergencyZoneDB, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('emergency_zones')
      .insert([zone])
      .select()
      .single();

    if (error) {
      console.error('Error creating emergency zone:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in createEmergencyZone:', err);
    throw err;
  }
};

// Función para crear un nuevo incidente de emergencia
export const createEmergencyIncident = async (incident: Omit<EmergencyIncidentDB, 'id' | 'reported_at'>) => {
  try {
    const { data, error } = await supabase
      .from('emergency_incidents')
      .insert([incident])
      .select()
      .single();

    if (error) {
      console.error('Error creating emergency incident:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in createEmergencyIncident:', err);
    throw err;
  }
};

// Función para actualizar el estado de un incidente
export const updateIncidentStatus = async (incidentId: string, resolved: boolean, responseTime?: number) => {
  try {
    const updateData: any = {
      resolved,
      updated_at: new Date().toISOString()
    };

    if (resolved) {
      updateData.resolved_at = new Date().toISOString();
      if (responseTime) {
        updateData.response_time = responseTime;
      }
    }

    const { data, error } = await supabase
      .from('emergency_incidents')
      .update(updateData)
      .eq('id', incidentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating incident status:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error in updateIncidentStatus:', err);
    throw err;
  }
};

// Función para obtener zonas de riesgo por nivel
export const getZonesByRiskLevel = async (riskLevel: string) => {
  try {
    const { data, error } = await supabase
      .from('emergency_zones')
      .select('*')
      .eq('risk_level', riskLevel)
      .eq('active', true)
      .order('emergency_rate', { ascending: false });

    if (error) {
      console.error('Error fetching zones by risk level:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Error in getZonesByRiskLevel:', err);
    return [];
  }
};

// Función para obtener incidentes por zona
export const getIncidentsByZone = async (zoneId: string) => {
  try {
    const { data, error } = await supabase
      .from('emergency_incidents')
      .select('*')
      .eq('zone_id', zoneId)
      .order('reported_at', { ascending: false });

    if (error) {
      console.error('Error fetching incidents by zone:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Error in getIncidentsByZone:', err);
    return [];
  }
};