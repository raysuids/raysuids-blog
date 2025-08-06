export async function onRequestGet() {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>新闻 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<!-- 繁/简按钮注入（确保子页也有） -->
<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js"></script>
<script defer src="/js/zh-toggle.js"></script>
...
