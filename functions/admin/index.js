export async function onRequestGet() {
  return new Response(`<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>管理 - Ray's Blog</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
:root{--primary:#3b82f6}
body{background:#f7f7fb}
.container{max-width:980px;margin:28px auto;padding:0 16px}
.card{background:#fff;border-radius:16px;box-shadow:0 10px 26px rgba(0,0,0,.06);padding:18px}
h1{margin:0 0 14px}
.grid{display:grid;grid-template-columns:1fr;gap:12px}
.row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
input,textarea{padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;background:#fff}
button{padding:10px 14px;border:0;border-radius:10px;background:var(--primary);color:#fff;font-weight:600}
a.btn{display:inline-block;padding:8px 12px;border-radius:10px;border:2px solid var(--primary);color:var(--primary);text-decoration:none}
.list li{margin:6px 0}
.faint{color:#9ca3af}
.actions{display:flex;gap:10px;align-items:center}
</style></head><body>
<div class="container">
  <h1>管理</h1>

  <!-- 登录卡片（每次进入都要先登录，不保存状态） -->
  <div class="card" id="adm-login">
    <div class="grid">
      <input id="adm-pass" type="password" placeholder="管理员密码" />
      <div class="actions">
        <button id="adm-go">登录</button>
        <span id="adm-tip" class="faint"></span>
      </div>
    </div>
  </div>

  <!-- 管理面板 -->
  <div class="card" id="adm-panel" style="display:none">
    <div class="actions" style="justify-content:end"><a id="adm-logout" class="btn" href="javascript:;">退出登录</a></div>

    <h3>发布/编辑文章</h3>
    <div class="row">
      <input id="p-title" placeholder="标题" />
      <input id="p-slug" placeholder="固定链接（英文/拼音）" />
      <input id="p-cover" placeholder="封面图片 URL（可空）" />
    </div>
    <textarea id="p-content" rows="12" placeholder="正文支持 Markdown 或 HTML"></textarea>
    <div class="actions">
      <button id="p-save">发布/保存</button>
      <a href="javascript:;" id="p-list" class="btn">刷新列表</a>
      <span id="p-tip" class="faint"></span>
    </div>

    <h4 style="margin-top:14px">文章列表（点击载入编辑 / 删除）</h4>
    <ul id="p-ul" class="list"></ul>

    <hr style="margin:16px 0;border:0;border-top:1px solid #eee" />

    <h3>站点设置</h3>
    <div class="row">
      <input id="s-hero-title" placeholder="首页标题（如：Hi，我是 Ray）" />
      <input id="s-hero-sub" placeholder="首页副标题" />
      <input id="s-avatar" placeholder="头像 URL（可空）" />
    </div>
    <div class="actions">
      <button id="s-save">保存设置</button>
      <span id="s-tip" class="faint"></span>
    </div>

    <h3 style="margin-top:14px">关于页面</h3>
    <textarea id="about-html" rows="10" placeholder="这里写关于页内容（支持 HTML）"></textarea>
    <div class="actions">
      <button id="about-save">保存关于页</button>
      <span id="about-tip" class="faint"></span>
    </div>
  </div>
</div>
<script src="/js/admin.js"></script>
</body></html>`,
  { headers: { "content-type":"text/html; charset=utf-8" }});
}
