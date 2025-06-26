import React, { useState } from 'react';
import { Bot, Send, Minimize2, Maximize2, MessageCircle } from 'lucide-react';

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
      text: '¡Hey! Soy el ChatBot del Geoportal de Centros de Asistencia Médica. ¿En qué puedo ayudarte?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');

  const responses = {
    'hola': '¡Hola! ¿Cómo puedo ayudarte con información médica hoy?',
    'hospital': 'Puedo ayudarte a encontrar hospitales cerca de tu ubicación. Los hospitales están marcados en rojo en el mapa.',
    'clinica': 'Las clínicas están marcadas en azul en el mapa. Ofrecen servicios especializados y consultas programadas.',
    'emergencia': 'Para emergencias médicas, los hospitales con servicio 24 horas están disponibles. Puedes ver la ruta al más cercano en el mapa.',
    'ubicacion': 'Tu ubicación actual se muestra en el mapa. Desde ahí puedes ver los centros médicos más cercanos.',
    'horarios': 'Los horarios varían por centro. Hospitales generalmente 24hrs, clínicas y centros de salud tienen horarios específicos.',
    'cobertura': 'El análisis de cobertura muestra áreas con acceso médico en un radio de 1km. Las zonas sin cobertura se destacan en el mapa.',
    'ruta': 'Para crear una ruta, haz clic en cualquier centro médico del mapa o selecciona uno de la tabla de centros médicos.',
    'servicios': 'Cada centro médico ofrece diferentes servicios. Puedes ver los servicios disponibles en los popups del mapa o en la tabla.',
    'default': 'Puedo ayudarte con información sobre centros médicos, horarios, servicios, emergencias, y cómo llegar a los centros más cercanos.'
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

  // Avatar del robot
  const RobotAvatar = ({ size = 'normal' }: { size?: 'normal' | 'large' }) => (
    <div className={`${size === 'large' ? 'w-12 h-12' : 'w-10 h-10'} bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg`}>
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
    </div>
  );

  return (
    <div className="fixed bottom-0 right-0 z-[9999]">
      {/* Botón flotante cuando está cerrado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="m-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {/* Indicador de disponibilidad */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Asistente Médico
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Ventana del chat flotante */}
      {isOpen && (
        <div className="m-6 bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[500px] flex flex-col overflow-hidden chat-window">
          {/* Header del chatbot */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center space-x-3">
              <RobotAvatar />
              <div>
                <span className="font-semibold text-white">Asistente Médico</span>
                <div className="flex items-center text-xs text-blue-100">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  En línea
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

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu pregunta..."
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
          </div>
        </div>
      )}

      {/* Estilos CSS */}
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