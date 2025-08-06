export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id,name,message,created_at FROM msgs ORDER BY id DESC LIMIT 50"
  ).all();
  return Response.json({ ok: true, list: results || [] });
}
export async function onRequestPost({ request, env }) {
  try{
    const d = await request.json();
    const name=(d.name||'').trim().slice(0,24);
    const msg=(d.message||'').trim().slice(0,500);
    if(!name||!msg) return Response.json({ ok:false, error:"请填写昵称与内容" }, {status:400});
    await env.DB.prepare("INSERT INTO msgs (name,message) VALUES (?,?)").bind(name,msg).run();
    return Response.json({ ok:true }, {status:201});
  }catch{ return Response.json({ ok:false, error:"请求格式不正确" }, {status:400}); }
}
