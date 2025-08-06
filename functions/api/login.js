export async function onRequestPost({ request, env }) {
  const { pass } = await request.json();
  if(pass && env.ADMIN_PASS && pass === env.ADMIN_PASS){
    // 简化：直接回传 key（不发 Cookie），前端放 sessionStorage
    return Response.json({ ok:true, key: pass });
  }
  return Response.json({ ok:false, error:"密码错误" }, { status:401 });
}
