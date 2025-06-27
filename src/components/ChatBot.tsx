import React, { useState } from 'react';
import { Bot, Send, Minimize2, Maximize2, MessageCircle, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy el asistente del Geoportal Médico. Puedo ayudarte con información sobre centros médicos, zonas de emergencia, análisis de riesgo y rutas. ¿En qué puedo asistirte?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const responses = {
    'hola': '¡Hola! ¿Cómo puedo ayudarte con información médica y análisis de emergencias hoy?',
    'hospital': 'Los hospitales están marcados en rojo en el mapa. Muchos tienen servicio de emergencias 24 horas. Puedes activar las zonas de riesgo para ver la cobertura de emergencias.',
    'clinica': 'Las clínicas están marcadas en azul en el mapa. Ofrecen servicios especializados y consultas programadas. Algunas también tienen servicios de emergencia.',
    'emergencia': 'Para emergencias médicas: 1) Activa la capa "Zonas de Riesgo" en el análisis espacial, 2) Los hospitales 24h están disponibles, 3) Puedes ver tiempos de respuesta por zona.',
    'zona': 'Las zonas de emergencia muestran áreas con mayor tasa de incidentes médicos. Verde=bajo riesgo, Amarillo=medio, Rojo=alto, Rojo oscuro=crítico. Haz clic en las zonas para más detalles.',
    'riesgo': 'El análisis de riesgo se basa en: tasa de emergencias por 1000 habitantes, tiempo de respuesta promedio, y proximidad a hospitales. Activa "Zonas de Riesgo" para verlo.',
    'analisis': 'El análisis espacial incluye: 1) Áreas de cobertura médica, 2) Zonas de riesgo de emergencias, 3) Densidad poblacional. Usa los controles en el panel lateral.',
    'incidente': 'Los incidentes se muestran como puntos en el mapa cuando activas las zonas de riesgo. Los que parpadean están en curso, los estáticos ya fueron resueltos.',
    'tiempo': 'Los tiempos de respuesta varían: zonas urbanas 8-12 min, zonas rurales 20-25 min. Las zonas críticas pueden tener tiempos superiores a 20 minutos.',
    'cobertura': 'La cobertura médica muestra áreas con acceso a centros médicos en un radio de 1km. Las zonas sin cobertura se identifican para planificación.',
    'ubicacion': 'Tu ubicación se muestra con un punto azul pulsante. Desde ahí puedes ver centros médicos cercanos y el nivel de riesgo de tu zona.',
    'horarios': 'Los horarios varían: Hospitales=24hrs, Clínicas=horarios específicos, Centros de salud=7AM-4PM generalmente. Haz clic en cualquier marcador para ver horarios exactos.',
    'ruta': 'Para crear rutas: 1) Haz clic en cualquier centro médico, 2) Se creará automáticamente una ruta desde tu ubicación, 3) Verás distancia y tiempo estimado.',
    'servicios': 'Cada centro ofrece diferentes servicios. Los hospitales tienen emergencias, las clínicas especialidades, los centros de salud medicina preventiva.',
    'critico': 'Las zonas críticas (rojo oscuro) tienen >40 emergencias por 1000 habitantes y tiempos de respuesta elevados. Requieren atención prioritaria.',
    'estadisticas': 'Las estadísticas incluyen: total de incidentes, tiempo promedio de respuesta, zonas críticas, y hospitales con emergencias 24h.',
    'default': 'Puedo ayudarte con: centros médicos, zonas de emergencia, análisis de riesgo, rutas, horarios, servicios y estadísticas. ¿Qué te interesa saber específicamente?'
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simular respuesta del bot
    setTimeout(() => {
      const keywords = inputText.toLowerCase();
      let response = responses.default;

      for (const [key, value] of Object.entries(responses)) {
        if (keywords.includes(key)) {
          response = value;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInputText('');
  };

  // Avatar del robot mejorado
  const RobotAvatar = ({ size = 'normal' }: { size?: 'normal' | 'large' }) => (
    <div className={`${size === 'large' ? 'w-12 h-12' : 'w-10 h-10'} bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg relative`}>
      <div className="relative">
        {/* Cabeza del robot */}
        <div className={`${size === 'large' ? 'w-7 h-7' : 'w-6 h-6'} bg-white rounded-sm relative`}>
          {/* Ojos */}
          <div className={`absolute top-1 left-1 ${size === 'large' ? 'w-1.5 h-1.5' : 'w-1 h-1'} bg-blue-600 rounded-full`}></div>
          <div className={`absolute top-1 right-1 ${size === 'large' ? 'w-1.5 h-1.5' : 'w-1 h-1'} bg-blue-600 rounded-full`}></div>
          {/* Boca */}
          <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 ${size === 'large' ? 'w-3 h-0.5' : 'w-2 h-0.5'} bg-blue-600 rounded-full`}></div>
        </div>
        {/* Antenas */}
        <div className={`absolute -top-1 left-1 w-0.5 ${size === 'large' ? 'h-1.5' : 'h-1'} bg-white rounded-full`}></div>
        <div className={`absolute -top-1 right-1 w-0.5 ${size === 'large' ? 'h-1.5' : 'h-1'} bg-white rounded-full`}></div>
      </div>
      {/* Indicador de emergencias */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
        <AlertTriangle className="w-2 h-2 text-white" />
      </div>
    </div>
  );

  return (
    <div className="fixed bottom-0 right-0 z-[9999]">
      {/* Botón flotante cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="m-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group relative"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {/* Indicador de disponibilidad */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            {/* Indicador de emergencias */}
            <div className="absolute -top-2 -left-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <AlertTriangle className="w-2 h-2 text-white" />
            </div>
          </div>
          
          {/* Tooltip mejorado */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Asistente de Emergencias Médicas
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Ventana del chat flotante */}
      {isOpen && (
        <div className="m-6 bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[500px] flex flex-col overflow-hidden chat-window">
          {/* Header del chatbot mejorado */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center space-x-3">
              <RobotAvatar />
              <div>
                <span className="font-semibold text-white">Asistente Médico</span>
                <div className="flex items-center text-xs text-blue-100">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  <span>Análisis de emergencias activo</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {!message.isUser && (
                  <div className="flex-shrink-0">
                    <RobotAvatar />
                  </div>
                )}
                
                {message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 shadow-md">
                    U
                  </div>
                )}

                <div
                  className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                    message.isUser
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input mejorado */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pregunta sobre emergencias, zonas de riesgo..."
                  className="w-full border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 shadow-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Sugerencias rápidas */}
            <div className="flex flex-wrap gap-2 mt-3">
              <button 
                onClick={() => setInputText('zonas de riesgo')}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
              >
                Zonas de riesgo
              </button>
              <button 
                onClick={() => setInputText('emergencias')}
                className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors"
              >
                Emergencias
              </button>
              <button 
                onClick={() => setInputText('hospitales')}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Hospitales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos CSS mejorados */}
      <style>{`
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .chat-window {
          animation: slideInUp 0.3s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};