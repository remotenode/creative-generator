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
