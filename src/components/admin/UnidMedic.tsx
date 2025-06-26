import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, MapPin, Phone, Clock, Heart, Save, X, Eye, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MedicalCenter } from '../../types';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';

interface UnidMedicProps {
  user: any;
}

export const UnidMedic: React.FC<UnidMedicProps> = ({ user }) => {
  const [centers, setCenters] = useState<MedicalCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState<MedicalCenter | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards'); // Default to cards for mobile
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lng: '',
    address: '',
    phone: '',
    schedule: '',
    services: [] as string[],
    emergency: false
  });

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_centers')
        .select('*')
        .eq('type', 'health_center')
        .order('name');

      if (error) throw error;

      const transformedData: MedicalCenter[] = data.map(center => ({
        id: center.id,
        name: center.name,
        type: center.type,
        lat: parseFloat(center.lat),
        lng: parseFloat(center.lng),
        address: center.address,
        phone: center.phone,
        schedule: center.schedule,
        services: Array.isArray(center.services) ? center.services : [],
        emergency: center.emergency
      }));

      setCenters(transformedData);
    } catch (err) {
      console.error('Error fetching centers:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const centerData = {
        name: formData.name,
        type: 'health_center' as const,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        address: formData.address,
        phone: formData.phone,
        schedule: formData.schedule,
        services: formData.services,
        emergency: formData.emergency
      };

      if (editingCenter) {
        const { error } = await supabase
          .from('medical_centers')
          .update(centerData)
          .eq('id', editingCenter.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medical_centers')
          .insert([centerData]);

        if (error) throw error;
      }

      setFormData({
        name: '',
        lat: '',
        lng: '',
        address: '',
        phone: '',
        schedule: '',
        services: [],
        emergency: false
      });
      setShowAddForm(false);
      setEditingCenter(null);
      fetchCenters();
    } catch (err) {
      console.error('Error saving center:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (center: MedicalCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      lat: center.lat.toString(),
      lng: center.lng.toString(),
      address: center.address,
      phone: center.phone,
      schedule: center.schedule,
      services: center.services,
      emergency: center.emergency
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta unidad médica?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('medical_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCenters();
    } catch (err) {
      console.error('Error deleting center:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         center.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading && centers.length === 0) {
    return <LoadingSpinner size="lg" text="Cargando unidades médicas..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchCenters} />;
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Unidades Médicas</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Administra los centros de salud y unidades médicas</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingCenter(null);
              setFormData({
                name: '',
                lat: '',
                lng: '',
                address: '',
                phone: '',
                schedule: '',
                services: [],
                emergency: false
              });
            }}
            className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-sm text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Nueva Unidad Médica</span>
            <span className="sm:hidden">Nueva Unidad</span>
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
                  placeholder="Buscar unidades médicas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-80"
                />
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
              Total: <span className="font-semibold">{filteredCenters.length}</span> unidades médicas
            </div>
          </div>
        </div>

        {/* Content Display */}
        {viewMode === 'cards' ? (
          /* Cards View - Mobile Friendly */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredCenters.map((center, index) => (
              <div key={center.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{center.name}</h3>
                      <p className="text-xs text-gray-500">ID: {index + 1}</p>
                    </div>
                  </div>
                  {center.emergency && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      🚨 24h
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">{center.address}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{center.phone}</p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">{center.schedule}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Lat:</span> {center.lat.toFixed(4)}
                    </div>
                    <div>
                      <span className="font-medium">Lng:</span> {center.lng.toFixed(4)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {center.services.slice(0, 2).map((service, idx) => (
                      <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {service}
                      </span>
                    ))}
                    {center.services.length > 2 && (
                      <span className="text-xs text-gray-500">+{center.services.length - 2}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(center)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(center.id)}
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
                      Unidad Médica
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Servicios
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCenters.map((center, index) => (
                    <tr key={center.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <Heart className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{center.name}</div>
                            <div className="text-xs text-gray-500">ID: {index + 1}</div>
                            {center.emergency && (
                              <div className="text-xs text-red-600 font-medium">🚨 Emergencias 24h</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{center.address}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 flex items-center mb-1">
                          <Phone className="w-4 h-4 mr-1 text-gray-400" />
                          {center.phone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-start">
                          <Clock className="w-4 h-4 mr-1 mt-0.5 text-gray-400 flex-shrink-0" />
                          <span className="max-w-xs truncate">{center.schedule}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {center.services.slice(0, 2).map((service, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                            >
                              {service}
                            </span>
                          ))}
                          {center.services.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{center.services.length - 2} más
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(center)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(center.id)}
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

        {filteredCenters.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
            <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay unidades médicas</h3>
            <p className="text-gray-500">Comienza agregando una nueva unidad médica.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCenter ? 'Editar Unidad Médica' : 'Nueva Unidad Médica'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingCenter(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Unidad Médica
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: Unidad Médica San Salvador"
                    />
                  </div>

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="-88.8965"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="2200-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horario
                    </label>
                    <input
                      type="text"
                      value={formData.schedule}
                      onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Lunes a Viernes 7:00 AM - 4:00 PM"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servicios (separados por coma)
                    </label>
                    <input
                      type="text"
                      value={formData.services.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        services: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Consulta General, Medicina Preventiva, Vacunación"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.emergency}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergency: e.target.checked }))}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Servicio de emergencias 24 horas
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCenter(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingCenter ? 'Actualizar' : 'Guardar'}</span>
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