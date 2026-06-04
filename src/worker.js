export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Proxy /api/* to the real backend
    if (url.pathname.startsWith('/api/')) {
      const backendUrl = 'https://ux2rk0yn.up.railway.app' + url.pathname + url.search;
      return fetch(backendUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
    }

    // Serve static assets for everything else
    return env.ASSETS.fetch(request);
  }
};
