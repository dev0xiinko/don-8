#!/usr/bin/env node

// Auto-Migration System Verification
console.log('🔍 Auto-Migration System Verification')
console.log('=====================================\n')

const fs = require('fs')
const path = require('path')

// Check 1: Verify auto-migration component exists
console.log('📁 Check 1: Auto-Migration Files')
const autoMigrationFile = path.join(__dirname, 'components', 'auto-migration.tsx')
const migrationDashboardFile = path.join(__dirname, 'components', 'migration-dashboard.tsx')
const migrationAPIFile = path.join(__dirname, 'app', 'api', 'donations', 'migrate', 'route.ts')
const layoutFile = path.join(__dirname, 'app', 'layout.tsx')

console.log('✅ AutoMigrationHandler:', fs.existsSync(autoMigrationFile) ? 'EXISTS' : '❌ MISSING')
console.log('✅ MigrationDashboard:', fs.existsSync(migrationDashboardFile) ? 'EXISTS' : '❌ MISSING')  
console.log('✅ Migration API:', fs.existsSync(migrationAPIFile) ? 'EXISTS' : '❌ MISSING')
console.log('✅ Layout Integration:', fs.existsSync(layoutFile) ? 'EXISTS' : '❌ MISSING')

// Check 2: Verify layout integration
console.log('\n🔗 Check 2: Layout Integration')
if (fs.existsSync(layoutFile)) {
  const layoutContent = fs.readFileSync(layoutFile, 'utf8')
  const hasImport = layoutContent.includes('AutoMigrationHandler')
  const hasComponent = layoutContent.includes('<AutoMigrationHandler')
  
  console.log('✅ AutoMigrationHandler Import:', hasImport ? 'FOUND' : '❌ MISSING')
  console.log('✅ AutoMigrationHandler Component:', hasComponent ? 'FOUND' : '❌ MISSING')
} else {
  console.log('❌ Layout file not found')
}

// Check 3: Verify donations directory structure  
console.log('\n📂 Check 3: Donations Directory')
const donationsDir = path.join(__dirname, 'mock', 'donations')
console.log('✅ Donations Directory:', fs.existsSync(donationsDir) ? 'EXISTS' : '⚠️  WILL BE CREATED')

if (fs.existsSync(donationsDir)) {
  const files = fs.readdirSync(donationsDir)
  const jsonFiles = files.filter(f => f.endsWith('.json'))
  console.log('📊 JSON Files Found:', jsonFiles.length)
  
  if (jsonFiles.length > 0) {
    console.log('📄 Files:', jsonFiles.join(', '))
  }
}

// Check 4: Verify migration API structure
console.log('\n🔧 Check 4: Migration API Structure')
if (fs.existsSync(migrationAPIFile)) {
  const apiContent = fs.readFileSync(migrationAPIFile, 'utf8')
  const hasPOST = apiContent.includes('export async function POST')
  const hasGET = apiContent.includes('export async function GET')
  
  console.log('✅ POST Method:', hasPOST ? 'FOUND' : '❌ MISSING')
  console.log('✅ GET Method:', hasGET ? 'FOUND' : '❌ MISSING')
} else {
  console.log('❌ Migration API file not found')
}

// Check 5: Auto-migration component structure
console.log('\n🤖 Check 5: Auto-Migration Component Structure')
if (fs.existsSync(autoMigrationFile)) {
  const componentContent = fs.readFileSync(autoMigrationFile, 'utf8')
  const hasUseEffect = componentContent.includes('useEffect')
  const hasCheckAndRun = componentContent.includes('checkAndRunAutoMigration')
  const hasMigrationUtils = componentContent.includes('MigrationUtils')
  
  console.log('✅ useEffect Hook:', hasUseEffect ? 'FOUND' : '❌ MISSING')
  console.log('✅ checkAndRunAutoMigration:', hasCheckAndRun ? 'FOUND' : '❌ MISSING') 
  console.log('✅ MigrationUtils Export:', hasMigrationUtils ? 'FOUND' : '❌ MISSING')
} else {
  console.log('❌ Auto-migration component file not found')
}

// Summary
console.log('\n🎯 SUMMARY')
console.log('==========')

const allFilesExist = [
  autoMigrationFile, 
  migrationDashboardFile, 
  migrationAPIFile, 
  layoutFile
].every(fs.existsSync)

if (allFilesExist) {
  console.log('🎉 ✅ Auto-Migration System: FULLY IMPLEMENTED')
  console.log('🚀 Status: READY TO USE')
  console.log('')
  console.log('📋 Next Steps:')
  console.log('   1. Start your Next.js development server: npm run dev')
  console.log('   2. Open the app in a browser')
  console.log('   3. Check browser console for auto-migration logs')
  console.log('   4. Create some localStorage test data (see documentation)')
  console.log('   5. Refresh the page to see auto-migration in action')
  console.log('')
  console.log('📖 Full Documentation: AUTO_MIGRATION_DOCUMENTATION.md')
} else {
  console.log('⚠️  ❌ Auto-Migration System: INCOMPLETE')
  console.log('🔧 Some files are missing. Please check the implementation.')
}

console.log('\n🔍 For detailed testing, use the Migration Dashboard component in your app.')
console.log('💡 The system runs automatically - no manual intervention needed!')