export async function onRequestGet({ env }) {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>标签：动态 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
</head><body>
<div class="container" style="margin:28px auto">
  <h1>标签：<span class="tag-badge">动态</span></h1>
  <div id="list" class="grid cols-2 card-list"></div>
</div>
<script>
(async ()=>{
  const r=await fetch('/api/posts?limit=200'); const d=await r.json();
  const box=document.getElementById('list');
  box.innerHTML = (d.ok && d.list.length)
    ? d.list.map(p=>\`
      <a class="item" href="/p/\${p.slug}">
        <div class="cover">\${p.cover?`<img src="\${p.cover}">`:`<div></div>`}</div>
        <div class="meta">
          <div class="title">\${p.title}</div>
          <div class="info"><span>\${(p.created_at||'').replace('T',' ').slice(0,10)}</span></div>
        </div>
      </a>\`).join('')
    : '<div style="color:#9ca3af">暂无</div>';
})();
</script>
</body></html>`, { headers: { "content-type":"text/html; charset=utf-8" }});
}
