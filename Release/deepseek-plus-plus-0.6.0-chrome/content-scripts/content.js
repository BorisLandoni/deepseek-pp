var content=(function(){function e(e){return e}var t=.96,n=.45,r={enabled:!1,position:`bottom-right`,size:132,opacity:t,motion:!0};function i(e){return Math.min(220,Math.max(84,Math.round(typeof e==`number`&&Number.isFinite(e)?e:132)))}function a(e){return Math.min(1,Math.max(n,typeof e==`number`&&Number.isFinite(e)?e:t))}function o(e){return typeof e!=`number`||!Number.isFinite(e)?null:Math.min(1,Math.max(0,e))}function s(e){return e===`custom`?`custom`:e===`bottom-left`?`bottom-left`:`bottom-right`}function c(e){if(!e||typeof e!=`object`)return null;let t=e,n=o(t.x),r=o(t.y);return n===null||r===null?null:{x:n,y:r}}function l(e){if(!e)return{...r};let t=s(e.position),n=c(e.customPosition),o={enabled:e.enabled??r.enabled,position:t===`custom`&&!n?r.position:t,size:i(e.size),opacity:a(e.opacity),motion:e.motion??r.motion};return o.position===`custom`&&n&&(o.customPosition=n),o}var ee={thinking:[`Riflettendo…`,`Ponderando…`,`Ci sto pensando`,`Un attimo…`,`Meditando…`,`Valutando…`,`Concentrato`,`Analizzando…`,`Decifrando…`,`Usando il cervello`,`Ragionando…`,`Sintesi in corso`,`Momento filosofico`,`Grande riflessione`,`Valutando opzioni`,`Decodificando…`,`Considerando…`,`Cercando ispirazione`],working:`Al lavoro.Rifinendo….Creando….Forgiando….Prendendo forma.Generando….A pieno ritmo.Scricchiolando….In funzione….Lavorando sodo.Manifestando….Domare il codice.In incubazione….Lanciando magie.Sistemando….Mixando….Ronzando….Calcolando….Elaborando….Processando….Trasformando….Spostando dati.Tessendo….Condensando….Germogliando….Cuocendo a fuoco lento.Sobbollendo….A fiamma bassa.In fermentazione….Marinando…`.split(`.`),speaking:[`Comunicando…`,`Spiegando…`,`Dispiegando…`,`Svelando…`,`Ispirazione!`,`Immaginando…`,`Descrivendo…`,`Oracolando…`,`Incantando…`,`Al lavoro…`],idle:[`In giro`,`Toccami!`,`Passeggiando…`,`Rilassato`,`Vagabondando`,`Nel vuoto…`,`Dondolando…`,`Contorcendomi`,`Occupato con niente`,`Canticchiando…`],confused:[`Cortocircuito`,`Riorganizzando…`,`Blabla…`,`Oscillando…`,`Cercando la via`],success:[`Fatto!`,`Completato!`,`Risolto!`,`Perfetto!`,`Finito!`,`Magnifico!`,`Missione compiuta!`],error:[`Bloccato…`,`Ops, errore`,`Muro colpito`,`Logica assente`,`Ribaltato…`,`Sistema in crash`],sleepy:[`Zzz…`,`Sonnolento…`,`Un pisolino`,`Sognando…`,`Sotto le coperte`]},te={thinking:[`Pondering…`,`Mulling it over`,`Deep in thought`,`Just a moment…`,`Meditating…`,`Deliberating…`,`Focused…`,`Analysing…`,`Deciphering…`,`Brain engaged`,`Reasoning…`,`Synthesising…`,`Philosophical moment`,`Big thinks…`,`Weighing options`,`Decoding…`,`Considering…`,`Seeking inspiration`],working:`Working….Crafting….Creating….Forging….Taking shape.Generating….Full steam ahead.Crunching….Running….Hard at work.Manifesting….Taming the code.Incubating….Casting spells.Tinkering….Blending….Humming along.Calculating….Computing….Processing….Transmuting….Hauling data.Weaving….Condensing….Sprouting….Baking….Simmering….Slow cooking.Brewing….Marinating…`.split(`.`),speaking:[`Channelling…`,`Explaining…`,`Unfolding…`,`Unravelling…`,`Inspiration!`,`Imagining…`,`Describing…`,`Divining…`,`Casting…`,`On it…`],idle:[`Playing…`,`Poke me!`,`Strolling…`,`Taking it easy`,`Wandering…`,`Zoning out…`,`Swaying…`,`Wiggling…`,`Doing nothing`,`Humming…`],confused:[`Brain glitch`,`Reorganising…`,`Babbling…`,`Swaying…`,`Finding the way`],success:[`Done!`,`Nailed it!`,`Sorted!`,`Perfect!`,`Finished!`,`Beautiful!`,`Mission complete!`],error:[`Stuck…`,`Oops, error`,`Hit a wall`,`Logic escaped`,`Crashed…`,`System hiccup`],sleepy:[`Zzz…`,`Getting sleepy…`,`Quick nap`,`Daydreaming…`,`Under the covers`]},ne={it:ee,en:te};function re(e,t=`en`,n=[]){let r=ne[t]?.[e]??te[e];if(!r||r.length===0)return``;let i=r.filter(e=>!n.includes(e)),a=i.length>0?i:r;return a[Math.floor(Math.random()*a.length)]}var ie=[`user`,`feedback`,`topic`,`reference`],ae={kind:`local`,id:`memory`,displayName:`DeepSeek++ Memory`,transport:`in_process`},oe=[{id:`local:memory:memory_save`,provider:ae,name:`memory_save`,invocationName:`memory_save`,title:`Save memory`,description:`Save a new long-term memory entry`,inputSchema:{type:`object`,properties:{type:{type:`string`,enum:ie,description:`Memory type: user=identity/role/preference, feedback=behaviour correction, topic=discussion points, reference=external resource link`},name:{type:`string`,description:`Short title`},content:{type:`string`,description:`Content to save`},tags:{type:`array`,items:{type:`string`},description:`Tag list`}},required:[`type`,`name`,`content`,`tags`],additionalProperties:!1},execution:{mode:`auto`,enabled:!0,risk:`low`}},{id:`local:memory:memory_update`,provider:ae,name:`memory_update`,invocationName:`memory_update`,title:`Update memory`,description:`Update an existing memory entry`,inputSchema:{type:`object`,properties:{id:{type:`integer`,description:`Memory ID`},type:{type:`string`,enum:ie,description:`Memory type`},name:{type:`string`,description:`Updated title`},content:{type:`string`,description:`Updated content`},tags:{type:`array`,items:{type:`string`},description:`Tag list`}},required:[`id`,`type`,`name`,`content`,`tags`],additionalProperties:!1},execution:{mode:`auto`,enabled:!0,risk:`medium`}},{id:`local:memory:memory_delete`,provider:ae,name:`memory_delete`,invocationName:`memory_delete`,title:`Delete memory`,description:`Delete a memory entry`,inputSchema:{type:`object`,properties:{id:{type:`integer`,description:`Memory ID`}},required:[`id`],additionalProperties:!1},execution:{mode:`auto`,enabled:!0,risk:`medium`}}],se={kind:`local`,id:`web`,displayName:`DeepSeek++ Web Search`,transport:`in_process`},ce=[{id:`local:web:web_search`,provider:se,name:`web_search`,invocationName:`web_search`,title:`Web Search`,description:`Search the internet and return titles, URLs and summaries of relevant web pages`,inputSchema:{type:`object`,properties:{query:{type:`string`,description:`Search query keywords`},topK:{type:`integer`,description:`Number of results to return, default 5`}},required:[`query`],additionalProperties:!1},execution:{mode:`auto`,enabled:!0,risk:`low`}},{id:`local:web:web_fetch`,provider:se,name:`web_fetch`,invocationName:`web_fetch`,title:`Fetch Page`,description:`Download the content of a URL and return visible text (navigation, scripts and styles are automatically removed)`,inputSchema:{type:`object`,properties:{url:{type:`string`,description:`Full URL to fetch (http:// or https://)`}},required:[`url`],additionalProperties:!1},execution:{mode:`auto`,enabled:!0,risk:`low`}}],u=[...oe,...ce],le=new WeakMap,ue=new WeakMap;function de(e=u){let t=le.get(e);if(t)return t;let n=new Map,r=new Map,i=new Map,a=new Map;for(let t of e){let e=t.name.trim();he(e)&&a.set(e,(a.get(e)??0)+1)}for(let t of e){let e=t.invocationName.trim(),o=[];he(e)&&me(n,o,e,t);let s=t.name.trim();s&&!r.has(s)&&r.set(s,t),s&&s!==e&&he(s)&&a.get(s)===1&&me(n,o,s,t),i.set(t.id,o)}let o={descriptors:e,invocationNames:[...n.keys()],descriptorByInvocationName:n,descriptorByName:r,invocationNamesByDescriptorId:i};return le.set(e,o),o}function fe(e){if(e.invocationNames.length===0)return/$a/g;let t=ue.get(e);return t||(t=`<(${e.invocationNames.map(pe).join(`|`)})>\\s*([\\s\\S]*?)\\s*<\\/\\1>`,ue.set(e,t)),new RegExp(t,`g`)}function pe(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function me(e,t,n,r){t.push(n),!e.has(n)&&e.set(n,r)}function he(e){return/^[A-Za-z_][A-Za-z0-9_.:-]*$/.test(e)}var ge=.3,_e=.05;function ve(e){return Math.min(1,Math.max(_e,typeof e==`number`&&Number.isFinite(e)?e:ge))}function ye(e){return e?{enabled:e.enabled??!1,type:e.type===`url`?`url`:`upload`,url:e.url??``,imageData:e.imageData??``,opacity:ve(e.opacity)}:null}var be=/<｜DSML｜tool_calls>\s*[\s\S]*?\s*<\/｜DSML｜tool_calls>/g;function xe(e,t){let n=fe(de(t?.descriptors)),r=new RegExp(be.source,`g`);return e.replace(n,``).replace(r,``).trim()}var Se=`https://chat.deepseek.com/api/v0/chat/completion`;u.map(e=>e.invocationName),fe(de(u));var Ce=[`shell_exec`,`shell_status`];typeof Intl<`u`&&Intl.Segmenter&&new Intl.Segmenter(`zh-Hans`,{granularity:`word`});var we=`<!-- deepseek-pp-visible-user-prompt:start -->`,Te=`<!-- deepseek-pp-visible-user-prompt:end -->`,Ee=`Tool call format reminder:`,De=`Available tool tag names:`,Oe=[Ee,De,`These listed tools are executable by the extension.`,`To call a tool, use ONLY the direct XML tag`,`For MCP tools, prefer the short tag name`,`For local file paths, use forward slashes`,`Do not use <invoke name="...">`,`Do not put executable tool XML`];function ke(e){let t=e.indexOf(we);if(t===-1)return null;let n=t+46,r=e.indexOf(Te,n);return r===-1?null:Me(e.slice(n,r))}function Ae(e,t){let n=ke(e);return n===null?Fe(e)?``:Ne(e)?t??Pe(e):e:n}function je(e){return e.includes(`<!-- deepseek-pp-visible-user-prompt:start -->`)||Ne(e)||Fe(e)}function Me(e){let t=e;return t.startsWith(`\r
`)?t=t.slice(2):t.startsWith(`
`)&&(t=t.slice(1)),t.endsWith(`\r
`)?t=t.slice(0,-2):t.endsWith(`
`)&&(t=t.slice(0,-1)),t}function Ne(e){return e.includes(Ee)&&e.includes(De)}function Pe(e){let t=e.indexOf(Ee);if(t===-1)return e;let n=e.lastIndexOf(`
---`,t),r=n===-1?t:n;return e.slice(0,r).trim()}function Fe(e){let t=e.trimStart();return t?Oe.some(e=>t.startsWith(e)):!1}var Ie=`dpp-inline-agent-css`;function Le(){if(document.getElementById(Ie))return;let e=document.createElement(`style`);e.id=Ie,e.textContent=`
    .dpp-agent-container {
      margin-top: 12px;
      border-left: 3px solid #6366f1;
      padding-left: 12px;
    }
    [data-dpp-agent-host-hidden] > :not(.dpp-agent-container):not(.dpp-tool-block) {
      display: none !important;
    }
    .dpp-agent-container[data-restored="true"] {
      margin-bottom: 12px;
    }
    .dpp-agent-step {
      margin-bottom: 8px;
      border: 1px solid var(--dpp-border, #e5e7eb);
      border-radius: 8px;
      overflow: hidden;
      background: var(--dpp-step-bg, #fafafa);
    }
    .dpp-agent-step[data-status="streaming"] {
      border-color: #6366f1;
    }
    .dpp-agent-step[data-status="executing_tools"] {
      border-color: #f59e0b;
    }
    .dpp-agent-step[data-status="error"] {
      border-color: #ef4444;
    }
    .dpp-agent-step-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      font-size: 12px;
      color: var(--dpp-muted, #6b7280);
      background: var(--dpp-header-bg, #f3f4f6);
      cursor: pointer;
      user-select: none;
    }
    .dpp-agent-step-header::after {
      content: '\\25BC';
      font-size: 9px;
      margin-left: auto;
      transition: transform 0.2s ease;
    }
    .dpp-agent-step[data-collapsed="true"] .dpp-agent-step-header::after {
      transform: rotate(-90deg);
    }
    .dpp-agent-step-indicator {
      font-weight: 600;
      color: #6366f1;
    }
    .dpp-agent-step-status {
      flex: 1;
    }
    .dpp-agent-stop-btn {
      padding: 2px 8px;
      font-size: 11px;
      border: 1px solid #ef4444;
      border-radius: 4px;
      background: transparent;
      color: #ef4444;
      cursor: pointer;
    }
    .dpp-agent-stop-btn:hover {
      background: #fef2f2;
    }
    .dpp-agent-step-body {
      padding: 8px 10px;
      font-size: 13px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 300px;
      overflow-y: auto;
      transition: max-height 0.3s ease, padding 0.3s ease, opacity 0.2s ease;
    }
    .dpp-agent-step-body:empty {
      display: none;
    }
    .dpp-agent-step[data-collapsed="true"] .dpp-agent-step-body {
      max-height: 0;
      padding: 0 10px;
      opacity: 0;
      overflow: hidden;
    }
    .dpp-agent-step[data-collapsed="true"] .dpp-agent-step-tools {
      max-height: 0;
      padding: 0 10px;
      opacity: 0;
      overflow: hidden;
    }
    .dpp-agent-step-tools {
      padding: 4px 10px 8px;
      font-size: 12px;
      color: var(--dpp-muted, #6b7280);
      transition: max-height 0.3s ease, padding 0.3s ease, opacity 0.2s ease;
    }
    .dpp-agent-step-tool-item {
      padding: 2px 0;
    }
    .dpp-agent-step-tool-item.ok::before {
      content: '\\2713 ';
      color: #10b981;
    }
    .dpp-agent-step-tool-item.err::before {
      content: '\\2717 ';
      color: #ef4444;
    }
    .dpp-agent-footer {
      margin-top: 8px;
      padding: 6px 0;
      font-size: 12px;
      color: var(--dpp-muted, #6b7280);
    }
    .dpp-agent-footer.complete::before {
      content: '\\25A0 ';
      color: #10b981;
    }
    .dpp-agent-footer.error::before {
      content: '\\25A0 ';
      color: #ef4444;
    }

    body.dpp-theme-dark .dpp-agent-container {
      border-left-color: #818cf8;
    }
    body.dpp-theme-dark .dpp-agent-step {
      background: #1e1e2e;
      border-color: #374151;
    }
    body.dpp-theme-dark .dpp-agent-step-header {
      background: #111827;
      color: #9ca3af;
    }
    body.dpp-theme-dark .dpp-agent-step-body {
      color: #e5e7eb;
    }
    body.dpp-theme-dark .dpp-agent-stop-btn:hover {
      background: #1f1f2e;
    }
    [data-dpp-body-text] {
      font-size: inherit;
      line-height: 1.7;
      margin-top: 12px;
      color: var(--ds-text, #1D1D1F);
      word-break: break-word;
    }
    [data-dpp-body-text] * { color: inherit; }
    [data-dpp-body-text] h3 { font-size: 1.1em; font-weight: 600; margin: 10px 0 4px; }
    [data-dpp-body-text] p { margin: 3px 0; }
    [data-dpp-body-text] ul, [data-dpp-body-text] ol { margin: 3px 0 3px 16px; }
    [data-dpp-body-text] strong { font-weight: 600; }
    [data-dpp-body-text] a { color: var(--ds-blue, #4D6BFE); text-decoration: underline; }
    body.dpp-theme-dark [data-dpp-body-text] {
      color: var(--ds-text, #E5E7EB);
    }
    @media (prefers-color-scheme: dark) {
      body:not(.dpp-theme-light) [data-dpp-body-text] {
        color: var(--ds-text, #E5E7EB);
      }
    }
  `,document.head.appendChild(e)}function Re(){let e=document.createElement(`div`);return e.className=`dpp-agent-container`,e.setAttribute(`data-dpp-agent`,`true`),e}function ze(e,t){let n=document.createElement(`div`);n.className=`dpp-agent-step`,n.setAttribute(`data-step-index`,String(e)),n.setAttribute(`data-status`,`streaming`);let r=document.createElement(`div`);r.className=`dpp-agent-step-header`,r.addEventListener(`click`,()=>{let e=n.getAttribute(`data-collapsed`)===`true`;n.setAttribute(`data-collapsed`,e?`false`:`true`)});let i=document.createElement(`span`);i.className=`dpp-agent-step-indicator`,i.textContent=`Step ${e+1}`;let a=document.createElement(`span`);if(a.className=`dpp-agent-step-status`,a.textContent=`streaming...`,r.appendChild(i),r.appendChild(a),t){let e=document.createElement(`button`);e.className=`dpp-agent-stop-btn`,e.textContent=`Stop`,e.addEventListener(`click`,e=>{e.stopPropagation(),t()}),r.appendChild(e)}let o=document.createElement(`div`);o.className=`dpp-agent-step-body`;let s=document.createElement(`div`);return s.className=`dpp-agent-step-tools`,n.appendChild(r),n.appendChild(o),n.appendChild(s),n}function Be(e,t){let n=e.querySelector(`.dpp-agent-step-body`);n&&(n.textContent=t)}function Ve(e,t,n){e.setAttribute(`data-status`,t);let r=e.querySelector(`.dpp-agent-step-status`);r&&n&&(r.textContent=n),(t===`complete`||t===`error`)&&e.querySelector(`.dpp-agent-stop-btn`)?.remove()}function He(e,t,n,r){let i=e.querySelector(`.dpp-agent-step-tools`);if(!i)return;let a=document.createElement(`div`);a.className=`dpp-agent-step-tool-item ${n?`ok`:`err`}`,a.textContent=`${t}: ${r.slice(0,100)}`,i.appendChild(a)}function d(e,t,n,r){let i=document.createElement(`div`);return i.className=`dpp-agent-footer ${n?`error`:`complete`}`,r?i.textContent=r:n?i.textContent=`Agent error (${e} steps, ${t} tool calls)`:i.textContent=`Agent complete (${e} steps, ${t} tool calls)`,i}var Ue=`deepseek_pp_chat_enabled`;async function We(){return(await chrome.storage.local.get(Ue))[Ue]===!0}new TextEncoder,new URL(Se).pathname;var Ge=`2.0.0`,Ke=`web`,qe=`userToken`,f=null,Je=class extends Error{constructor(e){super(e),this.name=`DeepSeekAuthError`}};function Ye(e){if(f)return{...f};let t=$e();if(!t)throw new Je(e?.missingTokenMessage??`DeepSeek login token is missing. Refresh chat.deepseek.com or sign in again.`);return{Authorization:`Bearer ${t}`,"X-App-Version":tt(),"x-client-platform":Ke,"x-client-version":tt(),"x-client-locale":nt(),"x-client-timezone-offset":String(-new Date().getTimezoneOffset()*60)}}function Xe(e){let t=et(e);if(!t)return;let n=t.get(`authorization`);n&&(f={Authorization:n,"X-App-Version":t.get(`x-app-version`)||tt(),"x-client-platform":t.get(`x-client-platform`)||Ke,"x-client-version":t.get(`x-client-version`)||tt(),"x-client-locale":t.get(`x-client-locale`)||nt(),"x-client-timezone-offset":t.get(`x-client-timezone-offset`)||String(-new Date().getTimezoneOffset()*60)})}var Ze=`deepseekCachedClientHeaders`;async function Qe(){if(await We()&&f)try{await chrome.storage.local.set({[Ze]:f})}catch{}}function $e(){try{let e=localStorage.getItem(qe);if(!e)return null;let t=it(e);return typeof t==`string`?t.trim()||null:t&&typeof t==`object`?rt(t.token,t.value,t.accessToken):e.trim()===`null`?null:e.trim()||null}catch{return null}}function et(e){if(!e)return null;try{return new Headers(e)}catch{return null}}function tt(){return Ge}function nt(){return document.documentElement.lang||navigator.language||`en-US`}function rt(...e){for(let t of e){if(typeof t==`string`&&t.trim())return t;if(typeof t==`number`&&Number.isFinite(t))return String(t)}return null}function it(e){try{return JSON.parse(e)}catch{return null}}var at=`dpp-tool-block`,ot=`dpp-tool-block-css`,st=`._74c0879`,ct=/\b(?:reason|reasoning|think|thinking|thought)\b/i,lt=/^(?:已思考|思考中|正在思考|thinking|reasoning|thought)(?:[（(:：]|$)/i,ut=`dpp-token-speed-badge`,dt=`dpp-token-speed-css`,p=`dpp-pet-host`,ft=`dpp-pet-css`,pt=250,mt=40,ht=500,gt=500,_t=`dpp_tool_execution_blocks`,vt=`dpp_inline_agent_traces`,yt=1e3*60*60*24*30,bt=100,xt=300,St=250,Ct=20,wt=900,Tt=24,Et=92,Dt=12,Ot=1,kt=1400,At=12e3,jt=`pet/deepseek-whale-pet-states.png`,Mt=`deepseek/sha3_wasm_bg.wasm`,Nt=6e3,Pt=8e3,Ft=12e3,It=3,Lt=new Set([`idle`,`thinking`,`speaking`,`working`]),m=[],h=null,Rt=0,g=null,zt=null,Bt=0,Vt=null,Ht=null,_=tr(),Ut=``,Wt=null,v=new Map,y=null,Gt=0,Kt=new Set,b=null,x=null,S=null,C=null,w=null,T=null,qt=null,Jt=0,Yt=null,E=null,D=null,Xt=null,Zt=null,O=null,Qt=!1,k=null,$t=null,A=null,j=null,M=null,N=[],en=`en`;chrome.storage.local.get([`deepseek_pp_language`]).then(e=>{(e.deepseek_pp_language===`it`||e.deepseek_pp_language===`en`)&&(en=e.deepseek_pp_language)}),chrome.storage.onChanged.addListener(e=>{if(`deepseek_pp_language`in e){let t=e.deepseek_pp_language.newValue;(t===`it`||t===`en`)&&(en=t)}});var P=null,F=null,I=null,L=null,R=null,z=null,B=new Map,tn=null,nn=0,rn=[],an=[],on=null,sn=null,V=[...u],cn=xr(V),ln=Sr(V),un=!0,dn=e({matches:[`*://chat.deepseek.com/*`],runAt:`document_start`,async main(){mn(),window.addEventListener(`message`,async e=>{if(e.origin===window.location.origin&&e.data?.source===`deepseek-pp-main`)try{switch(e.data.type){case`TOOL_CALL`:{let t=e.data.data;Q(`working`),Jn(t);break}case`EXECUTE_TOOL_CALL`:{let t=e.data.data,n=e.data.id;Q(`working`);let r=await Wr(t).catch(e=>({ok:!1,summary:`Execution failed`,detail:e instanceof Error?e.message:String(e)}));Yn(r),window.postMessage({source:`deepseek-pp-content`,type:`TOOL_CALL_RESULT`,id:n,result:r});break}case`RESTORE_TOOL_CALLS`:Ur(e.data.records);break;case`MEMORIES_USED`:{let t=e.data.ids;await W({type:`TOUCH_MEMORIES`,payload:{ids:t}});break}case`HEADERS_CAPTURED`:await hn();break;case`RESPONSE_COMPLETE`:{let t=Zn(e.data.payload,e.data.text),n=++Rt;if(await Xn(),n!==Rt)break;let r=[...m];m.length>0&&(await Br(m,t.text),Bi(),m=[],h=null),Ln(t,r),$();break}case`RESPONSE_TOKEN_SPEED`:{let t=Qn(e.data.payload);t&&(er(t),ua(t));break}case`AGENT_STEP_STARTED`:Q(`working`),zn(e.data.data);break;case`AGENT_STREAM_CHUNK`:Q(`speaking`),Bn(e.data.data);break;case`AGENT_TOOL_DETECTED`:break;case`AGENT_STEP_COMPLETE`:Vn(e.data.data),$();break;case`AGENT_LOOP_COMPLETE`:Hn(e.data.data),Q(`success`),$(kt);break;case`AGENT_LOOP_ERROR`:Q(`error`),qn(e.data.data),$(kt);break}}catch(e){H(e)&&U()}}),fn().catch(()=>void 0),await new Promise(e=>{document.readyState===`complete`||document.readyState===`interactive`?e(void 0):document.addEventListener(`DOMContentLoaded`,()=>e(void 0),{once:!0})}),bn(),ir(),sr(),ur(),Ni(),Vr(),Lr(),W({type:`GET_BACKGROUND`}).then(e=>{ka(e??null)}),W({type:`GET_PET`}).then(e=>{Zi(e??null)}),yn((e,t,n)=>{e.type===`STATE_UPDATED`?vr(e.memories,e.skills,e.activePreset,e.modelType,V):e.type===`TOOL_DESCRIPTORS_UPDATED`?vr(rn,an,on,sn,br(e.toolDescriptors)):e.type===`MCP_SERVERS_UPDATED`?W({type:`GET_TOOL_DESCRIPTORS`}).then(e=>vr(rn,an,on,sn,br(e))).catch(()=>void 0):e.type===`BACKGROUND_UPDATED`?ka(e.config):e.type===`PET_UPDATED`&&Zi(e.config)})}});async function fn(){let[e,t,n,r,i]=await Promise.all([W({type:`GET_MEMORIES`}),W({type:`GET_SKILLS`}),W({type:`GET_ACTIVE_PRESET`}),W({type:`GET_MODEL_TYPE`}),W({type:`GET_TOOL_DESCRIPTORS`})]);vr(e??[],t??[],n??null,r??null,br(i))}function pn(){if(!un)return!1;try{if(typeof chrome>`u`)return!1;let e=chrome.runtime;return!!e?.id&&typeof e.sendMessage==`function`}catch(e){return H(e)&&U(),!1}}function mn(){let e=e=>{H(`reason`in e?e.reason:e.error??e.message)&&(U(),e.preventDefault())};window.addEventListener(`unhandledrejection`,e),window.addEventListener(`error`,e)}function H(e){let t=e instanceof Error?e.message:String(e);return t.includes(`Extension context invalidated`)||t.includes(`context invalidated`)}function U(){un&&(un=!1,b?.disconnect(),b=null,$i(),xn(),y&&=(clearTimeout(y),null),tn&&=(clearTimeout(tn),null),z&&=(clearTimeout(z),null),ar(),cr(),dr(),hr())}async function hn(){try{let e=Ye();e&&(Xe(e),await Qe(),chrome.runtime.sendMessage({type:`AUTH_STATUS_CHANGED`}).catch(()=>{}))}catch{}}async function W(e){if(pn())try{let t=await chrome.runtime.sendMessage(e);return t&&typeof t==`object`&&`ok`in t&&t.ok===!1?void 0:t}catch(e){if(H(e)){U();return}return}}async function gn(e){let t=vn();if(t)try{return(await t.get(e))?.[e]}catch(e){H(e)&&U();return}}async function _n(e,t){let n=vn();if(n)try{await n.set({[e]:t})}catch(e){H(e)&&U()}}function vn(){if(!pn())return null;try{let e=chrome.storage?.local;return!e||typeof e.get!=`function`||typeof e.set!=`function`?null:e}catch(e){return H(e)&&U(),null}}function yn(e){if(pn())try{chrome.runtime.onMessage.addListener(e)}catch(e){H(e)&&U()}}function bn(){On(),x?.disconnect(),x=new MutationObserver(Dn),wn(document.documentElement),wn(document.body),wn(document.getElementById(`root`)),C=window.matchMedia(`(prefers-color-scheme: dark)`),w=()=>Dn(),C.addEventListener(`change`,w),Sn()}function xn(){x?.disconnect(),x=null,Cn(),T&&=(clearTimeout(T),null),C&&w&&C.removeEventListener(`change`,w),C=null,w=null}function Sn(){Cn(),Jt=0,S=new MutationObserver(()=>{Tn(document.getElementById(`root`)),Dn()}),Tn(document.body),Tn(document.getElementById(`root`)),En()}function Cn(){S?.disconnect(),S=null,qt&&=(clearTimeout(qt),null)}function wn(e){!e||!x||x.observe(e,{attributes:!0,attributeFilter:[`class`,`style`,`data-theme`,`data-color-mode`,`data-mode`,`color-scheme`]})}function Tn(e){!e||!S||S.observe(e,{childList:!0,subtree:!0})}function En(){qt||=setTimeout(()=>{if(qt=null,Jt+=1,On(),Jt>=Ct){Cn();return}En()},St)}function Dn(){T&&clearTimeout(T),T=setTimeout(()=>{T=null,On()},50)}function On(){let e=An();kn(e),e!==Yt&&(Yt=e,W({type:`SET_DEEPSEEK_THEME`,payload:{theme:e}}))}function kn(e){document.body.classList.toggle(`dpp-theme-dark`,e===`dark`),document.body.classList.toggle(`dpp-theme-light`,e===`light`)}function An(){return jn()??Nn()??(window.matchMedia(`(prefers-color-scheme: dark)`).matches?`dark`:`light`)}function jn(){let e=[document.documentElement,document.body,document.getElementById(`root`)].filter(e=>!!e),t=[`data-theme`,`data-color-mode`,`data-mode`,`color-scheme`];for(let n of e){for(let e of t){let t=Mn(n.getAttribute(e));if(t)return t}let e=Mn(typeof n.className==`string`?n.className:``);if(e)return e;let r=getComputedStyle(n).colorScheme.toLowerCase().trim();if(r===`dark`||r===`light`)return r}return null}function Mn(e){if(!e)return null;let t=e.toLowerCase();return/(^|[\s_-])(dark|black|night)([\s_-]|$)/.test(t)?`dark`:/(^|[\s_-])(light|white|day)([\s_-]|$)/.test(t)?`light`:null}function Nn(){let e=[document.elementFromPoint(Math.max(0,Math.floor(window.innerWidth/2)),Math.max(0,Math.min(Math.floor(window.innerHeight/2),240))),document.querySelector(`main`),document.getElementById(`root`),document.body,document.documentElement].filter(e=>!!e);for(let t of e){let e=t;for(;e&&e!==document.documentElement.parentElement;){let t=Pn(getComputedStyle(e).backgroundColor);if(t)return t;e=e.parentElement}}return null}function Pn(e){let t=Fn(e);return!t||t.alpha<.2?null:In(t.red,t.green,t.blue)<.45?`dark`:`light`}function Fn(e){let t=e.match(/^rgba?\((.+)\)$/);if(!t)return null;let n=t[1].replace(/\//g,` `).split(/[\s,]+/).map(e=>e.trim()).filter(Boolean),[r,i,a]=n.slice(0,3).map(Number),o=n[3]===void 0?1:Number(n[3]);return[r,i,a,o].some(e=>Number.isNaN(e))?null:{red:r,green:i,blue:a,alpha:o}}function In(e,t,n){let[r,i,a]=[e,t,n].map(e=>{let t=e/255;return t<=.03928?t/12.92:((t+.055)/1.055)**2.4});return .2126*r+.7152*i+.0722*a}function Ln(e,t){let n=t.filter(e=>e.provider?.kind===`mcp`||e.provider?.id===`web`||e.name===`web_search`||e.name===`web_fetch`);if(n.length===0||!e.chatSessionId||e.assistantMessageId==null)return;let r=crypto.randomUUID(),i={loopId:r,chatSessionId:e.chatSessionId,parentMessageId:e.assistantMessageId,originalPrompt:e.agentTaskPrompt||e.originalPrompt,agentTaskPrompt:e.agentTaskPrompt||e.originalPrompt,toolExecutions:n,promptOptions:{modelType:e.promptOptions.modelType,searchEnabled:e.promptOptions.searchEnabled,thinkingEnabled:e.promptOptions.thinkingEnabled,refFileIds:e.promptOptions.refFileIds},toolDescriptors:V.filter(e=>e.provider?.kind===`mcp`||e.provider?.id===`web`||e.name===`web_search`||e.name===`web_fetch`),powWasmUrl:chrome.runtime.getURL(Mt)};Le();let a=Re();a.setAttribute(`data-dpp-agent-loop-id`,r);let o=Ei(),s=o[o.length-1];if(!s)return;I=r,R=Tr(e,r,n.length),Ar(R),P=a;let c=Di(s);c.appendChild(a),L?.disconnect(),L=new MutationObserver(()=>{a.parentNode&&a.nextSibling&&a.parentNode.appendChild(a)}),L.observe(c,{childList:!0}),window.postMessage({source:`deepseek-pp-content`,type:`START_INLINE_AGENT_LOOP`,payload:i})}function Rn(){let e=P;if(Y(e=>({...e,status:`stopping`,error:`Stopped`}),{immediate:!0}),I=null,P=null,F=null,R=null,L?.disconnect(),L=null,window.postMessage({source:`deepseek-pp-content`,type:`STOP_INLINE_AGENT_LOOP`}),e){let t=d(0,0,!1,`Stopped`);e.appendChild(t)}}function zn(e){if(e.loopId!==I||!P)return;let t=ze(e.stepIndex,Rn);F=t,P.appendChild(t),Y(t=>Dr(t,{index:e.stepIndex,status:`streaming`,text:``,toolExecutions:[],responseMessageId:null,collapsed:!1}))}function Bn(e){if(e.loopId!==I||!F)return;let t=Er(F),n=e.fullText.trim()||t;Be(F,n),Y(t=>Or(t,e.stepIndex,{text:n,status:`streaming`,collapsed:!1}))}function Vn(e){if(e.loopId!==I||!F)return;for(let t of e.toolExecutions)He(F,t.name,t.result.ok,t.result.summary);let t=e.toolExecutions.length>0?`Complete (${e.toolExecutions.length} tools)`:`Complete`;Ve(F,`complete`,t);let n=Er(F);Y(t=>Or(t,e.stepIndex,{status:`complete`,text:n,toolExecutions:e.toolExecutions,responseMessageId:e.responseMessageId,collapsed:!0}),{immediate:!0});let r=F;setTimeout(()=>{r.setAttribute(`data-collapsed`,`true`)},800),F=null}function Hn(e){if(!(e.loopId!==I||!P))try{L?.disconnect(),L=null;let t=Un(e.finalText);Gn(P,t,e.loopId);let n=d(e.totalSteps,e.totalTools,!1);P.appendChild(n),Y(n=>({...n,status:`complete`,totalSteps:e.totalSteps,totalTools:e.totalTools,finalText:t}),{immediate:!0})}catch(e){console.error(`[DeepSeek++] handleAgentLoopComplete error:`,e)}finally{I=null,P=null,F=null,R=null,L?.disconnect(),L=null}}function Un(e){return Wn(xe(e,{descriptors:V})).trim()}function Wn(e){return e.replace(/<task_complete>\s*({[\s\S]*?})\s*<\/task_complete>/g,(e,t)=>{try{let e=JSON.parse(t);return typeof e.summary==`string`?e.summary:``}catch{return``}})}function Gn(e,t,n){if(!t)return;let r=e.parentNode;if(!r)return;let i=document.createElement(`div`);i.innerHTML=Kn(t),i.setAttribute(`data-dpp-body-text`,`true`),i.setAttribute(`data-dpp-agent-loop-id`,n),r.appendChild(i)}function Kn(e){try{let t=e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`);return t=t.replace(/```(\w*)\n([\s\S]*?)```/g,(e,t,n)=>`<pre><code>${n.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</code></pre>`),t=t.replace(/`([^`]+)`/g,`<code>$1</code>`),t=t.replace(/\*\*([^*]+)\*\*/g,`<strong>$1</strong>`),t=t.replace(/\*([^*]+)\*/g,`<em>$1</em>`),t=t.replace(/\[([^\]]+)\]\(([^)]+)\)/g,`<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`),t=t.replace(/^### (.+)$/gm,`<h4>$1</h4>`),t=t.replace(/^## (.+)$/gm,`<h3>$1</h3>`),t=t.replace(/^# (.+)$/gm,`<h2>$1</h2>`),t=t.replace(/^- (.+)$/gm,`<li>$1</li>`),t=t.replace(/^\* (.+)$/gm,`<li>$1</li>`),t=t.replace(/((?:<li>.*?<\/li>\n?)+)/g,`<ul>$1</ul>`),t=t.replace(/^\d+\.\s+(.+)$/gm,`<ol><li>$1</li></ol>`),t=t.replace(/<\/ol>\s*<ol>/g,``),t=t.replace(/\n\s*\n/g,`</p><p>`),t=t.replace(/\n/g,`<br>`),t=t.replace(/<br>\s*<\/(ul|ol|li|h[234])>/g,`</$1>`),t=t.replace(/<\/(ul|ol|li|h[234])>\s*<br>/g,`</$1>`),t=t.replace(/<(ul|ol|h[234])>\s*<br>/g,`<$1>`),t=t.replace(/<br>\s*<\/(p)>/g,`</$1>`),t.startsWith(`<`)||(t=`<p>`+t+`</p>`),t}catch{return e.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/\n/g,`<br>`)}}function qn(e){if(!(e.loopId!==I||!P))try{F&&Ve(F,`error`,e.error);let t=d(e.stepIndex,e.totalTools,!0,e.error);P.appendChild(t),Y(t=>({...t,status:`error`,totalSteps:e.stepIndex,error:e.error}),{immediate:!0})}catch(e){console.error(`[DeepSeek++] handleAgentLoopError:`,e)}finally{I=null,P=null,F=null,R=null,L?.disconnect(),L=null}}function Jn(e){let t=Wr(e).catch(e=>({ok:!1,summary:`Execution failed`,detail:e instanceof Error?e.message:String(e)})).then(t=>(m.push({name:e.name,result:t,provider:e.provider,descriptorId:e.descriptorId}),fi(),Yn(t),t));return Kt.add(t),t.finally(()=>{Kt.delete(t)}),t}function Yn(e){Q(e.ok?`success`:`error`),$(kt)}async function Xn(){for(;Kt.size>0;)await Promise.allSettled(Array.from(Kt))}function Zn(e,t){let n=e&&typeof e==`object`?e:{};return{text:typeof n.text==`string`?n.text:typeof t==`string`?t:``,originalPrompt:typeof n.originalPrompt==`string`?n.originalPrompt:``,agentTaskPrompt:typeof n.agentTaskPrompt==`string`?n.agentTaskPrompt:``,chatSessionId:typeof n.chatSessionId==`string`?n.chatSessionId:null,parentMessageId:typeof n.parentMessageId==`number`?n.parentMessageId:null,assistantMessageId:typeof n.assistantMessageId==`number`?n.assistantMessageId:null,promptOptions:{modelType:typeof n.promptOptions?.modelType==`string`?n.promptOptions.modelType:null,searchEnabled:n.promptOptions?.searchEnabled===!0,thinkingEnabled:n.promptOptions?.thinkingEnabled===!0,refFileIds:Array.isArray(n.promptOptions?.refFileIds)?n.promptOptions.refFileIds.filter(e=>typeof e==`string`):[]}}}function Qn(e){if(!e||typeof e!=`object`)return null;let t=e,n=$n(t.estimatedTokens),r=$n(t.tokensPerSecond),i=$n(t.elapsedMs),a=$n(t.textLength);return n===null||r===null||i===null||a===null?null:{active:t.active===!0,estimatedTokens:n,tokensPerSecond:r,elapsedMs:i,textLength:a}}function $n(e){return typeof e==`number`&&Number.isFinite(e)?e:null}function er(e){Ut=pr(),_=e,nr(e)}function tr(){return{active:!1,estimatedTokens:0,tokensPerSecond:0,elapsedMs:0,textLength:0}}function nr(e){let t=gr();if(!t)return!1;let n=rr(e.tokensPerSecond);return t.textContent=n,t.dataset.active=e.active?`true`:`false`,t.setAttribute(`aria-label`,`Token output speed ${n}`),t.setAttribute(`title`,`Token output speed: ${n}${e.active?``:` (idle)`}`),!0}function rr(e){let t=Number.isFinite(e)&&e>0?e:0;return`${t>=100?String(Math.round(t)):t.toFixed(1)} tok/s`}function ir(){ar(),Bt=0,or()}function ar(){zt&&=(clearTimeout(zt),null)}function or(){zt||=setTimeout(()=>{zt=null,!nr(_)&&(Bt+=1,Bt<mt&&or())},Bt===0?0:pt)}function sr(){cr();let e=document.getElementById(`root`)??document.body;e&&(Vt=new MutationObserver(lr),Vt.observe(e,{childList:!0,subtree:!1}),lr())}function cr(){Vt?.disconnect(),Vt=null,Ht&&=(clearTimeout(Ht),null)}function lr(){Ht||=setTimeout(()=>{Ht=null,fr(),!mr()&&nr(_)},ht)}function ur(){dr(),Ut=pr(),window.addEventListener(`popstate`,G),window.addEventListener(`hashchange`,G),Wt=setInterval(G,gt)}function dr(){window.removeEventListener(`popstate`,G),window.removeEventListener(`hashchange`,G),Wt&&=(clearInterval(Wt),null)}function G(){fr()&&nr(_)}function fr(){let e=pr();return e===Ut?!1:(Ut=e,_=tr(),!0)}function pr(){return typeof location>`u`?``:`${location.pathname}${location.search}`}function mr(){let e=Ki();return!!(e&&g?.isConnected&&g.parentElement===e)}function hr(){let e=g?.parentElement;g?.remove(),e?.removeAttribute(`data-dpp-token-speed-anchor`),g=null}function gr(){_r();let e=Ki();if(!e)return null;if(g&&g.isConnected&&g.parentElement===e)return g;let t=g?.parentElement;g?.remove(),t?.removeAttribute(`data-dpp-token-speed-anchor`),e.setAttribute(`data-dpp-token-speed-anchor`,``);let n=document.createElement(`div`);return n.id=ut,n.className=`dpp-token-speed-badge`,n.setAttribute(`role`,`status`),n.setAttribute(`aria-live`,`polite`),e.appendChild(n),g=n,n}function _r(){if(document.getElementById(dt))return;let e=document.createElement(`style`);e.id=dt,e.textContent=`
    [data-dpp-token-speed-anchor] {
      position: relative !important;
    }

    .dpp-token-speed-badge {
      position: absolute;
      top: 8px;
      right: 12px;
      z-index: 30;
      display: inline-flex;
      align-items: center;
      min-height: 20px;
      max-width: 96px;
      padding: 2px 7px;
      border: 1px solid rgba(77, 107, 254, 0.18);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.88);
      color: #4b5563;
      font: 500 11px/1.2 -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Segoe UI', sans-serif;
      white-space: nowrap;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }

    body.dpp-theme-dark .dpp-token-speed-badge {
      border-color: rgba(125, 145, 255, 0.28);
      background: rgba(22, 26, 36, 0.86);
      color: #d1d7e6;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
    }

    .dpp-token-speed-badge[data-active='false'] {
      opacity: 0.72;
    }
  `,document.head.appendChild(e)}function K(e,t){return e&&(e.length>t?e.slice(0,t)+`
...[truncated]`:e)}function vr(e,t,n,r,i){rn=e,an=t,on=n,sn=r,V=i,cn=xr(i),ln=Sr(i),window.postMessage({source:`deepseek-pp-content`,type:`SYNC_STATE`,memories:e,skills:t,activePreset:n,modelType:r,toolDescriptors:i})}function yr(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function br(e){if(!Array.isArray(e))return[...u];let t=e.filter(e=>!!(e&&typeof e==`object`));return t.length>0?t:[...u]}function xr(e){let t=Cr(e);return RegExp(`<\\s*(${t})\\s*>`,`i`)}function Sr(e){let t=Cr(e);return RegExp(`<\\s*/?\\s*(?:${t})\\s*>`,`i`)}function Cr(e){let t=de(e).invocationNames,n=new Set(t);for(let e of Ce)n.add(e);let r=[...n].map(yr);return r.length>0?r.join(`|`):`memory_save|memory_update|memory_delete`}function wr(e){let t=0;for(let n=0;n<e.length;n++)t=t*31+e.charCodeAt(n)|0;return Math.abs(t).toString(36)}function q(){return`${location.origin}${location.pathname}${location.search}`}function J(e){return(e??``).replace(/\s+/g,``).trim()}function Tr(e,t,n){let r=Date.now();return{id:wr(`${e.chatSessionId}\n${e.assistantMessageId}\n${e.agentTaskPrompt||e.originalPrompt}`),loopId:t,chatSessionId:e.chatSessionId,anchorMessageId:e.assistantMessageId,url:q(),originalPrompt:e.originalPrompt,agentTaskPrompt:e.agentTaskPrompt,status:`running`,steps:[],totalSteps:0,totalTools:n,finalText:``,createdAt:r,updatedAt:r}}function Er(e){return(e.querySelector(`.dpp-agent-step-body`)?.textContent??``).trim()}function Y(e,t={}){if(R){if(R={...e(R),updatedAt:Date.now()},t.immediate){z&&=(clearTimeout(z),null),Ar(R);return}kr(R)}}function Dr(e,t){let n=[...e.steps.filter(e=>e.index!==t.index),t].sort((e,t)=>e.index-t.index);return{...e,steps:n,totalSteps:Math.max(e.totalSteps,t.index+1)}}function Or(e,t,n){return Dr(e,{...e.steps.find(e=>e.index===t)??{index:t,status:`streaming`,text:``,toolExecutions:[],responseMessageId:null,collapsed:!1},...n,index:t})}function kr(e){z&&clearTimeout(z),z=setTimeout(()=>{z=null,Ar(R?.id===e.id?R:e)},xt)}async function Ar(e){let t=Pr(e),n=await jr(),r=Date.now();await _n(vt,[...n.filter(e=>e.id!==t.id),t].filter(e=>r-e.createdAt<yt).slice(-bt)),B.set(t.id,t)}async function jr(){let e=await gn(vt);return Array.isArray(e)?e.filter(Mr):[]}function Mr(e){if(!e||typeof e!=`object`)return!1;let t=e;return typeof t.id==`string`&&typeof t.loopId==`string`&&typeof t.chatSessionId==`string`&&typeof t.anchorMessageId==`number`&&typeof t.url==`string`&&typeof t.createdAt==`number`&&typeof t.updatedAt==`number`&&Array.isArray(t.steps)&&t.steps.every(Nr)}function Nr(e){if(!e||typeof e!=`object`)return!1;let t=e;return typeof t.index==`number`&&typeof t.status==`string`&&typeof t.text==`string`&&Array.isArray(t.toolExecutions)&&typeof t.collapsed==`boolean`}function Pr(e){return{...e,originalPrompt:K(e.originalPrompt,8e3)??``,agentTaskPrompt:K(e.agentTaskPrompt,8e3)??``,finalText:K(e.finalText,8e3)??``,error:K(e.error,2e3),steps:e.steps.map(Fr)}}function Fr(e){return{...e,text:K(e.text,8e3)??``,toolExecutions:e.toolExecutions.map(Ir)}}function Ir(e){let t=e.result.output===void 0?void 0:K(typeof e.result.output==`string`?e.result.output:JSON.stringify(e.result.output),8e3);return{name:e.name,provider:e.provider,descriptorId:e.descriptorId,result:{...e.result,detail:K(e.result.detail,4e3),output:t}}}async function Lr(){let e=q(),t=await jr(),n=!1;for(let r of t)!Rr(r,e)||B.has(r.id)||(B.set(r.id,r),n=!0);n&&hi()}function Rr(e,t){if(e.url===t)return!0;try{return new URL(e.url).origin===location.origin}catch{return!1}}async function zr(){let e=await gn(_t);return Array.isArray(e)?e:[]}async function Br(e,t){if(e.length===0)return;let n=t?xe(t,{descriptors:V}):``,r=q(),i=wr(`${r}\n${n}\n${JSON.stringify(e)}`),a={id:i,source:`storage`,url:r,createdAt:Date.now(),content:n,executions:e.map(e=>({name:e.name,provider:e.provider,descriptorId:e.descriptorId,result:{...e.result,detail:K(e.result.detail,4e3),output:e.result.output===void 0?void 0:K(JSON.stringify(e.result.output),8e3)}})),metadata:{toolCount:e.length,mcpToolCount:e.filter(e=>e.provider?.kind===`mcp`).length}};await _n(_t,[...(await zr()).filter(e=>e.id!==i),a].filter(e=>Date.now()-e.createdAt<1e3*60*60*24*30).slice(-100))}async function Vr(){let e=q();Ur((await zr()).filter(t=>Hr(t,e)).map(e=>({...e,source:`storage`})))}function Hr(e,t){if(e.url===t)return!0;try{return new URL(e.url).origin===location.origin}catch{return!1}}function Ur(e){if(!e||e.length===0)return;let t=!1;for(let n of e)!n.id||v.has(n.id)||(v.set(n.id,n),t=!0);t&&pi()}async function Wr(e){if(e.parseError)return{ok:!1,summary:`Tool format error`,detail:e.parseError.message,error:e.parseError};let t=await Kr(e),n=qr(t);if(n){if(Gr(e,n)){let t=e.payload?.url;if(typeof t==`string`&&await $r(t)){let t=qr(await Kr(e));if(t)return t}}return n}return un?Jr(t):{ok:!1,summary:`Execution failed`,detail:`Extension reloaded. Please refresh the DeepSeek page and try again.`}}function Gr(e,t){return e.name===`web_fetch`&&!t.ok&&t.error?.code===`fetch_permission_denied`}async function Kr(e){if(pn())try{return await chrome.runtime.sendMessage({type:`EXECUTE_TOOL_CALL`,payload:e})}catch(e){if(H(e)){U();return}let t=e instanceof Error?e.message:String(e);return{ok:!1,summary:`Tool message send failed`,detail:t,error:{code:`runtime_message_failed`,message:t,retryable:!0}}}}function qr(e){if(!e||typeof e!=`object`)return null;let t=e;return typeof t.ok!=`boolean`||typeof t.summary!=`string`?null:{ok:t.ok,summary:t.summary,detail:t.detail,output:t.output,truncated:t.truncated,error:t.error}}function Jr(e){let t=e==null,n=t?`Background did not return a tool result.`:`Background returned an invalid tool result: ${Yr(e)}`;return{ok:!1,summary:`Background tool execution failed`,detail:t?`Background did not return tool execution results. Please refresh the DeepSeek page and try again; if it still fails, re-test Shell Local in the MCP page.`:`Invalid tool result structure from background: ${Yr(e)}`,error:{code:t?`runtime_tool_result_missing`:`runtime_tool_result_invalid`,message:n,retryable:!0}}}function Yr(e){try{let t=JSON.stringify(e);if(t)return t.length>500?`${t.slice(0,500)}...`:t}catch{}let t=String(e);return t.length>500?`${t.slice(0,500)}...`:t}var Xr=`dpp-permission-banner`,Zr=`dpp-permission-banner-css`,Qr=6e4,X=null;async function $r(e){let t;try{t=new URL(e).origin}catch{return!1}ei(!1);let n=ni(t);if(!n)return!1;try{return await new Promise(e=>{let r={banner:n,resolve:e,timeoutId:null};X=r;let i=n.querySelector(`.dpp-permission-grant`),a=n.querySelector(`.dpp-permission-deny`);if(!i||!a){ti(r,!1);return}let o=e=>{ti(r,e)};r.timeoutId=setTimeout(()=>o(!1),Qr),i.addEventListener(`click`,async()=>{i.textContent=`Requesting...`,i.disabled=!0,a.disabled=!0,o((await W({type:`REQUEST_HOST_PERMISSION`,payload:{origins:[`${t}/*`]}}))?.ok===!0)},{once:!0}),a.addEventListener(`click`,()=>o(!1),{once:!0})})}finally{n.isConnected&&n.remove()}}function ei(e){X&&ti(X,e)}function ti(e,t){X===e&&(X=null,e.timeoutId&&=(clearTimeout(e.timeoutId),null),e.banner.remove(),e.resolve(t))}function ni(e){ri();let t=document.getElementById(Xr);t&&(ei(!1),t.remove());let n=document.createElement(`div`);return n.id=Xr,n.className=`dpp-permission-banner`,n.innerHTML=`
    <span class="dpp-permission-text">DeepSeek++ needs permission to access <strong>${ii(e)}</strong> to fetch this page</span>
    <div class="dpp-permission-actions">
      <button type="button" class="dpp-permission-deny">Deny</button>
      <button type="button" class="dpp-permission-grant">Grant</button>
    </div>
  `,(Ki()?.parentElement??document.body).appendChild(n),n}function ri(){if(document.getElementById(Zr))return;let e=document.createElement(`style`);e.id=Zr,e.textContent=`
    .dpp-permission-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      margin: 8px 12px;
      border-radius: 10px;
      background: var(--ds-card, #fff);
      border: 1px solid var(--ds-blue, #4D6BFE);
      box-shadow: 0 2px 12px rgba(77, 107, 254, 0.15);
      font: 13px/1.4 -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
      color: var(--ds-text, #1D1D1F);
      animation: dppPermFadeIn 0.2s ease-out;
      z-index: 100;
    }

    .dpp-permission-text {
      flex: 1;
      min-width: 0;
    }

    .dpp-permission-text strong {
      color: var(--ds-blue, #4D6BFE);
    }

    .dpp-permission-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }

    .dpp-permission-actions button {
      padding: 5px 14px;
      border-radius: 8px;
      border: 1px solid var(--ds-border, #E5E7EB);
      font: inherit;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .dpp-permission-deny {
      background: var(--ds-surface, #F7F8FA);
      color: var(--ds-text-secondary, #6B7280);
    }

    .dpp-permission-deny:hover {
      background: var(--ds-danger-bg, #FEF2F2);
      color: var(--ds-danger, #EF4444);
      border-color: var(--ds-danger-border, #FECACA);
    }

    .dpp-permission-grant {
      background: var(--ds-blue, #4D6BFE);
      color: #fff;
      border-color: var(--ds-blue, #4D6BFE);
    }

    .dpp-permission-grant:hover {
      opacity: 0.9;
    }

    .dpp-permission-grant:disabled,
    .dpp-permission-deny[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @keyframes dppPermFadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    body.dpp-theme-dark .dpp-permission-banner {
      background: var(--ds-card, #151922);
      border-color: var(--ds-blue, #7D91FF);
      box-shadow: 0 2px 12px rgba(125, 145, 255, 0.2);
    }
  `,document.head.appendChild(e)}function ii(e){let t=document.createElement(`div`);return t.appendChild(document.createTextNode(e)),t.innerHTML}function ai(){if(document.getElementById(ot))return;let e=document.createElement(`style`);e.id=ot,e.textContent=`
    .dpp-tool-block {
      margin-top: 8px;
    }
    .dpp-tool-block-header {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      user-select: none;
      color: rgb(97, 102, 107);
      font-size: 14px;
      line-height: 20px;
    }
    .dpp-tool-block-header:hover {
      color: rgb(60, 65, 70);
    }
    .dpp-tool-block-icon {
      width: 16px;
      height: 16px;
      color: #4d6bfe;
      flex-shrink: 0;
    }
    .dpp-tool-block-title {
      font-weight: 500;
      color: inherit;
    }
    .dpp-tool-block-chevron {
      width: 12px;
      height: 12px;
      color: inherit;
      transition: transform 0.2s ease;
      margin-left: 2px;
    }
    .dpp-tool-block[data-collapsed="true"] .dpp-tool-block-chevron {
      transform: rotate(-90deg);
    }
    .dpp-tool-block-body {
      overflow: hidden;
      transition: max-height 0.25s ease, opacity 0.2s ease;
      max-height: 500px;
      opacity: 1;
      padding-left: 20px;
      margin-top: 6px;
    }
    .dpp-tool-block[data-collapsed="true"] .dpp-tool-block-body {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
    }
    .dpp-tool-block-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 3px 0;
      font-size: 13px;
      color: rgb(64, 65, 79);
      line-height: 1.5;
    }
    .dpp-tool-block-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #4d6bfe;
      flex-shrink: 0;
      margin-top: 7px;
    }
    .dpp-tool-block-item-text {
      flex: 1;
      min-width: 0;
    }
    .dpp-tool-block-item-name {
      font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
      font-size: 12px;
      color: #4d6bfe;
    }
    .dpp-tool-block-item-status {
      color: #10b981;
      margin-left: 6px;
    }
    .dpp-tool-block-item-status.error {
      color: #ef4444;
    }
    .dpp-tool-block-item-detail {
      margin-top: 4px;
      padding: 6px 8px;
      border-radius: 6px;
      background: rgba(77, 107, 254, 0.06);
      color: rgb(79, 84, 91);
      font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace;
      font-size: 12px;
      line-height: 1.45;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .dpp-manual-continuation {
      margin: 10px 0 0 20px;
      padding: 10px 12px;
      border-left: 2px solid #4d6bfe;
      border-radius: 6px;
      background: rgba(77, 107, 254, 0.05);
      color: rgb(64, 65, 79);
      font-size: 14px;
      line-height: 1.65;
    }
    .dpp-manual-continuation.error {
      border-left-color: #ef4444;
      background: rgba(239, 68, 68, 0.08);
    }
    .dpp-manual-continuation-title {
      margin-bottom: 6px;
      color: #4d6bfe;
      font-size: 12px;
      font-weight: 600;
    }
    .dpp-manual-continuation.error .dpp-manual-continuation-title {
      color: #ef4444;
    }
    .dpp-manual-continuation-content {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    body.dpp-theme-dark .dpp-tool-block-header { color: rgb(155, 160, 165); }
    body.dpp-theme-dark .dpp-tool-block-header:hover { color: rgb(200, 205, 210); }
    body.dpp-theme-dark .dpp-tool-block-item { color: rgb(200, 200, 200); }
    body.dpp-theme-dark .dpp-tool-block-item-detail {
      background: rgba(125, 150, 255, 0.12);
      color: rgb(210, 213, 218);
    }
    body.dpp-theme-dark .dpp-manual-continuation {
      background: rgba(125, 150, 255, 0.10);
      color: rgb(210, 213, 218);
    }
    @media (prefers-color-scheme: dark) {
      body:not(.dpp-theme-light) .dpp-tool-block-header { color: rgb(155, 160, 165); }
      body:not(.dpp-theme-light) .dpp-tool-block-header:hover { color: rgb(200, 205, 210); }
      body:not(.dpp-theme-light) .dpp-tool-block-item { color: rgb(200, 200, 200); }
      body:not(.dpp-theme-light) .dpp-tool-block-item-detail {
        background: rgba(125, 150, 255, 0.12);
        color: rgb(210, 213, 218);
      }
      body:not(.dpp-theme-light) .dpp-manual-continuation {
        background: rgba(125, 150, 255, 0.10);
        color: rgb(210, 213, 218);
      }
    }
  `,document.head.appendChild(e)}function oi(e){let t=document.createElement(`div`);return e?.id&&(t.id=e.id),e?.restoreId&&t.setAttribute(`data-dpp-tool-key`,e.restoreId),t.className=`dpp-tool-block`,t.setAttribute(`data-collapsed`,e?.collapsed?`true`:`false`),t.innerHTML=`
    <div class="dpp-tool-block-header">
      <svg class="dpp-tool-block-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
      <span class="dpp-tool-block-title"></span>
      <svg class="dpp-tool-block-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
    <div class="dpp-tool-block-body"></div>
  `,t.querySelector(`.dpp-tool-block-header`).addEventListener(`click`,()=>{let e=t.getAttribute(`data-collapsed`)===`true`;t.setAttribute(`data-collapsed`,e?`false`:`true`)}),t}function si(e,t){let n=t.length,r=e.querySelector(`.dpp-tool-block-title`);r.textContent=`Tools executed (${n})`;let i=e.querySelector(`.dpp-tool-block-body`);i.innerHTML=``;for(let e of t){let t=document.createElement(`div`);t.className=`dpp-tool-block-item`,t.innerHTML=`
      <div class="dpp-tool-block-dot"></div>
      <div class="dpp-tool-block-item-text">
        <div>
          <span class="dpp-tool-block-item-name"></span>
          <span class="dpp-tool-block-item-status ${e.result.ok?``:`error`}"></span>
        </div>
      </div>
    `;let n=t.querySelector(`.dpp-tool-block-item-name`),r=t.querySelector(`.dpp-tool-block-item-status`);n.textContent=di(e),r.textContent=e.result.summary;let a=ci(e.result);if(a){let e=document.createElement(`div`);e.className=`dpp-tool-block-item-detail`,e.textContent=a,t.querySelector(`.dpp-tool-block-item-text`).appendChild(e)}i.appendChild(t)}}function ci(e){if(e.detail){if(!e.ok&&li(e.detail)){let t=ui(e.detail);if(t)return t}return e.detail}return e.output===void 0?``:typeof e.output==`string`?e.output:JSON.stringify(e.output,null,2)}function li(e){let t=e.trimStart();return t.startsWith(`{`)||t.startsWith(`[`)}function ui(e){try{let t=JSON.parse(e);if(typeof t==`string`)return t;if(Array.isArray(t)){let e=t.filter(e=>e&&typeof e==`object`&&e.type===`text`).map(e=>e.text).filter(e=>typeof e==`string`);if(e.length>0)return e.join(`
`)}if(t&&typeof t==`object`){if(typeof t.message==`string`)return t.message;if(typeof t.error==`string`)return t.error;if(t.error&&typeof t.error==`object`&&typeof t.error.message==`string`)return t.error.message}}catch{}return null}function di(e){return e.provider?.displayName?`${e.provider.displayName} / ${e.name}`:e.name}function fi(){ai(),h||(h=oi({id:at}),Hi(h)),Ii(),si(h,m)}function pi(){y||=setTimeout(()=>{if(y=null,mi()>0&&Gt<20){Gt++,pi();return}Gt=0},Gt===0?0:250)}function mi(){ai();let e=Ei();if(e.length===0)return v.size;let t=0,n=new Set;for(let r of v.values()){if(Ci(r.id))continue;let i=Mi(r,e,n);if(!i){t++;continue}let a=wi(r);if(a.length===0)continue;let o=oi({restoreId:r.id,collapsed:!0});si(o,a),Vi(i,o),n.add(i)}return Ii(),t}function hi(){tn||=setTimeout(()=>{if(tn=null,gi()>0&&nn<20){nn++,hi();return}nn=0},nn===0?0:250)}function gi(){Le();let e=Ei();if(e.length===0)return B.size;let t=0,n=new Set;for(let r of B.values()){if(_i(r.id)||r.steps.length===0)continue;let i=vi(r,e,n);if(!i){t++;continue}let a=bi(r);Si(i.message,a,i.hideHostContent),n.add(i.message)}return t}function _i(e){for(let t of document.querySelectorAll(`.dpp-agent-container[data-dpp-agent-trace-key]`))if(t.getAttribute(`data-dpp-agent-trace-key`)===e)return t;return null}function vi(e,t,n){let r=yi(e);if(r.length>=12){let e=t.find(e=>n.has(e)?!1:J(e.textContent??``).includes(r));if(e)return{message:e,hideHostContent:!0}}if(e.url===q()){let e=[...t].reverse().find(e=>!n.has(e));if(e)return{message:e,hideHostContent:!1}}return null}function yi(e){let t=J(e.finalText);return t?t.slice(0,100):([...e.steps].reverse().map(e=>J(e.text)).find(e=>e.length>0)??``).slice(0,100)}function bi(e){let t=Re();t.setAttribute(`data-restored`,`true`),t.setAttribute(`data-dpp-agent-trace-key`,e.id),t.setAttribute(`data-dpp-agent-loop-id`,e.loopId);for(let n of[...e.steps].sort((e,t)=>e.index-t.index)){let e=ze(n.index);Be(e,n.text);for(let t of n.toolExecutions)He(e,t.name,t.result.ok,t.result.summary);Ve(e,n.status,xi(n)),e.setAttribute(`data-collapsed`,n.collapsed?`true`:`false`),t.appendChild(e)}return e.status===`complete`?t.appendChild(d(e.totalSteps,e.totalTools,!1)):e.status===`error`?t.appendChild(d(e.totalSteps,e.totalTools,!0,e.error)):e.status===`stopping`&&t.appendChild(d(e.totalSteps,e.totalTools,!1,e.error??`Stopped`)),t}function xi(e){return e.status===`complete`?e.toolExecutions.length>0?`Complete (${e.toolExecutions.length} tools)`:`Complete`:e.status===`executing_tools`?`Executing tools`:e.status===`error`?`Error`:`streaming...`}function Si(e,t,n){let r=Di(e);if(n){r.setAttribute(`data-dpp-agent-host-hidden`,`true`),r.prepend(t);return}r.appendChild(t)}function Ci(e){for(let t of document.querySelectorAll(`.dpp-tool-block[data-dpp-tool-key]`))if(t.getAttribute(`data-dpp-tool-key`)===e)return t;return null}function wi(e){return e.executions?.length?e.executions:(e.calls??[]).map(e=>({name:e.name,provider:e.provider,descriptorId:e.descriptorId,result:Ti(e)}))}function Ti(e){let t=e.payload,n=String(t.name??t.content??t.id??``);switch(e.name){case`memory_save`:return{ok:!0,summary:`Saved`,detail:n};case`memory_update`:return{ok:!0,summary:`Updated`,detail:n};case`memory_delete`:return{ok:!0,summary:`Deleted`,detail:n};case`web_search`:return{ok:!0,summary:`Searched`,detail:String(typeof e.payload.query==`string`?e.payload.query:``)};case`web_fetch`:return{ok:!0,summary:`Fetched`,detail:String(typeof e.payload.url==`string`?e.payload.url:``)};default:return{ok:!0,summary:`Executed`,detail:n}}}function Ei(){let e=Array.from(document.querySelectorAll(`.ds-message`)),t=e.filter(e=>Oi(e).length>0);return t.length>0?t:e}function Di(e){let t=Oi(e);return t.length===0?e:ji(t.filter(e=>!ki(e)))??ji(t)??e}function Oi(e){return Array.from(e.querySelectorAll(st)).filter(e=>!e.parentElement?.closest(st))}function ki(e){let t=[e.className,e.parentElement?.className??``,e.getAttribute(`aria-label`)??``,e.getAttribute(`data-testid`)??``,e.getAttribute(`data-role`)??``].join(` `);if(ct.test(t))return!0;let n=Ai(e);return lt.test(n)}function Ai(e){for(let t of Array.from(e.childNodes)){let e=J(t.textContent??``);if(e)return e.slice(0,80)}return J(e.textContent??``).slice(0,80)}function ji(e){return e.length>0?e[e.length-1]:void 0}function Mi(e,t,n){let r=J(e.content).slice(0,80),i=e.url===q();if(r.length>=12){let e=t.find(e=>n.has(e)?!1:J(e.textContent??``).includes(r));if(e)return e}return e.source===`storage`?i?[...t].reverse().find(e=>!n.has(e))??null:null:t.find(e=>!n.has(e))??null}function Ni(){let e=!1,t=()=>{e||(e=!0,requestAnimationFrame(()=>{e=!1,Ii()}))};t(),new MutationObserver(e=>{e.some(Pi)&&t()}).observe(document.body,{childList:!0,subtree:!0,characterData:!0})}function Pi(e){if(e.type===`characterData`)return Z(e.target.textContent);for(let t of e.addedNodes)if(Z(t.textContent))return!0;return!1}function Fi(e){return typeof e==`string`&&ln.test(e)}function Z(e){return typeof e==`string`&&(Fi(e)||je(e))}function Ii(){let e=Li();for(let t of e)Ri(t)}function Li(){let e=new Set,t=h?.closest(`.ds-message`);t&&e.add(t);for(let t of document.querySelectorAll(`#${at}, .dpp-tool-block`)){let n=t.closest(`.ds-message`);n&&e.add(n)}let n=document.querySelectorAll(`.ds-message`);for(let t=n.length-1;t>=0;t--){let r=n[t];e.has(r)||Z(r.textContent)&&e.add(r)}return Array.from(e)}function Ri(e){if(!Z(e.textContent))return;let t=[],n=new Set,r=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode(e){let t=e.parentElement;return!t||t.closest(`.dpp-tool-block`)||t.closest(`script, style, textarea, input, [contenteditable="true"]`)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),i=r.nextNode();for(;i;)t.push(i),i=r.nextNode();let a=null;for(let e of t){let t=e.nodeValue??``,r=Ae(t),i=0,o=``;for(;i<r.length;){if(a){let e=RegExp(`<\\s*/\\s*${yr(a)}\\s*>`,`i`).exec(r.slice(i));if(!e){i=r.length;break}i+=e.index+e[0].length,a=null;continue}let e=cn.exec(r.slice(i));if(!e){o+=r.slice(i);break}o+=r.slice(i,i+e.index),a=e[1],i+=e.index+e[0].length}o!==t&&(e.nodeValue=o,e.parentElement&&n.add(e.parentElement))}for(let t of n)zi(t,e)}function zi(e,t){let n=e;for(;n&&n!==t&&!n.classList.contains(`ds-message`);){let e=n.parentElement,t=(n.textContent??``).trim().length>0,r=!!n.querySelector(`.dpp-tool-block, img, svg, canvas, video, button, input, textarea`);if(!t&&!r){n.remove(),n=e;continue}n=e}}function Bi(){h&&setTimeout(()=>{h?.setAttribute(`data-collapsed`,`true`)},1500)}function Vi(e,t){Di(e).appendChild(t)}function Hi(e){let t=()=>{let t=Ei();if(t.length===0)return!1;let n=t[t.length-1];return Vi(n,e),!0};if(!t()){let e=setInterval(()=>{t()&&clearInterval(e)},200);setTimeout(()=>clearInterval(e),5e3)}}function Ui(){let e=document.getElementById(`root`);if(!e)return 0;function t(e){let n=e.getBoundingClientRect(),r=getComputedStyle(e);if(n.top>=-2&&n.top<=5&&n.height>30&&n.height<=80&&n.width>300&&(r.position===`absolute`||r.position===`sticky`||r.position===`fixed`))return n.bottom;for(let n of e.children){let e=t(n);if(e>0)return e}return 0}return t(e)}function Wi(e){let t=e.backgroundColor,n=e.backgroundImage;return t!==`rgba(0, 0, 0, 0)`&&t!==`transparent`||n!==`none`&&n!==``}function Gi(){let e=document.querySelector(`textarea`);return e?.tagName===`TEXTAREA`?e:null}function Ki(){let e=Gi();if(!e)return null;let t=document.getElementById(`root`),n=e.getBoundingClientRect(),r=null,i=e.parentElement;for(;i&&i!==t&&i!==document.body;){if(i instanceof HTMLElement){let e=getComputedStyle(i),t=i.getBoundingClientRect();if(Ji(t,n,e))return i;!r&&qi(t,n,e)&&(r=i)}i=i.parentElement}return r??e.parentElement}function qi(e,t,n){return e.width>=t.width&&e.height>=t.height&&e.height<=Math.max(260,t.height+180)&&e.width<=Math.max(t.width+260,t.width*1.25)&&(Wi(n)||Number.parseFloat(n.borderRadius)>0||Number.parseFloat(n.borderTopWidth)>0||Number.parseFloat(n.borderBottomWidth)>0)}function Ji(e,t,n){let r=Number.parseFloat(n.borderRadius),i=Number.parseFloat(n.borderTopWidth)>0||Number.parseFloat(n.borderBottomWidth)>0;return qi(e,t,n)&&r>=12&&(Wi(n)||i||n.overflow===`hidden`)}function Yi(){if(!document.body.classList.contains(`dpp-bg-active`))return;let e=document.getElementById(`root`);if(!e)return;let t=Gi();if(!t)return;let n=Ki();if(!n)return;let r=n.parentElement;for(;r&&r!==e&&r!==document.body;){let e=getComputedStyle(r);if(Wi(e)&&r.setAttribute(`data-dpp-transparent`,``),e.position===`sticky`)for(let e of r.children)e.contains(t)||Wi(getComputedStyle(e))&&e.setAttribute(`data-dpp-transparent`,``);r=r.parentElement}}function Xi(){b?.disconnect(),b=null,document.getElementById(`dpp-bg`)?.remove(),document.getElementById(`dpp-bg-style`)?.remove(),document.body.classList.remove(`dpp-bg-active`),document.body.style.removeProperty(`--dpp-overlay-light`),document.body.style.removeProperty(`--dpp-overlay-dark`),document.body.style.removeProperty(`--dpp-blur`)}function Zi(e){let t=l(e);if(E=t,!t.enabled){$i();return}let n=Qi();n.style.setProperty(`--dpp-pet-size`,`${t.size}px`),n.style.opacity=t.opacity.toFixed(2),n.dataset.motion=String(t.motion),n.dataset.position=t.position,da(n,t)}function Qi(){if(Ea(),Ca(),D?.isConnected)return D;let e=document.createElement(`div`);return e.id=p,e.setAttribute(`aria-hidden`,`true`),e.dataset.state=`idle`,e.dataset.motion=`true`,e.innerHTML=Da(),e.addEventListener(`pointerdown`,ha),e.addEventListener(`pointermove`,ga),e.addEventListener(`pointerup`,_a),e.addEventListener(`pointercancel`,va),e.addEventListener(`pointerenter`,ya),document.body.appendChild(e),D=e,k=e.querySelector(`.dpp-pet-bubble`),$t=e.querySelector(`.dpp-pet-bubble-text`),e}function $i(){na(),ra(),sa(),O=null,M=null,N.length=0,D?.remove(),D=null,k=null,$t=null,wa()}function Q(e){!E?.enabled||!D?.isConnected||(na(),ra(),ea(e))}function ea(e){if(!D?.isConnected)return;let t=D.dataset.state;D.dataset.state=e,e!==t&&ia(e)}function $(e=wt){!E?.enabled||!D?.isConnected||(na(),ra(),Xt=setTimeout(()=>{D?.isConnected&&(ea(`idle`),ta()),Xt=null},e))}function ta(){!E?.enabled||!D?.isConnected||(ra(),Zt=setTimeout(()=>{D?.isConnected&&D.dataset.state===`idle`&&ea(`sleepy`),Zt=null},At))}function na(){Xt&&=(clearTimeout(Xt),null)}function ra(){Zt&&=(clearTimeout(Zt),null)}function ia(e){!E?.enabled||!D?.isConnected||O||(ca(),M=e,oa(re(e,en,N)),Lt.has(e)&&aa())}function aa(){ca();let e=Ft-Pt,t=Pt+Math.floor(Math.random()*(e+1));j=setTimeout(()=>{j=null;let e=M;!e||!D?.isConnected||O||D.dataset.state===e&&(oa(re(e,en,N)),aa())},t)}function oa(e){!e||!k||!$t||(la(e),$t.textContent=e,k.dataset.visible=`true`,A&&clearTimeout(A),A=setTimeout(()=>{A=null,k&&(k.dataset.visible=`false`)},Nt))}function sa(){ca(),A&&=(clearTimeout(A),null),k&&(k.dataset.visible=`false`)}function ca(){j&&=(clearTimeout(j),null)}function la(e){for(N.push(e);N.length>It;)N.shift()}function ua(e){if(E?.enabled){if(!e.active){$();return}Q(e.textLength>0?`speaking`:`thinking`)}}function da(e,t){Object.assign(e.style,fa(t))}function fa(e){if(e.position===`custom`&&e.customPosition)return pa(e.customPosition,e.size);let t={top:`auto`,bottom:`${Et}px`};return e.position===`bottom-left`?{...t,left:`${Tt}px`,right:`auto`}:{...t,right:`${Tt}px`,left:`auto`}}function pa(e,t){let n=t,r=t*Ot,i=ma(e.x*window.innerWidth-n/2,window.innerWidth,n),a=ma(e.y*window.innerHeight-r/2,window.innerHeight,r);return{left:`${i}px`,top:`${a}px`,right:`auto`,bottom:`auto`}}function ma(e,t,n){let r=Math.max(Dt,t-n-Dt);return Math.min(r,Math.max(Dt,e))}function ha(e){if(e.button!==0||!E?.enabled||!D?.isConnected)return;let t=D.getBoundingClientRect();O={pointerId:e.pointerId,startClientX:e.clientX,startClientY:e.clientY,startLeft:t.left,startTop:t.top,moved:!1},D.dataset.dragging=`true`,sa(),D.setPointerCapture(e.pointerId),e.preventDefault(),e.stopPropagation()}function ga(e){if(!O||e.pointerId!==O.pointerId||!D?.isConnected)return;let t=D.getBoundingClientRect(),n=e.clientX-O.startClientX,r=e.clientY-O.startClientY,i=ma(O.startLeft+n,window.innerWidth,t.width),a=ma(O.startTop+r,window.innerHeight,t.height);O.moved=O.moved||Math.abs(n)>3||Math.abs(r)>3,D.style.left=`${i}px`,D.style.top=`${a}px`,D.style.right=`auto`,D.style.bottom=`auto`,e.preventDefault(),e.stopPropagation()}function _a(e){ba(e)}function va(e){ba(e)}function ya(){sa()}function ba(e){if(!O||e.pointerId!==O.pointerId||!D?.isConnected)return;let t=O.moved;if(O=null,delete D.dataset.dragging,D.hasPointerCapture(e.pointerId)&&D.releasePointerCapture(e.pointerId),t&&E){let e=l({...E,position:`custom`,customPosition:xa(D)});E=e,W({type:`SAVE_PET`,payload:e})}let n=D.dataset.state;n&&Lt.has(n)&&(M=n,aa()),e.preventDefault(),e.stopPropagation()}function xa(e){let t=e.getBoundingClientRect();return{x:Sa((t.left+t.width/2)/Math.max(window.innerWidth,1)),y:Sa((t.top+t.height/2)/Math.max(window.innerHeight,1))}}function Sa(e){return Number.isFinite(e)?Math.min(1,Math.max(0,e)):.5}function Ca(){Qt||=(window.addEventListener(`resize`,Ta),!0)}function wa(){Qt&&=(window.removeEventListener(`resize`,Ta),!1)}function Ta(){!E?.enabled||!D?.isConnected||O||da(D,E)}function Ea(){if(document.getElementById(ft))return;let e=document.createElement(`style`),t=Oa(chrome.runtime.getURL(jt));e.id=ft,e.textContent=`
    #${p} {
      --dpp-pet-size: 132px;
      position: fixed;
      width: var(--dpp-pet-size);
      height: var(--dpp-pet-size);
      z-index: 2147483646;
      pointer-events: auto;
      cursor: grab;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      transform-origin: center bottom;
      filter: drop-shadow(0 14px 24px rgba(39, 78, 180, 0.20));
      transition: opacity 0.18s ease, transform 0.18s ease;
    }

    #${p}[data-dragging='true'] {
      cursor: grabbing;
    }

    #${p} .dpp-pet-motion,
    #${p} .dpp-pet-sprite {
      width: 100%;
      height: 100%;
    }

    #${p} .dpp-pet-motion {
      transform-origin: center bottom;
    }

    #${p} .dpp-pet-sprite {
      background-image: url("${t}");
      background-repeat: no-repeat;
      background-size: 400% 200%;
      background-position: 0% 0%;
      transform-origin: center bottom;
      will-change: transform, background-position;
    }

    #${p}[data-state='thinking'] .dpp-pet-sprite {
      background-position: 33.333333% 0%;
    }

    #${p}[data-state='speaking'] .dpp-pet-sprite {
      background-position: 66.666667% 0%;
    }

    #${p}[data-state='working'] .dpp-pet-sprite {
      background-position: 100% 0%;
    }

    #${p}[data-state='confused'] .dpp-pet-sprite {
      background-position: 0% 100%;
    }

    #${p}[data-state='success'] .dpp-pet-sprite {
      background-position: 33.333333% 100%;
    }

    #${p}[data-state='error'] .dpp-pet-sprite {
      background-position: 66.666667% 100%;
    }

    #${p}[data-state='sleepy'] .dpp-pet-sprite {
      background-position: 100% 100%;
    }

    #${p}[data-motion='true'] .dpp-pet-motion {
      animation: dpp-pet-float 4.8s cubic-bezier(0.45, 0, 0.2, 1) infinite;
    }

    #${p}[data-motion='true'][data-state='thinking'] .dpp-pet-sprite {
      animation: dpp-pet-think 2.2s ease-in-out infinite;
    }

    #${p}[data-motion='true'][data-state='speaking'] .dpp-pet-sprite {
      animation: dpp-pet-speak 0.72s ease-in-out infinite;
    }

    #${p}[data-motion='true'][data-state='working'] .dpp-pet-sprite {
      animation: dpp-pet-work 1s ease-in-out infinite;
    }

    #${p}[data-motion='true'][data-state='confused'] .dpp-pet-sprite {
      animation: dpp-pet-confused 1.8s ease-in-out infinite;
    }

    #${p}[data-motion='true'][data-state='success'] .dpp-pet-sprite {
      animation: dpp-pet-success 1.1s ease-out 1;
    }

    #${p}[data-motion='true'][data-state='error'] .dpp-pet-sprite {
      animation: dpp-pet-error 0.42s ease-in-out 2;
    }

    #${p}[data-motion='true'][data-state='sleepy'] .dpp-pet-motion {
      animation-duration: 7s;
    }

    @keyframes dpp-pet-float {
      0%, 100% { transform: translateY(0) rotate(-1deg); }
      50% { transform: translateY(-7px) rotate(1deg); }
    }

    @keyframes dpp-pet-think {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      50% { transform: translateX(-3px) rotate(-1.5deg); }
    }

    @keyframes dpp-pet-speak {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.035); }
    }

    @keyframes dpp-pet-work {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    @keyframes dpp-pet-confused {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      35% { transform: translateY(-4px) rotate(-3deg); }
      70% { transform: translateY(-2px) rotate(3deg); }
    }

    @keyframes dpp-pet-success {
      0% { transform: scale(0.96) translateY(2px); }
      55% { transform: scale(1.08) translateY(-6px); }
      100% { transform: scale(1) translateY(0); }
    }

    @keyframes dpp-pet-error {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      75% { transform: translateX(4px); }
    }

    #${p} .dpp-pet-bubble {
      position: absolute;
      bottom: calc(100% - 24px);
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none;
      z-index: 1;
      max-width: 200px;
    }

    #${p} .dpp-pet-bubble-text {
      display: inline-block;
      position: relative;
      max-width: 200px;
      box-sizing: border-box;
      padding: 5px 11px;
      border-radius: 13px;
      border: 1px solid rgba(64, 110, 240, 0.45);
      background: rgba(255, 255, 255, 0.94);
      -webkit-backdrop-filter: blur(8px);
      backdrop-filter: blur(8px);
      box-shadow: 0 8px 18px rgba(39, 78, 180, 0.18);
      color: #1d2433;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;
      letter-spacing: 0.2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      opacity: 0;
      transform: translateY(6px) scale(0.94);
      transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34, 1.3, 0.64, 1);
      will-change: opacity, transform;
    }

    #${p} .dpp-pet-bubble-text::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: rgba(255, 255, 255, 0.94);
      filter: drop-shadow(0 2px 1px rgba(39, 78, 180, 0.12));
    }

    #${p} .dpp-pet-bubble[data-visible='true'] .dpp-pet-bubble-text {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    #${p}[data-motion='true'] .dpp-pet-bubble[data-visible='true'] .dpp-pet-bubble-text {
      animation: dpp-pet-bubble-float 3.6s ease-in-out infinite;
    }

    @keyframes dpp-pet-bubble-float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-2.5px) scale(1); }
    }

    @media (prefers-color-scheme: dark) {
      #${p} .dpp-pet-bubble-text {
        border-color: rgba(120, 156, 255, 0.5);
        background: rgba(32, 38, 56, 0.92);
        color: #eef2ff;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
      }

      #${p} .dpp-pet-bubble-text::after {
        border-top-color: rgba(32, 38, 56, 0.92);
        filter: none;
      }
    }

    @media (max-width: 720px) {
      #${p}:not([data-position='custom']) {
        bottom: 76px !important;
        transform: scale(0.86);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #${p} *,
      #${p} .dpp-pet-motion,
      #${p} .dpp-pet-sprite {
        animation: none !important;
        transition: none !important;
      }
    }
  `,document.head.appendChild(e)}function Da(){return`
    <div class="dpp-pet-bubble" data-visible="false">
      <span class="dpp-pet-bubble-text"></span>
    </div>
    <div class="dpp-pet-motion">
      <div class="dpp-pet-sprite"></div>
    </div>
  `}function Oa(e){return e.replace(/\\/g,`\\\\`).replace(/"/g,`\\"`).replace(/\)/g,`\\)`).replace(/\n/g,`\\a `).replace(/\r/g,`\\d `)}function ka(e){let t=ye(e);if(!t?.enabled){Xi();return}let n=(t.type===`url`?t.url:t.imageData)||null;if(!n){Xi();return}let r=document.getElementById(`dpp-bg`),i=document.getElementById(`dpp-bg-style`);document.body.classList.add(`dpp-bg-active`);let a=(1-t.opacity).toFixed(3),o=((1-t.opacity)*8).toFixed(1);document.body.style.setProperty(`--dpp-overlay-light`,`rgba(255, 255, 255, ${a})`),document.body.style.setProperty(`--dpp-overlay-dark`,`rgba(30, 30, 30, ${a})`),document.body.style.setProperty(`--dpp-blur`,`blur(${o}px)`);let s=Ui(),c=r||document.createElement(`div`);c.id=`dpp-bg`,Object.assign(c.style,{position:`fixed`,top:`${s}px`,left:`0`,right:`0`,bottom:`0`,zIndex:`-1`,backgroundImage:`url("${Oa(n)}")`,backgroundSize:`cover`,backgroundPosition:`center`,backgroundRepeat:`no-repeat`,pointerEvents:`none`}),r||document.body.prepend(c);let l=i||document.createElement(`style`);l.id=`dpp-bg-style`,l.textContent=`
    #dpp-bg::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--dpp-overlay-light);
      backdrop-filter: var(--dpp-blur);
      -webkit-backdrop-filter: var(--dpp-blur);
      pointer-events: none;
    }

    body.dpp-bg-active,
    body.dpp-bg-active #root,
    body.dpp-bg-active #__next {
      background: transparent !important;
    }

    body.dpp-bg-active #root > div,
    body.dpp-bg-active #__next > div {
      background: transparent !important;
    }

    body.dpp-bg-active #root > div > div,
    body.dpp-bg-active #__next > div > div {
      background: transparent !important;
    }

    body.dpp-bg-active [data-dpp-transparent] {
      background: transparent !important;
    }

    body.dpp-theme-dark #dpp-bg::after {
      background: var(--dpp-overlay-dark);
    }

    @media (prefers-color-scheme: dark) {
      body:not(.dpp-theme-light) #dpp-bg::after {
        background: var(--dpp-overlay-dark);
      }
    }
  `,i||document.head.appendChild(l),Yi(),b?.disconnect(),b=new MutationObserver(()=>{document.body.classList.contains(`dpp-bg-active`)&&Yi()}),b.observe(document.body,{childList:!0,subtree:!0})}var Aa={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)},ja=new WeakMap;function Ma(){let e=globalThis;return Na(()=>e.browser)||Na(()=>e.chrome)}function Na(e){try{return e()}catch(e){if(Pa(e))return;throw e}}function Pa(e){let t=e instanceof Error?e.message:String(e);return t.includes(`Extension context invalidated`)||t.includes(`context invalidated`)}function Fa(e){let t=ja.get(e);if(t)return t;let n=new Proxy(e,{get(e,t,n){let r;try{r=Reflect.get(e,t,n)}catch(e){if(Pa(e))return;throw e}return typeof r==`function`?(...t)=>{try{return r.apply(e,t)}catch(e){if(Pa(e))return;throw e}}:r&&typeof r==`object`?Fa(r):r}});return ja.set(e,n),n}var Ia=Ma(),La=Ia&&typeof Ia==`object`?Fa(Ia):Ia,Ra=class e extends Event{static EVENT_NAME=za(`wxt:locationchange`);constructor(t,n){super(e.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};function za(e){return`${La?.runtime?.id}:content:${e}`}var Ba=typeof globalThis.navigation?.addEventListener==`function`;function Va(e){let t,n=!1;return{run(){n||(n=!0,t=new URL(location.href),Ba?globalThis.navigation.addEventListener(`navigate`,e=>{let n=new URL(e.destination.url);n.href!==t.href&&(window.dispatchEvent(new Ra(n,t)),t=n)},{signal:e.signal}):e.setInterval(()=>{let e=new URL(location.href);e.href!==t.href&&(window.dispatchEvent(new Ra(e,t)),t=e)},1e3))}}}var Ha=class e{static SCRIPT_STARTED_MESSAGE_TYPE=za(`wxt:content-script-started`);id;abortController;locationWatcher=Va(this);constructor(e,t){this.contentScriptName=e,this.options=t,this.id=Math.random().toString(36).slice(2),this.abortController=new AbortController,this.stopOldScripts(),this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return La.runtime?.id??this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener(`abort`,e),()=>this.signal.removeEventListener(`abort`,e)}block(){return new Promise(()=>{})}setInterval(e,t){let n=setInterval(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearInterval(n)),n}setTimeout(e,t){let n=setTimeout(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearTimeout(n)),n}requestAnimationFrame(e){let t=requestAnimationFrame((...t)=>{this.isValid&&e(...t)});return this.onInvalidated(()=>cancelAnimationFrame(t)),t}requestIdleCallback(e,t){let n=requestIdleCallback((...t)=>{this.signal.aborted||e(...t)},t);return this.onInvalidated(()=>cancelIdleCallback(n)),n}addEventListener(e,t,n,r){t===`wxt:locationchange`&&this.isValid&&this.locationWatcher.run(),e.addEventListener?.(t.startsWith(`wxt:`)?za(t):t,n,{...r,signal:this.signal})}notifyInvalidated(){this.abort(`Content script context invalidated`),Aa.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){document.dispatchEvent(new CustomEvent(e.SCRIPT_STARTED_MESSAGE_TYPE,{detail:{contentScriptName:this.contentScriptName,messageId:this.id}})),window.postMessage({type:e.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:this.id},`*`)}verifyScriptStartedEvent(e){let t=e.detail?.contentScriptName===this.contentScriptName,n=e.detail?.messageId===this.id;return t&&!n}listenForNewerScripts(){let t=e=>{!(e instanceof CustomEvent)||!this.verifyScriptStartedEvent(e)||this.notifyInvalidated()};document.addEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t),this.onInvalidated(()=>document.removeEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t))}},Ua={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)};return(async()=>{try{let{main:e,...t}=dn;return await e(new Ha(`content`,t))}catch(e){throw Ua.error(`The content script "content" crashed on startup!`,e),e}})()})();
content;