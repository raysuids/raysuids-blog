---
title: "管理"
---

<div id="adm-app" class="adm">
  <div class="login" id="adm-login">
    <input id="adm-pass" type="password" placeholder="管理员密码（默认 112456）" />
    <button id="adm-go">登录</button>
    <span id="adm-tip" style="margin-left:10px;color:#888;"></span>
  </div>

  <div class="panel" id="adm-panel" style="display:none">
    <h3>发布/编辑文章</h3>
    <div class="row">
      <input id="p-title" placeholder="标题" />
      <input id="p-slug" placeholder="固定链接（英文/拼音）" />
      <input id="p-cover" placeholder="封面图片 URL（可空）" />
    </div>
    <textarea id="p-content" rows="10" placeholder="正文支持 Markdown 或 HTML"></textarea>
    <div class="row">
      <button id="p-save">发布/保存</button>
      <button id="p-list">刷新列表</button>
      <span id="p-tip" style="margin-left:10px;color:#888;"></span>
    </div>

    <h4>文章列表（点击载入编辑 / 删除）</h4>
    <ul id="p-ul"></ul>

    <hr />
    <h3>站点设置</h3>
    <div class="row">
      <input id="s-hero-title" placeholder="首页标题（如：Hi，我是 Ray）" />
      <input id="s-hero-sub" placeholder="首页副标题" />
      <input id="s-avatar" placeholder="头像 URL（用于以后扩展）" />
      <button id="s-save">保存设置</button>
      <span id="s-tip" style="margin-left:10px;color:#888;"></span>
    </div>
  </div>
</div>

<script src="/js/admin.js"></script>
