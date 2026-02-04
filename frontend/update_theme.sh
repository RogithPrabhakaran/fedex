#!/bin/bash

# Script to update all view files with light/dark mode support
# This replaces hardcoded dark colors with Tailwind dark: variants

VIEWS_DIR="d:/Projects/Fedex SMART/fedex/frontend/views"

# Common replacements
declare -A replacements=(
  ["bg-surface-dark"]="bg-white dark:bg-surface-dark"
  ["border-surface-border"]="border-slate-200 dark:border-surface-border"
  ["text-white"]="text-slate-900 dark:text-white"
  ["text-slate-400"]="text-slate-500 dark:text-slate-400"
  ["text-slate-300"]="text-slate-600 dark:text-slate-300"
)

# Files to update (excluding LoginView which should stay dark)
files=(
  "CustomersView.jsx"
  "DcaLeaderboardView.jsx"
  "DcaAdminDashboard.jsx"
  "DcaAgentsView.jsx"
  "IssuesResolveView.jsx"
  "SlaManagementView.jsx"
  "CampaignView.jsx"
  "ProfileView.jsx"
  "AgentSettingsView.jsx"
  "AdminSettingsView.jsx"
)

for file in "${files[@]}"; do
  filepath="$VIEWS_DIR/$file"
  if [ -f "$filepath" ]; then
    echo "Updating $file..."
    
    # Create backup
    cp "$filepath" "$filepath.bak"
    
    # Apply replacements
    sed -i "s/className='\\([^']*\\)bg-surface-dark/className='\\1bg-white dark:bg-surface-dark/g" "$filepath"
    sed -i "s/className=\"\\([^\"]*\\)bg-surface-dark/className=\"\\1bg-white dark:bg-surface-dark/g" "$filepath"
    
    sed -i "s/border-surface-border/border-slate-200 dark:border-surface-border/g" "$filepath"
    
    # Text colors - be more selective
    sed -i "s/text-white'/text-slate-900 dark:text-white'/g" "$filepath"
    sed -i "s/text-white\"/text-slate-900 dark:text-white\"/g" "$filepath"
    sed -i "s/text-white /text-slate-900 dark:text-white /g" "$filepath"
    
    echo "✓ Updated $file"
  fi
done

echo "All files updated!"
