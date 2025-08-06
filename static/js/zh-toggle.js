(() => {
  // 不转换这些节点里的文字
  const IGNORE = new Set(['SCRIPT','STYLE','CODE','PRE','TEXTAREA','NOSCRIPT','INPUT','SELECT','OPTION']);

  // 建一个按钮（右下角悬浮）
  const btn = document.createElement('button');
  btn.id = 'zh-toggle';
  btn.style.cssText = `
    position:fixed;right:18px;bottom:86px;z-index:9999;
    padding:10px 14px;border-radius:999px;border:0;
    background:#3b82f6;color:#fff;font-weight:600;
    box-shadow:0 12px 30px rgba(59,130,246,.32);cursor:pointer;
  `;
  document.addEventListener('DOMContentLoaded', () => document.body.appendChild(btn));

  let pref = localStorage.getItem('zhPref') || 't'; // t=繁体(默认) s=简体
  let convST = null, convTS = null; // 简->繁、繁->简

  function textNodes(root){
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if(!p) return NodeFilter.FILTER_REJECT;
        if(IGNORE.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if(p.closest('.no-zhconv')) return NodeFilter.FILTER_REJECT; // 可给某块加 class 以排除
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n; while(n = walker.nextNode()) nodes.push(n);
    return nodes;
  }

  async function ensureConv(){
    if(convST && convTS) return;
    // OpenCC: cn=简体, tw=繁体（台湾标准）
    convST = OpenCC.Converter({ from:'cn', to:'tw' });
    convTS = OpenCC.Converter({ from:'tw', to:'cn' });
  }

  async function applyVariant(kind){
    await ensureConv();
    const nodes = textNodes(document.body);
    const fn = (kind === 't') ? convST : convTS; // 简->繁 or 繁->简
    for(const t of nodes){
      try{ t.nodeValue = fn(t.nodeValue); }catch{}
    }
    btn.textContent = (kind === 't') ? '繁⇄简：繁' : '繁⇄简：简';
    localStorage.setItem('zhPref', kind);
  }

  // 观察动态内容（比如“新闻”异步加载），出现新文字时自动转换到当前偏好
  const mo = new MutationObserver(async (muts)=>{
    const need = muts.some(m=>m.addedNodes && m.addedNodes.length);
    if(!need) return;
    // 防抖
    clearTimeout(applyVariant.timer);
    applyVariant.timer = setTimeout(()=>applyVariant(pref), 60);
  });
  document.addEventListener('DOMContentLoaded', ()=>{
    mo.observe(document.documentElement, { childList:true, subtree:true, characterData:false });
    applyVariant(pref); // 默认打开即转换为繁体
  });

  btn.addEventListener('click', ()=>{
    pref = (pref === 't') ? 's' : 't';
    applyVariant(pref);
  });
})();
