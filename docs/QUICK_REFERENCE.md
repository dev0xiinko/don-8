# DON8 Platform - Quick Reference Guide

## 🚀 Platform Overview
DON8 is a blockchain-powered charitable donation platform providing complete transparency and accountability in the donation ecosystem.

## 📋 Quick Navigation

### 📖 Documentation Files
| Document | Purpose | Audience |
|----------|---------|----------|
| [COMPREHENSIVE_DOCUMENTATION.md](./COMPREHENSIVE_DOCUMENTATION.md) | Complete platform guide | All users |
| [API_ENDPOINTS.md](./API_ENDPOINTS.md) | API reference (29 endpoints) | Developers |
| [SYSTEM_DATA_MODELS.md](./SYSTEM_DATA_MODELS.md) | Data architecture | Developers |
| [DEPLOYMENT.md](../DEPLOYMENT.md) | Production deployment | DevOps |
| [DEVELOPER_SETUP_GUIDE.md](../DEVELOPER_SETUP_GUIDE.md) | Development setup | Developers |

### 🔧 Quick Start Commands
```bash
# Installation
git clone https://github.com/dev0xiinko/don-8.git
cd don-8
npm install

# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server

# Data Management
npm run clear-campaigns    # Clear campaign data
npm run backup-data       # Backup all data
npm run restore-data      # Restore from backup
npm run sanitize-ngo-apps # Clean NGO application data
```

### 🌐 Key URLs
- **Development**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Campaign Browser**: http://localhost:3000/campaigns

### 🎯 Core Features Checklist
- ✅ **Blockchain Donations**: MetaMask integration with transaction tracking
- ✅ **NGO Verification**: Multi-step application and approval process
- ✅ **Campaign Management**: Create, manage, and monitor fundraising campaigns
- ✅ **Financial Transparency**: Real-time donation and withdrawal tracking
- ✅ **Admin Dashboard**: Complete platform oversight and management
- ✅ **Email System**: Automated notifications and verifications
- ✅ **Reputation Scoring**: Dynamic NGO scoring based on performance
- ✅ **Health Monitoring**: System status and performance tracking

### 👥 User Roles & Access
| Role | Access Level | Primary Features |
|------|-------------|------------------|
| **Donor** | Public | Browse campaigns, make donations, view history |
| **NGO** | Authenticated | Create campaigns, manage funds, view analytics |
| **Admin** | Privileged | Approve NGOs, monitor system, manage users |

### 🏗️ Technical Stack
```
Frontend:     Next.js 14, React 18, TypeScript, Tailwind CSS
Blockchain:   Ethers.js, MetaMask integration
UI:           Radix UI components, Lucide icons
State:        React Context, Custom hooks
Backend:      Next.js API routes, RESTful design
Storage:      JSON files + Supabase backup
Email:        Nodemailer with SMTP
```

### 📊 API Summary
- **29 Total Endpoints** across 6 categories
- **Authentication**: Login, register, verify, reset password
- **NGO Management**: CRUD operations, withdrawals, applications
- **Campaigns**: Full lifecycle management
- **Admin**: Dashboard, user management, approvals
- **Donations**: Transaction processing and history
- **System**: Health checks and monitoring

### 🔐 Environment Setup
```env
# Required
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
ADMIN_EMAIL=admin@don8.com

# Optional
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

### 🚨 Common Issues & Solutions

| Issue | Quick Fix |
|-------|-----------|
| MetaMask won't connect | Refresh page, check if unlocked |
| Email not sending | Verify SMTP config in .env.local |
| API 500 errors | Check browser console, verify endpoints |
| Build failures | Run `npm run lint`, check imports |
| Health check fails | Restart dev server, check API routes |

### 📁 Project Structure Overview
```
don-8/
├── app/                    # Next.js pages and API routes
│   ├── api/               # Backend endpoints
│   ├── admin/             # Admin interface  
│   ├── campaign/          # Campaign pages
│   ├── donate/            # Donation flow
│   └── ngo/               # NGO management
├── components/            # React components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
├── types/                 # TypeScript definitions
├── mock/                  # Development data
└── docs/                  # Documentation
```

### 📈 Performance Metrics
- **Health Monitoring**: Real-time system status
- **Response Times**: API endpoint performance tracking
- **Blockchain Verification**: Transaction confirmation status
- **Email Delivery**: SMTP success/failure rates
- **User Engagement**: Campaign views, donations, registrations

### 🛠️ Development Workflow
1. **Setup**: Clone repo, install dependencies, configure environment
2. **Development**: Run `npm run dev`, make changes, test locally
3. **Testing**: Manual testing checklist, API validation
4. **Build**: `npm run build` for production optimization  
5. **Deploy**: Vercel, Docker, or traditional hosting

### 📞 Support & Resources
- **Documentation**: Complete guides in `/docs` folder
- **Issues**: GitHub issue tracker for bugs and features
- **API Testing**: Use Postman or curl for endpoint testing
- **Health Check**: `/api/health` for system status

---

## 🎯 Quick Action Items

### For New Developers
1. Read [COMPREHENSIVE_DOCUMENTATION.md](./COMPREHENSIVE_DOCUMENTATION.md)
2. Follow [DEVELOPER_SETUP_GUIDE.md](../DEVELOPER_SETUP_GUIDE.md)  
3. Review [API_ENDPOINTS.md](./API_ENDPOINTS.md)
4. Explore [SYSTEM_DATA_MODELS.md](./SYSTEM_DATA_MODELS.md)

### For Deployment
1. Check [DEPLOYMENT.md](../DEPLOYMENT.md)
2. Configure environment variables
3. Set up SMTP email service
4. Deploy to Vercel or preferred platform

### For Users
1. Install MetaMask browser extension
2. Visit platform URL
3. Connect wallet for donations
4. Browse campaigns or apply as NGO

---

*Quick Reference - Last Updated: October 8, 2025*