export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit')||'60'), 200);
  const { results } = await env.DB.prepare(
    "SELECT id,source,region,title,link,cover,summary,pub_at FROM news ORDER BY datetime(pub_at) DESC LIMIT ?"
  ).bind(limit).all();
  return new Response(JSON.stringify({ ok:true, list: results||[] }), {
    headers:{ "content-type":"application/json", "cache-control":"no-store,max-age=0" }
  });
}
