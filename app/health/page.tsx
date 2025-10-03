'use client';

import React from 'react';
import HealthDashboard from '@/components/health-dashboard';
import HealthStatus from '@/components/health-status';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HealthPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">System Health</h1>
            <Link href="/">
              <Button variant="outline" size="sm">
                ← Back to Home
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Monitor the connection status between your frontend and backend services.
          </p>
        </div>

        {/* Main Health Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <HealthDashboard />
          
          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a 
                href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  🌐 Open Backend API
                </Button>
              </a>
              
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/health`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  ❤️ Health Endpoint
                </Button>
              </a>
              
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/db-check`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="outline" className="w-full justify-start">
                  🗄️ Database Check
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* API Endpoints Overview */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available API Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Authentication</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">POST /auth/signup</code></li>
                <li><code className="bg-gray-100 px-1 rounded">POST /auth/login</code></li>
                <li><code className="bg-gray-100 px-1 rounded">POST /auth/check</code></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Organizations</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">GET /organizations</code></li>
                <li><code className="bg-gray-100 px-1 rounded">POST /organizations</code></li>
                <li><code className="bg-gray-100 px-1 rounded">GET /organizations/:id</code></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">NGO Applications</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">POST /ngo</code></li>
                <li><code className="bg-gray-100 px-1 rounded">GET /ngo</code></li>
                <li><code className="bg-gray-100 px-1 rounded">PATCH /ngo/:id/status</code></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Donation Drives</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded text-xs">POST /donation-drives/organizations/:orgId/drives</code></li>
                <li><code className="bg-gray-100 px-1 rounded text-xs">GET /donation-drives/drives/:id</code></li>
                <li><code className="bg-gray-100 px-1 rounded text-xs">PATCH /donation-drives/drives/:id</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}