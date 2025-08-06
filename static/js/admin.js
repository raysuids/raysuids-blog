const S = {
  key: null,
  q: s => document.querySelector(s),
  ce: (t, h) => { const el=document.createElement(t); el.innerHTML=h; return el; }
};

function setKey(k){ S.key = k; sessionStorage.setItem('adm', k); }
function getKey(){ return S.key || sessionStorage.getItem('adm') || ''; }

async function login(){
  const pass = S.q('#adm-pass').value.trim();
  S.q('#adm-tip').textContent='验证中…';
  const r = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pass }) });
  const d = await r.json();
  if(d.ok){ setKey(d.key); S.q('#adm-login').style.display='none'; S.q('#adm-panel').style.display='block'; loadList(); loadSettings(); }
  else { S.q('#adm-tip').textContent = d.error || '密码错误'; }
}

async function loadList(){
  const r = await fetch('/api/posts?limit=50');
  const d = await r.json(); const ul=S.q('#p-ul'); ul.innerHTML='';
  (d.list||[]).forEach(p=>{
    const li=S.ce('li', `<a href="javascript:;" data-id="${p.id}" data-slug="${p.slug}">${p.title}</a> 
      <small>${(p.created_at||'').replace('T',' ').slice(0,19)}</small> 
      <a href="javascript:;" data-del="${p.id}" style="color:#ef4444;margin-left:8px">删除</a>`);
    ul.appendChild(li);
  });
  ul.addEventListener('click', async e=>{
    const a=e.target;
    if(a.dataset.id){ // 载入编辑
      const r=await fetch('/api/posts/'+a.dataset.id);
      const d=await r.json(); if(!d.ok) return;
      S.q('#p-title').value=d.data.title; S.q('#p-slug').value=d.data.slug;
      S.q('#p-cover').value=d.data.cover||''; S.q('#p-content').value=d.data.content;
      S.q('#p-save').dataset.id=d.data.id;
    }else if(a.dataset.del){
      if(!confirm('确认删除？'))return;
      const rr=await fetch('/api/posts/'+a.dataset.del,{ method:'DELETE', headers:{'X-Admin-Key':getKey()}});
      const dd=await rr.json(); alert(dd.ok?'已删除':(dd.error||'失败')); loadList();
    }
  }, { once: true });
}

async function savePost(){
  const id=S.q('#p-save').dataset.id, title=S.q('#p-title').value.trim(),
        slug=S.q('#p-slug').value.trim(), cover=S.q('#p-cover').value.trim(),
        content=S.q('#p-content').value.trim();
  if(!title||!slug||!content){ S.q('#p-tip').textContent='请完整填写标题/固定链接/正文'; return; }
  S.q('#p-tip').textContent='保存中…';
  const method = id ? 'PUT' : 'POST';
  const url = id ? '/api/posts/'+id : '/api/posts';
  const r=await fetch(url,{ method, headers:{'Content-Type':'application/json','X-Admin-Key':getKey()},
    body: JSON.stringify({ title, slug, cover, content }) });
  const d=await r.json(); S.q('#p-tip').textContent = d.ok ? '已保存' : (d.error||'失败');
  if(d.ok){ delete S.q('#p-save').dataset.id; loadList(); }
}

async function loadSettings(){
  const r=await fetch('/api/settings'); const d=await r.json();
  if(d.ok){ S.q('#s-hero-title').value=d.data.hero_title||''; S.q('#s-hero-sub').value=d.data.hero_sub||''; S.q('#s-avatar').value=d.data.avatar||''; }
}
async function saveSettings(){
  const payload={
    hero_title:S.q('#s-hero-title').value.trim(),
    hero_sub:S.q('#s-hero-sub').value.trim(),
    avatar:S.q('#s-avatar').value.trim()
  };
  const r=await fetch('/api/settings',{ method:'POST', headers:{'Content-Type':'application/json','X-Admin-Key':getKey()}, body:JSON.stringify(payload)});
  const d=await r.json(); S.q('#s-tip').textContent = d.ok ? '已保存' : (d.error||'失败');
}

S.q('#adm-go').addEventListener('click', login);
S.q('#p-save').addEventListener('click', savePost);
S.q('#p-list').addEventListener('click', loadList);
S.q('#s-save').addEventListener('click', saveSettings);

// 自动登录（若已保存）
if(getKey()){ S.q('#adm-login').style.display='none'; S.q('#adm-panel').style.display='block'; loadList(); loadSettings(); }
