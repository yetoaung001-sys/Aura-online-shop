const SUPABASE_URL = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';

// ဒီနေရာမှာ လက်ရှိ Supabase anon/publishable key ကို ထည့်ပါ
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YWpsc3J5dGp2d3hxdHB4cnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4Nzg1MjEsImV4cCI6MjEwNDQ1NDUyMX0.Tl_nrEQzt2wmCd9sZaLPr7Y5F97DKms9BCckZfI8WZ8';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Supabase API path မဟုတ်ရင် Worker မှာ မဆက်လုပ်
    if (!url.pathname.startsWith('/api/supabase/')) {
      return new Response('Not found', {
        status: 404
      });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods':
            'GET, POST, PATCH, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': '*'
        }
      });
    }

    try {
      const targetPath = url.pathname.replace('/api/supabase', '');
      const targetUrl = SUPABASE_URL + targetPath + url.search;

      const headers = new Headers();

      headers.set('apikey', SUPABASE_ANON_KEY);
      headers.set(
        'Authorization',
        `Bearer ${SUPABASE_ANON_KEY}`
      );

      const contentType = request.headers.get('content-type');

      if (contentType) {
        headers.set('content-type', contentType);
      }

      let body;

      if (!['GET', 'HEAD'].includes(request.method)) {
        body = await request.arrayBuffer();
      }

      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        redirect: 'manual'
      });

      const responseHeaders = new Headers(response.headers);

      responseHeaders.set(
        'Access-Control-Allow-Origin',
        '*'
      );

      responseHeaders.set(
        'Access-Control-Allow-Headers',
        '*'
      );

      responseHeaders.set(
        'Access-Control-Allow-Methods',
        'GET,POST,PATCH,PUT,DELETE,OPTIONS'
      );

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
