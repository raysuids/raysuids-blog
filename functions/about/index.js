export async function onRequestGet({ env }){
  const rows = await env.DB.prepare("SELECT v FROM settings WHERE k='about_html'").all();
  const html = rows.results?.[0]?.v || "<p>这里写你的关于页内容。</p>";
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>关于 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
main{max-width:900px;margin:24px auto;background:#fff;border-radius:14px;box-shadow:0 10px 26px rgba(0,0,0,.06);padding:20px;}
main img{max-width:100%;border-radius:10px}
</style></head><body>
<main><h1>关于我</h1>${html}</main>
<a href="/" class="fab-admin">返回首页</a>
</body></html>`, { headers: { "content-type":"text/html; charset=utf-8" }});
}
