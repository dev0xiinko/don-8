# Real-Time Campaign Updates System

## Overview
This system ensures that whenever NGOs make updates to their campaigns (reports, campaign updates, etc.) from their management dashboard, the campaign donation page is updated in real-time for all visitors.

## Components Updated

### 1. Campaign Page (`/app/campaign/[id]/page.tsx`)
**New Features:**
- **Real-time polling**: Checks campaign data every 5 seconds for updates
- **Timestamp tracking**: Monitors `lastUpdated` timestamp to detect changes  
- **Automatic refresh**: Updates all campaign data when changes are detected
- **Visual notifications**: Shows temporary notification when campaign is updated
- **Proper cleanup**: Clears polling intervals on component unmount

**Key Functions:**
```typescript
// Real-time campaign monitoring
useEffect(() => {
  const interval = setInterval(async () => {
    // Check if campaign.lastUpdated has changed
    // If yes, refresh all campaign data
  }, 5000) // Every 5 seconds
}, [campaignId, lastUpdatedTimestamp])
```

### 2. NGO Management (`/app/ngo/management/page.tsx`)
**Enhanced Functions:**
- **`handleReportUpload`**: Now triggers campaign timestamp update
- **`handleUpdateAdded`**: Now triggers campaign timestamp update
- **Scoring integration**: Updates NGO scores when reports/updates are posted

**New API Calls:**
```typescript
// Trigger timestamp update for real-time sync
await fetch(`/api/campaigns/${campaignId}`, {
  method: 'PATCH',
  body: JSON.stringify({
    type: 'update_timestamp',
    source: 'report_upload' // or 'campaign_update'
  })
})
```

### 3. Campaign API (`/app/api/campaigns/[id]/route.ts`)
**New Handler:**
- **`update_timestamp`**: Updates campaign's `lastUpdated` field
- **Automatic timestamping**: All PATCH operations now update `lastUpdated`

### 4. Campaign Reports Component (`/components/campaign-reports.tsx`)
**Enhanced Features:**
- **`refreshKey` prop**: Triggers report refresh when campaign updates
- **Real-time synchronization**: Automatically fetches new reports

### 5. Campaign Updates API (`/app/api/ngo/campaigns/[id]/updates/route.ts`)
**Dual Storage Updates:**
- Updates both `campaigns.json` and comprehensive campaign files
- Ensures data consistency across all storage systems
- Automatic timestamp updates trigger real-time sync

## How It Works

### 1. NGO Posts Update/Report
```
NGO Management Dashboard
         ↓
   API Call (POST/PATCH)  
         ↓
Update lastUpdated timestamp
         ↓
   Save to storage
```

### 2. Campaign Page Detects Changes
```
Campaign Page Polling (every 5s)
         ↓
   Check lastUpdated
         ↓
If changed: Refresh all data
         ↓
  Show notification
```

### 3. Real-Time Data Flow
```
NGO Update → Timestamp Change → Campaign Detection → Auto Refresh → User Sees Update
```

## Benefits

### For NGOs:
- ✅ Updates are immediately visible to donors
- ✅ Better engagement with real-time transparency
- ✅ Scoring system rewards timely updates

### For Donors:
- ✅ Always see latest campaign information
- ✅ Real-time progress updates
- ✅ Immediate visibility of new reports

### For System:
- ✅ Efficient polling (only checks timestamps)
- ✅ Consistent data across all storage systems
- ✅ Proper cleanup prevents memory leaks

## Configuration

### Polling Intervals:
- **Campaign updates**: 5 seconds (configurable)
- **Donation updates**: 10 seconds
- **Personal history**: 10 seconds when wallet connected

### Notification System:
- **Visual indicators**: Temporary notifications for updates
- **Console logging**: Detailed update tracking
- **Error handling**: Graceful failure handling

## Usage Examples

### NGO uploads a report:
1. NGO selects file and uploads via report modal
2. System updates campaign timestamp
3. Campaign page detects change within 5 seconds
4. Reports section refreshes automatically
5. Donors see new report immediately

### NGO posts campaign update:
1. NGO writes update via AddUpdateModal
2. System saves update and updates timestamp
3. Campaign page polling detects change
4. Updates section refreshes
5. Visitors see new content in real-time

## Technical Notes

- **Memory management**: All intervals are properly cleaned up
- **Error resilience**: Polling continues even if individual requests fail  
- **Performance**: Only checks timestamps, not full data comparison
- **Scalability**: Efficient for multiple concurrent users
- **Consistency**: Dual storage ensures data integrity

This system ensures that the campaign donation pages stay synchronized with NGO management activities in real-time, providing transparency and up-to-date information to all stakeholders.