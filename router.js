// A very small router so we do not need Express.
'use strict';

class HttpError extends Error {
  constructor(status, message, extra) { super(message); this.status = status; this.extra = extra || {}; }
}

const routes = [];

function add(method, pattern, ...handlers) {
  const keys = [];
  const source = pattern.replace(/:([A-Za-z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; });
  routes.push({ method, regex: new RegExp('^' + source + '/?$'), keys, handlers });
}

const router = {
  get: (p, ...h) => add('GET', p, ...h),
  post: (p, ...h) => add('POST', p, ...h),
  put: (p, ...h) => add('PUT', p, ...h),
  patch: (p, ...h) => add('PATCH', p, ...h),
  delete: (p, ...h) => add('DELETE', p, ...h)
};

// Returns true if a route handled the request.
async function dispatch(ctx) {
  const method = ctx.req.method === 'HEAD' ? 'GET' : ctx.req.method;
  let pathMatched = false;
  for (const r of routes) {
    const m = r.regex.exec(ctx.url.pathname);
    if (!m) continue;
    pathMatched = true;
    if (r.method !== method) continue;
    ctx.params = {};
    r.keys.forEach((k, i) => { try { ctx.params[k] = decodeURIComponent(m[i + 1]); } catch (e) { ctx.params[k] = m[i + 1]; } });
    for (const h of r.handlers) {
      await h(ctx);
      if (ctx.res.writableEnded) break;
    }
    return true;
  }
  if (pathMatched) throw new HttpError(405, 'Method not allowed.');
  return false;
}

module.exports = { router, dispatch, HttpError };
