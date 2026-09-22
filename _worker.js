const SUPABASE_URL = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YWpsc3J5dGp2d3hxdHB4cnFkIiwicm9sZSI6Inp5YWpsc3J5dGp2d3hxdHB4cnFkIiwicm9sZSI6Inp5YWlRzIiwiaWF0IjoxNzg4ODc4NTIxLCJleHAiOjIxMDQ0NTQ1MjF9.Tl_nrEQzt2wmCd9sZaLPr7Y5F97DKms9BCckZfI8WZ8';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // /api/supabase/ နှင့် မစတင်သော Request မှန်သမျှကို Worker ထဲ ဆက်မသွားစေဘဲ 404 ဖြင့် တားဆီးမည် (Loop ကာကွယ်ရန်)
    if (!url.pathname.startsWith('/api/supabase/')) {
      return new Response('Not found', {
        status: 404
      });
    }

    try {
      const targetPath = url.pathname.replace('/api/supabase', '');
      const targetUrl = SUPABASE_URL + targetPath + url.search;

      const headers = new Headers();

      // Supabase API Key များကို ထည့်သွင်းပေးခြင်း
      headers.set('apikey', SUPABASE_ANON_KEY);
      headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);

      const contentType = request.headers.get('content-type');
      if (contentType) {
        headers.set('content-type', contentType);
      }

      let body;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.arrayBuffer();
      }

      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        redirect: 'manual'
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Headers', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
      });

    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
