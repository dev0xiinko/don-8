#!/bin/bash

# =============================================================================
# Campaign Cleanup Script for Testing
# =============================================================================
# This script clears all campaigns and related data to provide a clean
# testing environment for the donation platform.
#
# Usage: ./scripts/clear-campaigns.sh
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}🧹 Campaign Cleanup Script${NC}"
echo -e "${BLUE}===========================${NC}"
echo ""

# Function to print status messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Change to project directory
cd "$PROJECT_ROOT"

log_info "Navigating to project root: $PROJECT_ROOT"

# Confirm action with user
echo ""
echo -e "${YELLOW}This will delete ALL campaigns and donation data!${NC}"
echo -e "${YELLOW}Are you sure you want to proceed? (y/N)${NC}"
read -r confirmation

if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
    log_info "Operation cancelled by user"
    exit 0
fi

echo ""
log_info "Starting campaign cleanup process..."

# 1. Clear main campaigns.json file
log_info "Clearing main campaigns file..."
if [ -f "mock/campaigns.json" ]; then
    echo "[]" > mock/campaigns.json
    log_success "Main campaigns.json cleared"
else
    log_warning "Main campaigns.json not found, creating empty file"
    mkdir -p mock
    echo "[]" > mock/campaigns.json
fi

# 2. Remove individual campaign files
log_info "Removing individual campaign files..."
if [ -d "mock/campaigns" ]; then
    campaign_count=$(find mock/campaigns -name "campaign_*.json" -type f | wc -l)
    if [ "$campaign_count" -gt 0 ]; then
        rm -f mock/campaigns/campaign_*.json
        log_success "Removed $campaign_count individual campaign files"
    else
        log_info "No individual campaign files found"
    fi
else
    log_info "Campaigns directory doesn't exist, creating it"
    mkdir -p mock/campaigns
fi

# 3. Clear NGO scores (optional)
log_info "Clearing NGO scores..."
if [ -f "mock/ngo-scores.json" ]; then
    echo "[]" > mock/ngo-scores.json
    log_success "NGO scores cleared"
else
    log_info "NGO scores file not found, creating empty file"
    echo "[]" > mock/ngo-scores.json
fi

# 4. Clear donation files (if they exist separately)
log_info "Checking for separate donation files..."
if [ -d "mock/donations" ]; then
    donation_count=$(find mock/donations -name "*.json" -type f | wc -l)
    if [ "$donation_count" -gt 0 ]; then
        rm -f mock/donations/*.json
        log_success "Removed $donation_count donation files"
    else
        log_info "No separate donation files found"
    fi
fi

# 5. Clear any report files
log_info "Clearing uploaded reports..."
if [ -d "public/reports" ]; then
    report_count=$(find public/reports -name "*" -type f | wc -l)
    if [ "$report_count" -gt 0 ]; then
        rm -f public/reports/*
        log_success "Removed $report_count report files"
    else
        log_info "No report files found"
    fi
fi

# 6. Verify cleanup
echo ""
log_info "Verifying cleanup..."

# Check campaigns.json
campaigns_content=$(cat mock/campaigns.json 2>/dev/null || echo "ERROR")
if [ "$campaigns_content" = "[]" ]; then
    log_success "Main campaigns file verified empty"
else
    log_error "Main campaigns file verification failed"
fi

# Check campaigns directory
campaign_files=$(find mock/campaigns -name "campaign_*.json" -type f 2>/dev/null | wc -l)
if [ "$campaign_files" -eq 0 ]; then
    log_success "Individual campaign files verified cleared"
else
    log_error "$campaign_files campaign files still exist"
fi

# 7. Display final status
echo ""
echo -e "${GREEN}🎉 Cleanup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Current Status:${NC}"
echo -e "   • Main campaigns: $(cat mock/campaigns.json | jq length 2>/dev/null || echo 0) campaigns"
echo -e "   • Individual files: $(find mock/campaigns -name 'campaign_*.json' -type f 2>/dev/null | wc -l) files"
echo -e "   • NGO scores: $(cat mock/ngo-scores.json 2>/dev/null | jq length 2>/dev/null || echo 0) scores"
echo ""
echo -e "${BLUE}🚀 Ready for testing!${NC}"
echo -e "   • Homepage will show 0 SONIC raised, 0 campaigns"
echo -e "   • NGO dashboard will show empty campaign list"
echo -e "   • All statistics will start from zero"
echo -e "   • Create new campaigns to test functionality"
echo ""