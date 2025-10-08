# DON8 Platform - Comprehensive Documentation

## Table of Contents
1. [Platform Overview](#platform-overview)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Features](#features)
5. [API Documentation](#api-documentation)
6. [Data Models](#data-models)
7. [User Guides](#user-guides)
8. [Developer Guide](#developer-guide)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Platform Overview

DON8 is a revolutionary blockchain-powered charitable donation platform that provides complete transparency and accountability in the donation ecosystem. The platform connects donors with verified NGOs through secure, traceable transactions.

### Key Value Propositions
- **Complete Transparency**: All donations and withdrawals are blockchain-verified
- **NGO Verification**: Multi-step application and approval process for organizations
- **Real-time Tracking**: Live monitoring of donations, campaigns, and financial flows
- **Security First**: Wallet integration with MetaMask and secure authentication
- **Reputation System**: Dynamic NGO scoring based on performance metrics

### Technology Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Blockchain**: Ethereum, MetaMask integration, Ethers.js
- **State Management**: React Context, Custom hooks
- **Backend Integration**: RESTful APIs with health monitoring
- **Email System**: Nodemailer with SMTP
- **Data Storage**: JSON-based with Supabase backup

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- MetaMask browser extension
- Git for version control

### Quick Installation
```bash
# Clone the repository
git clone https://github.com/dev0xiinko/don-8.git
cd don-8

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

### Environment Configuration
Create a `.env.local` file with:
```env
# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
ADMIN_EMAIL=admin@don8.com

# Supabase (Optional - for backup)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

### First Run
1. Navigate to `http://localhost:3000`
2. Install MetaMask if not already installed
3. Connect your wallet
4. Explore the platform features

---

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Blockchain    │
│   (Next.js)     │◄──►│   (REST APIs)   │◄──►│    ( Sonic )    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │   Data Storage  │    │   MetaMask      │
│   (Radix UI)    │    │   (JSON/Backup) │    │   Integration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture
```
app/
├── admin/          # Admin dashboard and management
├── api/           # Backend API routes
├── campaign/      # Individual campaign pages
├── donate/        # Donation flow pages
├── ngo/          # NGO management interface
└── ...           # Other user-facing pages

components/
├── admin/        # Admin-specific components
├── auth/         # Authentication components
├── ui/          # Reusable UI components
└── features/    # Feature-specific components
```

### Data Flow
1. **User Interaction** → Frontend components
2. **API Calls** → Backend routes (`/app/api/`)
3. **Data Processing** → JSON storage + Supabase backup
4. **Blockchain Operations** → MetaMask integration
5. **Real-time Updates** → React state management

---

## Features

### For Donors
- **Browse Campaigns**: Discover active donation campaigns
- **Secure Donations**: MetaMask wallet integration for safe transactions
- **Transaction History**: Complete record of all donations
- **Real-time Updates**: Live campaign progress tracking
- **Receipt Generation**: Automatic donation receipts

### For NGOs
- **Application System**: Comprehensive registration and verification
- **Campaign Management**: Create and manage donation campaigns
- **Financial Dashboard**: Track donations and manage withdrawals
- **Withdrawal System**: Secure fund withdrawal to designated wallets
- **Reporting Tools**: Generate impact reports and updates
- **Reputation Scoring**: Dynamic scoring based on performance

### For Administrators
- **NGO Application Review**: Approve/reject organization applications
- **System Monitoring**: Health dashboard with real-time status
- **Campaign Oversight**: Monitor all active campaigns
- **User Management**: Manage donors and NGOs
- **Financial Oversight**: Track all platform transactions

### Platform Features
- **Blockchain Transparency**: All transactions recorded on blockchain
- **Email Notifications**: Automated emails for key events
- **Mobile Responsive**: Works seamlessly on all devices
- **Theme Support**: Light/dark mode toggle
- **Health Monitoring**: System status indicators
- **Backup System**: Automated data backup to Supabase

---

## API Documentation

### Authentication Endpoints
```
POST /api/auth/login     # User login
POST /api/auth/register  # User registration
POST /api/auth/verify    # Email verification
POST /api/auth/reset     # Password reset
```

### NGO Management
```
GET    /api/ngo                    # List all NGOs
POST   /api/ngo                    # Create NGO
GET    /api/ngo/[id]              # Get specific NGO
PUT    /api/ngo/[id]              # Update NGO
DELETE /api/ngo/[id]              # Delete NGO
GET    /api/ngo/withdrawals       # Get withdrawal history
POST   /api/ngo/withdraw          # Process withdrawal
```

### Campaign Management
```
GET    /api/campaigns             # List all campaigns
POST   /api/campaigns             # Create campaign
GET    /api/campaigns/[id]        # Get specific campaign
PUT    /api/campaigns/[id]        # Update campaign
DELETE /api/campaigns/[id]        # Delete campaign
```

### Admin Endpoints
```
GET    /api/admin/applications    # NGO applications
PUT    /api/admin/applications/[id] # Update application status
GET    /api/admin/dashboard       # Admin dashboard data
GET    /api/admin/users           # User management
```

### System Health
```
GET    /api/health                # System health check
GET    /api/health/detailed       # Detailed health metrics
```

*For detailed API documentation, see [API_ENDPOINTS.md](./docs/API_ENDPOINTS.md)*

---

## Data Models

### Core Models Overview
- **NGOApplication**: Complete registration and approval workflow
- **Campaign**: Fundraising campaigns with goals and progress
- **Transaction**: Blockchain-verified donations
- **Withdrawal**: NGO fund withdrawals with blockchain confirmation
- **NGOScore**: Dynamic reputation scoring system
- **DonationHistory**: Unified financial transparency view

### Key Relationships
```
NGO (1) → (N) Campaigns
Campaign (1) → (N) Transactions  
Campaign (1) → (N) Withdrawals
NGO (1) → (1) NGOScore
```

*For complete data model documentation, see [SYSTEM_DATA_MODELS.md](./docs/SYSTEM_DATA_MODELS.md)*

---

## User Guides

### For Donors

#### Making a Donation
1. **Browse Campaigns**: Visit the campaigns page to see active fundraisers
2. **Select Campaign**: Click on a campaign to view details
3. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
4. **Enter Amount**: Specify donation amount and add optional message
5. **Confirm Transaction**: Review details and confirm in MetaMask
6. **Receive Receipt**: Get confirmation and receipt via email

#### Managing Donations
- **View History**: Access donation history in your profile
- **Track Impact**: Follow campaign updates and progress
- **Download Receipts**: Get tax-deductible donation receipts

### For NGOs

#### Application Process
1. **Submit Application**: Fill out comprehensive NGO registration form
2. **Document Upload**: Provide required verification documents
3. **Admin Review**: Wait for administrator approval (24-48 hours)
4. **Account Setup**: Receive credentials upon approval
5. **Profile Completion**: Complete organization profile

#### Campaign Management
1. **Create Campaign**: Use the campaign creation form
2. **Set Goals**: Define fundraising target and timeline
3. **Add Media**: Upload campaign images and descriptions
4. **Publish**: Submit for review and publication
5. **Monitor Progress**: Track donations and engagement

#### Financial Management
1. **View Dashboard**: Monitor incoming donations
2. **Request Withdrawal**: Submit withdrawal requests
3. **Verify Transactions**: Check blockchain confirmations
4. **Generate Reports**: Create financial and impact reports

### For Administrators

#### NGO Application Review
1. **Review Queue**: Check pending applications in admin dashboard
2. **Verify Documents**: Review uploaded verification documents
3. **Background Check**: Verify organization legitimacy
4. **Approve/Reject**: Make decision with review notes
5. **Send Notification**: Automated email sent to applicant

#### System Monitoring
1. **Health Dashboard**: Monitor system status indicators
2. **User Activity**: Track platform engagement metrics
3. **Financial Oversight**: Review all platform transactions
4. **Issue Resolution**: Address system alerts and issues

---

## Developer Guide

### Project Structure
```
don-8/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── campaign/          # Campaign pages
│   └── ...                # Other pages
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── types/                 # TypeScript definitions
├── mock/                  # Mock data for development
├── docs/                  # Documentation
└── scripts/               # Build and deployment scripts
```

### Key Technologies

#### Frontend Stack
- **Next.js 14**: App router, server components, API routes
- **React 18**: Hooks, context, state management
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives

#### Blockchain Integration
- **Ethers.js**: Ethereum interaction library
- **MetaMask**: Wallet connectivity
- **Smart Contracts**: (Future implementation for enhanced features)

#### Development Tools
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Data management
npm run clear-campaigns    # Clear campaign data
npm run backup-data       # Backup all data
npm run restore-data      # Restore from backup
```

### Custom Hooks

#### useWallet
```typescript
const { account, connect, disconnect, isConnected } = useWallet();
```
Manages MetaMask wallet connection and state.

#### useDonations
```typescript
const { donations, addDonation, getDonationHistory } = useDonations();
```
Handles donation data and transaction management.

#### useAdmin
```typescript
const { applications, approveApplication, rejectApplication } = useAdmin();
```
Manages admin operations and NGO applications.

### Component Patterns

#### Page Components
- Located in `app/` directory
- Use server components where possible
- Implement proper loading and error states

#### Feature Components
- Located in `components/` directory
- Reusable across multiple pages
- Include proper TypeScript props

#### UI Components
- Located in `components/ui/`
- Based on Radix UI primitives
- Consistent styling with Tailwind

### API Development

#### Route Structure
```typescript
// app/api/example/route.ts
export async function GET(request: Request) {
  // Handle GET request
}

export async function POST(request: Request) {
  // Handle POST request
}
```

#### Error Handling
```typescript
try {
  // API logic
  return Response.json({ success: true, data });
} catch (error) {
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Testing Strategies

#### Manual Testing Checklist
- [ ] Wallet connection/disconnection
- [ ] Donation flow end-to-end
- [ ] NGO application and approval
- [ ] Campaign creation and management
- [ ] Admin dashboard functionality
- [ ] Email notifications
- [ ] Mobile responsiveness

#### Data Validation
- All forms use Zod schemas for validation
- API endpoints validate input data
- Blockchain transactions are verified

---

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] SMTP email service setup
- [ ] Supabase backup configured (optional)
- [ ] Domain and SSL certificate
- [ ] MetaMask network configuration
- [ ] Performance monitoring setup

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

#### Docker Deployment
```dockerfile
# Dockerfile included for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

#### Traditional Hosting
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Environment Variables
```env
# Required
NEXT_PUBLIC_APP_URL=https://yourdomain.com
SMTP_HOST=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
ADMIN_EMAIL=admin@yourdomain.com

# Optional
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

---

## Troubleshooting

### Common Issues

#### MetaMask Connection Issues
**Problem**: Wallet won't connect
**Solutions**:
- Refresh page and try again
- Check MetaMask is unlocked
- Ensure correct network is selected
- Clear browser cache

#### Email Not Sending
**Problem**: Verification/notification emails not received
**Solutions**:
- Check SMTP configuration
- Verify email credentials
- Check spam/junk folder
- Test with different email provider

#### API Errors
**Problem**: 500 Internal Server Error
**Solutions**:
- Check browser console for details
- Verify API endpoint exists
- Check request payload format
- Review server logs

#### Build Failures
**Problem**: TypeScript compilation errors
**Solutions**:
- Run `npm run lint` to check for issues
- Verify all imports are correct
- Check TypeScript configuration
- Clear `.next` folder and rebuild

### Debug Commands
```bash
# Check system health
curl http://localhost:3000/api/health

# View detailed error logs
npm run dev # Check terminal output

# Test API endpoints
# Use tools like Postman or curl

# Clear Next.js cache
rm -rf .next
npm run build
```

### Performance Monitoring
- Use browser DevTools Network tab
- Monitor API response times
- Check for memory leaks in Components
- Optimize images and assets

### Getting Help
1. Check this documentation
2. Review existing GitHub issues
3. Create new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS information
   - Console error messages

---

## Additional Resources

### Related Documentation
- [API Endpoints](./docs/API_ENDPOINTS.md) - Complete API reference
- [System Data Models](./docs/SYSTEM_DATA_MODELS.md) - Data architecture
- [NGO Registration Guide](./docs/ngo-registration.md) - NGO onboarding
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Developer Setup](./DEVELOPER_SETUP_GUIDE.md) - Development environment

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [MetaMask Developer Docs](https://docs.metamask.io/)
- [Radix UI Components](https://radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Ethers.js Documentation](https://docs.ethers.io/)

### Community
- GitHub Issues: Report bugs and feature requests
- Discussions: Community support and ideas
- Contributing: See CONTRIBUTING.md for guidelines

---

## Changelog

### Version 2.2.0 (Current)
- ✅ Complete Supabase backup system implementation
- ✅ Enhanced email verification and notification system
- ✅ Comprehensive admin dashboard with NGO application management
- ✅ Financial transparency with donation and withdrawal history
- ✅ Dynamic NGO reputation scoring system
- ✅ Complete API documentation and system health monitoring

### Version 2.1.0
- ✅ Full backend integration with health monitoring
- ✅ Authentication system and user management
- ✅ NGO application workflow
- ✅ Campaign management system
- ✅ Real-time status indicators

### Version 2.0.0
- ✅ Initial blockchain integration
- ✅ MetaMask wallet connectivity
- ✅ Basic donation functionality
- ✅ Responsive UI with Tailwind CSS

---

*This documentation is maintained by the DON8 development team. Last updated: October 8, 2025*