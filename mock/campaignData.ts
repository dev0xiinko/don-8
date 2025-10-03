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
    title: "Emergency Relief for Earthquake Victims",
    description: "Providing immediate shelter, food, and medical aid to families affected by recent earthquakes in Cebu",
    ngoName: "Web3 Cebu",
    location: "Philippines",
    category: "Emergency Relief",
    targetAmount: 50000,
    raisedAmount: 0,
    donorCount: 0,
    daysLeft: 12,
    image: "earthquake.png",
    urgent: true,
    featured: true,
    walletAddress: "0xAbC1234567890defABC1234567890DEFabc12345"
  }
]


export default mockCampaigns;