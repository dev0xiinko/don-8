# Campaign Management Scripts

This directory contains automation scripts for managing campaign data during testing and demos.

## Available Scripts

### 1. Campaign Manager (`campaign-manager.sh`)

A comprehensive script for managing campaign data with multiple operations:

#### Commands:

- **`clear`** - Clear all campaigns and reset to empty state
- **`backup`** - Create timestamped backup of current campaign data  
- **`restore`** - Restore from most recent backup
- **`status`** - Show current campaign and data status
- **`help`** - Show help message

#### Usage:

```bash
# Direct script usage
./scripts/campaign-manager.sh [command]

# Or use npm scripts (recommended)
npm run clear-campaigns    # Clear all data
npm run backup-data       # Create backup
npm run restore-data      # Restore from backup  
npm run data-status       # Show status
```

#### Examples:

```bash
# Before demo/testing - create backup
npm run backup-data

# Clear everything for fresh testing
npm run clear-campaigns

# After demo/testing - restore original data
npm run restore-data

# Check current system status
npm run data-status
```

### 2. Simple Clear Script (`clear-campaigns.sh`)

A basic script that only clears campaign data (legacy script):

```bash
./scripts/clear-campaigns.sh
```

## What Gets Managed

The scripts handle the following data:

- **Main Campaigns** (`mock/campaigns.json`)
- **Individual Campaign Files** (`mock/campaigns/campaign_*.json`)
- **NGO Scores** (`mock/ngo-scores.json`)
- **Report Files** (`public/reports/*`)
- **Donation Files** (`mock/donations/*.json`)

## Backup System

Backups are stored in `/backups` directory with timestamps:

```
backups/
├── backup-20251007-143022/
│   ├── campaigns.json
│   ├── ngo-scores.json
│   ├── campaigns/
│   ├── reports/
│   └── backup-info.txt
└── backup-20251007-150133/
    └── ...
```

Each backup includes:
- All campaign data
- NGO scores
- Uploaded reports
- Backup metadata and system status

## Typical Workflow

### For Testing:
```bash
# 1. Create backup (optional, if you have important data)
npm run backup-data

# 2. Clear everything for testing
npm run clear-campaigns

# 3. Test campaign creation, donations, etc.
# ... perform tests ...

# 4. Restore original data (if needed)
npm run restore-data
```

### For Demos:
```bash
# 1. Before demo - backup current state
npm run backup-data

# 2. Clear for clean demo
npm run clear-campaigns

# 3. Perform demo with fresh data
# ... demo process ...

# 4. After demo - restore original state
npm run restore-data
```

### Check Status Anytime:
```bash
npm run data-status
```

## Safety Features

- **Confirmation prompts** for destructive operations
- **Automatic timestamped backups** 
- **Status verification** after operations
- **Detailed logging** with colors and emojis
- **Error handling** and validation

## Script Features

- 🎨 **Colorized output** for better readability
- 📊 **Detailed status reporting** 
- 💾 **Automatic backup system**
- ✅ **Operation verification**
- 🛡️ **Safety confirmations**
- 📝 **Comprehensive logging**

## Requirements

- Bash shell
- `jq` for JSON processing (optional, graceful degradation)
- Write permissions to project directory

## Notes

- Scripts are designed to be safe and reversible
- All operations include confirmation prompts
- Backups are timestamped and preserved
- Status command shows current system state
- npm scripts provide convenient aliases