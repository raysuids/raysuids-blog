(function(){
  function esc(s){return (s||'').toString().replace(/[&<>"']/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});}

  fetch('/api/posts?limit=200')
    .then(r=>r.json())
    .then(d=>{
      var box = document.getElementById('list');
      if(!d.ok || !d.list || !d.list.length){
        box.innerHTML = '<div style="color:#9ca3af">暂无</div>'; return;
      }
      box.innerHTML = d.list.map(function(p){
        var cover = p.cover ? '<img src="'+p.cover+'" alt="">' : '<div></div>';
        return '<a class="item" href="/p/'+p.slug+'">'
             +   '<div class="cover">'+cover+'</div>'
             +   '<div class="meta">'
             +     '<div class="title">'+esc(p.title)+'</div>'
             +     '<div class="info"><span>'+((p.created_at||'').replace("T"," ").slice(0,10))+'</span></div>'
             +   '</div>'
             + '</a>';
      }).join('');
    })
    .catch(function(){
      document.getElementById('list').innerHTML = '<div style="color:#ef4444">加载失败</div>';
    });
})();
