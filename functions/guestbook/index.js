export async function onRequestGet(){
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>留言板 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
#gb-form{display:grid;gap:10px;margin-bottom:14px}
#gb-form input,#gb-form textarea{padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff}
#gb-form button{width:120px}
.gb-grid{display:grid;gap:18px}
@media (min-width:980px){ .gb-grid{grid-template-columns:repeat(2,1fr)} }
@media (max-width:979.98px){ .gb-grid{grid-template-columns:1fr} }
.gb-item{background:#fff;border-radius:16px;box-shadow:var(--shadow);padding:12px 14px}
.gb-meta{color:#6b7280;display:flex;gap:10px;align-items:center;font-size:14px}
.gb-msg{margin-top:6px;white-space:pre-wrap;line-height:1.65}
</style>
</head><body>
<div class="container" style="margin:28px auto">
  <h1>留言板</h1>
  <div class="card" style="padding:18px">
    <form id="gb-form">
      <input id="gb-name" type="text" placeholder="昵称" maxlength="24" required />
      <textarea id="gb-msg" rows="4" placeholder="想说点什么…" maxlength="500" required></textarea>
      <div style="display:flex;align-items:center;gap:10px">
        <button class="btn" type="submit">发布留言</button>
        <span id="gb-tip" style="color:#888"></span>
      </div>
    </form>
    <div id="gb-list" class="gb-grid"></div>
  </div>
</div>
<script src="/js/guestbook.js"></script>
</body></html>`, { headers: { "content-type":"text/html; charset=utf-8" }});
}
