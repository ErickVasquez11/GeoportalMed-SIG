import React from 'react';
import { MapPin, AlertTriangle, Users } from 'lucide-react';
import { LayerControls, CoverageStats } from '../types';

interface SidebarProps {
  layers: LayerControls;
  onLayerToggle: (layer: keyof LayerControls) => void;
  stats: CoverageStats;
}

export const Sidebar: React.FC<SidebarProps> = ({ layers, onLayerToggle }) => {
  return (
    <div className="bg-white w-80 h-full shadow-lg border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Análisis Espacial</h2>
        </div>

        <div className="space-y-4">
          {/* Áreas de Cobertura */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Áreas de Cobertura</p>
                <p className="text-xs text-gray-500">Radio de 1km por centro médico</p>
              </div>
            </div>
            <button
              onClick={() => onLayerToggle('coverage')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                layers.coverage ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  layers.coverage ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Zonas de Riesgo */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-4 h-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Zonas de Riesgo</p>
                <p className="text-xs text-gray-500">Áreas con mayor demanda médica</p>
              </div>
            </div>
            <button
              onClick={() => onLayerToggle('riskZones')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                layers.riskZones ? 'bg-orange-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  layers.riskZones ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Densidad Poblacional */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Users className="w-4 h-4 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Densidad Poblacional</p>
                <p className="text-xs text-gray-500">Datos demográficos por zona</p>
              </div>
            </div>
            <button
              onClick={() => onLayerToggle('populationDensity')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                layers.populationDensity ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  layers.populationDensity ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};