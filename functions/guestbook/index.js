export async function onRequestGet(){
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>留言板 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
.container{max-width:820px;margin:28px auto;padding:0 16px}
.card{background:#fff;border-radius:16px;box-shadow:0 10px 26px rgba(0,0,0,.06);padding:18px}
#gb-form{display:grid;gap:10px;margin-bottom:14px}
#gb-form input,#gb-form textarea{padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff}
#gb-form button{width:120px;padding:10px 12px;border-radius:10px;border:0;background:#3b82f6;color:#fff;font-weight:600;box-shadow:0 10px 24px rgba(59,130,246,.22)}
.gb-list{display:grid;gap:12px}
.gb-item{background:#fff;border-radius:14px;padding:12px 14px;box-shadow:0 8px 22px rgba(0,0,0,.06)}
.gb-meta{color:#6b7280;display:flex;gap:10px;align-items:center;font-size:14px}
.gb-meta b{color:#111827}
.gb-msg{margin-top:6px;white-space:pre-wrap;line-height:1.65}
</style>
</head><body>
<div class="container">
  <h1>留言板</h1>
  <div class="card">
    <form id="gb-form">
      <input id="gb-name" type="text" placeholder="昵称" maxlength="24" required />
      <textarea id="gb-msg" rows="4" placeholder="想说点什么…" maxlength="500" required></textarea>
      <div style="display:flex;align-items:center;gap:10px">
        <button type="submit">发布留言</button>
        <span id="gb-tip" style="color:#888"></span>
      </div>
    </form>
    <div id="gb-list" class="gb-list"></div>
  </div>
</div>
<script src="/js/guestbook.js"></script>
</body></html>`, { headers: { "content-type":"text/html; charset=utf-8" }});
}
