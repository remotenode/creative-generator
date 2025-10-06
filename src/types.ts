// Request/Response types for the ad generator API
export interface GenerateAdsRequest {
  prompt: string;
  language: string;
  country: string;
  count?: number;
  imageStyle?: string;
  imageQuality?: string;
}

export interface PersonaData {
  gender: string;
  ageRange: string;
  ethnicity: string;
  location: string;
  profession: string;
  education: string;
  incomeLevel: string;
  workStyle: string;
  personality: string;
  currentState: string;
  communicationStyle: string;
  decisionMaking: string;
  primaryInterest: string;
  technologyComfort: string;
  lifestyle: string;
  values: string;
  problemSolving: string;
  socialBehavior: string;
  learningStyle: string;
  adaptability: string;
}

export interface PersonaResponse {
  persona: PersonaData;
  id: number;
  createdAt: string;
  timestamp: string;
  requestId: string;
  characterCount: number;
}

export interface ImageData {
  url: string;
  prompt: string;
  size: string;
  provider: string;
  metadata: {
    resolution: string;
    seed: number;
    style_type: string;
    is_image_safe: boolean;
  };
}

export interface ImageResponse {
  success: boolean;
  images: ImageData[];
  usage: {
    provider: string;
    count: number;
    cost: number;
  };
}

export interface AdTextVariant {
  variant: 'urgency' | 'benefit' | 'ease';
  adTitle: string;
  adText: string;
  qualityScore: number;
  hasCallToAction: boolean;
  optimized: boolean;
}

export interface TextResponse {
  success: boolean;
  data: {
    variants: AdTextVariant[];
    generatedAt: string;
  };
}

export interface GeneratedAd {
  id: string;
  persona: PersonaResponse;
  image: ImageData;
  text: AdTextVariant;
  targeting: {
    country: string;
    language: string;
    demographics: string;
    psychographics: string;
  };
  qualityScore: number;
  generatedAt: string;
}

export interface GenerateAdsResponse {
  success: boolean;
  data: {
    ads: GeneratedAd[];
    totalCount: number;
    generatedAt: string;
    requestId: string;
    targeting: {
      country: string;
      language: string;
      originalPrompt: string;
    };
  };
  error?: string;
}

// Service binding interfaces
export interface PersonaGeneratorService {
  generateSingle(options?: {
    weighted?: boolean;
    seed?: string;
  }): Promise<PersonaResponse>;
  
  generateMultiple(count: number, options?: {
    weighted?: boolean;
    seed?: string;
  }): Promise<{
    personas: PersonaResponse[];
    totalCount: number;
    timestamp: string;
    requestId: string;
  }>;
  
  getCount(): Promise<number>;
  
  retrievePersonas(limit?: number, offset?: number): Promise<{
    personas: PersonaResponse[];
    totalCount: number;
    timestamp: string;
    requestId: string;
  }>;
  
  getInfo(): Promise<any>;
}

export interface ImageGeneratorService {
  generateImage(prompt: string, options?: {
    count?: number;
    size?: string;
    style?: string;
    quality?: string;
  }): Promise<ImageResponse>;
}

export interface TextGeneratorService {
  generate(params: {
    prompt: string;
    adTitleLimit: number;
    adTextLimit: number;
  }): Promise<TextResponse>;
  
  health(): { success: boolean; data: any };
  testAI(): Promise<{ success: boolean; data: any }>;
}

export interface Env {
  PERSONA_GENERATOR: PersonaGeneratorService;
  IMAGE_GENERATOR: ImageGeneratorService;
  TEXT_GENERATOR: TextGeneratorService;
  DEFAULT_AD_COUNT: string;
  MAX_AD_COUNT: string;
  DEFAULT_IMAGE_STYLE: string;
  DEFAULT_IMAGE_QUALITY: string;
}