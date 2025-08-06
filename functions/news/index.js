export async function onRequestGet() {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>新闻 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
.container{max-width:1200px;margin:26px auto;padding:0 20px}
.grid{display:grid;gap:18px}
@media (min-width:1500px){ .grid{grid-template-columns:repeat(4,1fr)} }
@media (min-width:1100px) and (max-width:1499.98px){ .grid{grid-template-columns:repeat(3,1fr)} }
@media (min-width:700px) and (max-width:1099.98px){ .grid{grid-template-columns:repeat(2,1fr)} }
@media (max-width:699.98px){ .grid{grid-template-columns:1fr} }
.card{background:#fff;border-radius:16px;box-shadow:0 12px 30px rgba(18,25,38,.06);overflow:hidden;display:flex;flex-direction:column}
.thumb{aspect-ratio:16/9;background:#eef2ff}
.thumb img{width:100%;height:100%;object-fit:cover;display:block}
.body{padding:12px 14px 14px}
.title{font-size:16px;margin:0 0 6px}
.meta{color:#9ca3af;font-size:13px;margin-bottom:6px}
.desc{color:#6b7280;font-size:14px;line-height:1.6;min-height:40px}
.filter{display:flex;gap:10px;margin:8px 0 12px}
.btn{padding:8px 12px;border-radius:10px;border:2px solid #3b82f6;background:#fff;color:#3b82f6;font-weight:600}
</style></head><body>
<div class="container">
  <h1>新闻</h1>
  <div class="filter">
    <button class="btn" data-r="ALL">全部</button>
    <button class="btn" data-r="HK">香港</button>
    <button class="btn" data-r="MO">澳門</button>
    <button class="btn" data-r="TW">臺灣</button>
    <button class="btn" data-r="CN">大陸</button>
  </div>
  <div id="grid" class="grid"></div>
</div>
<script src="/js/news-list.js"></script>
</body></html>`, { headers:{ "content-type":"text/html; charset=utf-8" }});
}
