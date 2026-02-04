const fs = require('fs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');

// Files to update (excluding LoginView and DashboardView which are already done)
const filesToUpdate = [
  'CustomersView.jsx',
  'DcaLeaderboardView.jsx',
  'DcaAdminDashboard.jsx',
  'DcaAgentsView.jsx',
  'IssuesResolveView.jsx',
  'SlaManagementView.jsx',
  'CampaignView.jsx',
];

function updateFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let updated = false;

  // Replace bg-surface-dark with light/dark variant
  const newContent = content
    .replace(/className=(['"])([^'"]*)\bbg-surface-dark\b/g, (match, quote, before) => {
      updated = true;
      return `className=${quote}${before}bg-white dark:bg-surface-dark`;
    })
    // Replace border-surface-border with light/dark variant
    .replace(/\bborder-surface-border\b/g, () => {
      updated = true;
      return 'border-slate-200 dark:border-surface-border';
    })
    // Replace standalone text-white in headings and labels
    .replace(/className=(['"])([^'"]*)\btext-white\b([^'"]*)\1/g, (match, quote, before, after) => {
      // Skip if it's a button or has bg-primary (those should stay white)
      if (before.includes('bg-primary') || before.includes('bg-') || after.includes('bg-')) {
        return match;
      }
      updated = true;
      return `className=${quote}${before}text-slate-900 dark:text-white${after}${quote}`;
    });

  if (updated) {
    fs.writeFileSync(filepath, newContent, 'utf8');
    console.log(`✓ Updated ${path.basename(filepath)}`);
    return true;
  }
  return false;
}

let totalUpdated = 0;
filesToUpdate.forEach(filename => {
  const filepath = path.join(viewsDir, filename);
  if (fs.existsSync(filepath)) {
    if (updateFile(filepath)) {
      totalUpdated++;
    }
  } else {
    console.log(`✗ File not found: ${filename}`);
  }
});

console.log(`\n✅ Updated ${totalUpdated} files`);
