---
title: "留言板"
---

<div id="gb-app">
  <form id="gb-form">
    <input id="gb-name" type="text" placeholder="昵称" maxlength="24" required />
    <textarea id="gb-msg" rows="4" placeholder="想说点什么…" maxlength="500" required></textarea>
    <button type="submit">发布留言</button>
    <span id="gb-tip" style="margin-left:10px;color:#888;"></span>
  </form>

  <div id="gb-list" class="gb-list"></div>
</div>

<script src="/js/guestbook.js"></script>
