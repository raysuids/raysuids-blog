export async function onRequestGet() {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>归档 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
</head><body>
<div class="container" style="margin:28px auto">
  <h1>归档</h1>

  <h3 class="sec-title">动态文章</h3>
  <div id="dyn" class="grid cols-2 card-list"></div>

  <h3 class="sec-title" style="margin-top:18px">静态文章</h3>
  <div id="stat" class="grid cols-2 card-list"></div>
</div>
<script src="/js/archives.js"></script>
</body></html>`,
  { headers: { "content-type":"text/html; charset=utf-8" }});
}
