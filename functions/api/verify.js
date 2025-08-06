export async function onRequestGet({ request, env }) {
  const key = request.headers.get('X-Admin-Key') || '';
  const ok = !!(env.ADMIN_PASS && key && key === env.ADMIN_PASS);
  return new Response(JSON.stringify({ ok }), { headers: { 'content-type': 'application/json' }});
}
