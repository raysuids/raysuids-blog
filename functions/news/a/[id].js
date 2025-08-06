export async function onRequestGet({ params, env }) {
  try {
    const id = params.id;
    let row = await env.DB.prepare("SELECT * FROM news WHERE id=?").bind(id).first();
    if (!row) return html(404, page("未找到此新聞", "<p><a href='/'>返回首頁</a></p>"));

    let content = (row.html || "");
    if (!content) {
      const got = await fetch(row.link, {
        headers: { "User-Agent": "Mozilla/5.0 RayBlog" },
        cf: { cacheTtl: 300 }
      });
      if (got.ok) {
        let doc = await got.text();
        let body = siteAdapt(row.link, doc);
        if (!body) body = cleanHTML(doc, row.link);
        if (strip(body).length >= 120) {
          content = body;
          await env.DB.prepare("UPDATE news SET html=? WHERE id=?").bind(content, id).run();
        } else {
          content = ""; // 抓不到正文→交给前端显示“前往原文”
        }
      }
    }

    const title = esc(row.title || "");
    const meta = esc((row.source || "") + " · " + (row.region || "") + " · " + ((row.pub_at || "").replace("T"," ").slice(0,16)));

    // 纯字符串拼接，避免 JSX/模板字符串
    const h = [];
    h.push('<!doctype html><html lang="zh-CN"><head>');
    h.push('<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">');
    h.push('<title>' + title + ' - Ray\'s News</title>');
    h.push('<link rel="stylesheet" href="/css/extended/custom.css">');
    // 繁/简按钮脚本，确保子页也始终存在
    h.push('<script src="https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js"></script>');
    h.push('<script defer src="/js/zh-toggle.js"></script>');
    h.push('<style>');
    h.push('main{max-width:900px;margin:24px auto;background:#fff;border-radius:16px;box-shadow:0 12px 30px rgba(18,25,38,.06);padding:22px}');
    h.push('h1{margin:0 0 10px;font-size:24px}.meta{color:#9ca3af;font-size:13px;margin-bottom:12px}');
    h.push('.content{line-height:1.78;color:#1f2937}.content img{max-width:100%;display:block;border-radius:10px;margin:10px auto}.content figure{margin:0}');
    h.push('.topnav{max-width:900px;margin:12px auto;padding:0 4px;font:14px system-ui}');
    h.push('.topnav a{margin-right:10px}');
    h.push('</style>');
    h.push('</head><body>');

    // 简易导航（含“管理”）
    h.push('<nav class="topnav">');
    h.push('<a href="/">首页</a><a href="/archives/">归档</a><a href="/tags/">标签</a><a href="/about/">关于</a><a href="/guestbook/">留言板</a><a href="/news/">新闻</a><a href="/admin/" style="font-weight:600">管理</a>');
    h.push('</nav>');

    h.push('<main>');
    h.push('<h1>' + title + '</h1>');
    h.push('<div class="meta">' + meta + '</div>');
    if (content && content.trim()) {
      h.push('<div class="content">' + content + '</div>');
    } else {
      // 抓不到正文→直接给原文链接（不空白）
      h.push('<div class="content"><p>此來源暫不支持正文抓取，<a href="' + esc(row.link || "#") + '" target="_blank" rel="noopener">點擊前往原文</a>。</p></div>');
    }
    h.push('<a class="btn ghost" style="display:block;text-align:center;margin:14px auto" href="/news/">返回新聞列表</a>');
    h.push('</main>');

    // 触发一次繁/简转换
    h.push('<script>window.dispatchEvent(new Event("zhconv"))</script>');
    h.push('</body></html>');

    return html(200, h.join(''));
  } catch (e) {
    return html(500, page("服務器異常", "<pre>" + esc(e && e.message ? e.message : "") + "</pre>"));
  }

  // ---------------- helpers ----------------
  function html(status, body) {
    return new Response(body, {
      status,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" }
    });
  }
  function page(title, inner) {
    return '<!doctype html><meta charset="utf-8"><title>' + esc(title) + '</title>' +
           '<div style="max-width:720px;margin:60px auto;font:16px/1.7 system-ui">' + inner + '</div>';
  }
  function esc(s) { return (s || "").toString().replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m])); }
  function strip(html) { return (html || "").replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); }

  function fixImgs(html, baseUrl) {
    return (html || "")
      .replace(/<style[\s\S]*?<\/style>/gi,"")
      .replace(/<img[^>]*>/gi, function(tag){
        var m = (tag.match(/\s(src|data-src|data-original)=["']([^"']+)["']/i) || []);
        var src = m[2] || "";
        if (!src) return "";
        try { src = new URL(src, baseUrl).href; } catch {}
        return '<img src="' + src + '" referrerpolicy="no-referrer">';
      })
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1");
  }

  // 站点适配：能抓就抓，抓不到返回空字符串
  function siteAdapt(url, html) {
    try {
      var u = new URL(url); var h = (html || "").replace(/<script[\s\S]*?<\/script>/gi, "");
      function take(regs){ for (var i=0;i<regs.length;i++){ var m = h.match(regs[i]); if(m){ return fixImgs(m[0], u) } } return ""; }

      if (/rthk\.hk$|\.rthk\.hk/i.test(u.hostname)) {
        return take([
          /<article[\s\S]*?<\/article>/i,
          /<section[^>]*class=["'][^"']*(?:article|content)[^"']*["'][\s\S]*?<\/section>/i,
          /<div[^>]*class=["'][^"']*(?:news|content|article)[^"']*["'][\s\S]*?<\/div>/i
        ]);
      }
      if (/news\.now\.com/i.test(u.hostname)) {
        return take([
          /<div[^>]*class=["'][^"']*(?:newsContent|article|post)-?body[^"']*["'][\s\S]*?<\/div>/i,
          /<article[\s\S]*?<\/article>/i
        ]);
      }
      if (/cna\.com\.tw|udn\.com|yahoo\.com/i.test(u.hostname)) {
        return take([
          /<article[\s\S]*?<\/article>/i,
          /<div[^>]*class=["'][^"']*(?:story|article|content)[^"']*["'][\s\S]*?<\/div>/i
        ]);
      }
      if (/gov\.mo/i.test(u.hostname)) {
        return take([
          /<div[^>]*class=["'][^"']*entry-content[^"']*["'][\s\S]*?<\/div>/i,
          /<article[\s\S]*?<\/article>/i
        ]);
      }
      return "";
    } catch { return ""; }
  }

  // 宽松提取：抓不到时使用，做基本净化
  function cleanHTML(html, base) {
    var h = (html || "").replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"");
    var body = "";
    var regs = [
      /<article[\s\S]*?<\/article>/i,
      /<div[^>]+class=["'][^"']*(?:(?:content|article|story|entry|post)-?body)[^"']*["'][\s\S]*?<\/div>/i,
      /<main[\s\S]*?<\/main>/i
    ];
    for (var i=0;i<regs.length;i++){ var m = h.match(regs[i]); if(m){ body = m[0]; break; } }
    if (!body) {
      var ps = h.match(/<p[\s\S]*?<\/p>/gi) || [];
      body = ps.slice(0,60).join("\n");
    }
    return fixImgs(body, base)
      .replace(/<nav[\s\S]*?<\/nav>/gi,"").replace(/<aside[\s\S]*?<\/aside>/gi,"")
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1");
  }
}

