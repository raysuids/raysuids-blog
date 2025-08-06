async function loadList() {
  const box = document.getElementById("gb-list");
  box.innerHTML = "加载中…";
  const res = await fetch("/api/guestbook");
  const data = await res.json();
  if (!data.ok) { box.innerHTML = "加载失败"; return; }
  box.innerHTML = data.list.map(row => `
    <div class="gb-item">
      <div class="gb-meta">
        <b>${escapeHtml(row.name)}</b>
        <span>${row.created_at.replace("T"," ").slice(0,19)}</span>
      </div>
      <div class="gb-msg">${escapeHtml(row.message)}</div>
    </div>
  `).join("") || "<div style='color:#888'>还没有留言，来抢个沙发吧~</div>";
}

function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]))}

async function submitForm(e){
  e.preventDefault();
  const tip = document.getElementById("gb-tip");
  const name = document.getElementById("gb-name").value.trim();
  const msg  = document.getElementById("gb-msg").value.trim();
  if(!name || !msg){ tip.textContent="请填写完整"; return; }
  tip.textContent="提交中…";
  const res = await fetch("/api/guestbook", {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ name, message: msg })
  });
  const data = await res.json();
  tip.textContent = data.ok ? "已发布" : (data.error || "失败");
  if(data.ok){ document.getElementById("gb-form").reset(); loadList(); }
}

document.getElementById("gb-form").addEventListener("submit", submitForm);
loadList();
