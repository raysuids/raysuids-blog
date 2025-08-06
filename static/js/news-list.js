(function(){
  const grid = document.getElementById('grid');
  const btns = document.querySelectorAll('.filter .btn');
  let ALL = [], REGION='ALL';
  function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

  function draw(list){
    grid.innerHTML = list.map(it=>`
      <a class="card" href="/news/a/${it.id}">
        <div class="thumb">${it.cover?`<img src="${esc(it.cover)}" alt="">`:''}</div>
        <div class="body">
          <h3 class="title">${esc(it.title||'')}</h3>
          <div class="meta">${esc(it.source||'')} · ${esc((it.pub_at||'').replace('T',' ').slice(0,16))} · ${esc(it.region||'')}</div>
          <div class="desc">${esc(it.summary||'')}</div>
        </div>
      </a>
    `).join('') || '<div style="color:#9ca3af">暫無內容</div>';
    window.dispatchEvent(new Event('zhconv'));
  }

  fetch('/api/news/list?limit=120').then(r=>r.json()).then(d=>{
    ALL = d.list||[]; draw(ALL);
  });

  // 先刷新聚合一次
  fetch('/api/news/refresh').then(r=>r.json()).then(d=>{
    if(d.ok && d.list && d.list.length){
      ALL = d.list; draw(ALL);
    }
  });

  btns.forEach(b=>b.addEventListener('click',()=>{
    REGION = b.dataset.r;
    const list = REGION==='ALL' ? ALL : ALL.filter(i=>i.region===REGION);
    draw(list);
  }));
})();
