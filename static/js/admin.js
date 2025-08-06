const $ = sel => document.querySelector(sel);
const html = (t, h) => { const el = document.createElement(t); el.innerHTML = h; return el; };
const setKey = k => sessionStorage.setItem('adm', k);
const getKey = () => sessionStorage.getItem('adm') || '';

async function login(){
  const pass = $('#adm-pass').value.trim();
  $('#adm-tip').textContent = '验证中…';
  try{
    const r = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pass }) });
    const d = await r.json();
    if(d.ok){ setKey(d.key); $('#adm-login').style.display='none'; $('#adm-panel').style.display='block'; loadList(); loadSettings(); }
    else { $('#adm-tip').textContent = d.error || '密码错误'; }
  }catch{ $('#adm-tip').textContent = '网络错误'; }
}

async function loadList(){
  const r = await fetch('/api/posts?limit=50'); const d = await r.json();
  const ul = $('#p-ul'); ul.innerHTML='';
  (d.list||[]).forEach(p=>{
    const li = html('li', `<a href="javascript:;" data-id="${p.id}" data-slug="${p.slug}">${p.title}</a>
    <small class="faint">${(p.created_at||'').replace('T',' ').slice(0,19)}</small>
    <a href="javascript:;" data-del="${p.id}" style="color:#ef4444;margin-left:8px">删除</a>`);
    ul.appendChild(li);
  });
  ul.onclick = async e=>{
    const a = e.target;
    if(a.dataset.id){
      const r=await fetch('/api/posts/'+a.dataset.id); const d=await r.json(); if(!d.ok) return;
      $('#p-title').value=d.data.title; $('#p-slug').value=d.data.slug;
      $('#p-cover').value=d.data.cover||''; $('#p-content').value=d.data.content;
      $('#p-save').dataset.id=d.data.id;
    }else if(a.dataset.del){
      if(!confirm('确认删除？'))return;
      const rr=await fetch('/api/posts/'+a.dataset.del,{ method:'DELETE', headers:{'X-Admin-Key':getKey()}});
      const dd=await rr.json(); alert(dd.ok?'已删除':(dd.error||'失败')); loadList();
    }
  };
}

async function savePost(){
  const id=$('#p-save').dataset.id, title=$('#p-title').value.trim(),
        slug=$('#p-slug').value.trim(), cover=$('#p-cover').value.trim(),
        content=$('#p-content').value.trim();
  if(!title||!slug||!content){ $('#p-tip').textContent='请完整填写标题/固定链接/正文'; return; }
  $('#p-tip').textContent='保存中…';
  const method = id ? 'PUT' : 'POST';
  const url = id ? '/api/posts/'+id : '/api/posts';
  const r=await fetch(url,{ method, headers:{'Content-Type':'application/json','X-Admin-Key':getKey()}, body: JSON.stringify({ title, slug, cover, content }) });
  const d=await r.json(); $('#p-tip').textContent = d.ok ? '已保存' : (d.error||'失败');
  if(d.ok){ delete $('#p-save').dataset.id; loadList(); }
}

async function loadSettings(){
  const r=await fetch('/api/settings'); const d=await r.json();
  if(d.ok){ $('#s-hero-title').value=d.data.hero_title||''; $('#s-hero-sub').value=d.data.hero_sub||''; $('#s-avatar').value=d.data.avatar||''; }
}
async function saveSettings(){
  const payload={ hero_title:$('#s-hero-title').value.trim(), hero_sub:$('#s-hero-sub').value.trim(), avatar:$('#s-avatar').value.trim() };
  const r=await fetch('/api/settings',{ method:'POST', headers:{'Content-Type':'application/json','X-Admin-Key':getKey()}, body: JSON.stringify(payload)});
  const d=await r.json(); $('#s-tip').textContent = d.ok ? '已保存' : (d.error||'失败');
}

$('#adm-go')?.addEventListener('click', login);
$('#p-save')?.addEventListener('click', savePost);
$('#p-list')?.addEventListener('click', loadList);
$('#s-save')?.addEventListener('click', saveSettings);

// 自动登录
if(getKey()){ $('#adm-login').style.display='none'; $('#adm-panel').style.display='block'; loadList(); loadSettings(); }

