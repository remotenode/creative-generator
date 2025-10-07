import { Env } from './types';
import { RouteHandler } from './handlers/routes';
import { AdGeneratorEntrypoint } from './services/ad-generator';

// Export the WorkerEntrypoint as default for both RPC and HTTP access
export { AdGeneratorEntrypoint };
export default AdGeneratorEntrypoint;
