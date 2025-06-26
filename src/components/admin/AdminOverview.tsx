import React from 'react';
import { Building2, Heart, Users, Activity, TrendingUp, MapPin } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: 'user' | 'admin';
}

interface AdminOverviewProps {
  user: any;
  userProfile?: UserProfile | null;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ user, userProfile }) => {
  const displayName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email || 'Administrador';

  const stats = [
    {
      title: 'Total Centros Médicos',
      value: '156',
      change: '+12%',
      changeType: 'positive' as const,
      icon: MapPin,
      color: 'blue'
    },
    
    {
      title: 'Clínicas Comunales',
      value: '67',
      change: '+15%',
      changeType: 'positive' as const,
      icon: Building2,
      color: 'purple'
    },
    {
      title: 'Usuarios Activos',
      value: '1,234',
      change: '+23%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'orange'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Nueva clínica agregada',
      details: 'Clínica Comunal San Salvador Centro',
      time: 'Hace 2 horas',
      type: 'create'
    },
    {
      id: 2,
      action: 'Unidad médica actualizada',
      details: 'Unidad Médica Soyapango - Horarios modificados',
      time: 'Hace 4 horas',
      type: 'update'
    },
    {
      id: 3,
      action: 'Nuevo usuario registrado',
      details: 'Dr. María González se registró como usuario',
      time: 'Hace 6 horas',
      type: 'user'
    },
    {
      id: 4,
      action: 'Hospital actualizado',
      details: 'Hospital Rosales - Servicios actualizados',
      time: 'Hace 1 día',
      type: 'update'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      orange: 'bg-orange-500 text-orange-600 bg-orange-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-1">Bienvenido de vuelta, {displayName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 px-3 py-1 rounded-full">
              <span className="text-green-800 text-sm font-medium">Sistema Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = getColorClasses(stat.color).split(' ');
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                      <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${colorClasses[2]}`}>
                    <Icon className={`w-6 h-6 ${colorClasses[1]}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Actividad Reciente
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'create' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.details}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Agregar Unidad Médica</p>
                      <p className="text-sm text-gray-600">Registrar nueva unidad de salud</p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">→</div>
                </button>

                <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Agregar Clínica Médica</p>
                      <p className="text-sm text-gray-600">Registrar nueva clínica comunal</p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">→</div>
                </button>

                <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Gestionar Usuarios</p>
                      <p className="text-sm text-gray-600">Administrar perfiles de usuario</p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">→</div>
                </button>

                <button className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Ver Mapa General</p>
                      <p className="text-sm text-gray-600">Visualizar todos los centros</p>
                    </div>
                  </div>
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">→</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      
      </div>
    </div>
  );
};