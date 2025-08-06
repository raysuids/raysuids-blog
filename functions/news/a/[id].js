export async function onRequestGet({ params, env }) {
  try{
    const id = params.id;
    let row = await env.DB.prepare("SELECT * FROM news WHERE id=?").bind(id).first();
    if(!row) return html(404, page("未找到此新聞","<p><a href='/'>返回首頁</a></p>"));

    if(!row.html){
      const got = await fetch(row.link, { headers:{ "User-Agent":"Mozilla/5.0 RayBlog" }, cf:{ cacheTtl: 300 }});
      if(got.ok){
        let body = await got.text();
        body = siteAdapt(row.link, body) || cleanHTML(body, row.link);
        // 过短视为失败
        if(body.replace(/<[^>]+>/g,"").trim().length < 120){
          row.html = ""; // 让前端走“跳原文”
        }else{
          await env.DB.prepare("UPDATE news SET html=? WHERE id=?").bind(body, id).run();
          row.html = body;
        }
      }
    }

    const content = row.html && row.html.trim()
      ? row.html
      : `<p>此來源暫不支持正文抓取，<a href="${esc(row.link)}" target="_blank" rel="noopener">點擊前往原文</a>。</p>`;

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
  function html(s, h){return new Response(h,{status:s,headers:{ "content-type":"text/html; charset=utf-8","cache-control":"no-store" }})}
  function esc(s){return (s||"").toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

  // ---- 站點適配（能抓就抓，抓不到走 fallback）----
  function siteAdapt(url, html){
    const host = "";
    try{ const u=new URL(url); html = html.replace(/<script[\s\S]*?<\/script>/gi,""); switch(true){
      case /rthk\.hk$|\.rthk\.hk/i.test(u.hostname):
        // RTHK：優先 main/article/section 內的段落
        return pick(html,[
          /<article[\s\S]*?<\/article>/i,
          /<section[^>]*class=["'][^"']*(?:article|content)[^"']*["'][\s\S]*?<\/section>/i,
          /<div[^>]*class=["'][^"']*(?:news|content|article)[^"']*["'][\s\S]*?<\/div>/i
        ], u);
      case /news\.now\.com/i.test(u.hostname):
        return pick(html,[
          /<div[^>]*class=["'][^"']*(?:newsContent|article|post)-?body[^"']*["'][\s\S]*?<\/div>/i,
          /<article[\s\S]*?<\/article>/i
        ], u);
      case /cna\.com\.tw|udn\.com|yahoo\.com/i.test(u.hostname):
        return pick(html,[
          /<article[\s\S]*?<\/article>/i,
          /<div[^>]*class=["'][^"']*(?:story|article|content)[^"']*["'][\s\S]*?<\/div>/i
        ], u);
      case /gov\.mo/i.test(u.hostname):
        return pick(html,[
          /<div[^>]*class=["'][^"']*entry-content[^"']*["'][\s\S]*?<\/div>/i,
          /<article[\s\S]*?<\/article>/i
        ], u);
      default: return "";
    }}catch{return ""}
  }
  function pick(h,regs,u){
    for(const re of regs){ const m = h.match(re); if(m){ return fixImgs(m[0], u) } }
    return "";
  }
  function fixImgs(html, u){
    return html
      .replace(/<style[\s\S]*?<\/style>/gi,"")
      .replace(/<img[^>]*>/gi, tag=>{
        let src = (tag.match(/\s(src|data-src|data-original)=["']([^"']+)["']/i)||[])[2]||"";
        if(!src) return "";
        try{ src = new URL(src, u).href }catch{}
        return `<img src="${src}" referrerpolicy="no-referrer">`;
      })
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1");
  }
  function cleanHTML(h, base){
    h = h.replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"");
    let body = "";
    const picks = [
      /<article[\s\S]*?<\/article>/i,
      /<div[^>]+class=["'][^"']*(?:(?:content|article|story|entry|post)-?body)[^"']*["'][\s\S]*?<\/div>/i,
      /<main[\s\S]*?<\/main>/i
    ];
    for(const re of picks){ const m = h.match(re); if(m){ body=m[0]; break; } }
    if(!body){ const ps = h.match(/<p[\s\S]*?<\/p>/gi)||[]; body = ps.slice(0,60).join("\n"); }
    return body.replace(/<img[^>]*>/gi, tag=>{
      let src = (tag.match(/\s(src|data-src|data-original)=["']([^"']+)["']/i)||[])[2]||"";
      if(!src) return "";
      try{ src = new URL(src, base).href }catch{}
      return `<img src="${src}" referrerpolicy="no-referrer">`;
    }).replace(/<nav[\s\S]*?<\/nav>/gi,"").replace(/<aside[\s\S]*?<\/aside>/gi,"")
      .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "$1");
  }
}
