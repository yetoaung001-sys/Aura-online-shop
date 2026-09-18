export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // OPTIONS Preflight Handle ပြုလုပ်ခြင်း
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/supabase')) {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Supabase API & Storage Reverse Proxy ပြုလုပ်ခြင်း
    if (url.pathname.startsWith('/api/supabase/')) {
      const SUPABASE_ORIGIN = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';
      const targetPath = url.pathname.replace('/api/supabase', '');
      const targetUrl = new URL(targetPath + url.search, SUPABASE_ORIGIN);

      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', 'zyajlsrytjvwxqtpxrqd.supabase.co');

      const proxyRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
        redirect: 'follow',
      });

      const response = await fetch(proxyRequest);

      const resHeaders = new Headers(response.headers);
      resHeaders.set('Access-Control-Allow-Origin', '*');
      resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      resHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    }

    // Static HTML/CSS Files မူလအတိုင်း ပို့ပေးခြင်း
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};
