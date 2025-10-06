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
