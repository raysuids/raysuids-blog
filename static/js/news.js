(function(){
  const grid = document.getElementById('news-grid');
  const btns = document.querySelectorAll('.filter .btn');

  function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
  function firstImg(html){
    const m = (html||'').match(/<img[^>]+src=["']([^"']+)["']/i); return m? m[1] : '';
  }
  function getText(html){
    const div = document.createElement('div'); div.innerHTML = html||''; return (div.textContent||'').trim();
  }
  function fmtTime(s){
    const d = new Date(s || Date.now());
    if(!isFinite(d)) return '';
    const pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function parseFeed(xml, source){
    const doc = new DOMParser().parseFromString(xml,'application/xml');
    const items = [...doc.querySelectorAll('item')].slice(0, 30).map(it=>{
      const title = it.querySelector('title')?.textContent?.trim();
      const link  = it.querySelector('link')?.textContent?.trim();
      const pub   = it.querySelector('pubDate')?.textContent?.trim() || it.querySelector('updated')?.textContent?.trim();
      const desc  = it.querySelector('description')?.textContent || it.querySelector('content\\:encoded')?.textContent || '';
      const img   = firstImg(desc);
      return { title, link, pub, desc: getText(desc).slice(0,160), img, source: source.name, region: source.region };
    });
    return items;
  }

  function render(list){
    grid.innerHTML = list.map(it=>{
      return `<a class="card" href="${it.link}" target="_blank" rel="noopener">
        <div class="thumb">${it.img ? `<img src="${esc(it.img)}" alt="">` : ''}</div>
        <div class="body">
          <h3 class="title">${esc(it.title||'')}</h3>
          <div class="meta">${esc(it.source)} · ${esc(fmtTime(it.pub))}</div>
          <div class="desc">${esc(it.desc||'')}</div>
        </div>
      </a>`;
    }).join('') || '<div style="color:#9ca3af">暫無內容</div>';
  }

  let ALL = [];
  let REGION = 'ALL';

  // 过滤按钮
  btns.forEach(b=>{
    b.addEventListener('click', ()=>{
      REGION = b.dataset.region;
      const list = (REGION==='ALL') ? ALL : ALL.filter(i=>i.region===REGION);
      render(list);
      // 触发繁简转换（若用户偏好为繁体）
      if(window.dispatchEvent){ setTimeout(()=>window.dispatchEvent(new Event('zhconv')), 0); }
    });
  });

  // 拉取聚合接口
  fetch('/api/news').then(r=>r.json()).then(arr=>{
    let list = [];
    (arr||[]).forEach(x=>{
      if(!x.ok) return;
      try{ list = list.concat(parseFeed(x.xml, x.feed)); }catch{}
    });
    // 时间排序
    list.sort((a,b)=> (new Date(b.pub||0)) - (new Date(a.pub||0)));
    ALL = list.slice(0, 60); // 最多 60 条
    render(ALL);
    // 触发一次繁简转换（与 zh-toggle 配合）
    if(window.dispatchEvent){ setTimeout(()=>window.dispatchEvent(new Event('zhconv')), 0); }
  }).catch(()=>{
    grid.innerHTML = '<div style="color:#ef4444">加載失敗</div>';
  });

})();
