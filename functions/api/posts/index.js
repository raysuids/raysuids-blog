function ok(d){return new Response(JSON.stringify(d),{headers:{'content-type':'application/json'}})}
export async function onRequestGet({ request, env }) {
  const url=new URL(request.url); const limit = Math.min(parseInt(url.searchParams.get('limit')||'10'), 100);
  const { results } = await env.DB.prepare(
    "SELECT id,title,slug,cover,substr(content,1,400) as content,created_at FROM posts ORDER BY id DESC LIMIT ?"
  ).bind(limit).all();
  return ok({ ok:true, list: results||[] });
}
export async function onRequestPost({ request, env }) {
  if(request.headers.get('X-Admin-Key') !== env.ADMIN_PASS) return ok({ok:false,error:'未授权'});
  const { title, slug, cover, content } = await request.json();
  if(!title||!slug||!content) return ok({ ok:false, error:"缺少字段" });
  try{
    await env.DB.prepare("INSERT INTO posts (title,slug,cover,content) VALUES (?,?,?,?)")
      .bind(title.trim(), slug.trim(), (cover||'').trim(), content).run();
    return ok({ ok:true });
  }catch(e){ return ok({ ok:false, error:"保存失败，可能是 slug 重复" }); }
}
