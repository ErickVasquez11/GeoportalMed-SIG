import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, AlertTriangle, Users, Clock, Save, X, Eye, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';


interface EmergencyZone {
  id: string;
  name: string;
  municipality: string;
  department: string;
  lat: number;
  lng: number;
  radius: number;
  population: number;
  emergency_rate: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  nearest_hospitals: string[];
  average_response_time: number;
  monthly_incidents: number;
  yearly_incidents: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmergencyZonesProps {
  user: any;
}

export const EmergencyZones: React.FC<EmergencyZonesProps> = ({ user }) => {
  const [zones, setZones] = useState<EmergencyZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingZone, setEditingZone] = useState<EmergencyZone | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    municipality: '',
    department: '',
    lat: '',
    lng: '',
    radius: '2000',
    population: '',
    emergency_rate: '',
    risk_level: 'medium' as EmergencyZone['risk_level'],
    nearest_hospitals: [] as string[],
    average_response_time: '',
    monthly_incidents: '',
    yearly_incidents: '',
    active: true
  });

  const fetchZones = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_zones')
        .select('*')
        .order('emergency_rate', { ascending: false });

      if (error) throw error;

      setZones(data || []);
    } catch (err) {
      console.error('Error fetching emergency zones:', err);
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
        emergency_rate: parseFloat(formData.emergency_rate),
        risk_level: formData.risk_level,
        nearest_hospitals: formData.nearest_hospitals,
        average_response_time: parseFloat(formData.average_response_time),
        monthly_incidents: parseInt(formData.monthly_incidents),
        yearly_incidents: parseInt(formData.yearly_incidents),
        active: formData.active
      };

      if (editingZone) {
        const { error } = await supabase
          .from('emergency_zones')
          .update(zoneData)
          .eq('id', editingZone.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('emergency_zones')
          .insert([zoneData]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        municipality: '',
        department: '',
        lat: '',
        lng: '',
        radius: '2000',
        population: '',
        emergency_rate: '',
        risk_level: 'medium',
        nearest_hospitals: [],
        average_response_time: '',
        monthly_incidents: '',
        yearly_incidents: '',
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

  const handleEdit = (zone: EmergencyZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      municipality: zone.municipality,
      department: zone.department,
      lat: zone.lat.toString(),
      lng: zone.lng.toString(),
      radius: zone.radius.toString(),
      population: zone.population.toString(),
      emergency_rate: zone.emergency_rate.toString(),
      risk_level: zone.risk_level,
      nearest_hospitals: zone.nearest_hospitals,
      average_response_time: zone.average_response_time.toString(),
      monthly_incidents: zone.monthly_incidents.toString(),
      yearly_incidents: zone.yearly_incidents.toString(),
      active: zone.active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta zona de emergencia?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('emergency_zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchZones();
    } catch (err) {
      console.error('Error deleting zone:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-800 text-red-100';
      case 'high': return 'bg-red-500 text-red-100';
      case 'medium': return 'bg-yellow-500 text-yellow-100';
      case 'low': return 'bg-green-500 text-green-100';
      default: return 'bg-gray-500 text-gray-100';
    }
  };

  const getRiskLevelName = (level: string) => {
    switch (level) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return 'Desconocido';
    }
  };

  const filteredZones = zones.filter(zone => {
    const matchesSearch = zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         zone.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRiskLevel = filterRiskLevel === 'all' || zone.risk_level === filterRiskLevel;
    return matchesSearch && matchesRiskLevel;
  });

  if (loading && zones.length === 0) {
    return <LoadingSpinner size="lg" text="Cargando zonas de emergencia..." />;
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
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Zonas de Emergencia</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Administra las zonas de riesgo y análisis de emergencias</p>
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
                radius: '2000',
                population: '',
                emergency_rate: '',
                risk_level: 'medium',
                nearest_hospitals: [],
                average_response_time: '',
                monthly_incidents: '',
                yearly_incidents: '',
                active: true
              });
            }}
            className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 shadow-sm text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nueva Zona de Emergencia</span>
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
                  placeholder="Buscar zonas de emergencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-80"
                />
              </div>

              {/* Risk Level Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterRiskLevel}
                  onChange={(e) => setFilterRiskLevel(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Medio</option>
                  <option value="low">Bajo</option>
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
              Total: <span className="font-semibold">{filteredZones.length}</span> zonas de emergencia
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
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{zone.name}</h3>
                      <p className="text-xs text-gray-500">ID: {index + 1}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(zone.risk_level)}`}>
                      {getRiskLevelName(zone.risk_level)}
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
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">Respuesta: {zone.average_response_time} min</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Tasa:</span> {zone.emergency_rate}/1000
                    </div>
                    <div>
                      <span className="font-medium">Radio:</span> {(zone.radius / 1000).toFixed(1)} km
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Lat:</span> {zone.lat.toFixed(4)}
                    </div>
                    <div>
                      <span className="font-medium">Lng:</span> {zone.lng.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <p>Incidentes/mes: <span className="font-medium">{zone.monthly_incidents}</span></p>
                    <p>Hospitales: <span className="font-medium">{zone.nearest_hospitals.length}</span></p>
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
                      Zona de Emergencia
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Riesgo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Población
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Métricas
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
                          <div className="bg-red-100 p-2 rounded-lg mr-3">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
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
                                {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(zone.risk_level)}`}>
                          {getRiskLevelName(zone.risk_level)}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {zone.emergency_rate}/1000 hab.
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {zone.population.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          Radio: {(zone.radius / 1000).toFixed(1)} km
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 flex items-center mb-1">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {zone.average_response_time} min
                        </div>
                        <div className="text-xs text-gray-500">
                          {zone.monthly_incidents} incidentes/mes
                        </div>
                        <div className="text-xs text-gray-500">
                          {zone.nearest_hospitals.length} hospitales
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
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay zonas de emergencia</h3>
            <p className="text-gray-500">Comienza agregando una nueva zona de emergencia.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingZone ? 'Editar Zona de Emergencia' : 'Nueva Zona de Emergencia'}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: Centro Histórico San Salvador"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="San Salvador"
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación Geográfica */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación Geográfica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="2000"
                      />
                    </div>
                  </div>
                </div>

                {/* Datos Demográficos y de Riesgo */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Demográficos y de Riesgo</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Población
                      </label>
                      <input
                        type="number"
                        value={formData.population}
                        onChange={(e) => setFormData(prev => ({ ...prev, population: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="85000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tasa de Emergencias (por 1000 hab.)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.emergency_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergency_rate: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="45.2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nivel de Riesgo
                      </label>
                      <select
                        value={formData.risk_level}
                        onChange={(e) => setFormData(prev => ({ ...prev, risk_level: e.target.value as EmergencyZone['risk_level'] }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="low">Bajo</option>
                        <option value="medium">Medio</option>
                        <option value="high">Alto</option>
                        <option value="critical">Crítico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiempo Promedio de Respuesta (min)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.average_response_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, average_response_time: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="8.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Estadísticas de Incidentes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas de Incidentes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incidentes Mensuales
                      </label>
                      <input
                        type="number"
                        value={formData.monthly_incidents}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthly_incidents: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="32"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Incidentes Anuales
                      </label>
                      <input
                        type="number"
                        value={formData.yearly_incidents}
                        onChange={(e) => setFormData(prev => ({ ...prev, yearly_incidents: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="384"
                      />
                    </div>
                  </div>
                </div>

                {/* Hospitales Cercanos */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hospitales Cercanos</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IDs de Hospitales (separados por coma)
                    </label>
                    <input
                      type="text"
                      value={formData.nearest_hospitals.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        nearest_hospitals: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="1, 2, 4"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa los IDs de los hospitales más cercanos separados por comas
                    </p>
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
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
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