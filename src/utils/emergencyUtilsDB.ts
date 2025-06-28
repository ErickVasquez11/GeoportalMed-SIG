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

// 🗺️ GENERAR POLÍGONO IRREGULAR BASADO EN ZONA
export const generateIrregularPolygon = (
  centerLat: number, 
  centerLng: number, 
  baseRadius: number, 
  zoneName: string
): [number, number][] => {
  const points: [number, number][] = [];
  const numPoints = 8 + Math.floor(Math.random() * 4); // 8-12 puntos para variedad
  
  // Crear variaciones específicas por zona para consistencia
  const seed = zoneName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (index: number) => {
    return ((seed * (index + 1) * 9301 + 49297) % 233280) / 233280;
  };

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    
    // Variación del radio (70% - 130% del radio base)
    const radiusVariation = 0.7 + (random(i) * 0.6);
    const currentRadius = baseRadius * radiusVariation;
    
    // Variación angular para hacer el polígono más irregular
    const angleVariation = (random(i + numPoints) - 0.5) * 0.3;
    const currentAngle = angle + angleVariation;
    
    // Convertir radio de metros a grados (aproximado)
    const radiusInDegrees = currentRadius / 111000; // 1 grado ≈ 111km
    
    const lat = centerLat + (radiusInDegrees * Math.cos(currentAngle));
    const lng = centerLng + (radiusInDegrees * Math.sin(currentAngle));
    
    points.push([lat, lng]);
  }
  
  // Cerrar el polígono
  points.push(points[0]);
  
  return points;
};

// 🏔️ GENERAR POLÍGONOS ESPECÍFICOS PARA ZONAS CONOCIDAS DE EL SALVADOR
export const getZoneSpecificPolygon = (zone: EmergencyZoneDB): [number, number][] => {
  // Polígonos específicos para zonas importantes de El Salvador
  switch (zone.name) {
    case 'Centro Histórico San Salvador':
      return [
        [13.7050, -89.2250],
        [13.7080, -89.2100],
        [13.6950, -89.2050],
        [13.6900, -89.2150],
        [13.6850, -89.2200],
        [13.6880, -89.2280],
        [13.6950, -89.2300],
        [13.7020, -89.2280],
        [13.7050, -89.2250]
      ];
    
    case 'Soyapango Norte':
      return [
        [13.7550, -89.1500],
        [13.7580, -89.1300],
        [13.7450, -89.1250],
        [13.7350, -89.1300],
        [13.7300, -89.1400],
        [13.7280, -89.1500],
        [13.7320, -89.1580],
        [13.7400, -89.1600],
        [13.7480, -89.1580],
        [13.7550, -89.1500]
      ];
    
    case 'Mejicanos Centro':
      return [
        [13.7500, -89.2250],
        [13.7520, -89.2100],
        [13.7450, -89.2050],
        [13.7380, -89.2080],
        [13.7320, -89.2150],
        [13.7300, -89.2220],
        [13.7350, -89.2280],
        [13.7420, -89.2300],
        [13.7480, -89.2280],
        [13.7500, -89.2250]
      ];
    
    case 'Santa Ana Centro':
      return [
        [14.0050, -89.5700],
        [14.0080, -89.5500],
        [13.9950, -89.5450],
        [13.9850, -89.5500],
        [13.9800, -89.5600],
        [13.9820, -89.5700],
        [13.9880, -89.5750],
        [13.9950, -89.5750],
        [14.0020, -89.5720],
        [14.0050, -89.5700]
      ];
    
    case 'Chalatenango Rural':
      // Zona rural más extensa e irregular
      return [
        [14.0800, -89.0000],
        [14.0900, -88.9000],
        [14.0500, -88.8500],
        [14.0200, -88.8800],
        [13.9800, -88.9200],
        [13.9900, -88.9800],
        [14.0100, -89.0200],
        [14.0400, -89.0100],
        [14.0650, -89.0050],
        [14.0800, -89.0000]
      ];
    
    default:
      // Para zonas no específicas, generar polígono irregular automático
      return generateIrregularPolygon(zone.lat, zone.lng, zone.radius, zone.name);
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

// 🔍 VERIFICAR SI UN PUNTO ESTÁ DENTRO DE UN POLÍGONO
export const isPointInPolygon = (
  point: [number, number], 
  polygon: [number, number][]
): boolean => {
  const [lat, lng] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    
    if (((lngI > lng) !== (lngJ > lng)) &&
        (lat < (latJ - latI) * (lng - lngI) / (lngJ - lngI) + latI)) {
      inside = !inside;
    }
  }
  
  return inside;
};

// 📐 CALCULAR ÁREA DE POLÍGONO (en km²)
export const calculatePolygonArea = (polygon: [number, number][]): number => {
  if (polygon.length < 3) return 0;
  
  let area = 0;
  const earthRadius = 6371; // Radio de la Tierra en km
  
  for (let i = 0; i < polygon.length - 1; i++) {
    const [lat1, lng1] = polygon[i];
    const [lat2, lng2] = polygon[i + 1];
    
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLng = (lng2 - lng1) * Math.PI / 180;
    
    area += deltaLng * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }
  
  area = Math.abs(area * earthRadius * earthRadius / 2);
  return area;
};