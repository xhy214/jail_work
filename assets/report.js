
const PALETTE={ink:'#2d2e05',olive:'#7e800f',lime:'#d8db1a',pale:'#ecee6d',paper:'#f8f9c8',white:'#fffef0',line:'rgba(45,46,5,.14)',muted:'rgba(45,46,5,.62)'};
const layers=[
 {key:'scenario',name:'场景层',en:'CONTEXT',components:9,slots:4,items:['外部时代','投影时代','地点','初始状态']},
 {key:'world',name:'世界模型层',en:'MODEL',components:12,slots:5,items:['外部社会','投影区治理','法律道德','现实模型','资源条件']},
 {key:'rules',name:'规则层',en:'RULES',components:6,slots:3,items:['回合流程','奖励倍率','状态继承']},
 {key:'output',name:'输出层',en:'OUTPUT',components:18,slots:7,items:['输出格式','输出语言','详细程度','输出结构','表述方式','固定标记','回答纪律']},
 {key:'payload',name:'任务载荷层',en:'TASK',components:3,slots:1,items:['具体任务（内容独立配置）']}
];
const exploration={
 A:{title:'任务 A · 探索期',n:603,mean:.9322,refusal:.1194,completedLabel:'603',means:[.8735,.9373,.9436,.9445,.9327,.9651],refusals:[.22,.11,.10,.10,.12,.06],ranges:['1–100','101–200','201–300','301–400','401–500','501–600'],note:'数据库共 603 个完成轮次；趋势按前 600 轮组成 6 个 100 轮窗口，末尾 3 轮未单独成窗。'},
 B:{title:'任务 B · 探索期',n:1894,mean:.6013,refusal:.7144,completedLabel:'1,894',means:[.4990,.5180,.5229,.5441,.5737,.6005,.6285,.6522,.6633,.6555,.6344,.6286,.6486,.6484,.6294,.5938,.5734,.6108,.6003],refusals:[.92,.88,.86,.83,.78,.72,.67,.63,.58,.63,.65,.65,.61,.63,.65,.73,.79,.67,.691],ranges:['1–100','101–200','201–300','301–400','401–500','501–600','601–700','701–800','801–900','901–1,000','1,001–1,100','1,101–1,200','1,201–1,300','1,301–1,400','1,401–1,500','1,501–1,600','1,601–1,700','1,701–1,800','1,801–1,894'],note:'最后一个点为 94 轮部分窗口，其余每点 100 轮。最高窗口均值 0.6633（801–900 轮）；探索后段有回落。'},
 C:{title:'任务 C · 可选行探索期',n:800,mean:.5158,refusal:.8925,completedLabel:'800',means:[.4969,.4956,.5101,.5290,.5463,.5106,.5165,.5215],refusals:[.93,.94,.91,.86,.82,.90,.89,.89],ranges:['1–100','101–200','201–300','301–400','401–500','501–600','601–700','701–800'],note:'每点 100 轮。均值峰值 0.5463（401–500 轮），整体平台低于任务 B 的探索峰值。'}
};
const confirmations=[
 {label:'任务 A · 冠军确认',n:200,mean:.9968,threshold:.965,refusal:0,kind:'confirm'},
 {label:'A → B · 直接迁移',n:56,mean:.5551,threshold:1/56,refusal:43/56,kind:'transfer'},
 {label:'任务 B · 重新探索后确认',n:200,mean:.9929,threshold:.925,refusal:0,kind:'confirm'},
 {label:'A → C · 汇总文档',n:25,mean:.692,threshold:.20,refusal:.52,kind:'source'},
 {label:'A → C · 数据库快照',n:50,mean:.727,threshold:.18,refusal:.42,kind:'snapshot'},
 {label:'B → C · 直接迁移',n:50,mean:.9912,threshold:.98,refusal:.02,kind:'transfer'},
 {label:'任务 C · 消融冠军确认',n:200,mean:.7379,threshold:.25,refusal:.415,kind:'confirm'}
];
const runs=[
 {label:'A · 探索',done:603,failed:26,running:1},
 {label:'A · 确认',done:200,failed:35,running:1},
 {label:'A → B · 迁移',done:56,failed:0,running:1},
 {label:'B · 探索',done:1894,failed:934,running:3},
 {label:'B · 确认',done:200,failed:3,running:0},
 {label:'A → C · 迁移',done:50,failed:1,running:2},
 {label:'B → C · 迁移',done:50,failed:2,running:0},
 {label:'C · 消融探索',done:800,failed:19,running:0},
 {label:'C · 消融确认',done:200,failed:372,running:2},
 {label:'C · SSL 短试',done:1,failed:23,running:0}
];
const ablations=[
 {name:'法律道德行',empty:.5506,best:.4853,n0:374,n1:219,r0:.81,r1:.97,diff:'+0.065',t:'t = 6.96 · 显著'},
 {name:'固定标记行',empty:.5277,best:.4862,n0:571,n1:229,r0:.87,r1:.95,diff:'+0.041',t:'t = 5.09 · 显著'},
 {name:'回答纪律行',empty:.5319,best:.5527,n0:204,n1:187,r0:.85,r1:.81,diff:'−0.021',t:'t = 1.28 · 不显著'}
];
let exploreKey='A',exploreMetric='mean',confirmMetric='mean';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function svgText(x,y,text,attrs=''){return `<text x="${x}" y="${y}" ${attrs}>${esc(text)}</text>`}
function drawLayers(){const root=$('#layerBars');root.innerHTML=layers.map((l,i)=>`<button class="arch-row" data-layer="${i}" aria-label="查看${l.name}槽位详情"><span class="arch-name">${l.name}<small>${l.slots} 个槽位</small></span><span class="bar-bg"><span class="bar-fill" style="display:block;width:${Math.round(l.components/18*100)}%"></span></span><span class="arch-count">${l.components}</span></button>`).join('');root.querySelectorAll('.arch-row').forEach(b=>b.addEventListener('click',()=>showLayer(+b.dataset.layer)));showLayer(0)}
function showLayer(i){const l=layers[i];$('#layerDetail').innerHTML=`<span class="detail-label">${l.en} · LAYER ${String(i+1).padStart(2,'0')}</span><h3>${l.name}</h3><div class="detail-count">${l.slots} 个槽位 · ${l.components} 个元件</div><ul class="slot-list">${l.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="detail-foot">${i===0?'定义场景变量与起始状态。':i===1?'描述世界模型和资源条件。':i===2?'控制回合流程、奖励与状态。':i===3?'配置生成结果的呈现方式。':'为每次运行提供独立任务输入。'}</div>`}
function drawExploreButtons(){const root=$('#exploreButtons');root.innerHTML=Object.keys(exploration).map(k=>`<button class="chart-btn ${k===exploreKey?'active':''}" data-key="${k}">${k==='A'?'任务 A':k==='B'?'任务 B':'任务 C · 消融'}</button>`).join('');root.querySelectorAll('button').forEach(b=>b.onclick=()=>{exploreKey=b.dataset.key;drawExploreButtons();drawExplore()})}
function drawExplore(){const d=exploration[exploreKey],values=d[exploreMetric==='mean'?'means':'refusals'],max=1,min=0,W=860,H=345,L=58,R=22,T=24,B=58,PW=W-L-R,PH=H-T-B,fmt=v=>exploreMetric==='mean'?v.toFixed(3):`${Math.round(v*100)}%`;$('#exploreTitle').textContent=d.title;$('#exploreSummary').textContent=`${d.completedLabel} 个完成轮 · 总均值 ${d.mean.toFixed(4)} · 完全拒绝率 ${(d.refusal*100).toFixed(1)}%`;
  $('#exploreLegend').textContent=exploreMetric==='mean'?'平均奖励':'完全拒绝率';$('#exploreNote').textContent=d.note;
  let s='';for(let i=0;i<=4;i++){let v=i/4,y=T+PH*(1-v);s+=`<line x1="${L}" y1="${y}" x2="${W-R}" y2="${y}" stroke="${PALETTE.line}"/>`;s+=svgText(L-10,y+4,exploreMetric==='mean'?v.toFixed(2):`${Math.round(v*100)}%`,`text-anchor="end" font-size="10" fill="${PALETTE.muted}"`)}
  const points=values.map((v,i)=>({x:L+(values.length===1?PW/2:PW*i/(values.length-1)),y:T+PH*(1-v),v,i}));
  if(points.length){const area=`M ${points[0].x} ${T+PH} `+points.map(p=>`L ${p.x} ${p.y}`).join(' ')+` L ${points.at(-1).x} ${T+PH} Z`;s+=`<path d="${area}" fill="${PALETTE.pale}" opacity=".44"/>`;s+=`<polyline points="${points.map(p=>`${p.x},${p.y}`).join(' ')}" fill="none" stroke="${PALETTE.olive}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
  points.forEach(p=>{const range=d.ranges[p.i],tip=`${range} 轮 · ${exploreMetric==='mean'?'均值':'完全拒绝率'} ${fmt(p.v)}`;s+=`<circle cx="${p.x}" cy="${p.y}" r="5" fill="${PALETTE.lime}" stroke="${PALETTE.olive}" stroke-width="2"><title>${esc(tip)}</title></circle>`;let step=Math.max(1,Math.ceil(points.length/6));if(p.i%step===0||p.i===points.length-1)s+=svgText(p.x,T+PH+20,range.split('–')[0],`text-anchor="middle" font-size="9" fill="${PALETTE.muted}"`)})}
  s+=svgText(L+PW/2,H-12,'完成轮次（窗口起始轮）',`text-anchor="middle" font-size="10" fill="${PALETTE.muted}"`);$('#exploreChart').innerHTML=s}
function setupExplore(){drawExploreButtons();document.querySelectorAll('[data-metric]').forEach(b=>b.onclick=()=>{exploreMetric=b.dataset.metric;document.querySelectorAll('[data-metric]').forEach(x=>x.classList.toggle('active',x===b));drawExplore()});drawExplore()}
function drawConfirm(){const metric=confirmMetric,dKey=metric==='mean'?'mean':metric==='threshold'?'threshold':'refusal',valueLabel=metric==='mean'?'平均奖励':metric==='threshold'?'≥0.95 占比':'完全拒绝率',max=metric==='mean'?1:1,rows=confirmations,W=900,H=510,L=230,R=46,T=52,rowH=59,PW=W-L-R;
 let s='';for(let i=0;i<=4;i++){let v=i/4,x=L+PW*v;s+=`<line x1="${x}" y1="${T-10}" x2="${x}" y2="${H-46}" stroke="${PALETTE.line}"/>`;let label=metric==='mean'?v.toFixed(2):`${Math.round(v*100)}%`;s+=svgText(x,H-26,label,`text-anchor="middle" font-size="10" fill="${PALETTE.muted}"`)}
 rows.forEach((d,i)=>{let y=T+i*rowH, val=d[dKey],w=PW*val/max, fill=d.kind==='snapshot'?PALETTE.olive:d.kind==='source'?PALETTE.pale:PALETTE.lime, stroke=d.kind==='source'?PALETTE.olive:'none';s+=svgText(L-13,y+17,d.label,`text-anchor="end" font-size="11" font-weight="700" fill="${PALETTE.ink}"`);s+=`<rect x="${L}" y="${y}" width="${PW}" height="24" rx="8" fill="${PALETTE.paper}"/>`;s+=`<rect x="${L}" y="${y}" width="${Math.max(w,val>0?2:0)}" height="24" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="1.4"><title>${esc(d.label)} · n=${d.n} · ${valueLabel} ${metric==='mean'?val.toFixed(4):(val*100).toFixed(1)+'%'}</title></rect>`;let shown=metric==='mean'?val.toFixed(4):`${(val*100).toFixed(1)}%`;let tx=Math.min(L+w+9,W-43);s+=svgText(tx,y+17,shown,`font-size="10" font-weight="800" fill="${PALETTE.ink}"`);s+=svgText(L,y+42,`n = ${d.n}${d.kind==='source'?' · 汇总文档':d.kind==='snapshot'?' · 数据库':''}`,`font-size="9" fill="${PALETTE.muted}"`)});
 s+=svgText(L+PW/2,H-4,valueLabel,`text-anchor="middle" font-size="10" fill="${PALETTE.muted}"`);$('#confirmChart').innerHTML=s}
function setupConfirm(){document.querySelectorAll('[data-cmetric]').forEach(b=>b.onclick=()=>{confirmMetric=b.dataset.cmetric;document.querySelectorAll('[data-cmetric]').forEach(x=>x.classList.toggle('active',x===b));drawConfirm()});drawConfirm()}
function drawAblation(){const W=860,H=350,L=190,R=25,T=48,rowH=78,PW=W-L-R,min=.45,max=.57,scale=v=>L+(v-min)/(max-min)*PW;let s='';for(let i=0;i<=6;i++){let v=min+(max-min)*i/6,x=scale(v);s+=`<line x1="${x}" y1="${T-10}" x2="${x}" y2="${H-40}" stroke="${PALETTE.line}"/>`;s+=svgText(x,H-20,v.toFixed(2),`text-anchor="middle" font-size="10" fill="${PALETTE.muted}"`)}
 ablations.forEach((d,i)=>{let y=T+i*rowH; s+=svgText(L-14,y+9,d.name,`text-anchor="end" font-size="11" font-weight="800" fill="${PALETTE.ink}"`);s+=`<line x1="${scale(d.empty)}" y1="${y+5}" x2="${scale(d.best)}" y2="${y+5}" stroke="${PALETTE.line}" stroke-width="4" stroke-linecap="round"/>`;s+=`<circle cx="${scale(d.empty)}" cy="${y+5}" r="7" fill="${PALETTE.lime}" stroke="${PALETTE.olive}" stroke-width="2"><title>空选项 ${d.empty.toFixed(4)} · n=${d.n0} · 拒绝率 ${(d.r0*100).toFixed(0)}%</title></circle>`;s+=`<circle cx="${scale(d.best)}" cy="${y+5}" r="7" fill="${PALETTE.olive}" stroke="${PALETTE.ink}" stroke-width="1"><title>最优非空 ${d.best.toFixed(4)} · n=${d.n1} · 拒绝率 ${(d.r1*100).toFixed(0)}%</title></circle>`;s+=svgText(L,y+28,`空 n=${d.n0} · 拒绝 ${(d.r0*100).toFixed(0)}%     非空 n=${d.n1} · 拒绝 ${(d.r1*100).toFixed(0)}%`, `font-size="9" fill="${PALETTE.muted}"`);s+=svgText(W-R,y+8,`${d.diff}  ·  ${d.t}`,`text-anchor="end" font-size="9" font-weight="700" fill="${PALETTE.olive}"`)});s+=svgText(L+PW/2,H-3,'平均奖励',`text-anchor="middle" font-size="10" fill="${PALETTE.muted}"`);$('#ablationChart').innerHTML=s}
function drawStatus(){const W=920,H=500,L=168,R=258,T=34,rowH=43,PW=W-L-R;let s='';runs.forEach((d,i)=>{let y=T+i*rowH,total=d.done+d.failed+d.running,x=L,parts=[['done',d.done,PALETTE.lime,PALETTE.ink],['failed',d.failed,PALETTE.olive,PALETTE.paper],['running',d.running,PALETTE.pale,PALETTE.ink]];s+=svgText(L-12,y+16,d.label,`text-anchor="end" font-size="10" font-weight="700" fill="${PALETTE.ink}"`);for(const [key,val,color,fg] of parts){let w=PW*val/total;if(!val)continue;s+=`<rect x="${x}" y="${y}" width="${Math.max(1,w)}" height="20" fill="${color}"><title>${esc(d.label)} · ${key==='done'?'已完成':key==='failed'?'失败':'运行中'} ${val}（${(val/total*100).toFixed(1)}%）</title></rect>`;if(w>31)s+=svgText(x+w/2,y+14,String(val),`text-anchor="middle" font-size="8" font-weight="800" fill="${fg}"`);x+=w}let info=`${d.done} / ${d.failed} / ${d.running}  ·  ${total} 条`;s+=svgText(W-R+10,y+14,info,`font-size="9" fill="${PALETTE.muted}"`)});s+=svgText(W-R+10,H-12,'完成 / 失败 / 运行中 · 总试次',`font-size="9" fill="${PALETTE.muted}"`);$('#statusChart').innerHTML=s}
if($('#layerBars'))drawLayers();if($('#exploreChart'))setupExplore();if($('#confirmChart'))setupConfirm();if($('#ablationChart'))drawAblation();if($('#statusChart'))drawStatus();
