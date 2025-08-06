export async function onRequestGet({ env }){
  const rows = await env.DB.prepare("SELECT v FROM settings WHERE k='about_html'").all();
  const html = rows.results?.[0]?.v || "<p>这里写你的关于页内容。</p>";
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>关于 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
.hero-a{position:relative;padding:80px 20px 40px;margin-bottom:12px;overflow:hidden}
.hero-a::before{content:"";position:absolute;inset:-20% -10% auto -10%;height:360px;
  background:radial-gradient(900px 360px at 50% -20%,rgba(59,130,246,.28),rgba(59,130,246,0))}
.main{max-width:900px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:var(--shadow);padding:22px}
.main img{max-width:100%;border-radius:10px}
</style></head><body>
<section class="hero-a"><div class="container"><h1>关于我</h1></div></section>
<div class="main">${html}</div>
<div class="container" style="text-align:center;margin:18px auto"><a class="btn ghost" href="/">返回首页</a></div>
</body></html>`, {
    headers: {
      "content-type":"text/html; charset=utf-8",
      "cache-control":"no-store, max-age=0"   // 关键：保存后刷新立刻生效
    }
  });
}
