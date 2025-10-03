'use client';

import React from 'react';
import { useAuth, useOrganizations, useHealthCheck } from '@/lib/api-hooks';

const ApiExample = () => {
  const { user, login, logout, loading: authLoading, isAuthenticated } = useAuth();
  const { data: organizations, loading: orgsLoading, error: orgsError } = useOrganizations();
  const { isHealthy, loading: healthLoading } = useHealthCheck();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      alert('Login successful!');
    } catch (error) {
      alert(`Login failed: ${error}`);
    }
  };

  if (authLoading || healthLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Integration Example</h1>
      
      {/* Health Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Backend Health</h2>
        <div className={`inline-block px-3 py-1 rounded text-white ${
          isHealthy ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {isHealthy ? '🟢 Backend Connected' : '🔴 Backend Offline'}
        </div>
      </div>

      {/* Authentication */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Authentication</h2>
        
        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <p>Welcome, {user?.email}!</p>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Organizations */}
      <div className="p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Organizations</h2>
        
        {orgsLoading ? (
          <p>Loading organizations...</p>
        ) : orgsError ? (
          <p className="text-red-500">Error: {orgsError}</p>
        ) : organizations && organizations.length > 0 ? (
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="p-2 bg-gray-100 rounded">
                <h3 className="font-medium">{org.name}</h3>
                <p className="text-sm text-gray-600">{org.description}</p>
                <p className="text-xs text-gray-500">Status: {org.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No organizations found</p>
        )}
      </div>
    </div>
  );
};

export default ApiExample;