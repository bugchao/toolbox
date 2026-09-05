import { readGateConfig } from './gate.js';
import { WS_PATH } from './ws-gateway.js';

const STATUS_PATH = '/api/remote-shell/status';

// 只暴露「要不要口令」，不暴露 token 本身
function statusPayload(config) {
  return {
    requiresToken: config.requiresToken,
    wsPath: WS_PATH,
  };
}

/** 生产：挂到 api-gateway 的 Express 实例 */
export function registerRemoteShellApiRoutes(app, options = {}) {
  const config = options.config ?? readGateConfig();
  app.get(STATUS_PATH, (req, res) => {
    res.json(statusPayload(config));
  });
}

/** 开发：Vite 的 connect 中间件，和上面共用同一份状态 */
export function createRemoteShellApiMiddleware(options = {}) {
  const config = options.config ?? readGateConfig();
  return (req, res, next) => {
    const url = new URL(req.url ?? '', 'http://localhost');
    if (url.pathname !== STATUS_PATH) {
      next();
      return;
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(statusPayload(config)));
  };
}
