# DON-8 Development Setup Guide

## 🚀 Quick Start for New Developers

### Latest Version: v2.3.0 - Real-Time Donation Tracking System

---

## 📋 Prerequisites

- **Node.js** 18+ 
- **Git** for version control
- **MetaMask** browser extension (for testing)
- **Code Editor** (VS Code recommended)

## 🛠 Setup Instructions

### 1. **Clone the Repository**
```bash
git clone https://github.com/dev0xiinko/don-8.git
cd don-8
```

### 2. **Switch to Latest Production Branch**
```bash
git checkout production/v2.3.0-donation-tracking
```

### 3. **Install Dependencies**
```bash
npm install
```

### 4. **Create Required Directories**
```bash
mkdir -p mock/donations
chmod 755 mock/donations
```

### 5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or next available port).

---

## 🎯 Key Features to Test

### Real-Time Donation System
1. Navigate to any campaign: `http://localhost:3000/campaign/2`
2. Connect MetaMask wallet
3. Make a small test donation (0.01 SONIC)
4. Watch real-time status updates from pending → confirmed
5. Check donation transparency feed (visible to all users)

### Campaign Management
1. Visit NGO login: `http://localhost:3000/ngo/login`
2. Use test credentials: `web3cebu@gmail.com` / `Web3Cebu2024`
3. Create new campaigns with image uploads
4. View campaign analytics and donation tracking

### Admin Dashboard
1. Access admin panel with proper authentication
2. Review NGO applications and campaign approvals
3. Monitor platform-wide donation statistics

---

## 📁 Project Structure

```
don-8/
├── app/                          # Next.js app router
│   ├── campaign/[id]/           # Individual campaign pages
│   ├── api/                     # API endpoints
│   │   ├── donations/           # NEW: Donation tracking APIs
│   │   ├── ngo/                # NGO management
│   │   └── admin/              # Admin operations
│   └── ngo/                    # NGO dashboard
├── components/                  # React components
│   ├── campaign-donations.tsx   # NEW: Real-time donation feed
│   ├── ui/                     # UI components
│   └── admin/                  # Admin components
├── lib/                        # Utility libraries
│   ├── donation-storage.ts     # NEW: Donation management
│   └── blob-storage.ts         # Image storage system
├── mock/                       # Mock data & JSON storage
│   ├── donations/              # NEW: Donation JSON files
│   ├── campaigns.json          # Campaign data
│   └── ngo-applications.json   # NGO applications
└── docs/                       # Documentation
```

---

## 🔍 API Endpoints

### Donation System (NEW in v2.3.0)
```bash
GET  /api/donations/[campaignId]     # Get campaign donations
POST /api/donations/[campaignId]     # Save donations + update amounts
```

### Campaign Management
```bash
GET  /api/ngo/campaigns             # List all campaigns
POST /api/ngo/campaigns             # Create new campaign
GET  /api/ngo/campaigns/[id]/updates # Get campaign updates
```

### Admin Operations
```bash
GET  /api/admin/ngo-applications    # List NGO applications
POST /api/admin/ngo-applications/[id]/approve # Approve NGO
POST /api/admin/ngo-applications/[id]/reject  # Reject NGO
```

---

## 🧪 Testing Guide

### 1. **Donation Flow Testing**
```bash
# Navigate to campaign page
http://localhost:3000/campaign/2

# Steps to test:
1. Connect MetaMask wallet (Sonic Blaze Testnet)
2. Enter donation amount (0.01 SONIC)
3. Add optional message
4. Submit transaction
5. Watch real-time status updates
6. Verify donation appears in transparency feed
7. Check campaign raised amount updates
```

### 2. **API Testing**
```bash
# Test donation retrieval
curl http://localhost:3000/api/donations/2

# Test campaign data
curl http://localhost:3000/api/ngo/campaigns

# Check NGO credentials
curl http://localhost:3000/api/ngo/credentials
```

### 3. **Data Persistence Testing**
```bash
# Make donation → Close browser → Reopen
# Verify donation data persists in:
1. Campaign transparency feed
2. Personal donation history
3. Updated campaign amounts
4. JSON files in /mock/donations/
```

---

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Maintenance
npm run lint        # Check code quality
npm run type-check  # TypeScript validation
```

---

## 📊 Monitoring & Debugging

### 1. **Console Logs**
- Donation saves: `"Donation saved for campaign X"`
- Status updates: `"Transaction X confirmed in block Y"`
- API calls: Network tab in browser dev tools

### 2. **File System Monitoring**
```bash
# Check donation files
ls -la mock/donations/

# View campaign updates
cat mock/campaigns.json | jq '.[] | {id, raisedAmount, donorCount}'

# Monitor API logs
tail -f logs/api.log  # If logging is configured
```

### 3. **Common Issues**

#### Donations Not Appearing
```javascript
// Force refresh from server
const manager = DonationStorageManager.getInstance()
await manager.forceRefreshFromServer(campaignId)
```

#### MetaMask Connection Issues
- Ensure Sonic Blaze Testnet is added to MetaMask
- Check wallet permissions in browser
- Verify HTTPS in production

#### File Permission Errors
```bash
sudo chown -R $USER:$USER mock/
chmod -R 755 mock/
```

---

## 🌐 Network Configuration

### Sonic Blaze Testnet
```javascript
// Network Details (auto-configured)
Chain ID: 64165
RPC URL: https://rpc.blaze.soniclabs.com
Explorer: https://blaze.soniclabs.com
Currency: SONIC
```

### MetaMask Setup
1. Add Sonic Blaze network to MetaMask
2. Get test SONIC from faucet
3. Connect wallet to application

---

## 🔐 Security Notes

### Test Credentials
```bash
# NGO Login
Email: web3cebu@gmail.com
Password: Web3Cebu2024

# Admin Access
# (Use proper authentication in production)
```

### Production Considerations
- Enable HTTPS for wallet connections
- Set proper file permissions
- Configure rate limiting
- Monitor transaction volumes
- Implement proper logging

---

## 📚 Documentation Links

- **Complete System Docs**: `DONATION_SYSTEM_README.md`
- **API Reference**: Inline comments in `/app/api/`
- **Component Guide**: Comments in `/components/`
- **Version History**: `CHANGELOG.md`

---

## 🔄 Git Workflow

### Branch Structure
```bash
main                              # Main development branch
├── production/v2.3.0-donation-tracking  # Latest production (CURRENT)
├── production/v2.2.0-admin-auth        # Previous version
└── production/v2.1.0-final            # Stable release
```

### Creating Features
```bash
git checkout production/v2.3.0-donation-tracking
git pull origin production/v2.3.0-donation-tracking
git checkout -b feature/your-feature-name
# Make changes
git commit -m "feat: description"
git push origin feature/your-feature-name
```

---

## 📞 Support

### If You Get Stuck
1. Check console for error messages
2. Verify file permissions in `/mock` directory
3. Ensure MetaMask is connected to Sonic Blaze
4. Review API responses in Network tab
5. Check donation JSON files exist and are readable

### Key Files to Understand
1. `/lib/donation-storage.ts` - Core donation logic
2. `/components/campaign-donations.tsx` - UI components
3. `/app/campaign/[id]/page.tsx` - Campaign page integration
4. `/app/api/donations/[campaignId]/route.ts` - Persistence API

---

## 🎉 Success Metrics

Your setup is successful when:
- ✅ Campaign pages load with donation forms
- ✅ MetaMask connects and shows SONIC balance
- ✅ Test donations process and show real-time updates
- ✅ Donation data persists across browser refreshes
- ✅ Campaign amounts update automatically
- ✅ Transparency feed shows all donations

---

**Happy Coding! 🚀**

The DON-8 platform now has a complete, production-ready donation tracking system. Focus on testing the real-time features and exploring the transparency components for the best development experience.