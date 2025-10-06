import { GeneratedAd } from './ad';

export interface GenerateAdsRequest {
  prompt: string;
  language: string;
  country: string;
  count?: number;
}

export interface GenerateAdsResponse {
  success: boolean;
  data: { ads: GeneratedAd[]; totalCount: number; generatedAt: string; requestId: string; };
  error?: string;
}
