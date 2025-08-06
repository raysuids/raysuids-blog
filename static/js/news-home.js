(function(){
  const grid = document.getElementById('news-grid');
  function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

  fetch('/api/news/list?limit=24') // 先读本地缓存
    .then(r=>r.json()).then(d=>render(d.list||[])).catch(()=>{});

  // 后台刷新一次（抓最新，存 D1）
  fetch('/api/news/refresh').then(r=>r.json()).then(d=>{
    if(d.ok && d.list) render(d.list.slice(0,24));
  }).catch(()=>{});

  function render(list){
    if(!list || !list.length){ grid.innerHTML = '<div style="color:#9ca3af">暫無內容</div>'; return; }
    grid.innerHTML = list.map(it=>{
      const href = '/news/a/'+it.id;
      return `<a class="card" href="${href}">
        <div class="thumb">${it.cover?`<img src="${esc(it.cover)}" alt="">`:''}</div>
        <div class="body">
          <h3 class="title">${esc(it.title||'')}</h3>
          <div class="meta">${esc(it.source||'')} · ${esc((it.pub_at||'').replace('T',' ').slice(0,16))} · ${esc(it.region||'')}</div>
          <div class="desc">${esc(it.summary||'')}</div>
        </div>
      </a>`;
    }).join('');
    // 通知繁/简转换
    if(window.dispatchEvent){ setTimeout(()=>window.dispatchEvent(new Event('zhconv')), 0); }
  }
})();
