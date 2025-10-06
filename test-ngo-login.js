// Test script to verify NGO login functionality
const testNgoLogin = async () => {
  // Test credentials from approved NGO in mock data
  const testCredentials = {
    email: "act@foundation.com",
    password: "ACTFoundation202"
  };

  console.log('Testing NGO Login with credentials:', testCredentials.email);

  try {
    const response = await fetch('http://localhost:3000/api/ngo/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCredentials),
    });

    const result = await response.json();
    
    console.log('Login Response Status:', response.status);
    console.log('Login Response:', result);

    if (result.success) {
      console.log('✅ NGO Login Successful!');
      console.log('NGO Info:', result.ngo);
    } else {
      console.log('❌ NGO Login Failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
};

// Test with wrong credentials
const testInvalidLogin = async () => {
  const invalidCredentials = {
    email: "wrong@email.com",
    password: "wrongpassword"
  };

  console.log('\nTesting NGO Login with invalid credentials...');

  try {
    const response = await fetch('http://localhost:3000/api/ngo/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidCredentials),
    });

    const result = await response.json();
    
    console.log('Invalid Login Response Status:', response.status);
    console.log('Invalid Login Response:', result);
  } catch (error) {
    console.error('❌ Network Error:', error.message);
  }
};

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testNgoLogin();
  testInvalidLogin();
}