export async function onRequestGet({ env }) {
  // 尽量选在大陆可直接访问的官方源；不可用的自动忽略
  const FEEDS = [
    // HK
    { name:"RTHK 港聞", url:"https://rthk.hk/rthk/news/rss/c_expressnews_clocal.xml", region:"HK" },
    { name:"Now 新聞 本地", url:"https://news.now.com/rss/local", region:"HK" },
    // MO
    { name:"澳門政府新聞局", url:"https://www.gov.mo/zh-hant/feed/", region:"MO" },
    // TW
    { name:"中央社 即時", url:"https://www.cna.com.tw/rss.aspx?Type=0", region:"TW" },
    { name:"聯合新聞網 焦點", url:"https://udn.com/rssfeed/news/1/1?ch=news", region:"TW" },
    { name:"Yahoo奇摩新聞", url:"https://tw.news.yahoo.com/rss/", region:"TW" },
    // CN（補充）
    { name:"鳳凰網資訊", url:"https://news.ifeng.com/rss/index.xml", region:"CN" }
  ];

  const list = [];
  for (const f of FEEDS) {
    try {
      const r = await fetch(f.url, {
        headers: { "User-Agent": "Mozilla/5.0 RayBlog" },
        cf: { cacheEverything: true, cacheTtl: 300 }
      });
      if (!r.ok) continue;
      const xml = await r.text();

      // 简单解析（RSS 常见字段）
      const items = [...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].slice(0, 50);
      for (const it of items) {
        const seg = it[0];
        const title = pick(seg, "title");
        const link  = pick(seg, "link");
        const pub   = pick(seg, "pubDate") || pick(seg, "updated") || pick(seg, "dc:date");
        const desc  = pick(seg, "description") || pick(seg, "content:encoded");
        if (!title || !link) continue;

        const id = await sha1(link);
        const cover = parseCover(seg) || await fetchOG(link);
        const summary = text(desc).slice(0, 160);

        list.push({
          id, source: f.name, region: f.region, title, link,
          cover: cover || "", summary: summary || "", pub_at: iso(pub)
        });
      }
    } catch {}
  }

  // 批量 upsert
  if (list.length) {
    const stmts = list.map(x =>
      env.DB.prepare(
        "INSERT INTO news (id,source,region,title,link,cover,summary,pub_at) VALUES (?,?,?,?,?,?,?,?) " +
        "ON CONFLICT(id) DO UPDATE SET source=excluded.source, region=excluded.region, title=excluded.title, cover=excluded.cover, summary=excluded.summary, pub_at=excluded.pub_at"
      ).bind(x.id, x.source, x.region, x.title, x.link, x.cover, x.summary, x.pub_at)
    );
    await env.DB.batch(stmts);
  }

  return new Response(JSON.stringify({ ok: true, list }), {
    headers: { "content-type": "application/json" }
  });

  // ---------- helpers ----------
  function pick(seg, tag) {
    // 取 <tag>…</tag> 内容，并安全处理 CDATA，不用复杂正则分组
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
    const m = seg.match(re);
    if (!m) return "";
    let inner = (m[1] || "").trim();
    // 去掉 CDATA 包裹
    if (inner.startsWith("<![CDATA[")) inner = inner.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
    return decode(inner);
  }

  function decode(s) {
    try {
      return s
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    } catch { return s }
  }

  function text(html) {
    return (html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function parseCover(seg) {
    const m1 = seg.match(/<enclosure[^>]+url=["']([^"']+)["']/i);
    if (m1) return abs(m1[1]);
    const m2 = seg.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    if (m2) return abs(m2[1]);
    const m3 = (seg.match(/<img[^>]+src=["']([^"']+)["']/i) || [])[1];
    return m3 ? abs(m3) : "";
  }

  async function fetchOG(url) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 RayBlog" }, cf: { cacheTtl: 600 } });
      if (!r.ok) return "";
      const h = await r.text();
      const m = h.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      return m ? abs(m[1]) : "";
    } catch { return "" }
  }

  function abs(u) { try { return new URL(u).href } catch { return u } }
  function iso(s) { const d = new Date(s || Date.now()); return isFinite(d) ? d.toISOString() : new Date().toISOString(); }
  async function sha1(str) {
    const b = new TextEncoder().encode(str);
    const h = await crypto.subtle.digest("SHA-1", b);
    return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, "0")).join("");
  }
}
