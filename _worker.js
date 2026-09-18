export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ၁။ Supabase Reverse Proxy
    if (url.pathname.startsWith('/api/supabase')) {
      const SUPABASE_HOST = 'zyajlsrytjvwxqtpxrqd.supabase.co';
      
      // CORS Preflight (OPTIONS) စစ်ဆေးခြင်း
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
          },
        });
      }

      // လမ်းကြောင်း ခွဲထုတ်ခြင်း
      const cleanPath = url.pathname.replace(/^\/api\/supabase/, '') || '';
      const finalPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
      const targetUrl = `https://${SUPABASE_HOST}${finalPath}${url.search}`;

      // Headers အသစ်တည်ဆောက်ခြင်း
      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', SUPABASE_HOST);
      
      const clientIp = request.headers.get('CF-Connecting-IP');
      if (clientIp) {
        newHeaders.set('X-Forwarded-For', clientIp);
      }

      const hasBody = !['GET', 'HEAD'].includes(request.method);
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: newHeaders,
        body: hasBody ? request.body : null,
        redirect: 'follow',
        duplex: hasBody ? 'half' : undefined,
      });

      const response = await fetch(proxyRequest);

      // Response Headers တွင် CORS ထည့်သွင်းခြင်း
      const resHeaders = new Headers(response.headers);
      resHeaders.set('Access-Control-Allow-Origin', '*');
      resHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      resHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: resHeaders,
      });
    }

    // ၂။ Static HTML/CSS/JS ဖိုင်များ ပြသခြင်း
    return env.ASSETS.fetch(request);
  },
};
