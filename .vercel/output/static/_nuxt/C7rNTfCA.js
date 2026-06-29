import{_ as C}from"./vbxbLNta.js";import{_ as B}from"./CJrcPW-M.js";import{_ as q}from"./C_DbEKYn.js";/* empty css        */import{_ as Q}from"./DlAUqK2U.js";import{r as h,k as W,H as Y,o as G,y as d,z as u,A as n,C as Z,J as D,N as T,B as $,P as tt,Q as et}from"#entry";/* empty css        */const st={class:"healthLogWrap"},at={class:"healthLogContent"},ot={class:"tab-section"},nt={key:0,class:"week-selector"},rt={class:"week-range"},it={key:1,class:"total-count"},ct={key:2,class:"loading-container"},lt={key:3,class:"log-list"},dt={class:"timeline-container"},ut={class:"log-content-wrapper"},mt={class:"log-date"},pt={key:0,class:"content-section"},vt=["onClick"],yt={key:4,class:"summary-container"},ht={key:0,class:"loading-container"},gt={key:1,class:"summary-card"},ft={class:"summary-content"},kt={key:2,class:"empty-state"},wt={key:5,class:"empty-state"},St="https://23700999.com:8081/push_notification/api/chatgpt/ask",_t={__name:"healthLog2",setup(Dt){const O=localStorage.getItem("userData");O&&JSON.parse(O);const p=h("log"),N=h({}),H=h({}),y=h([]),g=h(null),I=h(!0),k=h(!1),E=h(!1),P=(a=new Date)=>{const t=new Date(a);t.setHours(0,0,0,0);const s=t.getDay(),c=t.getDate()-s+(s===0?-6:1),m=new Date(t);return m.setDate(c),m.setHours(0,0,0,0),m},M=()=>{g.value=P()},w=W(()=>{if(!g.value)return"";const a=new Date,t=A(g.value),s=A(a);return`${t} - ${s}`});W(()=>{if(!g.value)return!0;const t=P(new Date);return g.value.getTime()===t.getTime()});const A=a=>{const t=a.getFullYear(),s=(a.getMonth()+1).toString().padStart(2,"0"),c=a.getDate().toString().padStart(2,"0");return`${t}/${s}/${c}`},S=a=>{if(!a)return new Date(NaN);if(a instanceof Date)return a;if(typeof a=="number")return new Date(a);const t=String(a).trim();if(!t)return new Date(NaN);if(t.includes("-")&&t.includes(" ")){const[s,c="00:00:00"]=t.split(" "),[m,v,o]=s.split("-").map(i=>parseInt(i,10)),[r="0",l="0",e="0"]=c.split(":");return new Date(m,(v||1)-1,o||1,+r,+l,+e)}if(t.includes("/")&&t.includes(" ")){const s=t.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s*(上午|下午)?\s*(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/i);if(s){const[,c,m,v,o,r,l,e]=s;let i=parseInt(r,10);return o==="下午"&&i<12&&(i+=12),o==="上午"&&i===12&&(i=0),new Date(parseInt(c,10),parseInt(m,10)-1,parseInt(v,10),i,parseInt(l,10),parseInt(e||"0",10))}}return new Date(t)},b=W(()=>y.value.length?y.value.sort((a,t)=>S(t.date||t.timestamp)-S(a.date||a.timestamp)):[]),f=h(""),J=async()=>{if(p.value!=="summary"){f.value="";return}if(!g.value){f.value="";return}const a=new Date(g.value);a.setHours(0,0,0,0);const t=new Date;t.setHours(23,59,59,999);const s=y.value.filter(o=>{if(!o.date&&!o.timestamp)return!1;const r=S(o.date||o.timestamp);if(Number.isNaN(r.getTime()))return!1;const l=new Date(r);return l.setHours(0,0,0,0),l>=a&&r<=t});if(!s.length){f.value="";return}const c=s.filter(o=>o.preSoundNote&&o.preSoundNote.trim()||o.content&&o.content.trim()).map(o=>{const r=U(o.date||o.timestamp),l=(o.preSoundNote||o.content||"").trim();return{date:r,content:l}});if(c.length===0){f.value="";return}const v=c.map((o,r)=>`${r+1}. ${o.date}
${o.content}`).join(`

`);E.value=!0;try{const o=await fetch(St,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemMessage:`你是一位健康管理 app 內的對話式紀錄整理機器人。 任務是根據患者最近七天內的對話內容，整理可閱讀的一週症狀與生活摘要。

你不是醫療人員。 不提供診斷、不解釋原因、不判斷嚴重度、不給建議； 僅整理患者原話，安全、簡單呈現。


語言規則

1. 七天對話 全文英文 → 英文輸出

2. 只要出現任何中文（含繁體）→ 繁體中文輸出

3. 不翻譯、不調整語氣

4. 英文次數格式：mentioned X times this week


核心原則

1. 僅使用患者原文

2. 不補充未出現資訊

3. 不做任何醫療推論

4. 簡短、可快速閱讀

5. 症狀名稱與描述不重複


類型判斷

· 睡眠、情緒、食慾、緊繃 → 症狀

· 人的感受或狀態 → 症狀

· 事件或情境 → 生活


症狀規則

1. 僅整理患者主動提到的不舒服

2. 症狀名稱用患者原話，不合併

3. 語意相近可並列（逗號分隔），次數各自計算

4. 症狀需標示歸類（呈現用）：

o 緊繃 → 身體

o 睡眠相關 → 睡眠

o 喉嚨相關 → 喉嚨

o 其餘 → 可辨識部位

o 無法辨識 → 全身

症狀呈現

· 避免歸類與症狀同詞重複

· 若重複，改為：歸類：狀態

· 僅使用患者原文詞彙 （例：睡眠：不好／喉嚨：疼痛／身體：緊繃）


次數

· 講幾次記幾次，不合併、不去重

· 中文：本週提及 X 次


生活（含藥品）

1. 僅記錄事件，不解釋

2. 同類事件可合併

3. 同句含感受＋事件：

o 感受 → 症狀

o 事件 → 生活

藥品

· 永遠列生活第 1 項

· 依出現順序

· 格式：藥名-數量-頻率（原文）

· 使用方式未變不重複

· 有更改 → 新增一筆＋日期＋「改」


固定輸出格式

中文

這週你提到的狀況有

症狀

症狀名稱：描述 本週提及X次


生活

1 事件描述


我們幫您的身體變化紀錄起來，請您放心。

英文（全文英文時）

This week, you mentioned the following:

Symptoms

Symptom: description, mentioned X times this week

Lifestyle

1. Event description

We’ve recorded these body changes for you. Please feel at ease.


無資料

· 中文：這週還沒有新的留言唷，請您想到什麼，隨時都可以跟我們說。

· 英文：There were no new messages this week. Feel free to share anything with us anytime.

  `,message:`以下是本週（${w.value}）的患者留言內容，共 ${c.length} 筆記錄：

${v}

請依據以上原始文字，整理成一份「病情&生活紀錄摘要」。

重要：結尾固定說明中，請將「日期範圍」替換為「${w.value}」，完整結尾說明應為：
「以上內容我已幫您完成紀錄並整理（${w.value}），後續會提供給醫師了解與參考；請放心，我們會陪著您把狀況清楚整理下來。」`,model:"gpt-5-mini"})});if(!o.ok)throw new Error(`API 調用失敗: ${o.status}`);let r="";const l=o.headers.get("x-answer");if(l)try{r=decodeURIComponent(l)}catch{r=l}if(!r){let e=null;try{e=await o.clone().json()}catch{try{const i=await o.text();i&&(r=i)}catch{}}if(e){const i=x=>{if(!x)return"";if(typeof x=="string")return x;const z=["response","bot","answer","text","message","content","output"];for(const j of z){const _=x[j];if(typeof _=="string"&&_.trim())return _;if(_&&typeof _=="object"){const X=i(_);if(X)return X}}return""};r=i(e)}}f.value=r.trim()||`本週健康狀況摘要

${v}

---
以上為本週（${w.value}）的健康日誌彙整，共 ${c.length} 筆記錄。`}catch(o){console.error("彙整本週摘要失敗:",o),f.value=`本週健康狀況摘要

${v}

---
以上為本週（${w.value}）的健康日誌彙整，共 ${c.length} 筆記錄。`}finally{E.value=!1}};Y([()=>p.value,()=>y.value.length],()=>{g.value||M(),p.value==="summary"&&J()},{immediate:!0});const L=async()=>{I.value=!0,k.value=!1;try{const t=localStorage.getItem("robotDemo_healthLogs"),s=t?JSON.parse(t):[],m=localStorage.getItem("robotDemo_chatHistory"),v=m?JSON.parse(m):[];console.log("從 localStorage 讀取的健康日誌:",s),console.log("從 localStorage 讀取的聊天記錄:",v);const o=[];s.forEach(e=>{o.push({id:e.id||Date.now(),date:e.date||e.timestamp,timestamp:e.timestamp||e.date,type:e.type||"summary",content:e.content||e.Note||"",preSoundNote:e.preSoundNote||e.originalInput||""})}),v.forEach(e=>{e.user&&e.bot&&o.push({id:e.id||e.ts||Date.now(),date:e.timestamp||e.inputTime||new Date(e.ts).toISOString(),timestamp:e.timestamp||e.inputTime||new Date(e.ts).toISOString(),type:"summary",content:e.bot||"",preSoundNote:e.user||""})});const r=new Map;o.forEach(e=>{r.has(e.id)||r.set(e.id,e)}),y.value=Array.from(r.values()).sort((e,i)=>S(i.date||i.timestamp)-S(e.date||e.timestamp));const l=50;y.value.forEach(e=>{if(e.preSoundNote&&e.preSoundNote.trim()){const i=`${e.id}-oral`;H.value[i]=e.preSoundNote.trim().length>l}if(e.content&&e.content.trim()){const i=`${e.id}-ai`;H.value[i]=e.content.trim().length>l}}),console.log("轉換後的健康日誌:",y.value),console.log("健康日誌總數:",y.value.length)}catch(a){console.error("讀取健康日誌失敗:",a),y.value=[]}finally{I.value=!1,k.value=!0}},K=(a,t)=>{const s=`${a}-${t}`;N.value[s]=!N.value[s]},R=(a,t)=>{const s=`${a}-${t}`;return!!H.value[s]},U=a=>{const t=S(a);if(Number.isNaN(t.getTime()))return"--/-- --:--";const s=t.getMonth()+1,c=t.getDate(),m=t.getHours().toString().padStart(2,"0"),v=t.getMinutes().toString().padStart(2,"0");return`${s}/${c} ${m}:${v}`},V=()=>{},F=()=>{};return window.addEventListener("healthLogsUpdated",()=>{console.log("收到 healthLogsUpdated 事件，重新載入健康日誌"),L()}),window.addEventListener("chatHistoryUpdated",()=>{console.log("收到 chatHistoryUpdated 事件，重新載入健康日誌"),L()}),window.addEventListener("storage",a=>{(a.key==="robotDemo_healthLogs"||a.key==="robotDemo_chatHistory")&&(console.log(`收到 storage 事件，key: ${a.key}，重新載入健康日誌`),L())}),G(async()=>{M(),await L()}),(a,t)=>(u(),d("div",st,[n("div",at,[Z(q,{Text:"健康日誌",positionType:"sticky",link:"/robotdemo"}),n("div",ot,[n("button",{class:T(["tab-btn",{active:p.value==="log"}]),onClick:t[0]||(t[0]=s=>p.value="log")}," 日誌 ",2),n("button",{class:T(["tab-btn",{active:p.value==="summary"}]),onClick:t[1]||(t[1]=s=>p.value="summary")}," 本週摘要 ",2)]),p.value==="summary"?(u(),d("div",nt,[n("button",{class:"week-nav-btn",onClick:V,disabled:""},[...t[2]||(t[2]=[n("img",{src:C,alt:"上一週",class:"week-arrow left disabled"},null,-1)])]),n("div",rt,$(w.value),1),n("button",{class:"week-nav-btn",onClick:F,disabled:""},[...t[3]||(t[3]=[n("img",{src:C,alt:"下一週",class:"week-arrow right disabled"},null,-1)])])])):D("",!0),k.value&&p.value==="log"?(u(),d("div",it," 總共 "+$(b.value.length)+" 筆 ",1)):D("",!0),I.value?(u(),d("div",ct,[...t[4]||(t[4]=[n("div",{class:"loading-card"},[n("div",{class:"loading-spinner"}),n("div",{class:"loading-text"},"載入健康日誌中...")],-1)])])):k.value&&p.value==="log"&&b.value.length>0?(u(),d("div",lt,[n("div",dt,[(u(!0),d(tt,null,et(b.value,s=>(u(),d("div",{class:"log-item",key:s.id},[n("div",ut,[n("div",mt,$(U(s.date||s.timestamp)),1),s.preSoundNote&&s.preSoundNote.trim()?(u(),d("div",pt,[n("div",{class:"section-header",onClick:c=>R(s.id,"oral")&&K(s.id,"oral")},[t[5]||(t[5]=n("span",{class:"section-title"},"口述內容",-1)),R(s.id,"oral")?(u(),d("img",{key:0,src:C,alt:"展開/收合",class:T(["section-chevron",{rotated:!N.value[`${s.id}-oral`]}])},null,2)):D("",!0)],8,vt),n("div",{class:T(["section-content",{expanded:N.value[`${s.id}-oral`]}])},$(s.preSoundNote),3)])):D("",!0)])]))),128))])])):k.value&&p.value==="summary"?(u(),d("div",yt,[E.value?(u(),d("div",ht,[...t[6]||(t[6]=[n("div",{class:"loading-card"},[n("div",{class:"loading-spinner"}),n("div",{class:"loading-text"},"正在彙整本週摘要...")],-1)])])):f.value?(u(),d("div",gt,[n("div",ft,$(f.value),1)])):(u(),d("div",kt,[...t[7]||(t[7]=[n("div",{class:"empty-card"},[n("div",{class:"empty-character"},[n("img",{src:B,alt:"空狀態角色",class:"character-img"})]),n("div",{class:"empty-message"},"目前沒有資料")],-1)])]))])):k.value&&p.value==="log"&&b.value.length===0?(u(),d("div",wt,[...t[8]||(t[8]=[n("div",{class:"empty-card"},[n("div",{class:"empty-character"},[n("img",{src:B,alt:"空狀態角色",class:"character-img"})]),n("div",{class:"empty-message"},"目前沒有資料")],-1)])])):D("",!0)])]))}},It=Q(_t,[["__scopeId","data-v-c0344145"]]);export{It as default};
