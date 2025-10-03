# DON-8 Backend Integration & Health Monitoring System

## 🚀 Major Updates - v2.1.0

This update introduces a complete backend integration system with real-time health monitoring, API connectivity, and improved architecture.

## 📋 Table of Contents
1. [Overview](#overview)
2. [New Features](#new-features)
3. [Architecture Changes](#architecture-changes)
4. [API Integration](#api-integration)
5. [Health Monitoring](#health-monitoring)
6. [File Changes](#file-changes)
7. [Setup Instructions](#setup-instructions)
8. [Usage Guide](#usage-guide)
9. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This update establishes a robust connection between the Next.js frontend and NestJS backend, featuring:

- **Real-time Backend Health Monitoring**
- **Complete API Integration Layer**
- **Authentication System**
- **Organization Management**
- **NGO Application Processing**
- **Donation Drive Management**
- **CORS-enabled Backend Communication**

## 🆕 New Features

### 1. **Health Monitoring System**
- **Header Status Indicator**: Shows connection status in navigation
- **Floating Health Widget**: Expandable status indicator on all pages
- **Comprehensive Health Dashboard**: Detailed system status at `/health`
- **Real-time Connection Monitoring**: Automatic backend health checks
- **Response Time Tracking**: Performance metrics display

### 2. **API Integration Layer**
- **Centralized API Configuration**: `/lib/api-config.ts`
- **Custom React Hooks**: `/lib/api-hooks.ts`
- **TypeScript Interfaces**: Full type safety for all API calls
- **Error Handling**: Comprehensive error management
- **Authentication Management**: Token-based auth with localStorage

### 3. **Backend Services**
- **Authentication**: User signup, login, token verification
- **Organizations**: CRUD operations for NGO organizations
- **NGO Applications**: Application submission and approval workflow
- **Donation Drives**: Campaign management system
- **Health Endpoints**: System status monitoring

### 4. **Enhanced User Experience**
- **Visual Connection Status**: Green/Red indicators for backend connectivity
- **Responsive Design**: Mobile-friendly health indicators
- **Quick Actions**: Direct links to backend endpoints
- **Performance Metrics**: Response time monitoring

## 🏗️ Architecture Changes

### Frontend Architecture
```
/app
├── /health/               # Health monitoring dashboard
├── /api/                  # API route handlers
│   ├── /admin/           # Admin endpoints
│   ├── /auth/            # Authentication endpoints
│   ├── /health/          # Health check endpoints
│   └── /ngo-application/ # NGO application endpoints
└── layout.tsx            # Updated with health monitoring

/lib
├── api-config.ts         # API configuration and endpoints
├── api-hooks.ts          # React hooks for API calls
└── wallet-utils.ts       # Updated ethers.js v6 integration

/components
├── health-status.tsx              # Basic status indicator
├── health-dashboard.tsx           # Comprehensive health dashboard
├── floating-health-indicator.tsx  # Floating status widget
└── /homepage/layout/Header.tsx    # Updated with health status
```

### Backend Integration Points
```
Backend (Port 8000)     →     Frontend (Port 3000-3002)
├── /health            →     Health monitoring hooks
├── /db-check          →     Database status verification
├── /auth/*            →     Authentication system
├── /organizations/*   →     Organization management
├── /ngo/*             →     NGO application workflow
└── /donation-drives/* →     Campaign management
```

## 🔌 API Integration

### Configuration (`/lib/api-config.ts`)
```typescript
// Base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// All endpoints defined
export const endpoints = {
  auth: { login, signup, check },
  organizations: { list, detail, create },
  ngo: { apply, list, updateStatus },
  donationDrives: { create, listByOrg, detail, update }
};
```

### React Hooks (`/lib/api-hooks.ts`)
```typescript
// Authentication
const { user, login, logout, isAuthenticated } = useAuth();

// Data fetching
const { data: organizations, loading, error } = useOrganizations();
const { createOrganization } = useCreateOrganization();

// Health monitoring
const { isHealthy } = useHealthCheck();
```

### API Endpoints Available
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Backend health check |
| GET | `/db-check` | Database connectivity |
| POST | `/auth/signup` | User registration |
| POST | `/auth/login` | User authentication |
| POST | `/auth/check` | Token verification |
| GET | `/organizations` | List organizations |
| POST | `/organizations` | Create organization |
| GET | `/organizations/:id` | Get organization details |
| POST | `/ngo` | Submit NGO application |
| GET | `/ngo` | List applications |
| PATCH | `/ngo/:id/status` | Update application status |

## 🏥 Health Monitoring

### 1. **Header Indicator**
- Location: Top navigation bar
- Display: Small green/red dot with status text
- States: "Connected" (green) / "Offline" (red) / "Connecting..." (yellow)

### 2. **Floating Widget**
- Location: Bottom-right corner of all pages
- Expandable: Click to view detailed status
- Quick Access: Link to full health dashboard

### 3. **Health Dashboard** (`/health`)
- **System Status Overview**: Backend API and Database status
- **Performance Metrics**: Response time monitoring
- **Quick Actions**: Direct links to backend endpoints
- **API Documentation**: Complete endpoint reference

### Health Check Logic
```typescript
// Automatic health monitoring
useEffect(() => {
  const checkHealth = async () => {
    try {
      await fetch(`${API_BASE_URL}/health`);
      setHealthy(true);
    } catch {
      setHealthy(false);
    }
  };
  checkHealth();
}, []);
```

## 📁 File Changes

### New Files Created
```
/app/health/page.tsx                    # Health dashboard page
/lib/api-config.ts                     # API configuration
/lib/api-hooks.ts                      # React hooks for API
/components/health-status.tsx          # Status indicator component
/components/health-dashboard.tsx       # Comprehensive dashboard
/components/floating-health-indicator.tsx # Floating widget
/docs/API_INTEGRATION.md               # API documentation
/.env.local                            # Environment configuration
```

### Modified Files
```
/app/layout.tsx                        # Added floating health indicator
/components/homepage/layout/Header.tsx # Added header status indicator
/lib/wallet-utils.ts                   # Updated for ethers.js v6
/package.json                          # Added ethers dependency
```

### Backend Files (don8-backend-temp)
```
/src/main.ts                          # Added CORS configuration
/src/donations/dto/create-donation.dto.ts # Enhanced with validation
/src/organizations/dto/create-organization.dto.ts # Updated fields
/src/organizations/organizations.service.ts # Enhanced create method
/prisma/schema.prisma                 # Updated Organization model
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git repository access

### Backend Setup
1. **Navigate to backend directory**:
   ```bash
   cd /path/to/don8-backend-temp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   ```bash
   cp .env.sample .env
   # Configure your database and other settings
   ```

4. **Run database migrations**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the server**:
   ```bash
   npm run start:dev
   ```
   
   The server will start on `http://localhost:8000`

### Frontend Setup
1. **Navigate to frontend directory**:
   ```bash
   cd /path/to/don-8
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   # .env.local is already configured
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   
   The frontend will start on `http://localhost:3000` (or next available port)

## 📖 Usage Guide

### Testing the Integration
1. **Start both servers** (backend on 8000, frontend on 3000+)
2. **Visit the frontend** in your browser
3. **Check health indicators**:
   - Green dot in header = Connected
   - Red dot in header = Backend offline
4. **Visit `/health`** for detailed status
5. **Test API endpoints** using the dashboard quick actions

### Using API Hooks in Components
```typescript
// Basic authentication example
import { useAuth } from '@/lib/api-hooks';

export default function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      console.log('Logged in successfully!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.email}!</div>
      ) : (
        <button onClick={() => handleLogin('test@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}
```

### Fetching Organizations
```typescript
import { useOrganizations } from '@/lib/api-hooks';

export default function OrganizationsList() {
  const { data: organizations, loading, error } = useOrganizations();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {organizations?.map(org => (
        <div key={org.id}>
          <h3>{org.name}</h3>
          <p>{org.description}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. **"Offline" Status Showing**
**Symptoms**: Health indicators show red/offline status
**Solutions**:
- ✅ Ensure backend server is running on port 8000
- ✅ Check CORS configuration in backend `main.ts`
- ✅ Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- ✅ Test backend directly: `curl http://localhost:8000/health`

#### 2. **CORS Errors**
**Symptoms**: Browser console shows CORS errors
**Solutions**:
- ✅ Backend CORS is configured for ports 3000, 3001, 3002
- ✅ Add your frontend port to CORS origins in `main.ts`
- ✅ Restart backend server after CORS changes

#### 3. **ethers.js Import Errors**
**Symptoms**: "Cannot find module 'ethers'" or provider errors
**Solutions**:
- ✅ Run `npm install ethers` in frontend
- ✅ Use ethers v6 syntax (BrowserProvider, formatEther)
- ✅ Check wallet-utils.ts imports

#### 4. **API Hook Errors**
**Symptoms**: Hooks returning error states
**Solutions**:
- ✅ Verify API endpoints are responding: `/health`, `/organizations`
- ✅ Check network tab in browser dev tools
- ✅ Ensure proper error handling in components

### Debug Commands
```bash
# Test backend health
curl http://localhost:8000/health

# Test database connection
curl http://localhost:8000/db-check

# Check frontend environment
npm run build  # Look for any build errors

# Backend logs
# Check terminal running npm run start:dev
```

### Performance Optimization
- **Health Check Frequency**: Adjust `useHealthCheck` interval if needed
- **API Caching**: Consider implementing React Query for better caching
- **Error Boundaries**: Add React error boundaries for better UX
- **Loading States**: Ensure all API calls have proper loading indicators

## 🎯 Next Steps

### Recommended Improvements
1. **Add React Query** for better API state management
2. **Implement Refresh Tokens** for authentication
3. **Add API Rate Limiting** protection
4. **Create Unit Tests** for API hooks
5. **Add Error Boundaries** for better error handling
6. **Implement Offline Mode** for poor connectivity scenarios

### Additional Features to Consider
- **WebSocket Integration** for real-time updates
- **Push Notifications** for important events
- **Advanced Health Metrics** (CPU, memory usage)
- **API Response Caching** for better performance
- **Automatic Retry Logic** for failed requests

---

## 🏷️ Version Information
- **Version**: v2.1.0
- **Date**: October 3, 2025
- **Backend**: NestJS with Prisma ORM
- **Frontend**: Next.js 14.2.25 with TypeScript
- **Dependencies**: ethers.js v6, React 18+

## 👥 Contributors
- Enhanced backend integration
- Real-time health monitoring system
- Comprehensive API layer
- TypeScript type safety improvements
- Documentation and setup guides