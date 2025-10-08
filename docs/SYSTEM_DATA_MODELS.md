# System Data Models - Don8 Platform

## Overview
This document outlines the core data models and prototype interfaces used throughout the Don8 charitable donations platform. The system is built on a comprehensive data architecture that handles NGO applications, campaign management, financial transactions, and user interactions.

## Core Data Models

### 1. NGO Application Model
```typescript
interface NGOApplication {
  // Identity
  id: number;
  organizationName: string;
  email: string;
  phone?: string;
  description: string;
  address?: string;
  
  // Registration Details
  registrationNumber: string;
  taxId?: string;
  bankAccountDetails?: string;
  walletAddress: string;
  
  // Contact Information
  contactPersonName?: string;
  uploadedDocuments: string[];
  website?: string;
  
  // Organization Metadata
  category: string;
  foundedYear: string;
  teamSize: string;
  
  // Social Media
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  
  // Application Status
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  
  // Authentication
  credentials: {
    email: string;
    password: string;
  };
}
```

**Usage**: Complete NGO registration lifecycle from application submission to approval/rejection with admin oversight.

### 2. Campaign Model
```typescript
interface Campaign {
  // Basic Information
  id: string;
  title: string;
  description: string;
  story: string;
  
  // Financial
  goalAmount: number;
  currentAmount: number;
  currency: string;
  
  // Timing
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  
  // Organization
  ngoId: number;
  ngoName: string;
  ngoWalletAddress: string;
  
  // Media & Visibility
  imageUrl: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  
  // Geographic
  location: string;
  
  // Campaign Progress
  donations: DonationHistory[];
  withdrawals?: WithdrawalRecord[];
  updates: CampaignUpdate[];
  reports: CampaignReport[];
  
  // Engagement
  totalDonors: number;
  shareCount: number;
  viewCount: number;
}
```

**Usage**: Complete campaign lifecycle with financial tracking, updates, and transparency features.

### 3. Transaction/Donation Model
```typescript
interface Transaction {
  // Identity
  id: string;
  campaignId: string;
  
  // Campaign Context
  campaignTitle: string;
  ngoName: string;
  
  // Donor Information
  donorEmail: string;
  donorName: string;
  anonymous: boolean;
  
  // Financial Details
  amount: number;
  currency: string;
  
  // Blockchain Data
  transactionHash: string;
  walletAddress: string;
  
  // Status & Timing
  donationDate: string;
  status: "pending" | "completed" | "failed";
  
  // Additional Features
  message?: string;
  receiptGenerated: boolean;
}
```

**Usage**: Complete donation tracking with blockchain verification and receipt generation.

### 4. Withdrawal Model
```typescript
interface WithdrawalRecord {
  // Identity
  id: string;
  ngoId: number;
  
  // Financial Details
  amount: number;
  currency: string;
  
  // Blockchain Transaction
  destination: string;
  fromAddress: string;
  txHash: string;
  network: string;
  
  // Status & Verification
  status: "pending" | "completed" | "failed" | "processing";
  blockchainConfirmed: boolean;
  
  // Timing
  timestamp: string;
  createdAt: string;
}
```

**Usage**: NGO withdrawal tracking with blockchain verification for financial transparency.

### 5. NGO Scoring Model
```typescript
interface NGOScore {
  // Identity
  ngoId: number;
  organizationName: string;
  
  // Current Status
  totalScore: number;
  scoreLevel: "excellent" | "good" | "average" | "needs_improvement";
  lastUpdated: string;
  
  // Score Breakdown
  campaignSuccess: number;      // 0-25 points
  transparency: number;         // 0-20 points
  donorEngagement: number;     // 0-20 points
  reportingQuality: number;    // 0-15 points
  financialHealth: number;     // 0-10 points
  socialImpact: number;        // 0-10 points
  
  // Dynamic Criteria
  criteria: {
    totalCampaigns: number;
    completedCampaigns: number;
    totalDonationsReceived: number;
    averageDonationAmount: number;
    donorRetentionRate: number;
    reportSubmissionRate: number;
    withdrawalFrequency: number;
    socialMediaEngagement: number;
  };
  
  // Historical Data
  scoreHistory: ScoreEvent[];
  achievements: Achievement[];
}

interface ScoreEvent {
  date: string;
  score: number;
  event: string;
  impact: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  dateEarned: string;
  points: number;
}
```

**Usage**: Dynamic reputation scoring system with transparent criteria and historical tracking.

### 6. Donation History Model
```typescript
interface DonationHistory {
  // Basic Info
  id: string;
  type: "donation" | "withdrawal";
  
  // Financial
  amount: number;
  currency: string;
  
  // Participants
  donorName?: string;
  donorEmail?: string;
  ngoName: string;
  
  // Transaction Details
  transactionHash: string;
  walletAddress: string;
  
  // Status & Timing
  date: string;
  status: string;
  
  // Additional Context
  message?: string;
  anonymous?: boolean;
  destination?: string; // For withdrawals
  network?: string;     // For withdrawals
}
```

**Usage**: Unified financial transparency showing both incoming donations and outgoing withdrawals.

## Data Relationships

### Primary Relationships
```
NGOApplication (1) → (N) Campaign
Campaign (1) → (N) Transaction
Campaign (1) → (N) WithdrawalRecord  
NGOApplication (1) → (1) NGOScore
Campaign (1) → (N) DonationHistory (combined view)
```

### Key Associations
- **NGO to Campaigns**: One NGO can manage multiple campaigns
- **Campaign to Transactions**: Each campaign receives multiple donations
- **Campaign to Withdrawals**: NGOs can withdraw from successful campaigns
- **NGO to Scoring**: Each approved NGO has a dynamic reputation score
- **Financial Transparency**: Combined donation and withdrawal history per campaign

## Data Storage Strategy

### Primary Storage
- **JSON Files**: Development and testing data
- **Supabase**: Production backup and redundancy
- **Local State**: Runtime management with React hooks

### Backup System
- Automated Supabase backup for critical NGO applications
- JSON sanitization for sensitive data (passwords, personal info)
- Webhook support for real-time backup operations

## System Architecture Notes

### Financial Transparency
- All transactions are blockchain-verified
- Withdrawal history is displayed alongside donations
- Real-time status tracking with proper status mapping
- Complete audit trail for regulatory compliance

### Scoring Algorithm
- Dynamic scoring based on multiple criteria
- Historical tracking for trend analysis
- Achievement system for gamification
- Transparent calculation methodology

### Security & Privacy
- Password hashing for NGO credentials
- Data sanitization in backup operations
- Anonymous donation support
- Secure wallet integration

## File Locations
- **Mock Data**: `/mock/*.json`
- **Type Definitions**: `/types/*.ts`
- **API Hooks**: `/hooks/use*.ts`
- **Components**: `/components/` (various UI components)
- **API Routes**: `/app/api/` (backend endpoints)

This data model architecture supports the complete Don8 platform functionality including NGO management, campaign operations, financial transactions, reputation scoring, and administrative oversight.