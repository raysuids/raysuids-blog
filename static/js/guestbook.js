function esc(s){return (s||'').toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
async function loadList(){
  const box=document.getElementById("gb-list"); box.innerHTML="加载中…";
  try{
    const r=await fetch("/api/guestbook"); const d=await r.json();
    if(!d.ok) throw 0;
    box.innerHTML = (d.list||[]).map(r=>`
      <div class="gb-item">
        <div class="gb-meta"><b>${esc(r.name)}</b><span>${(r.created_at||'').replace('T',' ').slice(0,19)}</span></div>
        <div class="gb-msg">${esc(r.message)}</div>
      </div>`).join("") || "<div style='color:#888'>还没有留言，来抢个沙发吧~</div>";
  }catch{ box.innerHTML="<span style='color:#ef4444'>加载失败</span>"; }
}
async function submitForm(e){
  e.preventDefault();
  const tip=document.getElementById("gb-tip");
  const name=document.getElementById("gb-name").value.trim();
  const msg=document.getElementById("gb-msg").value.trim();
  if(!name||!msg){ tip.textContent="请填写完整"; return; }
  tip.textContent="提交中…";
  try{
    const r=await fetch("/api/guestbook",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ name, message: msg })});
    const d=await r.json(); tip.textContent=d.ok?"已发布":(d.error||"失败");
    if(d.ok){ document.getElementById("gb-form").reset(); loadList(); }
  }catch{ tip.textContent="提交失败"; }
}
document.getElementById("gb-form")?.addEventListener("submit", submitForm);
loadList();
