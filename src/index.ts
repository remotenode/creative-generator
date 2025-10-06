import { Env } from './types';
import { RouteHandler } from './handlers/routes';
import { AdGeneratorEntrypoint } from './services/ad-generator';

// Export the WorkerEntrypoint for RPC access by other Workers
export { AdGeneratorEntrypoint };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const routeHandler = new RouteHandler(env, ctx);
    return await routeHandler.handleRequest(request);
  }
};
