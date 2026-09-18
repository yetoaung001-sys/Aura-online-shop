export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Supabase API & Storage Reverse Proxy
    if (url.pathname.startsWith('/api/supabase')) {
      const SUPABASE_ORIGIN = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';
      
      // /api/supabase ကို ဖြုတ်ပြီး ကျန်လမ်းကြောင်းကို ရယူခြင်း
      let targetPath = url.pathname.replace(/^\/api\/supabase/, '');
      if (!targetPath.startsWith('/')) {
        targetPath = '/' + targetPath;
      }

      // Supabase Endpoint အပြည့်အစုံ တည်ဆောက်ခြင်း
      const targetUrl = new URL(targetPath + url.search, SUPABASE_ORIGIN);

      // Request Headers များကို ပြင်ဆင်ခြင်း (Host header အား Supabase သို့ ပြောင်းပေးရမည်)
      const newHeaders = new Headers(request.headers);
      newHeaders.set('Host', 'zyajlsrytjvwxqtpxrqd.supabase.co');

      const proxyRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: newHeaders,
        body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
        redirect: 'follow'
      });

      const response = await fetch(proxyRequest);

      // CORS Header များ ထည့်သွင်းပေးခြင်း
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      responseHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }

    // Static Assets (HTML ဖိုင်များ) ကို ပုံမှန်အတိုင်း လွှဲပေးခြင်း
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return fetch(request);
  }
};
