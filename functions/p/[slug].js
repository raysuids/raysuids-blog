export async function onRequestGet({ params, env }) {
  const slug = params.slug;
  const row = await env.DB.prepare("SELECT * FROM posts WHERE slug=?").bind(slug).get();
  if(!row) return new Response("Not Found", {status:404});
  const html = `<!doctype html>
<html><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(row.title)} - Ray's Blog</title>
<link rel="stylesheet" href="/css/home.css">
<link rel="stylesheet" href="/css/extended/custom.css">
<style>main{max-width:900px;margin:24px auto;background:#fff;border-radius:14px;box-shadow:0 10px 26px rgba(0,0,0,.06);padding:20px;}
h1{margin:6px 0 8px;}
.post-cover{aspect-ratio:16/9;background:#eaeef8;border-radius:10px;overflow:hidden;margin:6px 0 14px;}
.post-cover img{width:100%;height:100%;object-fit:cover;display:block;}
.post-content{line-height:1.75;color:#1f2937;}
.post-content img{max-width:100%;border-radius:10px;}
.post-info{color:#6b7280;margin:6px 0 14px;}</style>
</head>
<body>
<main>
  <h1>${esc(row.title)}</h1>
  <div class="post-info">${(row.created_at||'').replace('T',' ').slice(0,19)}</div>
  ${row.cover ? `<div class="post-cover"><img src="${esc(row.cover)}" alt="${esc(row.title)}"></div>` : ''}
  <div class="post-content">${row.content}</div>
</main>
<a href="/" class="fab-admin">返回首页</a>
</body></html>`;
  return new Response(html, { headers: { "content-type":"text/html; charset=utf-8" }});
}
function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]))}
