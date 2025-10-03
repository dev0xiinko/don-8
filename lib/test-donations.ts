// Test donation records for campaign transparency demonstration
export const generateTestDonations = (campaignId: string) => {
  const testDonations = [
    {
      id: "test_1_" + Date.now(),
      campaignId,
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      amount: "0.05",
      currency: "SONIC",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      status: "confirmed" as const,
      blockNumber: 12345678,
      gasUsed: "21000",
      explorerUrl: "https://blaze.soniclabs.com/tx/0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      donorAddress: "0x742D35Cc6eB5C3E69a5777E5aBcDDb5b1a0ac2B7",
      message: "Hope this helps the earthquake victims ❤️",
      anonymous: false,
      confirmationTime: new Date(Date.now() - 86400000 + 180000), // 3 minutes after
      networkName: "Sonic Blaze Testnet"
    },
    {
      id: "test_2_" + Date.now(),
      campaignId,
      txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      amount: "0.1",
      currency: "SONIC",
      timestamp: new Date(Date.now() - 43200000), // 12 hours ago
      status: "confirmed" as const,
      blockNumber: 12345679,
      gasUsed: "21000",
      explorerUrl: "https://blaze.soniclabs.com/tx/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      donorAddress: "0x8Ba1f109551bD432803012645Hac136c30912d49",
      message: "",
      anonymous: true,
      confirmationTime: new Date(Date.now() - 43200000 + 120000), // 2 minutes after
      networkName: "Sonic Blaze Testnet"
    },
    {
      id: "test_3_" + Date.now(),
      campaignId,
      txHash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      amount: "0.02",
      currency: "SONIC",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      status: "pending" as const,
      blockNumber: undefined,
      gasUsed: undefined,
      explorerUrl: "https://blaze.soniclabs.com/tx/0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
      donorAddress: "0x9Cd3B50d364f4E5739B4b6a2Cd0b5f8c9F87e4321",
      message: "Praying for everyone affected 🙏",
      anonymous: false,
      confirmationTime: undefined,
      networkName: "Sonic Blaze Testnet"
    }
  ];

  return testDonations;
};

// Function to populate test data for demonstration
export const populateTestDonations = async (campaignId: string) => {
  const { DonationStorageManager } = await import('./donation-storage');
  const manager = DonationStorageManager.getInstance();
  
  const testDonations = generateTestDonations(campaignId);
  
  for (const donation of testDonations) {
    await manager.saveDonationRecord(donation);
  }
  
  console.log(`Added ${testDonations.length} test donations for campaign ${campaignId}`);
  return testDonations;
};