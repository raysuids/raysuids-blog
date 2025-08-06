export async function onRequestGet({ params, env }) {
  try {
    const key = params.slug;
    let row = await env.DB.prepare("SELECT * FROM posts WHERE slug=?").bind(key).first();
    if (!row && /^\d+$/.test(key)) {
      row = await env.DB.prepare("SELECT * FROM posts WHERE id=?").bind(Number(key)).first();
    }
    if (!row) return new Response(page404(), { status: 404, headers: H() });
    return new Response(renderPost(row), { headers: H() });
  } catch (e) {
    return new Response(page500(e?.message), { status: 500, headers: H() });
  }
}
const H=()=>({"content-type":"text/html; charset=utf-8"});
const esc=s=>(s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
function renderPost(row){return `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(row.title)} - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css"><link rel="stylesheet" href="/css/home.css">
<style>
main{max-width:900px;margin:24px auto;background:#fff;border-radius:14px;box-shadow:0 10px 26px rgba(0,0,0,.06);padding:20px;}
h1{margin:6px 0 8px;}
.post-cover{aspect-ratio:16/9;background:#eaeef8;border-radius:10px;overflow:hidden;margin:6px 0 14px;}
.post-cover img{width:100%;height:100%;object-fit:cover;display:block}
.post-content{line-height:1.75;color:#1f2937}
.post-content img{max-width:100%;border-radius:10px}
.post-info{color:#6b7280;margin:6px 0 14px}
</style></head><body>
<main>
  <h1>${esc(row.title)}</h1>
  <div class="post-info">${(row.created_at||'').replace('T',' ').slice(0,19)}</div>
  ${row.cover ? `<div class="post-cover"><img src="${esc(row.cover)}" alt="${esc(row.title)}"></div>` : ""}
  <div class="post-content">${row.content || ""}</div>
</main>
<a href="/" class="fab-admin">返回首页</a></body></html>`}
function page404(){return `<!doctype html><meta charset="utf-8"><div style="max-width:720px;margin:60px auto;font:16px/1.7 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto"><h2>未找到文章</h2><p><a href="/">返回首页</a></p></div>`}
function page500(m){return `<!doctype html><meta charset="utf-8"><div style="max-width:720px;margin:60px auto;font:16px/1.7 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto"><h2>服务器异常</h2><p>${esc(m||"未知错误")}</p><p><a href="/">返回首页</a></p></div>`}
