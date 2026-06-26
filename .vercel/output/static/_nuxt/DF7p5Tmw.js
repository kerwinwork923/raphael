import{r as c,k as I,H as xe,o as Ye,y as r,z as i,A as s,C as ae,J as f,N as S,E as me,B as p,P as se,Q as ne,X as ye,D as Ie,K as Ae,U as We,Y as Ee}from"#entry";import{_ as A}from"./vbxbLNta.js";import{_ as fe}from"./CJrcPW-M.js";import{_ as Le}from"./C_DbEKYn.js";import{B as Pe}from"./txFYFuai.js";import{_ as Ne}from"./DlAUqK2U.js";/* empty css        *//* empty css        */const pe="data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20width='24'%20height='24'%20viewBox='0%200%2024%2024'%20fill='none'%3e%3cpath%20d='M3%206H21M7%2012H17M10%2018H14'%20stroke='%2374BC1F'%20stroke-width='2'%20stroke-linecap='round'%20stroke-linejoin='round'/%3e%3c/svg%3e",He={class:"healthLogWrap"},Oe={class:"healthLogContent"},Re={class:"tab-section"},je={key:0,class:"filter-section"},Fe={class:"filter-buttons"},Be={key:1,class:"week-selector"},Xe=["disabled"],Ke={class:"week-range"},Ue=["disabled"],Ve={key:2,class:"total-count"},Je={key:3,class:"loading-container"},ze={key:4,class:"log-list"},qe={class:"timeline-container"},Ge={class:"log-content-wrapper"},Qe={class:"log-date"},Ze={key:0,class:"content-section"},et=["onClick"],tt={key:5,class:"summary-container"},at={key:0,class:"loading-container"},st={key:1,class:"summary-card"},nt={class:"summary-content"},ot={key:0,class:"saved-meta-section"},lt={class:"saved-meta-content"},rt={key:2,class:"empty-state"},it={key:3,class:"bottom-action"},ct={class:"action-buttons"},ut=["disabled"],dt={key:6,class:"empty-state"},vt={class:"picker-header"},mt={class:"picker-content"},yt=["onClick"],ft={class:"picker-header"},pt={class:"picker-content"},gt=["onClick"],ht={key:0,class:"meta-modal-overlay"},kt={class:"meta-modal"},wt={class:"meta-modal-body"},St={class:"meta-modal-footer"},$t=["disabled"],Dt={key:9,class:"save-success-toast"},ge="https://23700999.com:8081/push_notification/api/chatgpt/ask",_t="https://23700999.com:8081/HMA/TTEgetCaseWeeklySummary.jsp",bt="https://23700999.com:8081/HMA/TTECaseWeeklySummary.jsp",Mt={__name:"healthLog",setup(Ct){const oe=localStorage.getItem("userData"),b=oe?JSON.parse(oe):null,m=c("log"),M=c(new Date().getFullYear()),W=c(`${new Date().getMonth()+1}月`),C=c(!1),T=c(!1),O=c({}),F=c({}),g=c([]),u=c(null),B=c(!0),x=c(!1),E=c(!1),L=c(!1),P=c(!1),N=c(!1),v=c(""),$=c(""),D=c(""),X=c(!1),Y=c(!1),R=c([]),K=c(null),he=I(()=>{const e=new Date().getFullYear();return Array.from({length:e-2025+1},(a,o)=>2025+o).reverse()}),U=I(()=>{const t=new Date().getFullYear(),e=new Date().getMonth()+1,o=M.value===t?e:12;return Array.from({length:o},(n,l)=>({value:l+1,label:`${l+1}月`}))}),le=(t=new Date)=>{const e=new Date(t);e.setHours(0,0,0,0);const a=e.getDay(),o=e.getDate()-a+(a===0?-6:1),n=new Date(e);return n.setDate(o),n.setHours(0,0,0,0),n},re=t=>{const e=new Date(t);return e.setDate(e.getDate()+6),e.setHours(23,59,59,999),e},ie=()=>{u.value=le()},k=I(()=>{if(!u.value)return"";const t=re(u.value),e=ce(u.value),a=ce(t);return`${e} - ${a}`}),V=I(()=>{if(!u.value)return!1;const t=new Date;return t.setDate(t.getDate()-28),u.value>t}),J=I(()=>{if(!u.value)return!1;const e=le(new Date);return u.value<e}),ce=t=>{const e=t.getFullYear(),a=(t.getMonth()+1).toString().padStart(2,"0"),o=t.getDate().toString().padStart(2,"0");return`${e}/${a}/${o}`},z=t=>{const e=t.getFullYear(),a=(t.getMonth()+1).toString().padStart(2,"0"),o=t.getDate().toString().padStart(2,"0");return`${e}${a}${o}`},ue=t=>{const e=t.getFullYear(),a=(t.getMonth()+1).toString().padStart(2,"0"),o=t.getDate().toString().padStart(2,"0"),n=t.getHours().toString().padStart(2,"0"),l=t.getMinutes().toString().padStart(2,"0"),d=t.getSeconds().toString().padStart(2,"0");return`${e}${a}${o}${n}${l}${d}`},j=I(()=>{if(!g.value.length)return console.log("沒有健康日誌資料"),[];const t=M.value,e=U.value.find(o=>o.label===W.value)?.value||1;console.log(`篩選條件: ${t}年${e}月`);const a=g.value.filter(o=>{const n=new Date(o.date||o.timestamp),l=n.getFullYear(),d=n.getMonth()+1;return l===t&&d===e}).sort((o,n)=>new Date(n.date||n.timestamp)-new Date(o.date||o.timestamp));return console.log(`篩選結果: ${a.length} 筆`),a}),de=()=>{if(!u.value||!g.value.length)return[];const t=new Date(u.value);t.setHours(0,0,0,0);const e=re(t);return g.value.filter(a=>{if(!a.date&&!a.timestamp)return!1;const o=new Date(a.date||a.timestamp);return o>=t&&o<=e})},q=async()=>{if(!u.value)return;const t=z(u.value);try{const e=await fetch(_t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({Key:"qrt897hpmd",MID:b?.MID||"1",StartDate:t})});if(!e.ok)throw new Error(`API 調用失敗: ${e.status}`);const a=await e.json();console.log("週期摘要列表:",a),a.Result==="OK"&&a.WeeklySummaryList?R.value=a.WeeklySummaryList:R.value=[]}catch(e){console.error("獲取週期摘要列表失敗:",e),R.value=[]}},ke=()=>{if(!u.value)return;const t=z(u.value),e=R.value.find(a=>a.StartDate===t);e?(Y.value=!0,K.value=e.AID,e.AISummary&&(v.value=e.AISummary),D.value=e.MetaSummary||""):(Y.value=!1,K.value=null,D.value="")},we=async()=>{if(m.value!=="summary"){v.value="";return}if(ke(),Y.value&&v.value){E.value=!1;return}const t=de();if(!t.length){v.value="";return}const e=t.filter(n=>n.content&&n.content.trim()).map(n=>({date:Z(n.date||n.timestamp),content:n.content.trim()}));if(e.length===0){v.value="";return}const o=e.map((n,l)=>`${l+1}. ${n.date}
${n.content}`).join(`

`);E.value=!0;try{const n=await fetch(ge,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemMessage:`你是一位健康管理 app 內的對話式紀錄整理機器人。 任務是根據患者最近七天內的對話內容，整理可閱讀的一週症狀與生活摘要。

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

We've recorded these body changes for you. Please feel at ease.


無資料

· 中文：這週還沒有新的留言唷，請您想到什麼，隨時都可以跟我們說。

· 英文：There were no new messages this week. Feel free to share anything with us anytime.

  `,message:`以下是本週（${k.value}）的健康日誌內容，共 ${e.length} 筆記錄：

${o}

請依據以上原始文字，整理成一份「病情&生活紀錄摘要」。

重要：結尾固定說明中，請將「日期範圍」替換為「${k.value}」，完整結尾說明應為：
「以上內容我已幫您完成紀錄並整理（${k.value}），後續會提供給醫師了解與參考；請放心，我們會陪著您把狀況清楚整理下來。」`,model:"gpt-5-mini"})});if(!n.ok)throw new Error(`API 調用失敗: ${n.status}`);let l="";const d=n.headers.get("x-answer");if(d)try{l=decodeURIComponent(d)}catch{l=d}if(!l){let _=null;try{_=await n.clone().json()}catch{try{const h=await n.text();h&&(l=h)}catch{}}if(_){const h=w=>{if(!w)return"";if(typeof w=="string")return w;const ee=["response","bot","answer","text","message","content","output"];for(const te of ee){const y=w[te];if(typeof y=="string"&&y.trim())return y;if(y&&typeof y=="object"){const H=h(y);if(H)return H}}return""};l=h(_)}}v.value=l.trim()||`本週健康狀況摘要

${o}

---
以上為本週（${k.value}）的健康日誌彙整，共 ${e.length} 筆記錄。`}catch(n){console.error("彙整本週摘要失敗:",n),v.value=`本週健康狀況摘要

${o}

---
以上為本週（${k.value}）的健康日誌彙整，共 ${e.length} 筆記錄。`}finally{E.value=!1}},Se=async()=>{if(N.value)return;const t=de();if(!t.length){alert("本週目前沒有健康日誌資料可供生成摘要");return}const e=t.filter(n=>n.content&&n.content.trim()).map(n=>({date:Z(n.date||n.timestamp),content:n.content.trim()}));if(e.length===0){alert("本週目前沒有 AI 摘要內容可供生成");return}const o=e.map((n,l)=>`${l+1}. ${n.date}
${n.content}`).join(`

`);N.value=!0;try{const n=await fetch(ge,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemMessage:`你是一位健康管理 app 內的對話式紀錄整理機器人。 任務是根據患者最近七天內的對話內容，整理可閱讀的一週症狀與生活摘要。

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

We've recorded these body changes for you. Please feel at ease.


無資料

· 中文：這週還沒有新的留言唷，請您想到什麼，隨時都可以跟我們說。

· 英文：There were no new messages this week. Feel free to share anything with us anytime.

  `,message:`以下是本週（${k.value}）的健康日誌內容，共 ${e.length} 筆記錄：

${o}

請依據以上原始文字，整理成一份「病情&生活紀錄摘要」。

重要：結尾固定說明中，請將「日期範圍」替換為「${k.value}」，完整結尾說明應為：
「以上內容我已幫您完成紀錄並整理（${k.value}），後續會提供給醫師了解與參考；請放心，我們會陪著您把狀況清楚整理下來。」`,model:"gpt-5-mini"})});if(!n.ok)throw new Error(`API 調用失敗: ${n.status}`);let l="";const d=n.headers.get("x-answer");if(d)try{l=decodeURIComponent(d)}catch{l=d}if(!l){let _=null;try{_=await n.clone().json()}catch{try{const h=await n.text();h&&(l=h)}catch{}}if(_){const h=w=>{if(!w)return"";if(typeof w=="string")return w;const ee=["response","bot","answer","text","message","content","output"];for(const te of ee){const y=w[te];if(typeof y=="string"&&y.trim())return y;if(y&&typeof y=="object"){const H=h(y);if(H)return H}}return""};l=h(_)}}v.value=l.trim()||`本週健康狀況摘要

${o}

---
以上為本週（${k.value}）的健康日誌彙整，共 ${e.length} 筆記錄。`,Y.value=!1,P.value=!0,setTimeout(()=>{P.value=!1},2e3)}catch(n){console.error("更新摘要失敗:",n),alert("更新摘要失敗，請稍後再試")}finally{N.value=!1}},$e=()=>{$.value=D.value||"",X.value=!0},G=()=>{X.value=!1,$.value=""},De=async()=>{if(!(!v.value||L.value)){L.value=!0;try{const t=new Date,e=z(u.value),a=ue(t),o=ue(t),n={Key:"qrt897hpmd",MID:b?.MID||"1",StartDate:e,AISummary:v.value,MetaSummary:$.value||"",AIStime:a,Updatetime:o};console.log("儲存每週摘要請求:",n);const l=await fetch(bt,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!l.ok)throw new Error(`API 調用失敗: ${l.status}`);const d=await l.json();if(console.log("儲存每週摘要回應:",d),d.Result==="OK")Y.value=!0,K.value=d.AID,D.value=$.value,G(),await q(),P.value=!0,setTimeout(()=>{P.value=!1},2e3);else throw new Error(d.Message||"儲存失敗")}catch(t){console.error("儲存每週摘要失敗:",t),alert("儲存失敗，請稍後再試")}finally{L.value=!1}}};xe([()=>m.value,()=>g.value.length,()=>u.value],async()=>{u.value||ie(),m.value==="summary"&&($.value="",D.value="",v.value="",Y.value=!1,await q(),await we())},{immediate:!0});const Q=async()=>{B.value=!0,x.value=!1;try{const t=await fetch("https://23700999.com:8081/HMA/api/fr/getSoundNote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({MID:b?.MID||"1",Token:b?.Token||"kRwzQVDP8T4XQVcBBF8llJVMOirIxvf7",MAID:b?.MAID||"mFjpTsOmYmjhzvfDKwdjkzyBGEZwFd4J",Mobile:b?.Mobile||"0968324056",Lang:"zhtw",Year:M.value.toString(),Month:W.value.replace("月","").padStart(2,"0")})});if(!t.ok)throw new Error(`讀取健康日誌 API 失敗: ${t.status}`);const e=await t.json();if(console.log("從 API 讀取的資料:",e),e.Result==="OK"&&e.SoundNoteList){g.value=e.SoundNoteList.map((o,n)=>({id:Date.now()+n,date:o.CheckTime,timestamp:o.CheckTime,type:"summary",content:o.Note||"",preSoundNote:o.PreSoundNote||""}));const a=50;g.value.forEach(o=>{if(o.preSoundNote&&o.preSoundNote.trim()){const n=`${o.id}-oral`;F.value[n]=o.preSoundNote.trim().length>a}if(o.content&&o.content.trim()){const n=`${o.id}-ai`;F.value[n]=o.content.trim().length>a}}),console.log("轉換後的健康日誌:",g.value),console.log("健康日誌總數:",g.value.length)}else console.log("API 回應無效或無資料"),g.value=[]}catch(t){console.error("讀取健康日誌失敗:",t),g.value=[]}finally{B.value=!1,x.value=!0}},_e=(t,e)=>{const a=`${t}-${e}`;O.value[a]=!O.value[a]},be=async t=>{M.value=t,C.value=!1,await Q()},Me=async t=>{W.value=U.value.find(e=>e.value===t)?.label||"1月",T.value=!1,await Q()},Z=t=>{const e=new Date(t),a=e.getMonth()+1,o=e.getDate(),n=e.getHours().toString().padStart(2,"0"),l=e.getMinutes().toString().padStart(2,"0");return`${a}/${o} ${n}:${l}`},ve=(t,e)=>{const a=`${t}-${e}`;return!!F.value[a]},Ce=()=>{if(!V.value)return;const t=new Date(u.value);t.setDate(t.getDate()-7),u.value=t},Te=()=>{if(!J.value)return;const t=new Date(u.value);t.setDate(t.getDate()+7),u.value=t};return Ye(async()=>{ie(),await Q(),await q()}),(t,e)=>(i(),r("div",He,[s("div",Oe,[ae(Le,{Text:"健康日誌",positionType:"sticky",link:"/robot"}),s("div",Re,[s("button",{class:S(["tab-btn",{active:m.value==="log"}]),onClick:e[0]||(e[0]=a=>m.value="log")}," 日誌 ",2),s("button",{class:S(["tab-btn",{active:m.value==="summary"}]),onClick:e[1]||(e[1]=a=>m.value="summary")}," 本週摘要 ",2)]),m.value==="log"?(i(),r("div",je,[s("div",Fe,[s("button",{class:"filter-btn",onClick:e[2]||(e[2]=a=>C.value=!C.value)},[e[11]||(e[11]=s("img",{src:pe,alt:"篩選",class:"filter-icon"},null,-1)),me(" "+p(M.value)+" ",1),e[12]||(e[12]=s("img",{src:A,alt:"下拉",class:"chevron-icon"},null,-1))]),s("button",{class:"filter-btn",onClick:e[3]||(e[3]=a=>T.value=!T.value)},[e[13]||(e[13]=s("img",{src:pe,alt:"篩選",class:"filter-icon"},null,-1)),me(" "+p(W.value)+" ",1),e[14]||(e[14]=s("img",{src:A,alt:"下拉",class:"chevron-icon"},null,-1))])])])):f("",!0),m.value==="summary"?(i(),r("div",Be,[s("button",{class:"week-nav-btn",onClick:Ce,disabled:!V.value},[s("img",{src:A,alt:"上一週",class:S(["week-arrow left",{disabled:!V.value}])},null,2)],8,Xe),s("div",Ke,p(k.value),1),s("button",{class:"week-nav-btn",onClick:Te,disabled:!J.value},[s("img",{src:A,alt:"下一週",class:S(["week-arrow right",{disabled:!J.value}])},null,2)],8,Ue)])):f("",!0),x.value&&m.value==="log"?(i(),r("div",Ve," 總共 "+p(j.value.length)+" 筆 ",1)):f("",!0),B.value?(i(),r("div",Je,[...e[15]||(e[15]=[s("div",{class:"loading-card"},[s("div",{class:"loading-spinner"}),s("div",{class:"loading-text"},"載入健康日誌中...")],-1)])])):x.value&&m.value==="log"&&j.value.length>0?(i(),r("div",ze,[s("div",qe,[(i(!0),r(se,null,ne(j.value,a=>(i(),r("div",{class:"log-item",key:a.id},[s("div",Ge,[s("div",Qe,p(Z(a.date||a.timestamp)),1),a.preSoundNote&&a.preSoundNote.trim()?(i(),r("div",Ze,[s("div",{class:"section-header",onClick:o=>ve(a.id,"oral")&&_e(a.id,"oral")},[e[16]||(e[16]=s("span",{class:"section-title"},"口述內容",-1)),ve(a.id,"oral")?(i(),r("img",{key:0,src:A,alt:"展開/收合",class:S(["section-chevron",{rotated:!O.value[`${a.id}-oral`]}])},null,2)):f("",!0)],8,et),s("div",{class:S(["section-content",{expanded:O.value[`${a.id}-oral`]}])},p(a.preSoundNote),3)])):f("",!0)])]))),128))])])):x.value&&m.value==="summary"?(i(),r("div",tt,[E.value?(i(),r("div",at,[...e[17]||(e[17]=[s("div",{class:"loading-card"},[s("div",{class:"loading-spinner"}),s("div",{class:"loading-text"},"正在彙整本週摘要...")],-1)])])):v.value?(i(),r("div",st,[e[19]||(e[19]=s("div",{class:"summary-title"},"本周健康狀況摘要：",-1)),s("div",nt,p(v.value),1),D.value?(i(),r("div",ot,[e[18]||(e[18]=s("div",{class:"saved-meta-title"},"補充內容",-1)),s("div",lt,p(D.value),1)])):f("",!0)])):(i(),r("div",rt,[...e[20]||(e[20]=[s("div",{class:"empty-card"},[s("div",{class:"empty-character"},[s("img",{src:fe,alt:"空狀態角色",class:"character-img"})]),s("div",{class:"empty-message"},"本週目前沒有資料")],-1)])])),E.value?f("",!0):(i(),r("div",it,[s("div",ct,[s("button",{class:"update-summary-btn",onClick:Se,disabled:N.value},p(N.value?"生成中...":v.value?"更新摘要":"生成摘要"),9,ut),v.value?(i(),r("button",{key:0,class:"add-meta-btn",onClick:$e}," 補充內容 ")):f("",!0)])]))])):x.value&&m.value==="log"&&j.value.length===0?(i(),r("div",dt,[...e[21]||(e[21]=[s("div",{class:"empty-card"},[s("div",{class:"empty-character"},[s("img",{src:fe,alt:"空狀態角色",class:"character-img"})]),s("div",{class:"empty-message"},"目前沒有資料")],-1)])])):f("",!0),C.value?(i(),r("div",{key:7,class:"picker-overlay",onClick:e[6]||(e[6]=a=>C.value=!1)},[s("div",{class:"picker-modal",onClick:e[5]||(e[5]=ye(()=>{},["stop"]))},[s("div",vt,[e[22]||(e[22]=s("h3",null,"選擇年份",-1)),s("button",{onClick:e[4]||(e[4]=a=>C.value=!1),class:"close-btn"},"×")]),s("div",mt,[(i(!0),r(se,null,ne(he.value,a=>(i(),r("button",{key:a,class:S(["picker-item",{active:M.value===a}]),onClick:o=>be(a)},p(a),11,yt))),128))])])])):f("",!0),T.value?(i(),r("div",{key:8,class:"picker-overlay",onClick:e[9]||(e[9]=a=>T.value=!1)},[s("div",{class:"picker-modal",onClick:e[8]||(e[8]=ye(()=>{},["stop"]))},[s("div",ft,[e[23]||(e[23]=s("h3",null,"選擇月份",-1)),s("button",{onClick:e[7]||(e[7]=a=>T.value=!1),class:"close-btn"}," × ")]),s("div",pt,[(i(!0),r(se,null,ne(U.value,a=>(i(),r("button",{key:a.value,class:S(["picker-item",{active:W.value===a.label}]),onClick:o=>Me(a.value)},p(a.label),11,gt))),128))])])])):f("",!0),ae(Ee,{name:"slide-right"},{default:Ie(()=>[X.value?(i(),r("div",ht,[s("div",kt,[s("div",{class:"meta-modal-header"},[s("button",{class:"back-btn",onClick:G},[...e[24]||(e[24]=[s("img",{src:A,alt:"返回",class:"back-arrow"},null,-1)])]),e[25]||(e[25]=s("h3",null,"補充內容",-1)),e[26]||(e[26]=s("div",{class:"header-spacer"},null,-1))]),s("div",wt,[Ae(s("textarea",{"onUpdate:modelValue":e[10]||(e[10]=a=>$.value=a),class:"meta-textarea",placeholder:"請輸入補充內容..."},null,512),[[We,$.value]])]),s("div",St,[s("button",{class:"cancel-btn",onClick:G},"取消"),s("button",{class:"confirm-btn",onClick:De,disabled:L.value},p(L.value?"送出中...":"確認送出"),9,$t)])])])):f("",!0)]),_:1}),P.value?(i(),r("div",Dt,"儲存成功！")):f("",!0),ae(Pe)])]))}},Pt=Ne(Mt,[["__scopeId","data-v-cd639334"]]);export{Pt as default};
