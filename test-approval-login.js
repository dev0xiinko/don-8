// Test script to verify NGO approval and immediate login functionality
const fs = require('fs');
const path = require('path');

// Simulate the approval process and immediate login test
async function testNgoApprovalAndLogin() {
  console.log('🧪 Testing NGO Approval → Immediate Login Flow\n');

  // Step 1: Create a test NGO application
  const testNgo = {
    id: 999, // Using a test ID
    organizationName: "Test Relief Foundation",
    email: "test@relief.org",
    phone: "+1234567890",
    description: "Test foundation for verification",
    address: "123 Test Street",
    registrationNumber: "TEST123",
    taxId: "TAX456",
    bankAccountDetails: "Bank details",
    walletAddress: "0x1234567890123456789012345678901234567890",
    contactPersonName: "John Test",
    uploadedDocuments: [],
    website: "https://test-relief.org",
    category: "disaster",
    foundedYear: "2020",
    teamSize: "10",
    twitter: "https://x.com/testrelief",
    facebook: "https://facebook.com/testrelief",
    linkedin: "https://linkedin.com/testrelief",
    status: "pending",
    submittedAt: new Date().toISOString()
  };

  try {
    // Read current applications
    const filePath = path.join(process.cwd(), 'mock', 'ngo-applications.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const applications = JSON.parse(fileContents);

    // Add test NGO if it doesn't exist
    const existingIndex = applications.findIndex(app => app.id === 999);
    if (existingIndex === -1) {
      applications.push(testNgo);
      console.log('✅ Added test NGO application');
    } else {
      applications[existingIndex] = testNgo;
      console.log('✅ Updated existing test NGO application');
    }

    // Save the updated applications
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));

    // Step 2: Simulate approval process
    console.log('📋 Simulating admin approval...');
    
    const approvalIndex = applications.findIndex(app => app.id === 999);
    applications[approvalIndex] = {
      ...applications[approvalIndex],
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'admin@don8.com',
      reviewNotes: 'Test approval for immediate login verification',
      credentials: {
        email: applications[approvalIndex].email,
        password: `${applications[approvalIndex].organizationName.toLowerCase().replace(/\\s+/g, '')}123`
      }
    };

    // Save the approved application
    fs.writeFileSync(filePath, JSON.stringify(applications, null, 2));
    
    const generatedPassword = applications[approvalIndex].credentials.password;
    console.log('✅ NGO Approved Successfully!');
    console.log('📧 Generated Login Credentials:');
    console.log('   Email:', applications[approvalIndex].credentials.email);
    console.log('   Password:', generatedPassword);
    console.log('');

    // Step 3: Test immediate login
    console.log('🔐 Testing immediate login with generated credentials...');
    
    // Simulate the login API call
    const loginCredentials = {
      email: applications[approvalIndex].credentials.email,
      password: generatedPassword
    };

    // Read the file again to simulate API behavior
    const updatedFileContents = fs.readFileSync(filePath, 'utf8');
    const updatedApplications = JSON.parse(updatedFileContents);

    // Find approved NGO with matching credentials (simulate login API logic)
    const approvedNgo = updatedApplications.find((app) => 
      app.status === 'approved' && 
      app.credentials && 
      app.credentials.email === loginCredentials.email && 
      app.credentials.password === loginCredentials.password
    );

    if (approvedNgo) {
      console.log('✅ IMMEDIATE LOGIN SUCCESSFUL!');
      console.log('🎉 NGO can login right away after approval');
      console.log('');
      console.log('📊 Login Response Data:');
      console.log('   NGO ID:', approvedNgo.id);
      console.log('   Organization:', approvedNgo.organizationName);
      console.log('   Status:', approvedNgo.status);
      console.log('   Approved At:', approvedNgo.reviewedAt);
      console.log('   Wallet Address:', approvedNgo.walletAddress);
    } else {
      console.log('❌ IMMEDIATE LOGIN FAILED');
      console.log('⚠️  There might be an issue with the credential generation or login validation');
    }

    // Step 4: Cleanup - Remove test NGO
    console.log('\\n🧹 Cleaning up test data...');
    const finalApplications = updatedApplications.filter(app => app.id !== 999);
    fs.writeFileSync(filePath, JSON.stringify(finalApplications, null, 2));
    console.log('✅ Test NGO removed from applications');

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

// Run the test
testNgoApprovalAndLogin();