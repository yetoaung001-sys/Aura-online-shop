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
  const subPath = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const targetUrl = `https://${SUPABASE_HOST}/${subPath}${url.search}`;

  const newHeaders = new Headers(request.headers);
  newHeaders.set('Host', SUPABASE_HOST);

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
