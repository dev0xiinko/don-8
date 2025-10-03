'use client';

import React, { useState } from 'react';
import HealthStatus from './health-status';
import Link from 'next/link';

const FloatingHealthIndicator = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        // Expanded Card
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Backend Status</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          </div>
          
          <HealthStatus showDetails={true} />
          
          <div className="mt-3 pt-2 border-t border-gray-100">
            <Link 
              href="/health"
              className="text-xs text-blue-600 hover:text-blue-800 block"
            >
              View Full Health Dashboard →
            </Link>
          </div>
        </div>
      ) : (
        // Collapsed Circle
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white border border-gray-200 rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          title="View Backend Status"
        >
          <HealthStatus />
        </button>
      )}
    </div>
  );
};

export default FloatingHealthIndicator;