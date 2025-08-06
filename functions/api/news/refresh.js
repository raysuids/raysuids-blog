export async function onRequestGet({ env }) {
  // 順序：TW > HK > MO > CN
  const FEEDS = [
    // TW
    { name:"中央社 即時", url:"https://www.cna.com.tw/rss.aspx?Type=0", region:"TW" },
    { name:"聯合新聞網 焦點", url:"https://udn.com/rssfeed/news/1/1?ch=news", region:"TW" },
    { name:"Yahoo奇摩新聞", url:"https://tw.news.yahoo.com/rss/", region:"TW" },
    // HK
    { name:"RTHK 港聞", url:"https://rthk.hk/rthk/news/rss/c_expressnews_clocal.xml", region:"HK" },
    { name:"Now 新聞 本地", url:"https://news.now.com/rss/local", region:"HK" },
    // MO（Atom）
    { name:"澳門政府新聞局", url:"https://www.gov.mo/zh-hant/feed/", region:"MO" },
    // CN（補充）
    { name:"鳳凰網資訊", url:"https://news.ifeng.com/rss/index.xml", region:"CN" }
  ];

  for (const f of FEEDS) {
    try {
      const r = await fetch(f.url, { headers:{ "User-Agent":"Mozilla/5.0 RayBlog" }, cf:{ cacheEverything:true, cacheTtl:300 }});
      if (!r.ok) continue;
      const xml = await r.text();
      const items = parseRSSorAtom(xml, f);    // 兼容 RSS/Atom
      if(items.length){
        const stmts = items.map(x => env.DB.prepare(
          "INSERT INTO news (id,source,region,title,link,cover,summary,pub_at) VALUES (?,?,?,?,?,?,?,?) " +
          "ON CONFLICT(id) DO UPDATE SET source=excluded.source, region=excluded.region, title=excluded.title, cover=excluded.cover, summary=excluded.summary, pub_at=excluded.pub_at"
        ).bind(x.id, f.name, f.region, x.title, x.link, x.cover||"", x.summary||"", x.pub_at||""));
        await env.DB.batch(stmts);
      }
    } catch {}
  }
  return json({ ok:true });

  // -------- helpers --------
  function json(o){ return new Response(JSON.stringify(o),{headers:{'content-type':'application/json'}}) }
  function decode(s){ return (s||"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'") }
  function strip(html){ return (html||"").replace(/<script[\s\S]*?<\/script>/gi,"").replace(/<style[\s\S]*?<\/style>/gi,"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim() }
  function iso(s){ const d=new Date(s||Date.now()); return isFinite(d)? d.toISOString(): new Date().toISOString() }
  function abs(u, base){ try{ return new URL(u, base).href }catch{ return u } }

  // 确定性 ID：djb2（稳定、无随机）
  function djb2(str){ let h=5381; for(let i=0;i<str.length;i++){ h=((h<<5)+h)+str.charCodeAt(i); h|=0 } return ("x"+(h>>>0).toString(16)) }

  function coverFromSeg(seg, base){
    const m1 = seg.match(/<enclosure[^>]+url=["']([^"']+)["']/i); if(m1) return abs(m1[1], base);
    const m2 = seg.match(/<media:content[^>]+url=["']([^"']+)["']/i); if(m2) return abs(m2[1], base);
    const m3 = (seg.match(/<img[^>]+src=["']([^"']+)["']/i)||[])[1]; if(m3) return abs(m3, base);
    return "";
  }
  async function fetchOG(url){
    try{
      const r = await fetch(url,{ headers:{ "User-Agent":"Mozilla/5.0 RayBlog" }, cf:{ cacheTtl:600 }});
      if(!r.ok) return "";
      const h = await r.text();
      const m = h.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
             || h.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
      return m ? abs(m[1], url) : "";
    }catch{ return "" }
  }

  function parseRSSorAtom(xml, feed){
    const out = [];
    const rss = [...xml.matchAll(/<item>[\s\S]*?<\/item>/gi)];
    if(rss.length){
      for(const it of rss.slice(0,50)){
        const seg=it[0];
        const title = decode((seg.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||"").replace(/^<!\[CDATA\[/,"").replace(/\]\]>$/,"").trim();
        const link  = decode((seg.match(/<link[^>]*>([\s\S]*?)<\/link>/i)||[])[1]||"").trim();
        const pub   = decode((seg.match(/<(pubDate|updated|dc:date)[^>]*>([\s\S]*?)<\/\1>/i)||[])[2]||"");
        const desc  = decode((seg.match(/<(description|content:encoded)[^>]*>([\s\S]*?)<\/\1>/i)||[])[2]||"");
        if(!title || !link) continue;
        out.push({
          id: djb2(link),
          title, link,
          cover: coverFromSeg(seg, link),
          summary: strip(desc).slice(0,160),
          pub_at: iso(pub)
        });
      }
    }else{
      const entries = [...xml.matchAll(/<entry>[\s\S]*?<\/entry>/gi)];
      for(const en of entries.slice(0,50)){
        const seg=en[0];
        const title = decode((seg.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||"").replace(/^<!\[CDATA\[/,"").replace(/\]\]>$/,"").trim();
        const href  = (seg.match(/<link[^>]+href=["']([^"']+)["']/i)||[])[1] || decode((seg.match(/<link[^>]*>([\s\S]*?)<\/link>/i)||[])[1]||"").trim();
        const pub   = decode((seg.match(/<(updated|published)[^>]*>([\s\S]*?)<\/\1>/i)||[])[2]||"");
        const desc  = decode((seg.match(/<(summary|content)[^>]*>([\s\S]*?)<\/\1>/i)||[])[2]||"");
        if(!title || !href) continue;
        out.push({
          id: djb2(href),
          title, link: href,
          cover: coverFromSeg(seg, href),
          summary: strip(desc).slice(0,160),
          pub_at: iso(pub)
        });
      }
    }
    // 封面兜底：没有就去文章页读 og:image
    return out;
  }
}
