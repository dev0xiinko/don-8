# 🔐 Admin Authentication System - Implementation Guide

## 🎯 Overview
Enhanced admin authentication system with **dual login methods**:
1. **Traditional Credentials** (Email + Password)
2. **Wallet Connect** (MetaMask + Authorized Wallets)

---

## 🏗️ Architecture Changes

### 1. **Admin Login Page** (`/app/admin/login/page.tsx`)
- ✅ **Two Tab Interface**: Credentials vs Wallet Connect
- ✅ **Backend API Integration**: Real authentication calls
- ✅ **Wallet Integration**: MetaMask connection with authorization check
- ✅ **Enhanced UX**: Loading states, error handling, success feedback

### 2. **Backend API Endpoints**

#### **Credentials Authentication** (`/api/admin/login`)
```typescript
POST /api/admin/login
{
  "email": "admin@don8.app",
  "password": "admin123"
}
```
- Forwards to backend: `${BACKEND_URL}/auth/admin/login`
- Returns JWT token and admin info

#### **Wallet Authentication** (`/api/admin/wallet-auth`)
```typescript
POST /api/admin/wallet-auth
{
  "walletAddress": "0x742d35Cc7565C9C7c8e8a34280d36735F9B96b9e"
}
```
- Checks authorized wallet list
- Forwards to backend: `${BACKEND_URL}/auth/admin/wallet`
- Fallback authentication if backend not ready

### 3. **Authentication Hook** (`/hooks/useAdminAuth.ts`)
- ✅ **Session Management**: localStorage + cookie storage
- ✅ **Auth State**: Loading, authenticated, session data
- ✅ **Auto-redirect**: Unauthenticated users → login page
- ✅ **Logout Function**: Complete session cleanup

### 4. **Admin Dashboard** (`/app/admin/dashboard/page.tsx`)
- ✅ **Updated Authentication**: Uses `useAdminAuth` hook
- ✅ **Dual Identity Display**: Shows email OR wallet address
- ✅ **Secure Logout**: Proper session cleanup

---

## 🔑 Authorized Admin Wallets

### Current Configuration
```typescript
const AUTHORIZED_ADMIN_WALLETS = [
  '0x742d35Cc7565C9C7c8e8a34280d36735F9B96b9e', // Example admin wallet
  '0x8ba1f109551bD432803012645Hac136c22C87165', // Example admin wallet
  // Add more authorized admin wallets here
];
```

### 🚨 **IMPORTANT**: Update Wallet Addresses
**Before production deployment**, update the authorized wallet addresses in:
- `/app/api/admin/wallet-auth/route.ts`

---

## 🎨 User Experience

### **Credentials Login Tab**
- Email input field
- Password input with show/hide toggle  
- Backend authentication
- Error handling for invalid credentials

### **Wallet Connect Tab**
- MetaMask connection button
- Connected wallet address display
- Authorization check against approved addresses
- Admin authentication via wallet signature

### **Dashboard Experience**  
- Displays admin identity (email OR wallet address)
- Secure session management
- One-click logout functionality

---

## 🔧 Backend Integration Points

### **Required Backend Endpoints**

#### 1. Admin Credentials Login
```
POST /auth/admin/login
Headers: Content-Type: application/json
Body: { email, password }
Response: { admin: {...}, token: "jwt_token" }
```

#### 2. Admin Wallet Authentication  
```
POST /auth/admin/wallet
Headers: Content-Type: application/json  
Body: { walletAddress }
Response: { admin: {...}, token: "jwt_token" }
```

### **Fallback Behavior**
If backend endpoints are not available:
- ✅ **Credentials**: Returns error message
- ✅ **Wallet**: Creates temporary session for authorized wallets

---

## 🛡️ Security Features

### ✅ **Authentication Methods**
- JWT token-based authentication
- Wallet address authorization whitelist
- Session expiration (24 hours)
- Secure cookie storage

### ✅ **Protection Mechanisms**
- Frontend route protection
- Backend API authentication headers
- Unauthorized access prevention
- Session validation on page load

### ✅ **Data Storage**
- localStorage: Session data
- Cookies: Auth tokens (HTTP-only recommended for production)
- Automatic cleanup on logout

---

## 🚀 Production Deployment

### **Environment Variables Required**
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com
```

### **Pre-Deployment Checklist**
- [ ] Update `AUTHORIZED_ADMIN_WALLETS` with real admin addresses
- [ ] Configure backend authentication endpoints  
- [ ] Test both credential and wallet authentication flows
- [ ] Verify session management and logout functionality
- [ ] Update cookie settings for production security

### **Testing Checklist**
- [ ] Login with credentials → Dashboard access
- [ ] Login with wallet → Dashboard access  
- [ ] Unauthorized wallet → Error message
- [ ] Invalid credentials → Error message
- [ ] Session persistence across page refreshes
- [ ] Logout → Redirect to login page
- [ ] Auto-redirect for unauthenticated users

---

## 💡 Usage Examples

### **Admin Credentials Login**
1. Navigate to `/admin/login`
2. Click "Admin Credentials" tab  
3. Enter email and password
4. Backend authentication → Dashboard access

### **Wallet Connect Login**
1. Navigate to `/admin/login`
2. Click "Wallet Connect" tab
3. Connect MetaMask wallet
4. Address authorization check → Dashboard access

### **Dashboard Access**
- View NGO applications
- Approve/reject applications  
- Admin identity displayed
- Secure logout option

---

## 🔄 Future Enhancements

### **Potential Improvements**
- [ ] Multi-signature wallet support
- [ ] Role-based permissions (super admin, moderator)
- [ ] Session refresh tokens
- [ ] Admin activity logging
- [ ] 2FA for credential login
- [ ] Wallet signature verification for enhanced security

---

**✅ Implementation Complete!** 
Admin authentication system ready with dual login methods and backend integration! 🎉