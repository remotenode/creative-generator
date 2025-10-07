import { PersonaResponse } from './persona';

export interface PersonaGeneratorBinding {
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

export interface ImageGeneratorBinding {
  generateImage(prompt: string, options?: {
    count?: number;
    size?: string;
    style?: string;
    quality?: string;
  }): Promise<{
    images: Array<{
      url: string;
      prompt: string;
      id?: string;
    }>;
    metadata?: any;
  }>;
  
  healthCheck(): Promise<any>;
  getServiceInfo(): Promise<any>;
}

export interface TextGeneratorBinding {
  generate(params: {
    prompt: string;
    adTitleLimit?: number;
    adTextLimit?: number;
  }): Promise<{
    success: boolean;
    data: {
      variants: Array<{
        adTitle: string;
        adText: string;
        qualityScore: number;
      }>;
    };
  }>;
  
  health(): Promise<{
    success: boolean;
    data: any;
  }>;
}

export interface Env {
  PERSONA_GENERATOR: PersonaGeneratorBinding;
  IMAGE_GENERATOR: ImageGeneratorBinding;
  TEXT_GENERATOR: TextGeneratorBinding;
  DEFAULT_AD_COUNT: string;
  MAX_AD_COUNT: string;
}
