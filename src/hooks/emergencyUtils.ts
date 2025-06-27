import { MedicalCenter, EmergencyZone, EmergencyIncident, UserLocation } from '../types';

// 🎯 DATOS SIMULADOS DE ZONAS DE EMERGENCIA PARA EL SALVADOR
export const emergencyZones: EmergencyZone[] = [
  // San Salvador - Zonas críticas
  {
    id: 'zone-ss-centro',
    name: 'Centro Histórico San Salvador',
    lat: 13.6929,
    lng: -89.2182,
    radius: 2000,
    riskLevel: 'critical',
    emergencyRate: 45.2,
    population: 85000,
    nearestHospitals: ['1', '2'], // Hospital Rosales, Hospital de Diagnóstico
    averageResponseTime: 8.5,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'zone-ss-soyapango',
    name: 'Soyapango',
    lat: 13.7420,
    lng: -89.1401,
    radius: 3000,
    riskLevel: 'high',
    emergencyRate: 38.7,
    population: 120000,
    nearestHospitals: ['1'],
    averageResponseTime: 12.3,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'zone-ss-mejicanos',
    name: 'Mejicanos',
    lat: 13.7408,
    lng: -89.2147,
    radius: 2500,
    riskLevel: 'high',
    emergencyRate: 41.1,
    population: 95000,
    nearestHospitals: ['1', '4'],
    averageResponseTime: 10.8,
    lastUpdated: new Date().toISOString()
  },

  // Santa Ana
  {
    id: 'zone-sa-centro',
    name: 'Centro Santa Ana',
    lat: 13.9944,
    lng: -89.5594,
    radius: 2200,
    riskLevel: 'medium',
    emergencyRate: 28.4,
    population: 65000,
    nearestHospitals: ['6'],
    averageResponseTime: 9.2,
    lastUpdated: new Date().toISOString()
  },

  // San Miguel
  {
    id: 'zone-sm-centro',
    name: 'Centro San Miguel',
    lat: 13.4833,
    lng: -88.1833,
    radius: 2800,
    riskLevel: 'medium',
    emergencyRate: 32.6,
    population: 78000,
    nearestHospitals: ['8'],
    averageResponseTime: 11.5,
    lastUpdated: new Date().toISOString()
  },

  // Zonas rurales con menor cobertura
  {
    id: 'zone-chalatenango',
    name: 'Chalatenango Rural',
    lat: 14.0333,
    lng: -88.9333,
    radius: 5000,
    riskLevel: 'high',
    emergencyRate: 52.3,
    population: 45000,
    nearestHospitals: [],
    averageResponseTime: 25.7,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'zone-usulutan',
    name: 'Usulután Rural',
    lat: 13.3500,
    lng: -88.4500,
    radius: 4500,
    riskLevel: 'high',
    emergencyRate: 48.9,
    population: 38000,
    nearestHospitals: [],
    averageResponseTime: 22.1,
    lastUpdated: new Date().toISOString()
  }
];

// 🚨 INCIDENTES DE EMERGENCIA SIMULADOS
export const emergencyIncidents: EmergencyIncident[] = [
  {
    id: 'inc-001',
    type: 'cardiac',
    severity: 'critical',
    lat: 13.6929,
    lng: -89.2182,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    responseTime: 7,
    hospitalId: '1',
    resolved: true
  },
  {
    id: 'inc-002',
    type: 'accident',
    severity: 'high',
    lat: 13.7420,
    lng: -89.1401,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    responseTime: 15,
    hospitalId: '1',
    resolved: true
  },
  {
    id: 'inc-003',
    type: 'medical',
    severity: 'medium',
    lat: 13.9944,
    lng: -89.5594,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    responseTime: 8,
    hospitalId: '6',
    resolved: true
  },
  {
    id: 'inc-004',
    type: 'trauma',
    severity: 'critical',
    lat: 14.0333,
    lng: -88.9333,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
    responseTime: undefined,
    resolved: false
  }
];

// 🎨 COLORES PARA ZONAS DE RIESGO
export const getRiskZoneColor = (riskLevel: EmergencyZone['riskLevel']): string => {
  switch (riskLevel) {
    case 'low':
      return '#10B981'; // Verde
    case 'medium':
      return '#F59E0B'; // Amarillo/Naranja
    case 'high':
      return '#EF4444'; // Rojo
    case 'critical':
      return '#7C2D12'; // Rojo oscuro
    default:
      return '#6B7280';
  }
};

// 📊 CALCULAR ESTADÍSTICAS DE EMERGENCIA
export const calculateEmergencyStats = (
  zones: EmergencyZone[],
  incidents: EmergencyIncident[],
  hospitals: MedicalCenter[]
): any => {
  const criticalZones = zones.filter(zone => zone.riskLevel === 'critical' || zone.riskLevel === 'high').length;
  const hospitalsWithEmergency = hospitals.filter(h => h.emergency).length;
  
  const resolvedIncidents = incidents.filter(inc => inc.resolved && inc.responseTime);
  const averageResponseTime = resolvedIncidents.length > 0 
    ? resolvedIncidents.reduce((sum, inc) => sum + (inc.responseTime || 0), 0) / resolvedIncidents.length
    : 0;

  return {
    totalIncidents: incidents.length,
    averageResponseTime: Math.round(averageResponseTime * 10) / 10,
    criticalZones,
    hospitalsWithEmergency,
    lastUpdate: new Date().toISOString()
  };
};

// 🔍 ENCONTRAR ZONA DE EMERGENCIA MÁS CERCANA
export const findNearestEmergencyZone = (
  userLocation: UserLocation,
  zones: EmergencyZone[]
): EmergencyZone | null => {
  if (!userLocation || zones.length === 0) return null;

  let nearest = zones[0];
  let minDistance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    nearest.lat,
    nearest.lng
  );

  for (const zone of zones) {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      zone.lat,
      zone.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = zone;
    }
  }

  return nearest;
};

// 📏 CALCULAR DISTANCIA (reutilizada de mapUtils)
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 🎯 OBTENER NIVEL DE RIESGO BASADO EN TASA DE EMERGENCIAS
export const getRiskLevelFromRate = (emergencyRate: number): EmergencyZone['riskLevel'] => {
  if (emergencyRate >= 40) return 'critical';
  if (emergencyRate >= 30) return 'high';
  if (emergencyRate >= 20) return 'medium';
  return 'low';
};

// 📈 FORMATEAR TASA DE EMERGENCIAS
export const formatEmergencyRate = (rate: number): string => {
  return `${rate.toFixed(1)} por 1000 hab.`;
};

// ⏱️ FORMATEAR TIEMPO DE RESPUESTA
export const formatResponseTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}min`;
};

// 🚨 OBTENER ICONO PARA TIPO DE INCIDENTE
export const getIncidentIcon = (type: EmergencyIncident['type']): string => {
  switch (type) {
    case 'cardiac':
      return '💓';
    case 'accident':
      return '🚗';
    case 'respiratory':
      return '🫁';
    case 'trauma':
      return '🩹';
    case 'medical':
      return '🏥';
    default:
      return '🚨';
  }
};

// 🎨 OBTENER COLOR PARA SEVERIDAD
export const getSeverityColor = (severity: EmergencyIncident['severity']): string => {
  switch (severity) {
    case 'low':
      return '#10B981';
    case 'medium':
      return '#F59E0B';
    case 'high':
      return '#EF4444';
    case 'critical':
      return '#7C2D12';
    default:
      return '#6B7280';
  }
};