import React from 'react';
import { MedicalCenter, UserLocation } from '../types';
import { calculateDistance, getCenterColor, formatDistance } from '../utils/mapUtils';
import { MapPin, Phone, Clock, Heart, Building2, Guitar as Hospital } from 'lucide-react';

interface MedicalCentersTableProps {
  medicalCenters: MedicalCenter[];
  userLocation: UserLocation | null;
  onCenterSelect: (center: MedicalCenter) => void;
  selectedCenter: MedicalCenter | null;
}

export const MedicalCentersTable: React.FC<MedicalCentersTableProps> = ({
  medicalCenters,
  userLocation,
  onCenterSelect,
  selectedCenter
}) => {
  const getTypeIcon = (type: MedicalCenter['type']) => {
    switch (type) {
      case 'hospital':
        return <Hospital className="w-4 h-4" />;
      case 'clinic':
        return <Building2 className="w-4 h-4" />;
      case 'health_center':
        return <Heart className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeName = (type: MedicalCenter['type']) => {
    switch (type) {
      case 'hospital':
        return 'Hospital';
      case 'clinic':
        return 'Clínica Comunal';
      case 'health_center':
        return 'Unidad Médica';
      default:
        return 'Centro Médico';
    }
  };

  const sortedCenters = userLocation 
    ? [...medicalCenters].sort((a, b) => {
        const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distanceA - distanceB;
      })
    : medicalCenters;

  return (
    <div className="bg-white border-t border-gray-200 shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-600" />
          Centros Médicos Disponibles
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({medicalCenters.length} centros)
          </span>
        </h3>
      </div>
      
      <div className="overflow-x-auto max-h-80 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Centro Médico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dirección
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horario
              </th>
              {userLocation && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distancia
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCenters.map((center) => {
              const distance = userLocation 
                ? calculateDistance(userLocation.lat, userLocation.lng, center.lat, center.lng)
                : 0;
              const isSelected = selectedCenter?.id === center.id;
              const color = getCenterColor(center.type);

              return (
                <tr 
                  key={center.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => onCenterSelect(center)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                        style={{ backgroundColor: color, color: 'white' }}
                      >
                        {getTypeIcon(center.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {center.name}
                        </div>
                        {center.emergency && (
                          <div className="text-xs text-red-600 font-medium">
                            🚨 Emergencias 24h
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${color}20`, 
                        color: color 
                      }}
                    >
                      {getTypeName(center.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="max-w-xs">{center.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Phone className="w-4 h-4 mr-1 text-gray-400" />
                      {center.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-start">
                      <Clock className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                      <span className="max-w-xs">{center.schedule}</span>
                    </div>
                  </td>
                  {userLocation && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">
                        {formatDistance(distance)}
                      </span>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCenterSelect(center);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Ver en Mapa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {selectedCenter && (
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-900">Centro Seleccionado:</h4>
              <p className="text-sm text-blue-700">{selectedCenter.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">
                Servicios: {selectedCenter.services.length}
              </p>
              <div className="flex flex-wrap gap-1 mt-1 justify-end">
                {selectedCenter.services.slice(0, 3).map((service, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {service}
                  </span>
                ))}
                {selectedCenter.services.length > 3 && (
                  <span className="text-xs text-blue-600">
                    +{selectedCenter.services.length - 3} más
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};