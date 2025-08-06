export async function onRequestGet({ params, env }) {
  try{
    const id = params.id;
    let row = await env.DB.prepare("SELECT * FROM news WHERE id=?").bind(id).first();
    if(!row) return html(404, page("未找到此新闻","<p><a href='/'>返回首页</a></p>"));
    if(!row.html){ // 没抓过 → 现场抓一次并入库
      const raw = await fetch(row.link, { headers:{ "User-Agent":"Mozilla/5.0 RayBlog" }, cf:{ cacheTtl: 300 }});
      if(raw.ok){
        let body = await raw.text();
        body = cleanHTML(body, row.link);
        await env.DB.prepare("UPDATE news SET html=? WHERE id=?").bind(body, id).run();
        row.html = body;
      }
    }
    const content = row.html || `<p>抱歉，無法抓取該新聞內容，<a href="${esc(row.link)}" target="_blank" rel="noopener">前往原文</a></p>`;
    return html(200, render(row, content));
  }catch(e){
    return html(500, page("服務器異常", `<pre>${esc(e.message||"")}</pre>`));
  }

  function render(n, content){
    return `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(n.title)} - Ray's News</title>
<link rel="stylesheet" href="/css/extended/custom.css">
<style>
main{max-width:900px;margin:24px auto;background:#fff;border-radius:16px;box-shadow:0 12px 30px rgba(18,25,38,.06);padding:22px}
h1{margin:0 0 10px;font-size:24px}
.meta{color:#9ca3af;font-size:13px;margin-bottom:12px}
.content{line-height:1.78;color:#1f2937}
.content img{max-width:100%;display:block;border-radius:10px;margin:10px auto}
.content figure{margin:0}
.back{display:block;text-align:center;margin:14px auto}
</style></head><body>
<main>
  <h1>${esc(n.title)}</h1>
  <div class="meta">${esc(n.source)} · ${esc(n.region)} · ${(n.pub_at||'').replace('T',' ').slice(0,16)}</div>
  <div class="content">${content}</div>
  <a class="btn ghost back" href="/news/">返回新聞列表</a>
</main>
<script>window.dispatchEvent(new Event('zhconv'))</script>
</body></html>`;
  }
  function page(t, h){return `<!doctype html><meta charset="utf-8"><title>${esc(t)}</title><div style="max-width:720px;margin:60px auto;font:16px/1.7 system-ui">${h}</div>`}
  function html(s, h){return new Response(h,{status:s,headers:{ "content-type":"text/html; charset=utf-8", "cache-control":"no-store" }})}
  function esc(s){return (s||"").toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

  // 粗粒度提取正文 + 修正圖片為絕對地址；去掉腳本追蹤
  function cleanHTML(h, base){
    // 去掉腳本/樣式
    h = h.replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"");
    // 優先常見正文容器（盡量兼容）
    const picks = [
      /<article[\s\S]*?<\/article>/i,
      /<div[^>]+class=["'][^"']*(?:(?:content|article|story|entry|post)-?body)[^"']*["'][\s\S]*?<\/div>/i,
      /<div[^>]+id=["'][^"']*(?:content|article|story|entry)[^"']*["'][\s\S]*?<\/div>/i,
      /<main[\s\S]*?<\/main>/i
    ];
    let body = "";
    for(const re of picks){ const m = h.match(re); if(m){ body=m[0]; break; } }
    if(!body){ // 退一步：抓多段<p>
      const ps = h.match(/<p[\s\S]*?<\/p>/gi)||[]; body = ps.slice(0,60).join("\n");
    }
    // 修正圖片 src 為絕對地址，並替換 data-src 等懶加載屬性
    body = body.replace(/<img[^>]*>/gi, tag=>{
      let src = (tag.match(/\s(src|data-src|data-original)=["']([^"']+)["']/i)||[])[2]||"";
      if(!src) return ""; // 沒圖就丟棄
      try{ src = new URL(src, base).href }catch{}
      return `<img src="${src}" referrerpolicy="no-referrer">`;
    });
    // 移除多餘導航/分享
    body = body.replace(/<nav[\s\S]*?<\/nav>/gi,"").replace(/<aside[\s\S]*?<\/aside>/gi,"");
    // 收斂 a 標籤為純文本（避免外鏈）
    body = body.replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1");
    return body;
  }
}
