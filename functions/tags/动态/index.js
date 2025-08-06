export async function onRequestGet() {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>标签：动态 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
</head><body>
<div class="container" style="margin:28px auto">
  <h1>标签：<span class="tag-badge">动态</span></h1>
  <div id="list" class="grid cols-2 card-list"></div>
</div>
<script src="/js/tag-dynamic.js"></script>
</body></html>`,
  { headers: { "content-type": "text/html; charset=utf-8" } }
  );
}
