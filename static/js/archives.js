function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
(async ()=>{
  // 动态
  try{
    const r=await fetch('/api/posts?limit=200'); const d=await r.json();
    const box=document.getElementById('dyn');
    box.innerHTML = (d.ok && d.list.length)
      ? d.list.map(p=>`
        <a class="item" href="/p/${p.slug}">
          <div class="cover">${p.cover?`<img src="${p.cover}" alt="${esc(p.title)}">`:`<div></div>`}</div>
          <div class="meta">
            <div class="title">${esc(p.title)}</div>
            <div class="info"><span>${(p.created_at||'').replace('T',' ').slice(0,10)}</span><span class="tag-badge">动态</span></div>
          </div>
        </a>`).join('')
      : '<div style="color:#9ca3af">暂无</div>';
  }catch{ document.getElementById('dyn').innerHTML='<div style="color:#ef4444">加载失败</div>'; }

  // 静态（从 RSS 抓）
  try{
    const rss=await (await fetch('/index.xml')).text();
    const doc=new DOMParser().parseFromString(rss,'application/xml');
    const items=[...doc.querySelectorAll('item')];
    const box=document.getElementById('stat');
    box.innerHTML = items.map(it=>{
      const t=it.querySelector('title')?.textContent||'';
      const link=it.querySelector('link')?.textContent||'#';
      const pub=it.querySelector('pubDate')?.textContent||'';
      const dt=pub? new Date(pub).toISOString().slice(0,10) : '';
      return `<a class="item" href="${link}">
        <div class="cover"><div></div></div>
        <div class="meta"><div class="title">${esc(t)}</div>
          <div class="info"><span>${dt}</span><span class="tag-badge">静态</span></div></div>
      </a>`;
    }).join('') || '<div style="color:#9ca3af">暂无</div>';
  }catch{ document.getElementById('stat').innerHTML='<div style="color:#ef4444">加载失败</div>'; }
})();
