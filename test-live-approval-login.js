// Live API test for NGO approval and immediate login
async function testLiveNgoApprovalLogin() {
  console.log('🌐 Testing NGO Approval → Login with Live APIs\\n');

  // First, let's create a test NGO application
  const testNgoData = {
    organizationName: "Live Test Foundation",
    email: "livetest@foundation.org", 
    phone: "+1987654321",
    description: "Live test foundation for API verification",
    address: "456 Live Test Avenue",
    registrationNumber: "LIVE456",
    taxId: "TAX789",
    bankAccountDetails: "Live bank details",
    walletAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    contactPersonName: "Jane LiveTest",
    uploadedDocuments: [],
    website: "https://livetest-foundation.org",
    category: "healthcare",
    foundedYear: "2021",
    teamSize: "15",
    twitter: "https://x.com/livetestfound",
    facebook: "https://facebook.com/livetestfound", 
    linkedin: "https://linkedin.com/livetestfound"
  };

  try {
    // Step 1: Submit NGO Application (simulate)
    console.log('📝 Step 1: Submitting NGO Application...');
    const submitResponse = await fetch('http://localhost:3000/api/ngo-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testNgoData)
    });
    
    const submitResult = await submitResponse.json();
    
    if (submitResult.success) {
      console.log('✅ NGO Application submitted successfully');
      console.log('📋 Application ID:', submitResult.application.id);
      
      const ngoId = submitResult.application.id;
      
      // Step 2: Admin Approval
      console.log('\\n👨‍💼 Step 2: Admin approving NGO...');
      const approveResponse = await fetch(`http://localhost:3000/api/admin/ngo-applications/${ngoId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reviewNotes: 'Live test approval for immediate login verification' 
        })
      });
      
      const approveResult = await approveResponse.json();
      
      if (approveResponse.ok) {
        console.log('✅ NGO Approved successfully!');
        console.log('📧 Generated credentials:');
        console.log('   Email:', approveResult.application.credentials.email);
        console.log('   Password:', approveResult.application.credentials.password);
        
        // Step 3: Immediate Login Test
        console.log('\\n🔐 Step 3: Testing immediate login...');
        const loginResponse = await fetch('http://localhost:3000/api/ngo/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: approveResult.application.credentials.email,
            password: approveResult.application.credentials.password
          })
        });
        
        const loginResult = await loginResponse.json();
        
        if (loginResult.success) {
          console.log('🎉 IMMEDIATE LOGIN SUCCESSFUL!');
          console.log('✅ Confirmed: NGOs CAN login immediately after approval');
          console.log('');
          console.log('📊 Successful Login Data:');
          console.log('   NGO ID:', loginResult.ngo.id);
          console.log('   Organization:', loginResult.ngo.organizationName);
          console.log('   Status:', loginResult.ngo.status);
          console.log('   Approved At:', loginResult.ngo.approvedAt);
          
          // Step 4: Cleanup
          console.log('\\n🧹 Step 4: Cleaning up test data...');
          // Note: In a real scenario, you might want to delete the test NGO
          console.log('⚠️  Manual cleanup required for NGO ID:', ngoId);
          
        } else {
          console.log('❌ IMMEDIATE LOGIN FAILED');
          console.log('Error:', loginResult.message);
        }
        
      } else {
        console.log('❌ NGO Approval failed:', approveResult.error);
      }
      
    } else {
      console.log('❌ NGO Application submission failed:', submitResult.message);
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('💡 Make sure the development server is running (npm run dev)');
  }
}

// Run if called directly
if (require.main === module) {
  testLiveNgoApprovalLogin();
}

module.exports = { testLiveNgoApprovalLogin };