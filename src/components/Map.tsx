import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MedicalCenter, UserLocation, LayerControls } from '../types';
import { calculateDistance, findNearestCenter, getCenterColor, getCenterIconSVG, getUserLocationIconSVG, formatDistance, formatDuration } from '../utils/mapUtils';
import { useEmergencyData } from '../hooks/useEmergencyData';
import { usePopulationData } from '../hooks/usePopulationData';
import { 
  getRiskZoneColor, 
  getIncidentIcon, 
  getSeverityColor, 
  formatEmergencyRate, 
  formatResponseTime,
  calculateZoneMetrics
} from '../utils/emergencyUtilsDB';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPgo=',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA7LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPgo=',
  shadowUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDEiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCA0MSA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGVsbGlwc2UgY3g9IjIwLjUiIGN5PSIzNy41IiByeD0iMTguNSIgcnk9IjMuNSIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPC9zdmc+Cg=='
});

interface MapProps {
  medicalCenters: MedicalCenter[];
  userLocation: UserLocation | null;
  layers: LayerControls;
  selectedCenter?: MedicalCenter | null;
}

export const Map: React.FC<MapProps> = ({ 
  medicalCenters, 
  userLocation, 
  layers, 
  selectedCenter 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const coverageCirclesRef = useRef<L.Circle[]>([]);
  const riskZoneCirclesRef = useRef<L.Circle[]>([]);
  const populationZoneCirclesRef = useRef<L.Circle[]>([]);
  const incidentMarkersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number} | null>(null);

  // Hook para datos de emergencia desde la base de datos
  const { emergencyZones, emergencyIncidents, loading: emergencyLoading } = useEmergencyData();
  
  // Hook para datos de densidad poblacional
  const { populationZones, loading: populationLoading } = usePopulationData();

  useEffect(() => {
    if (!mapRef.current) return;

    // Inicializar el mapa centrado en El Salvador
    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([13.7942, -88.8965], 8);

    // Agregar controles en posiciones específicas
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Función para crear ruta a un centro específico
  const createRouteToCenter = (center: MedicalCenter) => {
    if (!mapInstanceRef.current || !userLocation) return;

    // Limpiar ruta anterior
    if (routeLineRef.current) {
      mapInstanceRef.current.removeLayer(routeLineRef.current);
    }

    // Calcular distancia y duración estimada
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      center.lat,
      center.lng
    );

    // Duración estimada: 40 km/h promedio en ciudad
    const estimatedDuration = (distance / 40) * 60; // en minutos

    setRouteInfo({ distance, duration: estimatedDuration });

    // Crear línea de ruta
    const routeLine = L.polyline([
      [userLocation.lat, userLocation.lng],
      [center.lat, center.lng]
    ], {
      color: '#3B82F6',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 5'
    });

    routeLine.addTo(mapInstanceRef.current);
    routeLineRef.current = routeLine;

    // Ajustar vista para mostrar tanto el usuario como el centro seleccionado
    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lng],
      [center.lat, center.lng]
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  // Actualizar marcadores de centros médicos
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Agregar marcadores para cada centro médico
    medicalCenters.forEach(center => {
      const color = getCenterColor(center.type);
      const iconSVG = getCenterIconSVG(center.type);
      const isSelected = selectedCenter?.id === center.id;
      
      const customIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${color}; 
            width: ${isSelected ? '48px' : '40px'}; 
            height: ${isSelected ? '48px' : '40px'}; 
            border-radius: 50%; 
            border: ${isSelected ? '4px' : '3px'} solid white; 
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s ease;
            transform: ${isSelected ? 'scale(1.1)' : 'scale(1)'};
          " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='${isSelected ? 'scale(1.1)' : 'scale(1)'}'">
            ${iconSVG}
          </div>
        `,
        className: '',
        iconSize: [isSelected ? 48 : 40, isSelected ? 48 : 40],
        iconAnchor: [isSelected ? 24 : 20, isSelected ? 24 : 20]
      });

      const marker = L.marker([center.lat, center.lng], { icon: customIcon });
      
      const distance = userLocation ? calculateDistance(
        userLocation.lat, userLocation.lng, center.lat, center.lng
      ) : 0;

      const popupContent = `
        <div class="p-3 min-w-[280px]">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-lg text-gray-900">${center.name}</h3>
            <span class="px-2 py-1 text-xs font-medium rounded-full" style="background-color: ${color}20; color: ${color}">
              ${center.type === 'hospital' ? 'Hospital' : center.type === 'clinic' ? 'Clínica' : 'Centro de Salud'}
            </span>
          </div>
          
          <div class="space-y-2 mb-3">
            <p class="text-sm text-gray-600 flex items-center">
              <span class="mr-2">📍</span> ${center.address}
            </p>
            <p class="text-sm text-gray-600 flex items-center">
              <span class="mr-2">📞</span> ${center.phone}
            </p>
            <p class="text-sm text-gray-600 flex items-center">
              <span class="mr-2">⏰</span> ${center.schedule}
            </p>
            ${userLocation ? `
              <p class="text-sm font-medium text-blue-600 flex items-center">
                <span class="mr-2">📏</span> ${formatDistance(distance)}
              </p>
            ` : ''}
          </div>

          <div class="mb-3">
            <p class="text-sm font-medium text-gray-900 mb-2">Servicios disponibles:</p>
            <div class="flex flex-wrap gap-1">
              ${center.services.map(service => 
                `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">${service}</span>`
              ).join('')}
            </div>
          </div>

          ${userLocation ? `
            <button 
              onclick="window.createRoute('${center.id}')" 
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <span class="mr-2">🗺️</span> Crear Ruta
            </button>
          ` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      // Evento de clic en el marcador
      marker.on('click', () => {
        if (userLocation) {
          createRouteToCenter(center);
        }
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });

    // Función global para crear ruta desde el popup
    (window as any).createRoute = (centerId: string) => {
      const center = medicalCenters.find(c => c.id === centerId);
      if (center && userLocation) {
        createRouteToCenter(center);
      }
    };
  }, [medicalCenters, userLocation, selectedCenter]);

  // Actualizar círculos de cobertura
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Limpiar círculos existentes
    coverageCirclesRef.current.forEach(circle => circle.remove());
    coverageCirclesRef.current = [];

    if (layers.coverage) {
      medicalCenters.forEach(center => {
        const color = getCenterColor(center.type);
        const circle = L.circle([center.lat, center.lng], {
          radius: 1000, // 1km
          fillColor: color,
          fillOpacity: 0.15,
          color: color,
          weight: 2,
          opacity: 0.5
        });
        
        circle.addTo(mapInstanceRef.current!);
        coverageCirclesRef.current.push(circle);
      });
    }
  }, [layers.coverage, medicalCenters]);

  // 🚨 ACTUALIZAR ZONAS DE RIESGO DE EMERGENCIA DESDE BASE DE DATOS
  useEffect(() => {
    if (!mapInstanceRef.current || emergencyLoading) return;

    // Limpiar zonas de riesgo existentes
    riskZoneCirclesRef.current.forEach(circle => circle.remove());
    riskZoneCirclesRef.current = [];

    if (layers.riskZones && emergencyZones.length > 0) {
      console.log('🔄 Rendering emergency zones from database:', emergencyZones.length);
      
      emergencyZones.forEach(zone => {
        const color = getRiskZoneColor(zone.risk_level);
        const metrics = calculateZoneMetrics(zone, emergencyIncidents);
        
        // Crear círculo de zona de riesgo
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radius,
          fillColor: color,
          fillOpacity: 0.25,
          color: color,
          weight: 3,
          opacity: 0.8,
          dashArray: zone.risk_level === 'critical' ? '10, 5' : undefined
        });

        // Popup con información detallada de la zona desde BD
        const popupContent = `
          <div class="p-4 min-w-[320px]">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-lg text-gray-900">${zone.name}</h3>
              <span class="px-3 py-1 text-xs font-bold rounded-full text-white" style="background-color: ${color}">
                ${zone.risk_level.toUpperCase()}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-red-50 p-3 rounded-lg">
                <p class="text-xs text-red-600 font-medium">Tasa de Emergencias</p>
                <p class="text-lg font-bold text-red-800">${formatEmergencyRate(zone.emergency_rate)}</p>
              </div>
              <div class="bg-blue-50 p-3 rounded-lg">
                <p class="text-xs text-blue-600 font-medium">Tiempo Respuesta</p>
                <p class="text-lg font-bold text-blue-800">${formatResponseTime(zone.average_response_time)}</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-orange-50 p-3 rounded-lg">
                <p class="text-xs text-orange-600 font-medium">Incidentes Activos</p>
                <p class="text-lg font-bold text-orange-800">${metrics.activeIncidents}</p>
              </div>
              <div class="bg-green-50 p-3 rounded-lg">
                <p class="text-xs text-green-600 font-medium">Resueltos</p>
                <p class="text-lg font-bold text-green-800">${metrics.resolvedIncidents}</p>
              </div>
            </div>

            <div class="space-y-2 text-sm text-gray-600 mb-3">
              <p><span class="font-medium">👥 Población:</span> ${zone.population.toLocaleString()} habitantes</p>
              <p><span class="font-medium">📍 Municipio:</span> ${zone.municipality}, ${zone.department}</p>
              <p><span class="font-medium">📊 Radio:</span> ${(zone.radius / 1000).toFixed(1)} km</p>
              <p><span class="font-medium">🏥 Hospitales cercanos:</span> ${zone.nearest_hospitals.length}</p>
            </div>

            <div class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-xs text-gray-500">
                🕒 Última actualización: ${new Date(zone.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent, {
          maxWidth: 380,
          className: 'emergency-zone-popup'
        });
        
        circle.addTo(mapInstanceRef.current!);
        riskZoneCirclesRef.current.push(circle);
      });
    }
  }, [layers.riskZones, emergencyZones, emergencyIncidents, emergencyLoading]);

  // 👥 ACTUALIZAR ZONAS DE DENSIDAD POBLACIONAL DESDE BASE DE DATOS
  useEffect(() => {
    if (!mapInstanceRef.current || populationLoading) return;

    // Limpiar zonas de densidad poblacional existentes
    populationZoneCirclesRef.current.forEach(circle => circle.remove());
    populationZoneCirclesRef.current = [];

    if (layers.populationDensity && populationZones.length > 0) {
      console.log('🔄 Rendering population zones from database:', populationZones.length);
      
      populationZones.forEach(zone => {
        // Obtener color basado en el nivel de densidad
        const getDensityColor = (level: string) => {
          switch (level) {
            case 'very_high': return '#7C2D12'; // Rojo oscuro
            case 'high': return '#EF4444'; // Rojo
            case 'medium': return '#F59E0B'; // Amarillo/Naranja
            case 'low': return '#10B981'; // Verde
            case 'very_low': return '#3B82F6'; // Azul
            default: return '#6B7280'; // Gris
          }
        };

        const color = getDensityColor(zone.density_level);
        
        // Crear círculo de zona de densidad poblacional
        const circle = L.circle([zone.lat, zone.lng], {
          radius: zone.radius,
          fillColor: color,
          fillOpacity: 0.2,
          color: color,
          weight: 2,
          opacity: 0.7,
          dashArray: zone.density_level === 'very_high' ? '8, 4' : undefined
        });

        // Popup con información detallada de la zona poblacional
        const popupContent = `
          <div class="p-4 min-w-[340px]">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-lg text-gray-900">${zone.name}</h3>
              <span class="px-3 py-1 text-xs font-bold rounded-full text-white" style="background-color: ${color}">
                ${zone.density_level.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-purple-50 p-3 rounded-lg">
                <p class="text-xs text-purple-600 font-medium">Población Total</p>
                <p class="text-lg font-bold text-purple-800">${zone.population.toLocaleString()}</p>
              </div>
              <div class="bg-indigo-50 p-3 rounded-lg">
                <p class="text-xs text-indigo-600 font-medium">Densidad</p>
                <p class="text-lg font-bold text-indigo-800">${zone.population_density.toFixed(1)} hab/km²</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-green-50 p-3 rounded-lg">
                <p class="text-xs text-green-600 font-medium">Urbano</p>
                <p class="text-lg font-bold text-green-800">${zone.urban_percentage}%</p>
              </div>
              <div class="bg-yellow-50 p-3 rounded-lg">
                <p class="text-xs text-yellow-600 font-medium">Rural</p>
                <p class="text-lg font-bold text-yellow-800">${zone.rural_percentage}%</p>
              </div>
            </div>

            <div class="space-y-2 text-sm text-gray-600 mb-3">
              <p><span class="font-medium">📍 Ubicación:</span> ${zone.municipality}, ${zone.department}</p>
              <p><span class="font-medium">📊 Área:</span> ${zone.area_km2} km²</p>
              <p><span class="font-medium">📈 Crecimiento:</span> ${zone.growth_rate}% anual</p>
              <p><span class="font-medium">🏗️ Infraestructura:</span> ${
                zone.infrastructure_level === 'advanced' ? 'Avanzada' :
                zone.infrastructure_level === 'intermediate' ? 'Intermedia' : 'Básica'
              }</p>
            </div>

            <div class="mb-3">
              <p class="text-sm font-medium text-gray-900 mb-2">Distribución por Edad:</p>
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div class="bg-blue-50 p-2 rounded text-center">
                  <p class="font-medium text-blue-800">${zone.age_groups.children.toLocaleString()}</p>
                  <p class="text-blue-600">0-14 años</p>
                </div>
                <div class="bg-green-50 p-2 rounded text-center">
                  <p class="font-medium text-green-800">${zone.age_groups.adults.toLocaleString()}</p>
                  <p class="text-green-600">15-64 años</p>
                </div>
                <div class="bg-orange-50 p-2 rounded text-center">
                  <p class="font-medium text-orange-800">${zone.age_groups.elderly.toLocaleString()}</p>
                  <p class="text-orange-600">65+ años</p>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <p class="text-sm font-medium text-gray-900 mb-2">Actividades Económicas:</p>
              <div class="flex flex-wrap gap-1">
                ${zone.economic_activity.map(activity => 
                  `<span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">${activity}</span>`
                ).join('')}
              </div>
            </div>

            <div class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-xs text-gray-500">
                🕒 Última actualización: ${new Date(zone.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent, {
          maxWidth: 400,
          className: 'population-zone-popup'
        });
        
        circle.addTo(mapInstanceRef.current!);
        populationZoneCirclesRef.current.push(circle);
      });
    }
  }, [layers.populationDensity, populationZones, populationLoading]);

  // 🚨 ACTUALIZAR MARCADORES DE INCIDENTES DE EMERGENCIA DESDE BASE DE DATOS
  useEffect(() => {
    if (!mapInstanceRef.current || emergencyLoading) return;

    // Limpiar marcadores de incidentes existentes
    incidentMarkersRef.current.forEach(marker => marker.remove());
    incidentMarkersRef.current = [];

    if (layers.riskZones && emergencyIncidents.length > 0) {
      console.log('🔄 Rendering emergency incidents from database:', emergencyIncidents.length);
      
      emergencyIncidents.forEach(incident => {
        const color = getSeverityColor(incident.severity);
        const icon = getIncidentIcon(incident.incident_type);
        
        const incidentIcon = L.divIcon({
          html: `
            <div style="
              background-color: ${color}; 
              width: 32px; 
              height: 32px; 
              border-radius: 50%; 
              border: 3px solid white; 
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              cursor: pointer;
              animation: ${!incident.resolved ? 'pulse 2s infinite' : 'none'};
            ">
              ${icon}
            </div>
          `,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([incident.lat, incident.lng], { icon: incidentIcon });
        
        const popupContent = `
          <div class="p-3 min-w-[280px]">
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-bold text-gray-900">Incidente ${incident.incident_type}</h4>
              <span class="px-2 py-1 text-xs font-bold rounded-full text-white" style="background-color: ${color}">
                ${incident.severity.toUpperCase()}
              </span>
            </div>
            
            <div class="space-y-2 text-sm text-gray-600 mb-3">
              <p><span class="font-medium">🕒 Reportado:</span> ${new Date(incident.reported_at).toLocaleString()}</p>
              <p><span class="font-medium">📍 Ubicación:</span> ${incident.lat.toFixed(4)}, ${incident.lng.toFixed(4)}</p>
              ${incident.response_time ? `
                <p><span class="font-medium">⏱️ Tiempo respuesta:</span> ${incident.response_time} min</p>
              ` : ''}
              ${incident.description ? `
                <p><span class="font-medium">📝 Descripción:</span> ${incident.description}</p>
              ` : ''}
              <p><span class="font-medium">📊 Estado:</span> 
                <span class="${incident.resolved ? 'text-green-600' : 'text-red-600'} font-medium">
                  ${incident.resolved ? '✅ Resuelto' : '🚨 En curso'}
                </span>
              </p>
              ${incident.resolved_at ? `
                <p><span class="font-medium">✅ Resuelto:</span> ${new Date(incident.resolved_at).toLocaleString()}</p>
              ` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'incident-popup'
        });
        
        marker.addTo(mapInstanceRef.current!);
        incidentMarkersRef.current.push(marker);
      });
    }
  }, [layers.riskZones, emergencyIncidents, emergencyLoading]);

  // Actualizar ubicación del usuario
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    // Limpiar marcador de usuario existente
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Crear marcador para la ubicación del usuario con nuevo diseño
    const userIcon = L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background-color: #3B82F6; 
            width: 20px; 
            height: 20px; 
            border-radius: 50%; 
            border: 4px solid white; 
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            position: relative;
            z-index: 2;
          ">
            ${getUserLocationIconSVG()}
          </div>
          <div style="
            position: absolute; 
            top: -6px; 
            left: -6px; 
            width: 32px; 
            height: 32px; 
            border: 3px solid #3B82F6; 
            border-radius: 50%; 
            animation: pulse 2s infinite;
            opacity: 0.6;
          "></div>
        </div>
      `,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon });
    userMarker.bindPopup(`
      <div class="p-3 text-center">
        <div class="flex items-center justify-center mb-2">
          <div class="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
          <span class="font-medium text-gray-900">Tu ubicación actual</span>
        </div>
        <p class="text-sm text-gray-600">
          Lat: ${userLocation.lat.toFixed(6)}<br>
          Lng: ${userLocation.lng.toFixed(6)}
        </p>
        <p class="text-xs text-gray-500 mt-2">
          Precisión: ±${Math.round(userLocation.accuracy)}m
        </p>
      </div>
    `);
    userMarker.addTo(mapInstanceRef.current);
    userMarkerRef.current = userMarker;

    // Si no hay centro seleccionado, encontrar el más cercano automáticamente
    if (!selectedCenter) {
      const nearest = findNearestCenter(userLocation, medicalCenters);
      if (nearest) {
        createRouteToCenter(nearest);
      }
    }
  }, [userLocation, medicalCenters, selectedCenter]);

  // Efecto para actualizar la ruta cuando cambia el centro seleccionado
  useEffect(() => {
    if (selectedCenter && userLocation) {
      createRouteToCenter(selectedCenter);
    }
  }, [selectedCenter, userLocation]);

  // Efecto para centrar el mapa en el centro seleccionado
  useEffect(() => {
    if (selectedCenter && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedCenter.lat, selectedCenter.lng], 12);
    }
  }, [selectedCenter]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Mapa */}
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Panel de información de ruta - Posicionado de manera más estable */}
      {routeInfo && selectedCenter && userLocation && (
        <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm z-[1000] pointer-events-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Ruta Activa</h3>
            <button 
              onClick={() => {
                setRouteInfo(null);
                if (routeLineRef.current && mapInstanceRef.current) {
                  mapInstanceRef.current.removeLayer(routeLineRef.current);
                }
              }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 font-medium">Destino:</span>
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedCenter.name}
              
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">
                  {formatDistance(routeInfo.distance)}
                </div>
                <div className="text-xs text-blue-600 font-medium">Distancia</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatDuration(routeInfo.duration)}
                </div>
                <div className="text-xs text-green-600 font-medium">Tiempo est.</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
              <span>Ruta estimada por carretera</span>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de carga de datos de emergencia */}
      {emergencyLoading && layers.riskZones && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-700">Cargando zonas de emergencia...</span>
          </div>
        </div>
      )}

      {/* Indicador de carga de datos poblacionales */}
      {populationLoading && layers.populationDensity && (
        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-700">Cargando densidad poblacional...</span>
          </div>
        </div>
      )}
      
      {/* CSS para animaciones */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .custom-popup .leaflet-popup-tip {
          background: white;
        }

        .emergency-zone-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(239, 68, 68, 0.2);
          border: 2px solid #FEE2E2;
        }

        .population-zone-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(147, 51, 234, 0.2);
          border: 2px solid #F3E8FF;
        }

        .incident-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          border: 2px solid #FEF3C7;
        }

        /* Asegurar que los controles del mapa no interfieran */
        .leaflet-control-container {
          pointer-events: none;
        }
        
        .leaflet-control {
          pointer-events: auto;
        }

        /* Mejorar la estabilidad de la card de ruta */
        .leaflet-container {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
};