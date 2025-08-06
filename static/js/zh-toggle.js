(()=>{const IGN=new Set(["SCRIPT","STYLE","CODE","PRE","TEXTAREA","NOSCRIPT","INPUT","SELECT","OPTION"]);
let pref=localStorage.getItem("zhPref")||"t";let st=null,ts=null;
function nodes(root){const a=[],w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){if(!n.nodeValue||!n.nodeValue.trim())return NodeFilter.FILTER_REJECT;const p=n.parentElement;if(!p||IGN.has(p.tagName)||p.closest(".no-zhconv"))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});let n;while(n=w.nextNode())a.push(n);return a}
async function ready(){if(st&&ts)return;st=OpenCC.Converter({from:"cn",to:"tw"});ts=OpenCC.Converter({from:"tw",to:"cn"})}
async function apply(k){await ready();const list=nodes(document.body);const fn=(k==="t")?st:ts;for(const t of list){try{t.nodeValue=fn(t.nodeValue)}catch{}}btn.textContent=(k==="t")?"繁":"简";localStorage.setItem("zhPref",k)}
const btn=document.createElement("button");btn.id="zh-toggle";btn.textContent="繁";
document.addEventListener("DOMContentLoaded",()=>{document.body.appendChild(btn);apply(pref)});
btn.addEventListener("click",()=>{pref=(pref==="t")?"s":"t";apply(pref)});
window.addEventListener("zhconv",()=>apply(pref)); // 外部触发（新闻渲染完后会发）
})();


