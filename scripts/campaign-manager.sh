#!/bin/bash

# =============================================================================
# Campaign Management Script for Testing & Demo
# =============================================================================
# This script provides multiple operations for managing campaign data:
# - Clear all campaigns and data (for testing)
# - Backup current data (before demos)
# - Restore backed-up data (after demos)
# - Show current status
#
# Usage: ./scripts/campaign-manager.sh [command]
# Commands: clear, backup, restore, status, help
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() { echo -e "${PURPLE}🚀 $1${NC}"; }

# Help function
show_help() {
    echo -e "${CYAN}Campaign Management Script${NC}"
    echo -e "${CYAN}=========================${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo -e "  ${GREEN}clear${NC}    - Clear all campaigns and reset to empty state"
    echo -e "  ${GREEN}backup${NC}   - Create backup of current campaign data"
    echo -e "  ${GREEN}restore${NC}  - Restore from most recent backup"
    echo -e "  ${GREEN}status${NC}   - Show current campaign and data status"
    echo -e "  ${GREEN}help${NC}     - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 clear          # Clear everything for testing"
    echo "  $0 backup         # Backup before demo"
    echo "  $0 restore        # Restore after demo"
    echo "  $0 status         # Check current state"
    echo ""
}

# Status function
show_status() {
    log_header "Current System Status"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Campaign statistics
    if [ -f "mock/campaigns.json" ]; then
        campaign_count=$(jq length mock/campaigns.json 2>/dev/null || echo "0")
        echo -e "${BLUE}📊 Main Campaigns:${NC} $campaign_count campaigns"
        
        if [ "$campaign_count" -gt 0 ]; then
            echo -e "${BLUE}   Campaign Details:${NC}"
            jq -r '.[] | "   • ID \(.id): \(.title) (\(.ngoName))"' mock/campaigns.json 2>/dev/null || echo "   • Error reading campaign details"
        fi
    else
        echo -e "${YELLOW}📊 Main Campaigns: File not found${NC}"
    fi
    
    # Individual campaign files
    individual_count=$(find mock/campaigns -name "campaign_*.json" -type f 2>/dev/null | wc -l)
    echo -e "${BLUE}📁 Individual Files:${NC} $individual_count files"
    
    # NGO scores
    if [ -f "mock/ngo-scores.json" ]; then
        score_count=$(jq length mock/ngo-scores.json 2>/dev/null || echo "0")
        echo -e "${BLUE}🏆 NGO Scores:${NC} $score_count NGOs"
    else
        echo -e "${YELLOW}🏆 NGO Scores: File not found${NC}"
    fi
    
    # Reports
    report_count=$(find public/reports -type f 2>/dev/null | wc -l || echo "0")
    echo -e "${BLUE}📄 Reports:${NC} $report_count files"
    
    # Backups
    if [ -d "$BACKUP_DIR" ]; then
        backup_count=$(find "$BACKUP_DIR" -name "backup-*" -type d 2>/dev/null | wc -l)
        echo -e "${BLUE}💾 Backups:${NC} $backup_count available"
        
        if [ "$backup_count" -gt 0 ]; then
            latest_backup=$(find "$BACKUP_DIR" -name "backup-*" -type d | sort | tail -1)
            if [ -n "$latest_backup" ]; then
                backup_name=$(basename "$latest_backup")
                echo -e "${BLUE}   Latest:${NC} $backup_name"
            fi
        fi
    else
        echo -e "${BLUE}💾 Backups:${NC} No backup directory"
    fi
    
    echo ""
}

# Backup function
create_backup() {
    log_header "Creating Backup"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Generate backup name with timestamp
    backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    backup_path="$BACKUP_DIR/$backup_name"
    
    log_info "Creating backup: $backup_name"
    mkdir -p "$backup_path"
    
    # Backup campaigns
    if [ -f "mock/campaigns.json" ]; then
        cp "mock/campaigns.json" "$backup_path/"
        log_success "Backed up main campaigns file"
    fi
    
    # Backup individual campaign files
    if [ -d "mock/campaigns" ] && [ "$(ls -A mock/campaigns)" ]; then
        mkdir -p "$backup_path/campaigns"
        cp mock/campaigns/*.json "$backup_path/campaigns/" 2>/dev/null || true
        file_count=$(find mock/campaigns -name "*.json" -type f | wc -l)
        log_success "Backed up $file_count individual campaign files"
    fi
    
    # Backup NGO scores
    if [ -f "mock/ngo-scores.json" ]; then
        cp "mock/ngo-scores.json" "$backup_path/"
        log_success "Backed up NGO scores"
    fi
    
    # Backup reports
    if [ -d "public/reports" ] && [ "$(ls -A public/reports)" ]; then
        mkdir -p "$backup_path/reports"
        cp -r public/reports/* "$backup_path/reports/" 2>/dev/null || true
        report_count=$(find public/reports -type f | wc -l)
        log_success "Backed up $report_count report files"
    fi
    
    # Create backup info file
    cat > "$backup_path/backup-info.txt" << EOF
Backup Information
==================
Created: $(date)
Backup Name: $backup_name
System Status at Backup:

$(show_status)
EOF
    
    echo ""
    log_success "Backup completed successfully!"
    echo -e "${BLUE}📁 Backup Location:${NC} $backup_path"
    echo ""
}

# Restore function
restore_backup() {
    log_header "Restoring from Backup"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "No backup directory found!"
        exit 1
    fi
    
    # Find latest backup
    latest_backup=$(find "$BACKUP_DIR" -name "backup-*" -type d | sort | tail -1)
    
    if [ -z "$latest_backup" ]; then
        log_error "No backups found!"
        exit 1
    fi
    
    backup_name=$(basename "$latest_backup")
    log_info "Restoring from: $backup_name"
    
    # Confirm restore
    echo -e "${YELLOW}This will overwrite current data with backup data!${NC}"
    echo -e "${YELLOW}Continue? (y/N)${NC}"
    read -r confirmation
    
    if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
        log_info "Restore cancelled"
        exit 0
    fi
    
    # Restore campaigns.json
    if [ -f "$latest_backup/campaigns.json" ]; then
        cp "$latest_backup/campaigns.json" "mock/"
        log_success "Restored main campaigns file"
    fi
    
    # Restore individual campaign files
    if [ -d "$latest_backup/campaigns" ]; then
        mkdir -p "mock/campaigns"
        rm -f mock/campaigns/*.json 2>/dev/null || true
        cp "$latest_backup/campaigns"/*.json "mock/campaigns/" 2>/dev/null || true
        file_count=$(find "$latest_backup/campaigns" -name "*.json" -type f | wc -l)
        log_success "Restored $file_count individual campaign files"
    fi
    
    # Restore NGO scores
    if [ -f "$latest_backup/ngo-scores.json" ]; then
        cp "$latest_backup/ngo-scores.json" "mock/"
        log_success "Restored NGO scores"
    fi
    
    # Restore reports
    if [ -d "$latest_backup/reports" ]; then
        mkdir -p "public/reports"
        rm -f public/reports/* 2>/dev/null || true
        cp -r "$latest_backup/reports"/* "public/reports/" 2>/dev/null || true
        report_count=$(find "$latest_backup/reports" -type f | wc -l)
        log_success "Restored $report_count report files"
    fi
    
    echo ""
    log_success "Restore completed successfully!"
    echo ""
}

# Clear function
clear_all_data() {
    log_header "Clearing All Campaign Data"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Confirm action
    echo -e "${RED}⚠️  WARNING: This will delete ALL campaigns and related data!${NC}"
    echo -e "${YELLOW}This action cannot be undone unless you have a backup.${NC}"
    echo -e "${YELLOW}Continue? (y/N)${NC}"
    read -r confirmation
    
    if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled"
        exit 0
    fi
    
    log_info "Starting cleanup process..."
    
    # Clear main campaigns file
    mkdir -p mock
    echo "[]" > mock/campaigns.json
    log_success "Cleared main campaigns file"
    
    # Remove individual campaign files
    if [ -d "mock/campaigns" ]; then
        rm -f mock/campaigns/campaign_*.json
        log_success "Removed individual campaign files"
    fi
    
    # Clear NGO scores
    echo "[]" > mock/ngo-scores.json
    log_success "Cleared NGO scores"
    
    # Clear reports
    if [ -d "public/reports" ]; then
        rm -f public/reports/*
        log_success "Cleared report files"
    fi
    
    # Clear any donation files
    if [ -d "mock/donations" ]; then
        rm -f mock/donations/*.json
        log_success "Cleared donation files"
    fi
    
    echo ""
    log_success "All data cleared successfully!"
    echo -e "${GREEN}🎉 System ready for fresh testing!${NC}"
    echo ""
}

# Main script logic
case "${1:-help}" in
    "clear")
        clear_all_data
        show_status
        ;;
    "backup")
        create_backup
        ;;
    "restore")
        restore_backup
        show_status
        ;;
    "status")
        show_status
        ;;
    "help"|"")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac