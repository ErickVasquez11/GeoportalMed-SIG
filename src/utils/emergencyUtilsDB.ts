import { EmergencyZoneDB, EmergencyIncidentDB } from './emergencyZonesDatabase';
import { MedicalCenter, UserLocation } from '../types';

// 🎨 COLORES PARA ZONAS DE RIESGO
export const getRiskZoneColor = (riskLevel: EmergencyZoneDB['risk_level']): string => {
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

// 📊 CALCULAR ESTADÍSTICAS DE EMERGENCIA DESDE BD
export const calculateEmergencyStatsFromDB = (
  zones: EmergencyZoneDB[],
  incidents: EmergencyIncidentDB[],
  hospitals: MedicalCenter[]
): any => {
  const criticalZones = zones.filter(zone => 
    zone.risk_level === 'critical' || zone.risk_level === 'high'
  ).length;
  
  const hospitalsWithEmergency = hospitals.filter(h => h.emergency).length;
  
  const resolvedIncidents = incidents.filter(inc => inc.resolved && inc.response_time);
  const averageResponseTime = resolvedIncidents.length > 0 
    ? resolvedIncidents.reduce((sum, inc) => sum + (inc.response_time || 0), 0) / resolvedIncidents.length
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
export const findNearestEmergencyZoneDB = (
  userLocation: UserLocation,
  zones: EmergencyZoneDB[]
): EmergencyZoneDB | null => {
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

// 📏 CALCULAR DISTANCIA
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
export const getRiskLevelFromRate = (emergencyRate: number): EmergencyZoneDB['risk_level'] => {
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
export const getIncidentIcon = (type: EmergencyIncidentDB['incident_type']): string => {
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
export const getSeverityColor = (severity: EmergencyIncidentDB['severity']): string => {
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

// 🏥 OBTENER HOSPITALES MÁS CERCANOS A UNA ZONA
export const getNearestHospitalsToZone = (
  zone: EmergencyZoneDB,
  hospitals: MedicalCenter[]
): MedicalCenter[] => {
  return hospitals
    .filter(h => h.type === 'hospital')
    .map(hospital => ({
      ...hospital,
      distance: calculateDistance(zone.lat, zone.lng, hospital.lat, hospital.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3); // Top 3 hospitales más cercanos
};

// 📊 CALCULAR MÉTRICAS DE ZONA
export const calculateZoneMetrics = (
  zone: EmergencyZoneDB,
  incidents: EmergencyIncidentDB[]
): {
  activeIncidents: number;
  resolvedIncidents: number;
  averageResponseTime: number;
  severityDistribution: Record<string, number>;
} => {
  const zoneIncidents = incidents.filter(inc => inc.zone_id === zone.id);
  
  const activeIncidents = zoneIncidents.filter(inc => !inc.resolved).length;
  const resolvedIncidents = zoneIncidents.filter(inc => inc.resolved).length;
  
  const resolvedWithTime = zoneIncidents.filter(inc => inc.resolved && inc.response_time);
  const averageResponseTime = resolvedWithTime.length > 0
    ? resolvedWithTime.reduce((sum, inc) => sum + (inc.response_time || 0), 0) / resolvedWithTime.length
    : 0;
  
  const severityDistribution = zoneIncidents.reduce((acc, inc) => {
    acc[inc.severity] = (acc[inc.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    activeIncidents,
    resolvedIncidents,
    averageResponseTime: Math.round(averageResponseTime * 10) / 10,
    severityDistribution
  };
};