// API Configuration for connecting to NestJS backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    check: '/auth/check',
  },
  // Organization endpoints
  organizations: {
    list: '/organizations',
    detail: (id: string) => `/organizations/${id}`,
    create: '/organizations',
  },
  // NGO Application endpoints
  ngo: {
    apply: '/ngo',
    list: '/ngo',
    updateStatus: (id: string) => `/ngo/${id}/status`,
  },
  // Donation Drives endpoints
  donationDrives: {
    create: (orgId: string) => `/donation-drives/organizations/${orgId}/drives`,
    listByOrg: (orgId: string) => `/donation-drives/organizations/${orgId}/drives`,
    detail: (id: string) => `/donation-drives/drives/${id}`,
    update: (id: string) => `/donation-drives/drives/${id}`,
  },
  // Health endpoints
  health: '/health',
  dbCheck: '/db-check',
};

// Helper to build full URL
export const buildUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper to get auth headers
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
