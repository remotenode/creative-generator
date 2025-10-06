import { PersonaResponse } from './persona';
import { ImageData } from './image';
import { AdTextVariant } from './text';

export interface GeneratedAd {
  id: string;
  persona: PersonaResponse;
  image: ImageData;
  text: AdTextVariant;
  targeting: { country: string; language: string; demographics: string; };
  qualityScore: number;
  generatedAt: string;
}
