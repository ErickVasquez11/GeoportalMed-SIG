import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-red-900 mb-2">
        Error al cargar datos
      </h3>
      
      <p className="text-sm text-red-700 text-center mb-4 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar</span>
        </button>
      )}
    </div>
  );
};