import React from 'react';
import { MapPin, Activity, Navigation, Users, LogOut, Shield } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
}

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user?: any;
  userProfile?: UserProfile | null;
  isAdmin?: boolean;
  onSignOut?: () => void;
  onAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  onTabChange, 
  user, 
  userProfile,
  isAdmin, 
  onSignOut,
  onAdminPanel 
}) => {
  const tabs = [
    { id: 'coverage', label: 'Análisis de Cobertura', icon: Activity },
    { id: 'centers', label: 'Centros Médicos', icon: MapPin },
    { id: 'navigation', label: 'Navegación', icon: Navigation },
    { id: 'population', label: 'Datos Poblacionales', icon: Users },
  ];

  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email || 'Usuario';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Geoportal Médico</h1>
              <p className="text-sm text-gray-600">Análisis Espacial de Cobertura</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {isAdmin && (
                  <button 
                    onClick={onAdminPanel}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden md:inline">Admin</span>
                  </button>
                )}
                
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {userInitial}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-sm text-gray-700 font-medium">
                      {displayName}
                    </span>
                    {userProfile?.role && (
                      <div className="text-xs text-gray-500">
                        {userProfile.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={onSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Salir</span>
                </button>
              </>
            ) : (
              <div className="text-sm text-gray-600">
                Cargando usuario...
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};