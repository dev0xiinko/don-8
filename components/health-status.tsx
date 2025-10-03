'use client';

import React from 'react';
import { useHealthCheck } from '@/lib/api-hooks';

interface HealthStatusProps {
  className?: string;
  showDetails?: boolean;
}

const HealthStatus: React.FC<HealthStatusProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const { isHealthy, loading } = useHealthCheck();

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">Connecting...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status Indicator */}
      <div 
        className={`w-2 h-2 rounded-full ${
          isHealthy 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-red-500'
        }`}
        title={isHealthy ? 'Backend Connected' : 'Backend Disconnected'}
      ></div>
      
      {/* Status Text */}
      <span className={`text-sm font-medium ${
        isHealthy 
          ? 'text-green-700' 
          : 'text-red-700'
      }`}>
        {isHealthy ? 'Connected' : 'Offline'}
      </span>

      {/* Detailed Info */}
      {showDetails && (
        <span className="text-xs text-gray-500">
          {isHealthy 
            ? '(Backend API Ready)' 
            : '(Backend Unavailable)'
          }
        </span>
      )}
    </div>
  );
};

export default HealthStatus;