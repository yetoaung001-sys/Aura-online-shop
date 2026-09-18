export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Supabase API နှင့် Storage နှစ်ခုလုံးကို Proxy လုပ်ပေးမည့်အပိုင်း
    if (url.pathname.startsWith('/api/supabase/')) {
      const supabaseHost = 'https://zyajlsrytjvwxqtpxrqd.supabase.co';
      const subPath = url.pathname.replace('/api/supabase', '');
      const targetUrl = new URL(subPath + url.search, supabaseHost);

      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow'
      });

      return fetch(modifiedRequest);
    }

    // Static Assets / HTML Routing မူလအတိုင်း ပြန်ပို့ခြင်း
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return fetch(request);
  }
};
