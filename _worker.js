const SUPABASE_URL = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YWpsc3J5dGp2d3hxdHB4cnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4Nzg1MjEsImV4cCI6MjEwNDQ1NDUyMX0.Tl_nrEQzt2wmCd9sZaLPr7Y5F97DKms9BCckZfI8WZ8';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/supabase/')) {
      const targetPath = url.pathname.replace('/api/supabase', '');
      const targetUrl = SUPABASE_URL + targetPath + url.search;

      const headers = new Headers(request.headers);

      // Supabase အတွက် လိုအပ်သော API Keys များကို မဖြစ်မနေ ထည့်သွင်းပေးခြင်း
      headers.set('apikey', SUPABASE_ANON_KEY);
      headers.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);

      // Host header ကို Supabase domain သို့ ပြောင်းပေးရန် (Supabase API က လက်ခံရန်အတွက်)
      headers.set('Host', 'zyajlsrytjvwxqtpxrqd.supabase.co');

      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body: ['GET', 'HEAD'].includes(request.method)
          ? undefined
          : request.body,
        redirect: 'follow'
      });

      // Response headers များကို ပုံစံမှန်ကန်စွာ ပြန်လည်ပေးပို့ရန်
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }

    return fetch(request);
  }
};
