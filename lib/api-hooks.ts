import { useState, useEffect } from 'react';
import { buildUrl, endpoints, getAuthHeaders } from './api-config';

// Types for API responses
interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface User {
  id: string;
  email: string;
  name?: string;
  wallet?: string;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
  email: string;
  category: string;
  registrationNumber: string;
  foundedYear: string;
  teamSize: string;
  website?: string;
  socialMedia?: string[];
  walletAddress?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface DonationDrive {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Generic API call function
const apiCall = async <T>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<T> => {
  const response = await fetch(buildUrl(url), {
    headers: getAuthHeaders(token),
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth Hooks
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth-token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token is still valid
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const userData = await apiCall<User>(endpoints.auth.check, {
        method: 'POST',
      }, authToken);
      setUser(userData);
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('auth-token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiCall<{ user: User; token: string }>(
        endpoints.auth.login,
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth-token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name?: string, wallet?: string) => {
    try {
      const response = await apiCall<{ user: User; token: string }>(
        endpoints.auth.signup,
        {
          method: 'POST',
          body: JSON.stringify({ email, password, name, wallet }),
        }
      );
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('auth-token', response.token);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth-token');
  };

  return {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
};

// Organizations Hooks
export const useOrganizations = (): ApiResponse<Organization[]> => {
  const [data, setData] = useState<Organization[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await apiCall<Organization[]>(endpoints.organizations.list);
        setData(orgs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return { data, loading, error };
};

export const useCreateOrganization = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrganization = async (orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'status'>, token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall<Organization>(
        endpoints.organizations.create,
        {
          method: 'POST',
          body: JSON.stringify(orgData),
        },
        token
      );
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create organization';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return { createOrganization, loading, error };
};

// Donation Drives Hooks
export const useDonationDrives = (organizationId: string): ApiResponse<DonationDrive[]> => {
  const [data, setData] = useState<DonationDrive[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;

    const fetchDrives = async () => {
      try {
        const drives = await apiCall<DonationDrive[]>(
          endpoints.donationDrives.listByOrg(organizationId)
        );
        setData(drives);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch donation drives');
      } finally {
        setLoading(false);
      }
    };

    fetchDrives();
  }, [organizationId]);

  return { data, loading, error };
};

// Health Check Hook
export const useHealthCheck = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiCall(endpoints.health);
        setIsHealthy(true);
      } catch (error) {
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return { isHealthy, loading };
};

// Export types
export type { User, Organization, DonationDrive, ApiResponse };
