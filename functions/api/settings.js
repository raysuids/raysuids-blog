function jr(d){return new Response(JSON.stringify(d),{headers:{'content-type':'application/json'}})}
export async function onRequestGet({ env }){
  const rows = await env.DB.prepare("SELECT k,v FROM settings").all();
  const obj = {}; (rows.results||[]).forEach(r=>obj[r.k]=r.v);
  return jr({ ok:true, data: obj });
}
export async function onRequestPost({ request, env }){
  if(request.headers.get('X-Admin-Key') !== env.ADMIN_PASS) return jr({ok:false,error:'未授权'},401);
  const d = await request.json();
  const kv = Object.entries(d||{});
  if(!kv.length) return jr({ ok:false, error:'无内容' },400);
  await env.DB.batch(kv.map(([k,v])=> env.DB.prepare("INSERT INTO settings (k,v) VALUES (?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(k, String(v??''))));
  return jr({ ok:true });
}
