// Debug script to check localStorage and donation data issues
console.log('🔍 DONATION DEBUG SCRIPT')
console.log('=======================')

// Check localStorage for any donation-related data
console.log('\n📦 Checking localStorage for donation data...')
let localStorageCount = 0
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key && (key.includes('donation') || key.includes('campaign'))) {
    console.log('🔑 Found key:', key)
    try {
      const value = localStorage.getItem(key)
      if (value) {
        const parsed = JSON.parse(value)
        if (Array.isArray(parsed)) {
          console.log('   📊 Contains', parsed.length, 'items')
          if (parsed.length > 0) {
            console.log('   📋 First item:', parsed[0])
          }
        } else {
          console.log('   📋 Value:', parsed)
        }
        localStorageCount++
      }
    } catch (e) {
      console.log('   ⚠️ Error parsing:', e.message)
    }
  }
}

if (localStorageCount === 0) {
  console.log('✅ No donation-related localStorage found')
} else {
  console.log('⚠️ Found', localStorageCount, 'donation-related localStorage entries')
}

// Check URL for current campaign ID
console.log('\n🎯 Current Campaign Info:')
const currentUrl = window.location.pathname
const campaignIdMatch = currentUrl.match(/\/campaign\/(\d+)/)
const currentCampaignId = campaignIdMatch ? campaignIdMatch[1] : null
console.log('📍 URL:', currentUrl)
console.log('🆔 Campaign ID:', currentCampaignId)

// Function to clear all donation localStorage
window.clearAllDonationData = () => {
  console.log('🧹 Clearing all donation localStorage...')
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('donation') || key.includes('campaign'))) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
    console.log('🗑️ Removed:', key)
  })
  
  console.log('✅ Cleared', keysToRemove.length, 'localStorage entries')
  console.log('🔄 Please refresh the page to see clean data')
}

console.log('\n💡 To clear all donation data, run: clearAllDonationData()')
console.log('💡 Then refresh the page for a clean state')