export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ၁။ OPTIONS Preflight Handle ပြုလုပ်ခြင်း
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

    // ၂။ Supabase API & Storage Reverse Proxy (အရေးကြီးဆုံးအပိုင်း)
    if (url.pathname.startsWith('/api/supabase')) {
      const SUPABASE_ORIGIN = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';
      
      // /api/supabase စာသားကို ဖြုတ်ပြီး ကျန်လမ်းကြောင်းကို ရယူခြင်း
      const cleanPath = url.pathname.replace(/^\/api\/supabase/, '') || '/';
      const targetUrl = SUPABASE_ORIGIN + cleanPath + url.search;

      // Header အသစ်တည်ဆောက်ပြီး HostHeader ကို Supabase သို့ ပြောင်းလဲခြင်း
      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', 'zyajlsrytjvwxqtpxrqd.supabase.co');

      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: newHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
        redirect: 'follow',
      });

      const response = await fetch(proxyRequest);

      // CORS Headers ထည့်သွင်းခြင်း
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

    // ၃။ Static Assets (HTML, CSS, JS ဖိုင်များ) ပို့ဆောင်ခြင်း
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
