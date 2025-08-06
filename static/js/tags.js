function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
(async ()=>{
  const box = document.getElementById('tags');
  // 先把“动态”放进去（计数取动态文章数量）
  let dynCount = 0;
  try{ const r=await fetch('/api/posts?limit=1000'); const d=await r.json(); if(d.ok) dynCount = d.list.length; }catch{}
  box.innerHTML = `<a class="tag" href="/tags/动态/"><span>动态</span><span class="tag-badge">${dynCount}</span></a>`;

  // 再从 RSS 统计静态标签
  try{
    const rss=await (await fetch('/index.xml')).text();
    const doc=new DOMParser().parseFromString(rss,'application/xml');
    const items=[...doc.querySelectorAll('item')];
    const cnt=new Map();
    items.forEach(it=>{
      it.querySelectorAll('category').forEach(c=>{
        const t=c.textContent.trim();
        if(!t) return; cnt.set(t, (cnt.get(t)||0)+1);
      });
    });
    const html = [...cnt.entries()].sort((a,b)=>a[0].localeCompare(b[0],'zh-CN'))
      .map(([t,n])=>`<a class="tag" href="/tags/${encodeURIComponent(t)}/"><span>${esc(t)}</span><span class="tag-badge">${n}</span></a>`).join('');
    box.insertAdjacentHTML('beforeend', html || `<div style="color:#9ca3af">暂无</div>`);
  }catch{
    box.insertAdjacentHTML('beforeend', `<div style="color:#ef4444">静态标签加载失败</div>`);
  }
})();
