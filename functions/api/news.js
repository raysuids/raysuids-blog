export async function onRequestGet() {
  const FEEDS = [
    { name:"RTHK 港聞", url:"https://rthk.hk/rthk/news/rss/c_expressnews_clocal.xml", region:"HK" },
    { name:"RTHK 國際", url:"https://rthk.hk/rthk/news/rss/c_expressnews_cworld.xml", region:"HK" },
    { name:"澳門政府新聞局", url:"https://www.gov.mo/zh-hant/rss/" , region:"MO" },
    { name:"中央社 即時", url:"https://www.cna.com.tw/rss.aspx?Type=0", region:"TW" },
    { name:"聯合新聞網 焦點", url:"https://udn.com/rssfeed/news/1/1?ch=news", region:"TW" },
  ];
  async function getOne(feed){
    try{
      const r = await fetch(feed.url, {
        headers:{ "User-Agent":"Mozilla/5.0 (RayBlog NewsFetcher)" },
        cf:{ cacheTtl: 300, cacheEverything: true },
      });
      if(!r.ok) throw 0;
      const xml = await r.text();
      return { ok:true, feed, xml };
    }catch{ return { ok:false, feed }; }
  }
  const res = await Promise.all(FEEDS.map(getOne));
  return new Response(JSON.stringify(res), {
    headers: { "content-type":"application/json", "cache-control":"no-store,max-age=0" }
  });
}
