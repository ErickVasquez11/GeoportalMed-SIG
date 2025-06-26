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