export interface MedicalCenter {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'health_center';
  lat: number;
  lng: number;
  address: string;
  phone: string;
  schedule: string;
  services: string[];
  emergency: boolean;
}

export interface CoverageStats {
  coveredArea: number;
  uncoveredArea: number;
  totalCenters: number;
  population: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}

export interface RouteInfo {
  distance: number;
  duration: number;
  instructions: string[];
}

export interface LayerControls {
  coverage: boolean;
  riskZones: boolean;
  populationDensity: boolean;
}
// 🚨 NUEVAS INTERFACES PARA ZONAS DE EMERGENCIA
export interface EmergencyZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // Radio en metros
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  emergencyRate: number; // Tasa de emergencias por 1000 habitantes
  population: number;
  nearestHospitals: string[]; // IDs de hospitales más cercanos
  averageResponseTime: number; // Tiempo promedio de respuesta en minutos
  lastUpdated: string;
}

export interface EmergencyIncident {
  id: string;
  type: 'medical' | 'accident' | 'cardiac' | 'respiratory' | 'trauma' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lat: number;
  lng: number;
  timestamp: string;
  responseTime?: number; // en minutos
  hospitalId?: string; // Hospital que atendió
  resolved: boolean;
}

export interface EmergencyStats {
  totalIncidents: number;
  averageResponseTime: number;
  criticalZones: number;
  hospitalsWithEmergency: number;
  lastUpdate: string;
}