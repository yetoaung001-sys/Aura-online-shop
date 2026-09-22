const SUPABASE_URL = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith('/api/supabase/')) {
      return fetch(request);
    }

    try {
      const targetPath = url.pathname.replace('/api/supabase', '');
      const targetUrl = new URL(targetPath + url.search, SUPABASE_URL);

      const headers = new Headers(request.headers);

      // Remove incoming auth headers so they cannot override our values.
      headers.delete('apikey');
      headers.delete('authorization');
      headers.delete('host');

      headers.set('apikey', SUPABASE_ANON_KEY);
      headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);

      const init = {
        method: request.method,
        headers,
        redirect: 'follow'
      };

      if (!['GET', 'HEAD'].includes(request.method)) {
        init.body = await request.arrayBuffer();
      }

      const response = await fetch(targetUrl.toString(), init);

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }
};
