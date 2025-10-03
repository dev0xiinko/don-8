'use client';

import React, { useState, useEffect } from 'react';
import { useHealthCheck } from '@/lib/api-hooks';
import { buildUrl } from '@/lib/api-config';

const HealthDashboard = () => {
  const { isHealthy, loading } = useHealthCheck();
  const [dbStatus, setDbStatus] = useState<boolean | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [responseTime, setResponseTime] = useState<number | null>(null);

  // Check database connection
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const startTime = Date.now();
        const response = await fetch(buildUrl('/db-check'));
        const endTime = Date.now();
        
        setResponseTime(endTime - startTime);
        setDbStatus(response.ok);
        setLastChecked(new Date());
      } catch (error) {
        setDbStatus(false);
        setResponseTime(null);
      } finally {
        setDbLoading(false);
      }
    };

    if (isHealthy) {
      checkDatabase();
    }
  }, [isHealthy]);

  const getStatusColor = (status: boolean | null, isLoading: boolean) => {
    if (isLoading) return 'text-yellow-600 bg-yellow-100';
    if (status === null) return 'text-gray-600 bg-gray-100';
    return status ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (status: boolean | null, isLoading: boolean) => {
    if (isLoading) return '⏳';
    if (status === null) return '❓';
    return status ? '✅' : '❌';
  };

  const getStatusText = (status: boolean | null, isLoading: boolean) => {
    if (isLoading) return 'Checking...';
    if (status === null) return 'Unknown';
    return status ? 'Healthy' : 'Error';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">System Status</h3>
        <span className="text-xs text-gray-500">
          Last checked: {lastChecked.toLocaleTimeString()}
        </span>
      </div>

      <div className="space-y-3">
        {/* Backend API Status */}
        <div className="flex items-center justify-between p-2 rounded">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getStatusIcon(isHealthy, loading)}
            </span>
            <span className="font-medium text-gray-700">Backend API</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            getStatusColor(isHealthy, loading)
          }`}>
            {getStatusText(isHealthy, loading)}
          </span>
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between p-2 rounded">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getStatusIcon(dbStatus, dbLoading)}
            </span>
            <span className="font-medium text-gray-700">Database</span>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            getStatusColor(dbStatus, dbLoading)
          }`}>
            {getStatusText(dbStatus, dbLoading)}
          </span>
        </div>

        {/* Response Time */}
        {responseTime !== null && (
          <div className="flex items-center justify-between p-2 rounded">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className="font-medium text-gray-700">Response Time</span>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              responseTime < 100 ? 'text-green-600 bg-green-100' :
              responseTime < 500 ? 'text-yellow-600 bg-yellow-100' :
              'text-red-600 bg-red-100'
            }`}>
              {responseTime}ms
            </span>
          </div>
        )}

        {/* API Endpoint */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>🔗</span>
            <span>Endpoint:</span>
            <code className="bg-gray-100 px-1 py-0.5 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;