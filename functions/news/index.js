export async function onRequestGet() {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>新闻 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
.container{max-width:1100px;margin:26px auto;padding:0 20px}
.filter{display:flex;gap:10px;align-items:center;margin:8px 0 12px}
.filter .btn{background:#fff;color:#3b82f6;border:2px solid #3b82f6}
.grid{display:grid;gap:18px}
@media (min-width:980px){ .grid{grid-template-columns:repeat(2,1fr)} }
.card{background:#fff;border-radius:16px;box-shadow:0 12px 30px rgba(18,25,38,.06);overflow:hidden;display:flex;gap:0;min-height:140px}
.thumb{width:40%;min-height:140px;background:#eef2ff;display:flex;align-items:center;justify-content:center}
.thumb img{width:100%;height:100%;object-fit:cover;display:block}
.body{padding:12px 14px 14px;flex:1}
.title{font-size:16px;margin:0 0 6px}
.meta{color:#9ca3af;font-size:13px;margin-bottom:6px}
.desc{color:#6b7280;font-size:14px;line-height:1.6}
</style></head><body>
<div class="container">
  <h1>新闻</h1>
  <div class="filter">
    <button class="btn" data-region="ALL">全部</button>
    <button class="btn" data-region="HK">香港</button>
    <button class="btn" data-region="MO">澳門</button>
    <button class="btn" data-region="TW">臺灣</button>
  </div>
  <div id="news-grid" class="grid"></div>
</div>
<script src="/js/news.js"></script>
</body></html>`, { headers: { "content-type":"text/html; charset=utf-8" }});
}
