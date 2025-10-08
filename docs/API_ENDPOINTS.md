# DON-8 API Endpoints Documentation

> **Last Updated**: October 8, 2025  
> **Version**: 2.2.0  
> **Base URL**: `http://localhost:3000` (development)

## Overview

DON-8 provides a comprehensive REST API for managing NGO applications, campaigns, donations, and administrative functions. All endpoints return JSON responses and follow RESTful conventions.

## Authentication

The system uses multiple authentication methods:
- **Session-based**: For web interface authentication
- **Token-based**: For API access (admin panel)
- **Wallet-based**: For blockchain integration

## Response Format

All API responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "error": string // Only present on errors
}
```

---

## 🔐 Authentication & Admin

### Admin Authentication

#### POST `/api/admin/login`
Authenticate admin user with email/password.

**Request Body:**
```json
{
  "email": "admin@don8.com",
  "password": "admin_password"
}
```

**Response:**
```json
{
  "success": true,
  "admin": {
    "id": 1,
    "email": "admin@don8.com"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/admin/wallet-auth`
Authenticate admin user with wallet address.

**Request Body:**
```json
{
  "walletAddress": "0x..."
}
```

### General Authentication

#### POST `/api/auth/login`
General user authentication endpoint.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "user_password"
}
```

---

## 🏢 NGO Management

### NGO Registration & Authentication

#### POST `/api/ngo-application/register`
Submit a new NGO application.

**Request Body:**
```json
{
  "name": "Organization Name",
  "email": "ngo@example.org",
  "password": "secure_password",
  "description": "Organization description",
  "website": "https://example.org",
  "category": "education|healthcare|environment|poverty|disaster|human-rights|other",
  "walletAddress": "0x...",
  "registrationNumber": "REG123",
  "foundedYear": "2020",
  "teamSize": "10",
  "twitter": "https://twitter.com/org",
  "facebook": "https://facebook.com/org",
  "linkedin": "https://linkedin.com/org",
  "agreeTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "NGO application submitted successfully. Verification code sent to email.",
  "applicationId": 123
}
```

#### POST `/api/ngo-application/verify`
Verify email during registration or send verification code.

**Send Code:**
```json
{
  "applicationId": 123,
  "action": "send"
}
```

**Verify Code:**
```json
{
  "applicationId": 123,
  "action": "verify",
  "code": "123456"
}
```

#### POST `/api/ngo/login`
NGO user login.

**Request Body:**
```json
{
  "email": "ngo@example.org",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "ngo": {
    "id": 1,
    "organizationName": "NGO Name",
    "email": "ngo@example.org",
    "walletAddress": "0x...",
    "status": "approved"
  }
}
```

#### GET `/api/ngo/credentials`
Get NGO credentials (requires authentication).

### Password Reset

#### POST `/api/ngo/password/request`
Request password reset code.

**Request Body:**
```json
{
  "email": "ngo@example.org"
}
```

#### POST `/api/ngo/password/reset`
Reset password with verification code.

**Request Body:**
```json
{
  "email": "ngo@example.org",
  "code": "123456",
  "newPassword": "new_secure_password"
}
```

### NGO Operations

#### GET/POST `/api/ngo/campaigns`
Manage NGO campaigns.

**GET Query Parameters:**
- `ngoId`: Filter campaigns by NGO ID

**POST Request Body:**
```json
{
  "title": "Campaign Title",
  "description": "Campaign description",
  "goalAmount": 10000,
  "category": "education",
  "imageUrl": "https://example.com/image.jpg",
  "ngoId": 1,
  "ngoName": "NGO Name",
  "walletAddress": "0x..."
}
```

#### POST `/api/ngo/campaigns/[id]/updates`
Add updates to a campaign.

**Request Body:**
```json
{
  "updateTitle": "Update Title",
  "updateContent": "Update content",
  "ngoId": 1
}
```

#### GET `/api/ngo/transactions`
Get NGO transaction history (donations + withdrawals).

**Query Parameters:**
- `ngoId`: NGO ID (required)

#### GET/POST `/api/ngo/withdrawals`
Manage NGO withdrawals.

**POST Request Body:**
```json
{
  "ngoId": 1,
  "amount": 100,
  "destination": "0x...",
  "txHash": "0x...",
  "campaignId": "optional_campaign_id"
}
```

#### GET `/api/ngo/withdrawal-constraints`
Check withdrawal constraints and validation.

**Query Parameters:**
- `ngoId`: NGO ID

#### GET/POST `/api/ngo-scores`
Manage NGO reputation scores.

**GET Query Parameters:**
- `ngoId`: NGO ID
- `source`: `stored|dynamic` (default: dynamic)

**POST Request Body:**
```json
{
  "ngoId": 1,
  "type": "withdrawal|update|penalty_check",
  "campaignId": "optional",
  "withdrawalAmount": 100,
  "txHash": "0x...",
  "updateTitle": "Update title",
  "updateContent": "Update content"
}
```

---

## 👨‍💼 Admin Panel

### NGO Application Management

#### GET `/api/admin/ngo-applications`
Get all NGO applications (sorted newest first).

**Response:**
```json
[
  {
    "id": 1,
    "organizationName": "NGO Name",
    "email": "ngo@example.org",
    "status": "pending|approved|rejected",
    "submittedAt": "2025-10-08T10:00:00Z",
    "category": "education",
    // ... other fields
  }
]
```

#### PATCH `/api/admin/ngo-applications/[id]/approve`
Approve NGO application.

**Request Body:**
```json
{
  "reviewNotes": "Application looks good"
}
```

#### PATCH `/api/admin/ngo-applications/[id]/reject`
Reject NGO application.

**Request Body:**
```json
{
  "reviewNotes": "Missing required documents"
}
```

#### PATCH `/api/admin/ngo-applications/[id]/status`
Update application status (general purpose).

**Request Body:**
```json
{
  "status": "approved|rejected|under_review",
  "reviewNotes": "Optional notes"
}
```

### Admin Utilities

#### GET `/api/admin/test-supabase-backup`
Test Supabase backup connectivity and insert test record.

**Response:**
```json
{
  "ok": true,
  "mode": "json|raw",
  "table": "ngo_applications_backup"
}
```

#### POST `/api/admin/sanitize-ngo-applications`
Remove sensitive data from NGO applications JSON.

**Response:**
```json
{
  "success": true,
  "removedPasswords": 5,
  "clearedCodes": 3,
  "message": "NGO applications sanitized."
}
```

---

## 🎯 Campaigns

#### GET/POST `/api/campaigns`
Manage campaigns.

**GET Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": 1,
      "title": "Campaign Title",
      "description": "Description",
      "goalAmount": 10000,
      "raisedAmount": 5000,
      "status": "active|completed|paused",
      "category": "education",
      "ngoId": 1,
      "ngoName": "NGO Name",
      "createdAt": "2025-10-08T10:00:00Z",
      "imageUrl": "https://example.com/image.jpg",
      "reports": [],
      "updates": []
    }
  ]
}
```

#### GET/PATCH `/api/campaigns/[id]`
Get or update specific campaign.

**PATCH Request Body:**
```json
{
  "type": "update_timestamp|other_update_type",
  "source": "report_upload|campaign_update",
  "reportName": "optional_report_name"
}
```

#### POST `/api/campaigns/[id]/reports`
Upload campaign reports.

**Form Data:**
- `report`: File upload
- `reportType`: "progress|financial|impact"
- `description`: Report description

---

## 💰 Donations

#### GET/POST `/api/donations`
Manage donations.

**POST Request Body:**
```json
{
  "campaignId": 1,
  "amount": 100,
  "donorName": "Anonymous",
  "message": "Keep up the good work!",
  "txHash": "0x...",
  "walletAddress": "0x..."
}
```

#### GET/POST `/api/donations/[campaignId]`
Campaign-specific donations.

#### GET `/api/donations/global`
Global donation statistics.

**Response:**
```json
{
  "totalDonations": 50000,
  "totalDonors": 150,
  "activeCampaigns": 25,
  "completedCampaigns": 10
}
```

#### POST `/api/donations/migrate`
Migrate donation data between formats.

---

## ⚡ System Health

#### GET `/api/health`
System health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-08T10:00:00Z",
  "version": "2.2.0",
  "uptime": 3600
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error |

## Rate Limiting

- Most endpoints: 100 requests per minute
- Authentication endpoints: 10 requests per minute
- File uploads: 5 requests per minute

## Environment Configuration

Required environment variables:
```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="DON-8 <your_email@gmail.com>"

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_TABLE=ngo_applications_backup
SUPABASE_TABLE_MODE=json
```

## Security Notes

- All passwords are hashed using bcrypt
- Sensitive data (passwords, verification codes) are not included in Supabase backups
- Admin endpoints require authentication
- File uploads are validated for type and size
- Email verification is required for NGO registration

## Testing

Use the test endpoint to verify system connectivity:
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/admin/test-supabase-backup
```

---

*For technical support or API questions, contact the development team.*