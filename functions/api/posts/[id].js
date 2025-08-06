function j(d,s=200){return new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json'}})}
export async function onRequestGet({ params, env }) {
  const row = await env.DB.prepare("SELECT * FROM posts WHERE id=?").bind(params.id).first();
  if(!row) return j({ok:false,error:'not found'},404);
  return j({ ok:true, data: row });
}
export async function onRequestPut({ request, params, env }) {
  if(request.headers.get('X-Admin-Key') !== env.ADMIN_PASS) return j({ok:false,error:'未授权'},401);
  const { title, slug, cover, content } = await request.json();
  if(!title||!slug||!content) return j({ ok:false, error:"缺少字段" },400);
  await env.DB.prepare("UPDATE posts SET title=?,slug=?,cover=?,content=?,updated_at=datetime('now') WHERE id=?")
    .bind(title.trim(), slug.trim(), (cover||'').trim(), content, params.id).run();
  return j({ ok:true });
}
export async function onRequestDelete({ request, params, env }) {
  if(request.headers.get('X-Admin-Key') !== env.ADMIN_PASS) return j({ok:false,error:'未授权'},401);
  await env.DB.prepare("DELETE FROM posts WHERE id=?").bind(params.id).run();
  return j({ ok:true });
}
