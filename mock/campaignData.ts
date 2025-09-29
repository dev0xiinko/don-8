export interface Campaign {
  id: string;
  title: string;
  description: string;
  ngoName: string;
  location: string;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  daysLeft: number;
  image: string;
  urgent: boolean;
  featured: boolean;
  walletAddress?: string;
}

const mockCampaigns: Campaign[] = [
  {
    
    id: "1",
    title: "Emergency Relief for Flood Victims",
    description: "Providing immediate shelter, food, and medical aid to families affected by recent flooding in rural communities.",
    ngoName: "Disaster Relief Foundation",
    location: "Philippines",
    category: "Emergency Relief",
    targetAmount: 50000,
    raisedAmount: 32500,
    donorCount: 245,
    daysLeft: 12,
    image: "flood.png",
    urgent: true,
    featured: true,
    walletAddress: "0xAbC1234567890defABC1234567890DEFabc12345"
  }
]


export default mockCampaigns;