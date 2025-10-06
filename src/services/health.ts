import { Env } from '../types';

export class HealthService {
  constructor(private env: Env) {}

  async check(): Promise<{ success: boolean; data: any }> {
    const services = { personaGenerator: false, imageGenerator: false, textGenerator: false };
    
    try { 
      await this.env.PERSONA_GENERATOR.getInfo(); 
      services.personaGenerator = true; 
    } catch {}
    
    try { 
      const h = this.env.TEXT_GENERATOR.health(); 
      services.textGenerator = h.success; 
    } catch {}
    
    try { 
      await this.env.IMAGE_GENERATOR.generateImage("test", { count: 1 }); 
      services.imageGenerator = true; 
    } catch {}

    return {
      success: Object.values(services).every(s => s),
      data: { services, timestamp: new Date().toISOString(), worker: 'ad-generator' }
    };
  }
}
