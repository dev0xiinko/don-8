export type CampaignType =
  | "charity"
  | "medical"
  | "education"
  | "emergency"
  | "community"
  | "animal"
  | "environment";

export type MockCampaign = {
  id: string;
  title: string;
  description: string;
  type: CampaignType;
  donationPercent: number;
  raisedAmount: number;
  goalAmount: number;
};
