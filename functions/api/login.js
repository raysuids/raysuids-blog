export async function onRequestPost({ request, env }) {
  const { pass } = await request.json();
  if(pass && env.ADMIN_PASS && pass === env.ADMIN_PASS){
    // 不持久化；仅把 key 回给前端在当前页面使用
    return Response.json({ ok:true, key: pass });
  }
  return Response.json({ ok:false, error:"密码错误" }, { status:401 });
}
