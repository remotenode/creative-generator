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
