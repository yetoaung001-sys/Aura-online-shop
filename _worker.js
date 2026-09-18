export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ၁။ CORS Headers သတ်မှတ်ချက်
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };

    // ၂။ OPTIONS Preflight Handle ပြုလုပ်ခြင်း
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/supabase')) {
      return new Response(null, { headers: corsHeaders });
    }

    // ၃။ Supabase Reverse Proxy
    if (url.pathname.startsWith('/api/supabase')) {
      const SUPABASE_HOST = 'zyajlsrytjvwxqtpxrqd.supabase.co';
      const cleanPath = url.pathname.replace(/^\/api\/supabase/, '') || '';
      const finalPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
      const targetUrl = `https://zyajlsrytjvwxqtpxrqd.supabase.co${finalPath}${url.search}`;

      // Headers ပြင်ဆင်ခြင်း
      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', SUPABASE_HOST);
      
      const clientIp = request.headers.get('CF-Connecting-IP');
      if (clientIp) {
        newHeaders.set('X-Forwarded-For', clientIp);
      }

      // Request Body ဆိုင်ရာ ပြင်ဆင်မှု
      const hasBody = !['GET', 'HEAD'].includes(request.method);
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: newHeaders,
        body: hasBody ? request.body : null,
        redirect: 'follow',
        duplex: hasBody ? 'half' : undefined, // Stream body error မတက်စေရန်
      });

      const response = await fetch(proxyRequest);

      // Response Headers တွင် CORS ထည့်သွင်းခြင်း
      const resHeaders = new Headers(response.headers);
      for (const [key, value] of Object.entries(corsHeaders)) {
        resHeaders.set(key, value);
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    }

    // ၄။ Static Assets (Cloudflare Pages / Workers Sites)
    if (env?.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
