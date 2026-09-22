export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);

  // CORS Preflight
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

  const SUPABASE_HOST = 'zyajlsrytjvwxqtpxrqd.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5YWpsc3J5dGp2d3hxdHB4cnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4Nzg1MjEsImV4cCI6MjEwNDQ1NDUyMX0.Tl_nrEQzt2wmCd9sZaLPr7Y5F97DKms9BCckZfI8WZ8';

  const subPath = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const targetUrl = `https://${SUPABASE_HOST}/${subPath}${url.search}`;

  const newHeaders = new Headers(request.headers);
  newHeaders.set('Host', SUPABASE_HOST);
  
  // apikey header ကို အမြဲထည့်ပါ
  newHeaders.set('apikey', SUPABASE_ANON_KEY);

  // အကယ်၍ ယူဆာ Login ဝင်ထားပြီး Authorization (Bearer Token) ပါလာလျှင် ၎င်းကို ဆက်သုံးခွင့်ပြုပါ
  // မပါရှိမှသာ Anon Key ကို Authorization အဖြစ် သုံးပါ
  const clientAuth = request.headers.get('Authorization');
  if (!clientAuth || !clientAuth.startsWith('Bearer ey')) {
    newHeaders.set('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
  }

  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) newHeaders.set('X-Forwarded-For', clientIp);

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: newHeaders,
    body: hasBody ? request.body : null,
    redirect: 'follow',
    duplex: hasBody ? 'half' : undefined,
  });

  const response = await fetch(proxyRequest);

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
