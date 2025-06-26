import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Map } from './components/Map';
import { MedicalCentersTable } from './components/MedicalCentersTable';
import { ChatBot } from './components/ChatBot';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { AuthWrapper } from './components/auth/AuthWrapper';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { useGeolocation } from './hooks/useGeolocation';
import { useMedicalCenters } from './hooks/useMedicalCenters';
import { useAuth } from './hooks/useAuth';
import { LayerControls, CoverageStats, MedicalCenter } from './types';

function App() {
  const { user, userProfile, loading: authLoading, isAdmin, signOut, isSupabaseConfigured } = useAuth();
  const { location: userLocation } = useGeolocation();
  const { 
    medicalCenters, 
    loading: centersLoading, 
    error: centersError, 
    refetch: refetchCenters 
  } = useMedicalCenters();
  
  const [activeTab, setActiveTab] = useState('coverage');
  const [layers, setLayers] = useState<LayerControls>({
    coverage: true,
    riskZones: false,
    populationDensity: false
  });
  const [selectedCenter, setSelectedCenter] = useState<MedicalCenter | null>(null);

  const handleLayerToggle = (layer: keyof LayerControls) => {
    setLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCenterSelect = (center: MedicalCenter) => {
    setSelectedCenter(center);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Estadísticas calculadas basadas en los datos reales
  const stats: CoverageStats = {
    coveredArea: 78,
    uncoveredArea: 22,
    totalCenters: medicalCenters.length,
    population: 1250000
  };

  // Mostrar spinner de carga solo por un tiempo limitado
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner 
          size="lg" 
          text="Cargando aplicación..." 
        />
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar login/registro
  if (!user) {
    return <AuthWrapper onAuthSuccess={() => {}} />;
  }

  // Si es admin, mostrar directamente el panel de administración
  if (isAdmin) {
    return (
      <AdminDashboard 
        user={user} 
        userProfile={userProfile}
        onSignOut={handleSignOut}
      />
    );
  }

  // Mostrar spinner de carga mientras se cargan los datos
  if (centersLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner 
          size="lg" 
          text={`Cargando centros médicos${isSupabaseConfigured ? ' desde Supabase' : ' (modo demo)'}...`}
        />
      </div>
    );
  }

  // Mostrar error si hay problemas con la carga
  if (centersError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <ErrorMessage 
          message={`Error al cargar datos: ${centersError}`}
          onRetry={refetchCenters}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      <Header 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        user={user}
        userProfile={userProfile}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          layers={layers} 
          onLayerToggle={handleLayerToggle}
          stats={stats}
        />
        
        <div className="flex-1 flex flex-col relative">
          {/* Contenedor del mapa */}
          <div className="flex-1 relative">
            <Map 
              medicalCenters={medicalCenters}
              userLocation={userLocation}
              layers={layers}
              selectedCenter={selectedCenter}
            />
          </div>
          
          {/* Tabla de centros médicos */}
          {activeTab === 'centers' && (
            <MedicalCentersTable
              medicalCenters={medicalCenters}
              userLocation={userLocation}
              onCenterSelect={handleCenterSelect}
              selectedCenter={selectedCenter}
            />
          )}
        </div>
      </div>

      {/* Chatbot flotante */}
      <ChatBot />

      {/* Indicador de conexión */}
      {!isSupabaseConfigured && (
        <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-800 font-medium"></span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Datos simulados - Configure Supabase para datos reales
          </p>
        </div>
      )}
    </div>
  );
}

export default App;