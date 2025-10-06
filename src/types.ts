export interface GenerateAdsRequest {
  prompt: string;
  language: string;
  country: string;
  count?: number;
}

export interface PersonaData {
  gender: string;
  ageRange: string;
  profession: string;
  location: string;
  incomeLevel: string;
  lifestyle: string;
  values: string;
  primaryInterest: string;
  technologyComfort: string;
  communicationStyle: string;
  personality: string;
}

export interface PersonaResponse {
  persona: PersonaData;
  id: number;
  createdAt: string;
  requestId: string;
}

export interface ImageData {
  url: string;
  prompt: string;
  size: string;
  provider: string;
}

export interface ImageResponse {
  success: boolean;
  images: ImageData[];
}

export interface AdTextVariant {
  variant: 'urgency' | 'benefit' | 'ease';
  adTitle: string;
  adText: string;
  qualityScore: number;
  hasCallToAction: boolean;
}

export interface TextResponse {
  success: boolean;
  data: { variants: AdTextVariant[]; generatedAt: string; };
}

export interface GeneratedAd {
  id: string;
  persona: PersonaResponse;
  image: ImageData;
  text: AdTextVariant;
  targeting: { country: string; language: string; demographics: string; };
  qualityScore: number;
  generatedAt: string;
}

export interface GenerateAdsResponse {
  success: boolean;
  data: { ads: GeneratedAd[]; totalCount: number; generatedAt: string; requestId: string; };
  error?: string;
}

export interface Env {
  PERSONA_GENERATOR: any;
  IMAGE_GENERATOR: any;
  TEXT_GENERATOR: any;
  DEFAULT_AD_COUNT: string;
  MAX_AD_COUNT: string;
}
