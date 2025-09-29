export interface Campaign {
  id: string
  name: string
  description: string
  amount: number
  image?: string
  createdAt: string
  status: "active" | "completed" | "pending"
  reportUrl?: string
}

export interface Transaction {
  id: string
  type: "donation" | "withdrawal" | "expense"
  amount: number
  description: string
  date: string
  txHash: string
}

export interface Withdrawal {
  id: string
  amount: number
  destination: string
  date: string
  status: "pending" | "completed" | "failed"
  txHash?: string
}

export interface NGOData {
  name: string
  walletAddress: string
  balance: number
  reputationScore: number
  campaigns: Campaign[]
  transactions: Transaction[]
  withdrawals: Withdrawal[]
}

export const mockNGOData: NGOData = {
  name: "Hope Foundation",
  walletAddress: "0x143395F3B4C0d55ee676B06Fc6c2dC7cb9EFD9ee",
  balance: 45.75,
  reputationScore: 92,
  campaigns: [
    {
      id: "1",
      name: "Clean Water Initiative",
      description: "Providing clean water access to rural communities in Southeast Asia",
      amount: 15000,
      image: "/clean-water-well-in-rural-village.jpg",
      createdAt: "2024-01-15",
      status: "active",
      reportUrl: "/reports/clean-water-q1-2024.pdf",
    },
    {
      id: "2",
      name: "Education for All",
      description: "Building schools and providing educational materials for underprivileged children",
      amount: 25000,
      image: "/children-studying-in-classroom.jpg",
      createdAt: "2024-02-20",
      status: "active",
    },
    {
      id: "3",
      name: "Medical Relief Fund",
      description: "Emergency medical supplies and healthcare services for disaster-affected areas",
      amount: 18500,
      image: "/medical-supplies-and-healthcare-workers.jpg",
      createdAt: "2023-12-10",
      status: "completed",
      reportUrl: "/reports/medical-relief-2023.pdf",
    },
  ],
  transactions: [
    {
      id: "tx1",
      type: "donation",
      amount: 5.5,
      description: "Donation for Clean Water Initiative",
      date: "2024-03-15",
      txHash: "0x1a2b3c4d5e6f7g8h9i0j",
    },
    {
      id: "tx2",
      type: "donation",
      amount: 10.25,
      description: "Donation for Education for All",
      date: "2024-03-10",
      txHash: "0x9i8h7g6f5e4d3c2b1a0j",
    },
    {
      id: "tx3",
      type: "expense",
      amount: 3.2,
      description: "Medical supplies purchase",
      date: "2024-03-05",
      txHash: "0xaabbccddeeff11223344",
    },
    {
      id: "tx4",
      type: "donation",
      amount: 15.0,
      description: "Anonymous donation",
      date: "2024-02-28",
      txHash: "0x5566778899aabbccddee",
    },
  ],
  withdrawals: [
    {
      id: "wd1",
      amount: 8.5,
      destination: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
      date: "2024-03-01",
      status: "completed",
      txHash: "0xffee11223344556677889900",
    },
    {
      id: "wd2",
      amount: 12.0,
      destination: "0x9Cd35Cc6634C0532925a3b844Bc9e7595f0bEb",
      date: "2024-02-15",
      status: "completed",
      txHash: "0x00998877665544332211",
    },
    {
      id: "wd3",
      amount: 5.5,
      destination: "0x1234567890abcdef1234567890abcdef12345678",
      date: "2024-03-18",
      status: "pending",
    },
  ],
}
