import { Env } from './types';
import { RouteHandler } from './handlers/routes';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const routeHandler = new RouteHandler(env);
    return await routeHandler.handleRequest(request);
  }
} as ExportedHandler<Env>;
