// Test auto-migration system
console.log('🧪 Testing Auto-Migration System')
console.log('=================================')

// Test 1: Check migration API endpoint
async function testMigrationAPI() {
  console.log('\\n📡 Test 1: Migration API Endpoint')
  
  try {
    const response = await fetch('/api/donations/migrate')
    const result = await response.json()
    
    console.log('✅ API Response:', result)
    
    if (result.success) {
      console.log('📊 Migration Stats:')
      console.log('   JSON Files:', result.migration.jsonFiles)
      console.log('   Total Donations:', result.migration.totalJsonDonations)
      console.log('   Directory:', result.migration.donationsDirectory)
    }
  } catch (error) {
    console.error('❌ API Test Failed:', error)
  }
}

// Test 2: Check localStorage detection
function testLocalStorageDetection() {
  console.log('\\n🔍 Test 2: localStorage Detection')
  
  // Count localStorage donations
  let localKeys = []
  let totalDonations = 0
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('donation_history_')) {
      localKeys.push(key)
      
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            totalDonations += parsed.length
          }
        }
      } catch (error) {
        console.error('Error parsing key:', key, error)
      }
    }
  }
  
  console.log('📦 localStorage Status:')
  console.log('   Wallet Keys:', localKeys.length)
  console.log('   Total Donations:', totalDonations)
  console.log('   Keys Found:', localKeys)
  
  return { localKeys, totalDonations }
}

// Test 3: Create sample localStorage data for testing
function createSampleLocalStorageData() {
  console.log('\\n🎭 Test 3: Creating Sample Data')
  
  const sampleWallet = '0x1234567890123456789012345678901234567890'
  const sampleDonations = [
    {
      id: 'test_1',
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      amount: '0.01',
      currency: 'SONIC',
      timestamp: new Date().toISOString(),
      status: 'confirmed',
      blockNumber: 12345,
      explorerUrl: 'https://blaze.soniclabs.com/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      message: 'Test migration donation'
    },
    {
      id: 'test_2', 
      txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98',
      amount: '0.05',
      currency: 'SONIC',
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'confirmed',
      blockNumber: 12346,
      explorerUrl: 'https://blaze.soniclabs.com/tx/0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba98',
      message: 'Another test donation'
    }
  ]
  
  const key = `donation_history_${sampleWallet}`
  localStorage.setItem(key, JSON.stringify(sampleDonations))
  
  console.log('✅ Sample data created:')
  console.log('   Wallet:', sampleWallet)
  console.log('   Donations:', sampleDonations.length)
  console.log('   Key:', key)
  
  return key
}

// Test 4: Test migration with sample data
async function testMigrationWithSampleData() {
  console.log('\\n🚀 Test 4: Migration with Sample Data')
  
  const sampleKey = createSampleLocalStorageData()
  
  // Wait a bit then check if auto-migration would work
  setTimeout(() => {
    const { localKeys, totalDonations } = testLocalStorageDetection()
    
    if (totalDonations > 0) {
      console.log('✅ Sample data detected, auto-migration should trigger')
      console.log('💡 In a real app, AutoMigrationHandler would process this automatically')
    }
    
    // Cleanup test data
    localStorage.removeItem(sampleKey)
    console.log('🧹 Test data cleaned up')
  }, 1000)
}

// Run all tests
async function runAllTests() {
  console.log('🏃 Running Auto-Migration Tests...\\n')
  
  await testMigrationAPI()
  testLocalStorageDetection()
  testMigrationWithSampleData()
  
  console.log('\\n🎉 Auto-Migration Tests Complete!')
  console.log('\\nℹ️  Auto-migration will run automatically when:')
  console.log('   1. The app loads (via AutoMigrationHandler in layout)')
  console.log('   2. localStorage donations are detected')
  console.log('   3. No errors occur during the migration process')
  console.log('\\n📋 To manually trigger migration:')
  console.log('   1. Use the Migration Dashboard component')
  console.log('   2. Call the migrate button in campaign pages')
  console.log('   3. Use MigrationUtils.runManualMigration()')
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  runAllTests()
}

// Export for use in other components
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testMigrationAPI,
    testLocalStorageDetection,
    createSampleLocalStorageData,
    testMigrationWithSampleData,
    runAllTests
  }
}