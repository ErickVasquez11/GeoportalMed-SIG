import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, Users, BarChart3, Clock, Save, X, Eye, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';

interface PopulationZone {
  id: string;
  name: string;
  municipality: string;
  department: string;
  lat: number;
  lng: number;
  radius: number;
  population: number;
  population_density: number; // habitantes por km²
  density_level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  area_km2: number;
  urban_percentage: number;
  rural_percentage: number;
  growth_rate: number; // tasa de crecimiento anual
  age_groups: {
    children: number; // 0-14 años
    adults: number;   // 15-64 años
    elderly: number;  // 65+ años
  };
  economic_activity: string[];
  infrastructure_level: 'basic' | 'intermediate' | 'advanced';
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface PopulationDensityProps {
  user: any;
}

export const PopulationDensity: React.FC<PopulationDensityProps> = ({ user }) => {
  const [zones, setZones] = useState<PopulationZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingZone, setEditingZone] = useState<PopulationZone | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [filterDensityLevel, setFilterDensityLevel] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    municipality: '',
    department: '',
    lat: '',
    lng: '',
    radius: '3000',
    population: '',
    population_density: '',
    density_level: 'medium' as PopulationZone['density_level'],
    area_km2: '',
    urban_percentage: '',
    rural_percentage: '',
    growth_rate: '',
    age_groups: {
      children: '',
      adults: '',
      elderly: ''
    },
    economic_activity: [] as string[],
    infrastructure_level: 'intermediate' as PopulationZone['infrastructure_level'],
    active: true
  });

  const fetchZones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('population_density_zones')
        .select('*')
        .order('population_density', { ascending: false });

      if (error) throw error;

      setZones(data || []);
    } catch (err) {
      console.error('Error fetching population density zones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const zoneData = {
        name: formData.name,
        municipality: formData.municipality,
        department: formData.department,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        radius: parseInt(formData.radius),
        population: parseInt(formData.population),
        population_density: parseFloat(formData.population_density),
        density_level: formData.density_level,
        area_km2: parseFloat(formData.area_km2),
        urban_percentage: parseFloat(formData.urban_percentage),
        rural_percentage: parseFloat(formData.rural_percentage),
        growth_rate: parseFloat(formData.growth_rate),
        age_groups: {
          children: parseInt(formData.age_groups.children),
          adults: parseInt(formData.age_groups.adults),
          elderly: parseInt(formData.age_groups.elderly)
        },
        economic_activity: formData.economic_activity,
        infrastructure_level: formData.infrastructure_level,
        active: formData.active
      };

      if (editingZone) {
        const { error } = await supabase
          .from('population_density_zones')
          .update(zoneData)
          .eq('id', editingZone.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('population_density_zones')
          .insert([zoneData]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        municipality: '',
        department: '',
        lat: '',
        lng: '',
        radius: '3000',
        population: '',
        population_density: '',
        density_level: 'medium',
        area_km2: '',
        urban_percentage: '',
        rural_percentage: '',
        growth_rate: '',
        age_groups: {
          children: '',
          adults: '',
          elderly: ''
        },
        economic_activity: [],
        infrastructure_level: 'intermediate',
        active: true
      });
      setShowAddForm(false);
      setEditingZone(null);
      fetchZones();
    } catch (err) {
      console.error('Error saving zone:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (zone: PopulationZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      municipality: zone.municipality,
      department: zone.department,
      lat: zone.lat.toString(),
      lng: zone.lng.toString(),
      radius: zone.radius.toString(),
      population: zone.population.toString(),
      population_density: zone.population_density.toString(),
      density_level: zone.density_level,
      area_km2: zone.area_km2.toString(),
      urban_percentage: zone.urban_percentage.toString(),
      rural_percentage: zone.rural_percentage.toString(),
      growth_rate: zone.growth_rate.toString(),
      age_groups: {
        children: zone.age_groups.children.toString(),
        adults: zone.age_groups.adults.toString(),
        elderly: zone.age_groups.elderly.toString()
      },
      economic_activity: zone.economic_activity,
      infrastructure_level: zone.infrastructure_level,
      active: zone.active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta zona de densidad poblacional?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('population_density_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchZones();
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const getDensityLevelColor = (level: string) => {
    switch (level) {
      case 'very_high': return 'bg-red-800 text-red-100';
      case 'high': return 'bg-red-500 text-red-100';
      case 'medium': return 'bg-yellow-500 text-yellow-100';
      case 'low': return 'bg-green-500 text-green-100';
      case 'very_low': return 'bg-blue-500 text-blue-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const getDensityLevelName = (level: string) => {
    switch (level) {
      case 'very_high': return 'Muy Alta';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      case 'very_low': return 'Muy Baja';
      default: return 'Desconocida';
    }
  };

  const getInfrastructureName = (level: string) => {
    switch (level) {
      case 'advanced': return 'Avanzada';
      case 'intermediate': return 'Intermedia';
      case 'basic': return 'Básica';
      default: return 'Desconocida';
    }
  };

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDensityLevel = filterDensityLevel === 'all' || zone.density_level === filterDensityLevel;
    return matchesSearch && matchesDensityLevel;
  });

  if (loading && zones.length === 0) {
    return <LoadingSpinner size="lg" text="Cargando zonas de densidad poblacional..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchZones} />;
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Densidad Poblacional</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Administra las zonas demográficas y análisis poblacional</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingZone(null);
              setFormData({
                name: '',
                municipality: '',
                department: '',
                lat: '',
                lng: '',
                radius: '3000',
                population: '',
                population_density: '',
                density_level: 'medium',
                area_km2: '',
                urban_percentage: '',
                rural_percentage: '',
                growth_rate: '',
                age_groups: {
                  children: '',
                  adults: '',
                  elderly: ''
                },
                economic_activity: [],
                infrastructure_level: 'intermediate',
                active: true
              });
            }}
            className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 shadow-sm text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nueva Zona Poblacional</span>
            <span className="sm:hidden">Nueva Zona</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar zonas poblacionales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-80"
                />
              </div>

              {/* Density Level Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterDensityLevel}
                  onChange={(e) => setFilterDensityLevel(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todas las densidades</option>
                  <option value="very_high">Muy Alta</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                  <option value="very_low">Muy Baja</option>
                </select>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tarjetas
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tabla
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg text-center sm:text-left">
              Total: <span className="font-semibold">{filteredZones.length}</span> zonas poblacionales
            </div>
          </div>
        </div>

        {/* Content Display */}
        {viewMode === 'cards' ? (
          /* Cards View - Mobile Friendly */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredZones.map((zone, index) => (
              <div key={zone.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{zone.name}</h3>
                      <p className="text-xs text-gray-500">ID: {index + 1}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDensityLevelColor(zone.density_level)}`}>
                      {getDensityLevelName(zone.density_level)}
                    </span>
                    {!zone.active && (
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-1">{zone.municipality}, {zone.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{zone.population.toLocaleString()} habitantes</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{zone.population_density.toFixed(1)} hab/km²</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Área:</span> {zone.area_km2} km²
                    </div>
                    <div>
                      <span className="font-medium">Crecimiento:</span> {zone.growth_rate}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Urbano:</span> {zone.urban_percentage}%
                    </div>
                    <div>
                      <span className="font-medium">Rural:</span> {zone.rural_percentage}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <p>Infraestructura: <span className="font-medium">{getInfrastructureName(zone.infrastructure_level)}</span></p>
                    <p>Actividades: <span className="font-medium">{zone.economic_activity.length}</span></p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(zone)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View - Desktop */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Zona Poblacional
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Densidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Población
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Distribución
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredZones.map((zone, index) => (
                    <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                            <div className="text-xs text-gray-500">ID: {index + 1}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                            <div>
                              <span className="font-medium">{zone.municipality}</span>
                              <div className="text-xs text-gray-500">{zone.department}</div>
                              <div className="text-xs text-gray-500">
                                {zone.area_km2} km²
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDensityLevelColor(zone.density_level)}`}>
                          {getDensityLevelName(zone.density_level)}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {zone.population_density.toFixed(1)} hab/km²
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {zone.population.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Crecimiento: {zone.growth_rate}%
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-gray-500">
                          <div>Urbano: {zone.urban_percentage}%</div>
                          <div>Rural: {zone.rural_percentage}%</div>
                          <div className="mt-1">
                            <span className="font-medium">Infraestructura:</span> {getInfrastructureName(zone.infrastructure_level)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          zone.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {zone.active ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(zone)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(zone.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredZones.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay zonas poblacionales</h3>
            <p className="text-gray-500">Comienza agregando una nueva zona de densidad poblacional.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingZone ? 'Editar Zona Poblacional' : 'Nueva Zona Poblacional'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingZone(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información Básica */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Zona
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Ej: Área Metropolitana San Salvador"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Municipio
                      </label>
                      <input
                        type="text"
                        value={formData.municipality}
                        onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="San Salvador"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departamento
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="San Salvador"
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación Geográfica */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación Geográfica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.lat}
                        onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="13.7942"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.lng}
                        onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="-88.8965"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Radio (metros)
                      </label>
                      <input
                        type="number"
                        value={formData.radius}
                        onChange={(e) => setFormData(prev => ({ ...prev, radius: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="3000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Área (km²)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.area_km2}
                        onChange={(e) => setFormData(prev => ({ ...prev, area_km2: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="28.3"
                      />
                    </div>
                  </div>
                </div>

                {/* Datos Poblacionales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Poblacionales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Población Total
                      </label>
                      <input
                        type="number"
                        value={formData.population}
                        onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="316090"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Densidad (hab/km²)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.population_density}
                        onChange={(e) => setFormData(prev => ({ ...prev, population_density: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="11175.4"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel de Densidad
                      </label>
                      <select
                        value={formData.density_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, density_level: e.target.value as PopulationZone['density_level'] }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="very_low">Muy Baja (&lt;100 hab/km²)</option>
                        <option value="low">Baja (100-500 hab/km²)</option>
                        <option value="medium">Media (500-2000 hab/km²)</option>
                        <option value="high">Alta (2000-10000 hab/km²)</option>
                        <option value="very_high">Muy Alta (&gt;10000 hab/km²)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Distribución Urbano-Rural */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución Urbano-Rural</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje Urbano (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.urban_percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, urban_percentage: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="85.2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje Rural (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.rural_percentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, rural_percentage: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="14.8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tasa de Crecimiento Anual (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.growth_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, growth_rate: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1.2"
                      />
                    </div>
                  </div>
                </div>

                {/* Grupos de Edad */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Grupos de Edad</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Niños (0-14 años)
                      </label>
                      <input
                        type="number"
                        value={formData.age_groups.children}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          age_groups: { ...prev.age_groups, children: e.target.value }
                        }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="85000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adultos (15-64 años)
                      </label>
                      <input
                        type="number"
                        value={formData.age_groups.adults}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          age_groups: { ...prev.age_groups, adults: e.target.value }
                        }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="205000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adultos Mayores (65+ años)
                      </label>
                      <input
                        type="number"
                        value={formData.age_groups.elderly}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          age_groups: { ...prev.age_groups, elderly: e.target.value }
                        }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="26090"
                      />
                    </div>
                  </div>
                </div>

                {/* Actividad Económica e Infraestructura */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Económica e Infraestructura</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actividades Económicas (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={formData.economic_activity.join(', ')}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          economic_activity: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Comercio, Servicios, Industria, Agricultura"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel de Infraestructura
                      </label>
                      <select
                        value={formData.infrastructure_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, infrastructure_level: e.target.value as PopulationZone['infrastructure_level'] }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="basic">Básica</option>
                        <option value="intermediate">Intermedia</option>
                        <option value="advanced">Avanzada</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estado</h3>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Zona activa (visible en el mapa)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingZone(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingZone ? 'Actualizar' : 'Guardar'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};