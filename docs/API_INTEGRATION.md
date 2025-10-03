# Frontend-Backend Integration Guide

## 🎯 Quick Setup

Your NestJS backend is running on **http://localhost:8000** and is now connected to your Next.js frontend!

## 📁 What's Been Set Up

### 1. API Configuration (`/lib/api-config.ts`)
- Base URL configuration
- All endpoint definitions
- Authentication helpers

### 2. API Hooks (`/lib/api-hooks.ts`)
- `useAuth()` - Authentication management
- `useOrganizations()` - Fetch organizations
- `useCreateOrganization()` - Create new organizations
- `useDonationDrives()` - Manage donation drives
- `useHealthCheck()` - Backend health monitoring

### 3. Environment Variables (`/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🚀 How to Use in Your Components

### Basic Authentication Example:
```tsx
import { useAuth } from '@/lib/api-hooks';

export default function LoginPage() {
  const { login, user, isAuthenticated, logout } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now logged in!
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome {user?.email}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleLogin(
            formData.get('email') as string,
            formData.get('password') as string
          );
        }}>
          <input name="email" type="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      )}
    </div>
  );
}
```

### Fetch Organizations Example:
```tsx
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

## 📡 Available API Endpoints

### Authentication
- `POST /auth/signup` - User registration  
- `POST /auth/login` - User login
- `POST /auth/check` - Verify token

### Organizations
- `GET /organizations` - List approved organizations
- `GET /organizations/:id` - Get specific organization  
- `POST /organizations` - Create organization (requires auth)

### NGO Applications
- `POST /ngo` - Submit NGO application
- `GET /ngo` - List applications (admin)
- `PATCH /ngo/:id/status` - Update status (admin)

### Donation Drives  
- `POST /donation-drives/organizations/:orgId/drives` - Create drive
- `GET /donation-drives/organizations/:orgId/drives` - Get org drives
- `GET /donation-drives/drives/:id` - Get specific drive
- `PATCH /donation-drives/drives/:id` - Update drive

## 🔧 Integration with Existing Components

### Update your existing components:

1. **Replace mock data** in your existing components with API calls
2. **Add authentication** to protected routes
3. **Use the hooks** instead of local state management

### Example: Update your campaign list
```tsx
// Before (with mock data)
import { mockCampaigns } from '@/mock/campaignData';

// After (with API)
import { useOrganizations } from '@/lib/api-hooks';

export default function CampaignList() {
  const { data: organizations } = useOrganizations();
  // Now use real data from your backend!
}
```

## 🛠️ Next Steps

1. **Start your frontend**: `npm run dev` (in the `/don-8` folder)
2. **Test the connection**: Use the `ApiExample` component
3. **Update existing components** to use the new API hooks
4. **Add error handling** and loading states to your components

## 🌐 URLs
- **Frontend**: http://localhost:3000  
- **Backend**: http://localhost:8000
- **Health Check**: http://localhost:8000/health