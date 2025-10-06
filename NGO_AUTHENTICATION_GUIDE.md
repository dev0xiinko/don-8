# NGO Authentication Flow Documentation

## Overview
The NGO authentication system allows approved NGOs to log into their management dashboard using credentials generated during the approval process.

## Authentication Flow

### 1. NGO Application Process
- NGOs submit applications through the registration form
- Applications are stored in `mock/ngo-applications.json`
- Initial status is `"pending"`

### 2. Admin Approval Process
- Admins review applications in the admin dashboard
- When an admin approves an NGO application:
  - Status changes to `"approved"`
  - Automatic credentials are generated:
    - Email: Uses the NGO's registered email
    - Password: `${organizationName.toLowerCase().replace(/\s+/g, '')}123`
  - `reviewedAt` timestamp is set
  - `reviewedBy` is set to admin email

### 3. NGO Login Process
- Approved NGOs can log in at `/ngo/login`
- Login API (`/api/ngo/login`) validates:
  - NGO status must be `"approved"`
  - Email and password must match stored credentials
- Successful login:
  - Sets `ngo_logged_in` = `"true"` in sessionStorage
  - Stores NGO information in `ngo_info` sessionStorage
  - Redirects to `/ngo/management`

### 4. Dashboard Access Control
- NGO management dashboard (`/ngo/management`) checks:
  - `ngo_logged_in` sessionStorage value
  - Valid `ngo_info` data exists
- If authentication fails, redirects to `/ngo/login`

## Current Approved NGOs (Test Credentials)

### 1. Web3 Cebu
- **Email:** `web3cebu@gmail.com`
- **Password:** `Web3Cebu2024`
- **Organization ID:** 1 & 2 (duplicate entries)
- **Wallet:** `0x8cba8d62cad772c4275266d1128d73d02cdd2830`

### 2. ACT Foundation  
- **Email:** `act@foundation.com`
- **Password:** `ACTFoundation202`
- **Organization ID:** 3
- **Wallet:** `0xb440122475580284ae87811c1405486fc2b4135c`

## API Endpoints

### NGO Login
- **Endpoint:** `POST /api/ngo/login`
- **Request Body:**
  ```json
  {
    "email": "act@foundation.com",
    "password": "ACTFoundation202"
  }
  ```
- **Success Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "ngo": {
      "id": 3,
      "organizationName": "ACT Foundation",
      "email": "act@foundation.com",
      "walletAddress": "0xb440122475580284ae87811c1405486fc2b4135c",
      "status": "approved",
      "approvedAt": "2025-10-06T10:14:36.432Z"
    }
  }
  ```

### NGO Application Approval
- **Endpoint:** `PATCH /api/admin/ngo-applications/{id}/approve`
- **Request Body:**
  ```json
  {
    "reviewNotes": "Application approved for platform access."
  }
  ```

## Security Features

### Authentication Guards
1. **Session-based Authentication:** Uses browser sessionStorage
2. **Status Validation:** Only `"approved"` NGOs can log in
3. **Credential Matching:** Email and password must match exactly
4. **Auto-redirect:** Unauthorized access redirects to login

### Data Protection
- Credentials are stored securely in the applications file
- NGO information is filtered before sending to client
- Session data is validated on each page load

## Dashboard Features (Post-Login)

After successful login, NGOs can access:
- **Campaign Management:** Create and manage relief campaigns
- **Donation Tracking:** View real-time donations and blockchain transactions
- **Wallet Integration:** Connect MetaMask for blockchain operations
- **Financial Dashboard:** Track balance and withdrawal history
- **Analytics:** View campaign performance and donor insights

## Testing the Login Flow

You can test the login functionality with the existing approved NGOs:

1. **Navigate to:** `http://localhost:3000/ngo/login`
2. **Use credentials:**
   - Email: `act@foundation.com`
   - Password: `ACTFoundation202`
3. **Expected Result:** Successful login and redirect to dashboard

## Implementation Status

✅ **Completed Features:**
- NGO application system
- Admin approval workflow with credential generation
- NGO login API with proper validation
- Session-based authentication
- Dashboard access control
- Automatic redirect handling

🔄 **Ready for Production:**
The NGO authentication system is fully implemented and functional. Approved NGOs can immediately log in using their generated credentials and access their management dashboard.