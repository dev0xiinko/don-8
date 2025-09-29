export const CONTRACT_ADDRESS = "0x026932731E6f28896F2EE15f99916Bda0d4dE917";

// Contract ABI
export const CONTRACT_ABI = [
  // Events
  "event DonationMade(address indexed donor, address indexed ngo, address token, uint256 amount, bool isAnonymous)",
  "event NGORegistered(address indexed ngo, string name)",
  "event NGODeactivated(address indexed ngo, string reason)",
  "event ReportSubmitted(address indexed ngo, uint256 timestamp)",
  "event FundsWithdrawn(address indexed ngo, address token, uint256 amount)",
  "event NGOScored(address indexed ngo, uint256 newScore)",
  
  // View functions
  "function donationCount() view returns (uint256)",
  "function donations(uint256) view returns (address donor, address ngo, address token, uint256 amount, uint256 timestamp, bool isAnonymous)",
  "function donorHistory(address) view returns (uint256[])",
  
  // State-changing functions
  "function donate(address ngo, bool isAnonymous) payable",
  "function donateToken(address ngo, address token, uint256 amount, bool isAnonymous)",
  "function registerNGO(string memory name) returns (bool)",
  "function submitReport(string memory reportURI) returns (bool)",
  "function withdrawFunds(address token, uint256 amount) returns (bool)",
];