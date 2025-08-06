(function(){
  const grid = document.getElementById('news-grid');
  function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

  // 已渲染的 id 集，避免重复
  const seen = new Set();
  function append(list){
    const html = [];
    for(const it of list){
      if(!it || seen.has(it.id)) continue;
      seen.add(it.id);
      html.push(
        `<a class="card" href="/news/a/${it.id}">
          <div class="thumb">${it.cover?`<img src="${esc(it.cover)}" alt="">`:''}</div>
          <div class="body">
            <h3 class="title">${esc(it.title||'')}</h3>
            <div class="meta">${esc(it.source||'')} · ${esc((it.pub_at||'').replace('T',' ').slice(0,16))} · ${esc(it.region||'')}</div>
            <div class="desc">${esc(it.summary||'')}</div>
          </div>
        </a>`
      );
    }
    if(html.length) grid.insertAdjacentHTML('beforeend', html.join(''));
    // 触发繁/简
    if(window.dispatchEvent) setTimeout(()=>window.dispatchEvent(new Event('zhconv')),0);
  }

  // 1) 先把本地缓存列表灌上来（秒开）
  fetch('/api/news/list?limit=48').then(r=>r.json()).then(d=>{
    if(d.list?.length) append(d.list);
    else grid.innerHTML = '<div style="color:#9ca3af">正在加載新聞…</div>';
  }).catch(()=>{ grid.innerHTML = '<div style="color:#ef4444">加載失敗</div>'; });

  // 2) 启动刷新：后端会边抓边写库；前端每 1s 拉一次最新（只追加新条目）
  fetch('/api/news/refresh').catch(()=>{});
  let tries = 0, timer = setInterval(()=>{
    tries++;
    fetch('/api/news/list?limit=80').then(r=>r.json()).then(d=>{
      append(d.list||[]);
      if(tries>20) clearInterval(timer); // 拉 20 次(约20秒)后停止轮询
    }).catch(()=>{ if(tries>20) clearInterval(timer); });
  }, 1000);
})();
