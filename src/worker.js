export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Proxy /api/* requests to the external backend server on Nest
    if (url.pathname.startsWith("/api/")) {
      const targetUrl = new URL(request.url);
      targetUrl.hostname = "slackfm.hackclub.app";
      targetUrl.protocol = "https:";
      targetUrl.port = "";

      // Create a proxy request with the updated URL and original request options
      const proxyRequest = new Request(targetUrl.toString(), request);
      return fetch(proxyRequest);
    }

    // Serve static assets from public/ directory
    return env.ASSETS.fetch(request);
  }
};
