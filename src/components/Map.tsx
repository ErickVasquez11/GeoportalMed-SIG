import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MedicalCenter, UserLocation, LayerControls } from '../types';
import { calculateDistance, findNearestCenter, getCenterColor, getCenterIconSVG, getUserLocationIconSVG, formatDistance, formatDuration } from '../utils/mapUtils';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPgo=',
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDOC4xMyAyIDUgNS4xMyA1IDlDNSAxNC4yNSAxMiAyMiAxMiAyMkMxMiAyMiAxOSAxNC4yNSAxOSA5QzE5IDUuMTMgMTUuODcgMiAxMiAyWk0xMiAxMS41QzEwLjYyIDExLjUgOS41IDEwLjM4IDkuNSA5QzkuNSA3LjYyIDEwLjYyIDYuNSAxMiA2LjVDMTMuMzggNi41IDE0LjUgNy42MiAxNC41IDlDMTQuNSAxMC4zOCAxMy4zOCAxMS41IDEyIDExLjVaIiBmaWxsPSIjMzMzIi8+Cjwvc3ZnPgo=',
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
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: number, duration: number} | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Inicializar el mapa centrado en El Salvador
    const map = L.map(mapRef.current, {
      zoomControl: false, // Desactivar controles por defecto para evitar conflictos
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