function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
(async ()=>{
  try{
    const r=await fetch('/api/posts?limit=100'); const d=await r.json();
    const ul=document.getElementById('dyn');
    ul.innerHTML = (d.ok && d.list.length)
      ? d.list.map(p=>`<li><a href="/p/${p.slug}">${esc(p.title)}</a><span class="time">${(p.created_at||'').replace('T',' ').slice(0,10)}</span></li>`).join('')
      : '<li style="color:#9ca3af">暂无</li>';
  }catch{ document.getElementById('dyn').innerHTML='<li style="color:#ef4444">加载失败</li>'; }

  try{
    const rss=await (await fetch('/index.xml')).text();
    const doc=new DOMParser().parseFromString(rss,'application/xml');
    const items=[...doc.querySelectorAll('item')];
    const ul=document.getElementById('stat');
    ul.innerHTML = items.length
      ? items.map(it=>{
          const t=it.querySelector('title')?.textContent||'';
          const link=it.querySelector('link')?.textContent||'#';
          const pub=it.querySelector('pubDate')?.textContent||'';
          const dt=pub? new Date(pub).toISOString().slice(0,10):'';
          return `<li><a href="${link}">${esc(t)}</a><span class="time">${dt}</span></li>`;
        }).join('')
      : '<li style="color:#9ca3af">暂无</li>';
  }catch{ document.getElementById('stat').innerHTML='<li style="color:#ef4444">加载失败</li>'; }
})();
