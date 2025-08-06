export async function onRequestGet() {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>标签 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
</head><body>
<div class="container" style="margin:28px auto">
  <h1>标签</h1>
  <div id="tags" class="grid cols-2 tag-grid"></div>
</div>
<script src="/js/tags.js"></script>
</body></html>`, { headers: { "content-type":"text/html; charset=utf-8" }});
}
