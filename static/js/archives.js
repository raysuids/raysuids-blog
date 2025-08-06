function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}

(async ()=>{
  // 动态
  try{
    const r=await fetch('/api/posts?limit=100');
    const d=await r.json();
    const ul=document.getElementById('dyn');
    if(d.ok && d.list.length){
      ul.innerHTML = d.list.map(p => `<li><a href="/p/${p.slug}">${esc(p.title)}</a><span class="time">${(p.created_at||'').replace('T',' ').slice(0,10)}</span></li>`).join('');
    }else{ ul.innerHTML = '<li style="color:#9ca3af">暂无</li>'; }
  }catch{ document.getElementById('dyn').innerHTML='<li style="color:#ef4444">加载失败</li>'; }

  // 静态（从本站 RSS 读取）
  try{
    const r=await fetch('/index.xml'); const xml=await r.text();
    const doc=new DOMParser().parseFromString(xml,'application/xml');
    const items=[...doc.querySelectorAll('item')].slice(0,200);
    const ul=document.getElementById('stat');
    if(items.length){
      ul.innerHTML = items.map(it=>{
        const t=it.querySelector('title')?.textContent||'';
        const link=it.querySelector('link')?.textContent||'#';
        const pub=it.querySelector('pubDate')?.textContent||'';
        const dt=pub? new Date(pub).toISOString().slice(0,10) : '';
        return `<li><a href="${link}">${esc(t)}</a><span class="time">${dt}</span></li>`;
      }).join('');
    }else{ ul.innerHTML='<li style="color:#9ca3af">暂无</li>'; }
  }catch{ document.getElementById('stat').innerHTML='<li style="color:#ef4444">加载失败</li>'; }
})();
