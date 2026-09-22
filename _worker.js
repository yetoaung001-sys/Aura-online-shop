const SUPABASE_URL = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YWpsc3J5dGp2d3hxdHB4cnFkIiwicm9sZSI6Inp5YWpsc3J5dGp2d3hxdHB4cnFkIiwicm9sZSI6Inp5YWlRzIiwiaWF0IjoxNzg4ODc4NTIxLCJleHAiOjIxMDQ0NTQ1MjF9.Tl_nrEQzt2wmCd9sZaLPr7Y5F97DKms9BCckZfI8WZ8';

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (url.pathname.startsWith('/api/supabase/')) {
        const targetPath = url.pathname.replace('/api/supabase', '');
        const targetUrl = SUPABASE_URL + targetPath + url.search;

        const headers = new Headers(request.headers);

        headers.set('apikey', SUPABASE_ANON_KEY);
        headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
        headers.set('Host', 'zyajlsrytjvwxqtpxrqd.supabase.co');

        // Body ပါဝင်သော Method များအတွက် သေချာစေရန်
        let body = undefined;
        if (!['GET', 'HEAD'].includes(request.method)) {
          body = await request.arrayBuffer();
        }

        const response = await fetch(targetUrl, {
          method: request.method,
          headers,
          body,
          redirect: 'follow'
        });

        const newHeaders = new Headers(response.headers);
        newHeaders.set('Access-Control-Allow-Origin', '*');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      }

      return fetch(request);
    } catch (err) {
      // Error ဖြစ်ပေါ်လာပါက 1019 အစား အသေးစိတ် Error ကို ပြသပေးရန်
      return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
