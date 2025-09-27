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
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Emergency Relief for Flood Victims",
    description: "Providing immediate shelter, food, and medical aid to families affected by recent flooding in rural communities.",
    ngoName: "Disaster Relief Foundation",
    location: "Bangladesh",
    category: "Emergency Relief",
    targetAmount: 50000,
    raisedAmount: 32500,
    donorCount: 245,
    daysLeft: 12,
    image: "flood.png",
    urgent: true,
    featured: true
  },
  {
    id: "2",
    title: "Clean Water Wells for Remote Villages",
    description: "Building sustainable water infrastructure to provide clean drinking water to 5 remote villages.",
    ngoName: "Water for Life",
    location: "Kenya",
    category: "Water & Sanitation",
    targetAmount: 75000,
    raisedAmount: 45000,
    donorCount: 189,
    daysLeft: 28,
    image: "flood.png",
    urgent: false,
    featured: true
  },
  {
    id: "3",
    title: "Education Scholarships for Girls",
    description: "Supporting 100 girls from low-income families to complete their secondary education with full scholarships.",
    ngoName: "Girls Education Initiative",
    location: "India",
    category: "Education",
    targetAmount: 30000,
    raisedAmount: 18750,
    donorCount: 156,
    daysLeft: 45,
    image: "flood.png",
    urgent: false,
    featured: false
  },
  {
    id: "4",
    title: "Mobile Medical Clinic for Rural Areas",
    description: "Funding a mobile medical unit to provide healthcare services to underserved rural communities.",
    ngoName: "Healthcare Access Network",
    location: "Guatemala",
    category: "Healthcare",
    targetAmount: 85000,
    raisedAmount: 51000,
    donorCount: 298,
    daysLeft: 21,
    image: "flood.png",
    urgent: false,
    featured: true
  },
  {
    id: "5",
    title: "Reforestation Project - Plant 10,000 Trees",
    description: "Combat climate change by planting native trees and restoring degraded forest ecosystems.",
    ngoName: "Green Earth Foundation",
    location: "Brazil",
    category: "Environment",
    targetAmount: 25000,
    raisedAmount: 19500,
    donorCount: 412,
    daysLeft: 35,
    image: "flood.png",
    urgent: false,
    featured: false
  },
  {
    id: "6",
    title: "Winter Clothing Drive for Homeless",
    description: "Providing warm clothing, blankets, and winter essentials to homeless individuals during harsh winter months.",
    ngoName: "Shelter & Care Foundation",
    location: "Canada",
    category: "Social Welfare",
    targetAmount: 15000,
    raisedAmount: 8900,
    donorCount: 87,
    daysLeft: 18,
    image: "flood.png",
    urgent: true,
    featured: false
  }
];

export default mockCampaigns;
