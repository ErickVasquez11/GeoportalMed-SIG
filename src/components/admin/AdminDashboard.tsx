import React, { useState } from 'react';
import { Shield, Building2, Heart, Users, BarChart3, LogOut, Plus, AlertTriangle } from 'lucide-react';
import { UnidMedic } from './UnidMedic';
import { ClinicMedic } from './ClinicMedic';
import { EmergencyZones } from './EmergencyZones';
import { PopulationDensity } from './PopulationDensity';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
}

interface AdminDashboardProps {
  user: any;
  userProfile?: UserProfile | null;
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, userProfile, onSignOut }) => {
  // Inicializar en 'unidMedic' ya que 'overview' está desactivado
  const [activeSection, setActiveSection] = useState<'unidMedic' | 'clinicMedic' | 'emergencyZones'| 'populationDensity'>('unidMedic');

  const menuItems = [
    {
      id: 'unidMedic' as const,
      label: 'Unidades Médicas',
      icon: Heart,
      description: 'Gestionar centros de salud'
    },
    {
      id: 'clinicMedic' as const,
      label: 'Clínicas Médicas',
      icon: Building2,
      description: 'Gestionar clínicas comunales'
    },
      {
      id: 'emergencyZones' as const,
      label: 'Zonas de Emergencia',
      icon: AlertTriangle,
      description: 'Gestionar zonas de riesgo'
    },
     {
      id: 'populationDensity' as const,
      label: 'Densidad Poblacional',
      icon: Users,
      description: 'Gestionar datos demográficos'
    }
  ];

  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email || 'Administrador';

  const renderContent = () => {
    switch (activeSection) {
      case 'unidMedic':
        return <UnidMedic user={user} userProfile={userProfile} />;
      case 'clinicMedic':
        return <ClinicMedic user={user} userProfile={userProfile} />;
         case 'emergencyZones':
        return <EmergencyZones user={user} />;
        case 'populationDensity':
        return <PopulationDensity user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Panel Admin</h2>
              <p className="text-xs text-slate-300">Geoportal Médico</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info y Logout */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={onSignOut}
            className="w-full flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};
