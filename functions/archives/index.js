export async function onRequestGet() {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>归档 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
.container{max-width:980px;margin:28px auto;padding:0 16px}
.section{background:#fff;border-radius:16px;box-shadow:0 10px 26px rgba(0,0,0,.06);padding:18px;margin-bottom:16px}
ul.list{margin:0;padding:0;list-style:none}
ul.list li{padding:8px 0;border-bottom:1px solid #f2f2f2}
ul.list li:last-child{border-bottom:0}
.time{color:#9ca3af;margin-left:8px}
</style></head><body>
<div class="container">
  <h1>归档</h1>
  <div class="section"><h3>动态文章（在线发布）</h3><ul id="dyn" class="list"></ul></div>
  <div class="section"><h3>静态文章（Markdown）</h3><ul id="stat" class="list"></ul></div>
</div>
<script src="/js/archives.js"></script></body></html>`,
  { headers: { "content-type":"text/html; charset=utf-8" }});
}
