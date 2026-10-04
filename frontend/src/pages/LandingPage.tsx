// @ts-nocheck

import React, { useEffect, useRef } from 'react';
import './LandingPage.css';
import * as THREE from 'three';
import Lenis from 'lenis';

export const LandingPage = ({ onLaunch }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    window.THREE = THREE;
    window.Lenis = Lenis;

    
    const root = containerRef.current;
    if (!root) return;
    const $ = s => root.querySelector(s);
    const $$ = s => root.querySelectorAll(s);
    
    // Store cleanup items
    const observers = [];
    const rafIds = [];
    const eventListeners = [];
    
    // Override globals safely within this effect scope by declaring local variables
    const addEventListener = (event, handler, options) => {
      window.addEventListener(event, handler, options);
      eventListeners.push({ event, handler, options, target: window });
    };
    
    const requestAnimationFrame = (cb) => {
      const id = window.requestAnimationFrame(cb);
      rafIds.push(id);
      return id;
    };
    
    const OriginalIntersectionObserver = window.IntersectionObserver;
    class IntersectionObserver extends OriginalIntersectionObserver {
      constructor(cb, options) {
        super(cb, options);
        observers.push(this);
      }
    }
    const RM=window.matchMedia('(prefers-reduced-motion:reduce)').matches,MOB=window.innerWidth<820;
// nav + smooth scroll
addEventListener('scroll',()=>$('#nav').classList.toggle('on',scrollY>40),{passive:true});
if(window.Lenis&&!RM){const l=new Lenis({lerp:.08});(function r(t){l.raf(t);requestAnimationFrame(r)})(0);}
// reveal
const io=new IntersectionObserver(e=>e.forEach(x=>x.isIntersecting&&x.target.classList.add('in')),{threshold:.35});
// cursor + magnetic
const cur=$('#cur');
if(!MOB&&!RM){addEventListener('mousemove',e=>{cur.style.transform=`translate(${e.clientX}px,${e.clientY}px)`});
root.querySelectorAll('a,button,.al li').forEach(el=>{el.addEventListener('mouseenter',()=>cur.classList.add('h'));el.addEventListener('mouseleave',()=>cur.classList.remove('h'))});
root.querySelectorAll('.mag').forEach(b=>{b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.3}px)`});b.addEventListener('mouseleave',()=>b.style.transform='')})}
else cur.style.display='none';
// journey
const JN=[['Observe','Signals','Market & weather signals','Observed · Bay of Bengal','Flood warnings for the Odisha, West Bengal and Bangladesh coasts arrive alongside moves in energy markets.','DEMO DATA'],
['Read','News','Coverage turns cautious','Sentiment agent · FinBERT','Regional energy headlines are scored as they publish. Tone shifts negative within hours.','DEMO DATA'],
['Recall','History','Today’s risk has a history','Historical RAG','Retrieval finds a past coastal-storm supply shock with 0.82 similarity and its market reaction.','DEMO DATA'],
['Measure','Risk','Exposure becomes a number','Risk agent','On a $2.4M portfolio, VaR reads $184K and expected shortfall $241K, with concentration flagged high.','DEMO DATA'],
['Simulate','Scenario','Simulate several futures','Scenario engine','Event intensity, energy exposure and hedge size are varied to compare outcomes side by side.','HYPOTHETICAL'],
['Decide','Decision','A simulated response, fully traced','Hedging agent','Reduce energy equities by 6%. Each step above links back to its source and timestamp.','SIMULATION ONLY · NOT EXECUTED']];
const jp=$('#jb'),ja=$('#ja'),jw=$('#jglow'),jn=$('#jn'),D='M50 440C150 440 190 150 290 150C390 150 360 400 440 390C520 380 520 130 560 70';
[jp,ja,jw].forEach(x=>x.setAttribute('d',D));
const L=jp.getTotalLength(),F=[0,.2,.42,.62,.8,1];
[jp,ja,jw].forEach(x=>{x.style.strokeDasharray=L;x.style.strokeDashoffset=L});
jn.innerHTML=JN.map((d,i)=>{const p=jp.getPointAtLength(F[i]*L);return `<g class="nd" data-i="${i}" transform="translate(${p.x} ${p.y})" tabindex="0" role="button" aria-label="${d[2]}"><circle class="hit" r="30"/><circle class="o" r="20"/><circle class="m" r="11"/><circle class="c" r="5.5"/><text y="-34">${d[1]}</text></g>`}).join('');
const NS=[...jn.children];
function jsel(i,first){NS.forEach((n,k)=>{n.classList.toggle('sel',k==i);n.classList.toggle('fut',k>i);n.classList.toggle('fin',k==5)});
const off=L*(1-F[i]);ja.style.strokeDashoffset=off;jw.style.strokeDashoffset=off;
const c=$('#jc'),d=JN[i],set=()=>{$('#jk').textContent=`Milestone ${i+1} of ${JN.length} · ${d[0]}`;$('#jt').textContent=d[2];$('#js').textContent=d[3];$('#jd').textContent=d[4];$('#jtag').textContent=d[5]};
c.getAnimations().forEach(a=>a.cancel());
if(first||RM)set();else c.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateX(-18px)'}],{duration:200,fill:'forwards'}).onfinish=()=>{set();c.animate([{opacity:0,transform:'translateX(18px)'},{opacity:1,transform:'none'}],{duration:360,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'})}}
jn.addEventListener('click',e=>{const g=e.target.closest('.nd');g&&jsel(+g.dataset.i)});
jn.addEventListener('keydown',e=>{const g=e.target.closest('.nd');if(!g)return;const i=+g.dataset.i;
if(e.key=='Enter'||e.key==' '){e.preventDefault();jsel(i)}
else if(e.key=='ArrowRight'||e.key=='ArrowDown'){e.preventDefault();NS[Math.min(i+1,5)].focus()}
else if(e.key=='ArrowLeft'||e.key=='ArrowUp'){e.preventDefault();NS[Math.max(i-1,0)].focus()}});
jsel(0,true);
new IntersectionObserver((e,o)=>{if(!e[0].isIntersecting)return;o.disconnect();
jp.style.strokeDashoffset=0;NS.forEach((n,k)=>setTimeout(()=>n.classList.add('show'),RM?0:200+F[k]*1400))},{threshold:.3}).observe($('#jsv'));
// signal network
const SG=[['Markets','Prices, volatility'],['News','Headlines, filings'],['Weather','Storms, floods, heat'],['Macro','Rates, inflation'],['Sentiment','Tone of coverage'],['History','Past analogs']];
const sv=$('#sgs'),tp=$('#sgt'),sec=$('#signals'),XN='http://www.w3.org/2000/svg';
let sel=-1,hov=-1,mob,W,H,Ps,Cc,paths=[],gs=[],pts=[],dv,run=false,vis=false,started=RM;
const el=(n,a,p)=>{const e=document.createElementNS(XN,n);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
function ui(){const a=hov>=0?hov:sel;gs.forEach((g,i)=>g.classList.toggle('on',i==a));paths.forEach((p,i)=>{p.classList.toggle('on',i==a);p.classList.toggle('mute',a>=0&&i!=a)});
if(a<0){tp.classList.remove('v');return}
tp.innerHTML=`<b>${SG[a][0]}</b>${SG[a][1]}`;tp.classList.add('v');
if(mob){tp.style.left='0';tp.style.top='0';tp.style.transform='none'}else{tp.style.left=Ps[a][0]/W*100+'%';tp.style.top=(Ps[a][1]-24)/H*100+'%';tp.style.transform='translate(-50%,-100%)'}}
function buildSg(){mob=innerWidth<820;W=mob?400:1200;H=mob?440:430;sv.setAttribute('viewBox',`0 0 ${W} ${H}`);sv.innerHTML='';paths=[];gs=[];pts=[];
Cc=mob?[200,222]:[600,112];
Ps=SG.map((_,i)=>{if(!mob)return[100+i*200,330];const a=-Math.PI/2+i*Math.PI/3;return[200+Math.cos(a)*118,222+Math.sin(a)*160]});
dv=el('path',{d:`M0 14H${W}`,class:'dv'},sv);dv.style.strokeDasharray=W;dv.style.strokeDashoffset=W;
Ps.forEach((p,i)=>{let d;if(!mob)d=`M${p[0]} ${p[1]-10}C${p[0]} 235,${Cc[0]} 215,${Cc[0]} ${Cc[1]+34}`;
else{const dx=Cc[0]-p[0],dy=Cc[1]-p[1],l=Math.hypot(dx,dy),q=(i%2?1:-1)*.18,nx=-dy*q,ny=dx*q;d=`M${p[0]} ${p[1]}C${p[0]+dx*.3+nx} ${p[1]+dy*.3+ny},${p[0]+dx*.65+nx} ${p[1]+dy*.65+ny},${Cc[0]-dx/l*44} ${Cc[1]-dy/l*44}`}
const e=el('path',{d,class:'sp'},sv),L=e.getTotalLength();e.style.strokeDasharray=L;e.style.strokeDashoffset=L;e.L=L;paths.push(e)});
const ce=el('g',{class:'ce',transform:`translate(${Cc[0]} ${Cc[1]})`},sv),R=mob?40:26;
el('circle',{class:'rp',r:R},ce);el('circle',{class:'rg',r:R},ce);if(!mob)el('circle',{class:'cd',r:8},ce);
[['FINANCIAL',mob?-2:-52],['INTELLIGENCE',mob?11:-36]].forEach(t=>{el('text',{class:'ct',y:t[1]},ce).textContent=t[0]});
SG.forEach((s,i)=>{const [x,y]=Ps[i],g=el('g',{class:'sg',tabindex:0,role:'button','aria-label':s[0]+': '+s[1],transform:`translate(${x} ${y})`},sv);
el('circle',{r:30,fill:'transparent'},g);el('circle',{class:'gl',r:14},g);el('circle',{class:'ind',r:6},g);
let lx=0,ly=46,an='middle';if(mob){const dx=x-200,dy=y-222;if(Math.abs(dx)<10){ly=dy<0?-22:36}else{lx=dx>0?18:-18;ly=5;an=dx>0?'start':'end'}}
el('text',{class:'sn',x:lx,y:ly,'text-anchor':an},g).textContent=s[0];
if(!mob)el('text',{class:'sd',x:0,y:66,'text-anchor':'middle'},g).textContent=s[1];
g.onmouseenter=g.onfocus=()=>{hov=i;ui()};g.onmouseleave=g.onblur=()=>{hov=-1;ui()};g.onclick=()=>{sel=i;ui()};
g.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();sel=i;ui()}};gs.push(g)});
paths.forEach((p,i)=>{for(let k=0;k<2;k++){const c=el('circle',{class:'pt',r:2.6,opacity:0},sv);c.p=p;c.i=i;c.ph=k*.5+i*.13;c.d=3000+i*260;pts.push(c)}});
ui()}
function final(){sv.classList.add('nt','live','tx');gs.forEach(g=>g.classList.add('show'));paths.forEach(p=>p.style.strokeDashoffset=0);dv.style.strokeDashoffset=0;sec.classList.add('go','fin');run=!RM;setTimeout(()=>sv.classList.remove('nt'),60)}
function startSg(){setTimeout(()=>{sec.classList.add('go');dv.style.strokeDashoffset=0},150);
gs.forEach((g,i)=>setTimeout(()=>{g.classList.add('show','act');setTimeout(()=>g.classList.remove('act'),650)},550+i*260));
paths.forEach((p,i)=>setTimeout(()=>p.style.strokeDashoffset=0,2300+i*110));
setTimeout(()=>{run=true;sv.classList.add('live')},3600);setTimeout(()=>sv.classList.add('tx'),3900);setTimeout(()=>sec.classList.add('fin'),4900)}
if(!RM)sec.classList.add('pre');
buildSg();if(RM)final();
new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&!started){started=true;startSg()}},{threshold:.3}).observe(sec);
addEventListener('resize',()=>{if((innerWidth<820)!==mob){buildSg();if(started)final()}});
(function lp(now){requestAnimationFrame(lp);if(!run||!vis)return;const a=hov>=0?hov:sel;
pts.forEach(c=>{const t=((now/c.d)+c.ph)%1,q=c.p.getPointAtLength(t*c.p.L);c.setAttribute('cx',q.x);c.setAttribute('cy',q.y);c.setAttribute('opacity',Math.sin(Math.PI*t)*(a>=0&&a!=c.i?.25:.9))})})(0);
// agent visuals
const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t)).join(),ss=t=>t*t*(3-2*t),cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lr=(a,b,t)=>a+(b-a)*t;
const tx=(p,x,y,s,c,an)=>{const e=el('text',{x,y,class:c||'vt','text-anchor':an||'start'},p);e.textContent=s;return e};
const dot=(p,x,y)=>el('circle',{cx:x,cy:y,r:5,fill:'#fff',stroke:'#2563eb','stroke-width':1.6},p);
function mk(p,d,n,dur){const pa=el('path',{d,class:'fp'},p),L=pa.getTotalLength(),cs=[];for(let k=0;k<n;k++)cs.push(el('circle',{r:2.6,class:'vd',opacity:0},p));
return{upd(t,ph){let b=0;cs.forEach((c,k)=>{const u=((t/dur)+k/n+(ph||0))%1,q=pa.getPointAtLength(u*L);c.setAttribute('cx',q.x);c.setAttribute('cy',q.y);c.setAttribute('opacity',Math.sin(Math.PI*u)*.9);if(u>.88)b=Math.max(b,(u-.88)/.12)});return b}}}
function sSent(g){const S=['Reuters','Bloomberg','Financial Times','SEC filing'],HD=['Flood warning pressures coastal refineries','Analysts cut regional energy output forecast','Filing flags supply risk for Q4','Insurers brace for storm-related claims'];
tx(g,40,30,'News sources');const fl=S.map((n,i)=>{const y=70+i*40;dot(g,50,y);tx(g,66,y+4,n,'vb');return mk(g,`M178 ${y}C250 ${y} 262 130 330 130`,2,3.4)});
const eg=el('g',{style:'transform-box:fill-box;transform-origin:center'},g);el('rect',{x:330,y:104,width:160,height:52,rx:10,fill:'#fff',stroke:'#2563eb','stroke-width':1.6},eg);tx(eg,410,135,'SENTIMENT AI','vb','middle');
const ar=mk(g,'M410 158V214',1,1.8);tx(g,60,238,'Energy sector sentiment');const val=tx(g,500,238,'','vb','end');
el('rect',{x:60,y:252,width:440,height:6,rx:3,fill:'url(#spg)'},g);const ind=el('g',{},g);el('circle',{r:13,fill:'rgba(6,182,212,.18)'},ind);el('circle',{r:7,fill:'#fff',stroke:'#2563eb','stroke-width':2.4},ind);
tx(g,60,288,'Negative');tx(g,280,288,'Neutral','vt','middle');tx(g,500,288,'Positive','vt','end');tx(g,60,324,'Headline · demo');const hl=tx(g,60,346,'','vb');
return{tick(t){let b=0;fl.forEach((f,i)=>b=Math.max(b,f.upd(t,i*.17)));ar.upd(t);eg.style.transform=`scale(${1+.08*b})`;
const v=-.5+.2*Math.sin(t*.7)+.08*Math.sin(t*1.9);ind.setAttribute('transform',`translate(${60+(v+1)/2*440} 255)`);
val.textContent=(v<-.2?'NEGATIVE ':v>.2?'POSITIVE ':'NEUTRAL ')+(v>0?'+':'−')+Math.abs(v).toFixed(2);val.style.fill=v<-.2?'#dc2626':v>.2?'#16a34a':'#475569';
const f=(t/3.2)%1;hl.textContent=HD[Math.floor(t/3.2)%4];hl.setAttribute('opacity',Math.min(1,Math.sin(Math.PI*f)*2.4))}}}
function sMac(g){const G=[['Weather','Storm · Temperature · Flood',90,1],['Macro','Rates · Inflation · GDP · Commodities',200,1],['Market','Prices · Volatility',310,0]];
const fl=G.map(([a,b,y,up])=>{dot(g,50,y);tx(g,40,up?y-36:y+26,a,'vb');tx(g,40,up?y-21:y+41,b,'vs');return mk(g,`M58 ${y}C140 ${y} 170 200 262 200`,3,3.4)});
const cn=el('g',{transform:'translate(290 200)'},g),ci=el('g',{style:'transform-box:fill-box;transform-origin:center'},cn);
el('circle',{r:26,fill:'#fff',stroke:'#2563eb','stroke-width':1.6},ci);el('circle',{r:8,fill:'#2563eb'},ci);tx(g,290,156,'Analysis','vt','middle');
tx(g,420,40,'Macro impact');const nd=['Energy demand','Commodity prices','Sector exposure'].map((n,i)=>{const y=90+i*110,c=el('circle',{cx:430,cy:y,r:5.5,fill:'#fff',stroke:'#2563eb','stroke-width':1.6},g);tx(g,446,y+4,n,'vb');return c});
const cf=[mk(g,'M316 200C370 200 380 90 424 90',2,3),mk(g,'M430 97V193',2,2.4),mk(g,'M430 207V303',2,2.4)];
return{tick(t){let b=0;fl.forEach((f,i)=>b=Math.max(b,f.upd(t,i*.2)));cf.forEach(f=>f.upd(t));ci.style.transform=`scale(${1+.14*b})`;const a=Math.floor(t/1.3)%3;nd.forEach((c,i)=>c.style.fill=i<=a?'#2563eb':'#fff')}}}
function sRisk(g){const X0=60,X1=500,B=215,HH=110,xv=165;tx(g,60,34,'Portfolio risk');const ev=tx(g,500,34,'','vb','end');
const ar=el('path',{fill:'rgba(220,38,38,.16)'},g),ln=el('path',{fill:'none',stroke:'#2563eb','stroke-width':2.2},g);
el('path',{d:`M${X0} ${B}H${X1}`,fill:'none',stroke:'#cbd5e1'},g);el('path',{d:`M${xv} 66V${B}`,fill:'none',stroke:'#dc2626','stroke-dasharray':'4 4'},g);tx(g,xv,58,'VaR','vt','middle');
const pd=el('circle',{r:7,fill:'#fff','stroke-width':2.4},g);
[['#dcf1e4',60],['#fdf0cf',207],['#f8dcdc',353]].forEach(([c,x])=>el('rect',{x,y:268,width:147,height:6,fill:c},g));
tx(g,60,298,'Low');tx(g,280,298,'Medium','vt','middle');tx(g,500,298,'High','vt','end');
const ind=el('circle',{cy:271,r:8,fill:'#fff',stroke:'#2563eb','stroke-width':2.4},g);
const M=[['VaR',60],['Expected shortfall',220],['Stress',400]].map(([a,x])=>{tx(g,x,336,a);return tx(g,x,360,'','vn')});
const C={mu:285,sg:68,dx:285,ind:.34,a:184,e:241,s:0},ST=[{mu:285,sg:68,dx:285,ind:.34,a:184,e:241,s:0},{mu:245,sg:84,dx:135,ind:.88,a:262,e:341,s:8.4},{mu:290,sg:50,dx:255,ind:.46,a:131,e:172,s:3.1}];
return{tick(t,d){const q=(t%9)/3,s=q<1?0:q<2?1:2,T=ST[s],k=1-Math.exp(-d*3);for(const n in T)C[n]+=(T[n]-C[n])*k;
const y=x=>B-HH*Math.pow(68/C.sg,.6)*Math.exp(-.5*((x-C.mu)/C.sg)**2);let p='',a=`M${X0} ${B}`;
for(let x=X0;x<=X1;x+=8)p+=(x==X0?'M':'L')+x+' '+y(x).toFixed(1);for(let x=X0;x<=xv;x+=5)a+='L'+x+' '+y(x).toFixed(1);a+=`L${xv} ${y(xv).toFixed(1)}L${xv} ${B}Z`;
ln.setAttribute('d',p);ar.setAttribute('d',a);pd.setAttribute('cx',C.dx);pd.setAttribute('cy',y(C.dx));pd.setAttribute('stroke',C.dx<xv+6?'#dc2626':'#2563eb');ind.setAttribute('cx',60+C.ind*440);
ev.textContent=['Baseline','Market shock −8.4%','After hedge −3.1%'][s];ev.style.fill=['#475569','#dc2626','#16a34a'][s];
M[0].textContent='$'+Math.round(C.a)+'K';M[1].textContent='$'+Math.round(C.e)+'K';M[2].textContent=C.s>.3?'−'+C.s.toFixed(1)+'%':'—'}}}
function sHedge(g){const N=['Energy','Tech','Finance','Bonds','Cash'],B0=[34,24,18,14,10],B1=[22,25,20,19,14],CX=[85,185,285,385,485],BY=320,K=6.4;
const st=[['Before',150],['Hedge',280],['After',410]].map(([s,x])=>tx(g,x,36,s,'vt','middle'));tx(g,215,36,'→','vt','middle');tx(g,345,36,'→','vt','middle');
el('path',{d:`M50 ${BY}H520`,fill:'none',stroke:'#cbd5e1'},g);
const bars=CX.map((x,i)=>{tx(g,x,BY+22,N[i],'vt','middle');return el('rect',{x:x-26,width:52,rx:3,fill:'#bfd1f5'},g)}),vs=CX.map(x=>tx(g,x,0,'','vb','middle'));
const sh=tx(g,285,86,'Simulated hedge','vs','middle'),ps=[...Array(9)].map(()=>el('circle',{r:3,class:'vd',opacity:0},g));
return{tick(t){const ph=t%9,p=cl((ph-3)/3),e=ss(p),cu=B0.map((v,i)=>lr(v,B1[i],e));
st.forEach((s,i)=>s.style.fill=(i==0&&ph<3)||(i==1&&ph>=3&&ph<6)||(i==2&&ph>=6)?'#2563eb':'#94a3b8');
bars.forEach((r,i)=>{const h=cu[i]*K;r.setAttribute('y',BY-h);r.setAttribute('height',h);vs[i].setAttribute('y',BY-h-8);vs[i].textContent=Math.round(cu[i])+'%'});
bars[0].style.fill=`rgb(${mix([220,38,38],[37,99,235],e)})`;sh.setAttribute('opacity',Math.sin(Math.PI*p));
ps.forEach((c,k)=>{const j=2+k%3,u=cl((p-k/9*.55)/.4),y0=BY-B0[0]*K,y1=BY-cu[j]*K-22;c.setAttribute('cx',lr(CX[0],CX[j],u));c.setAttribute('cy',lr(y0,y1,u)-Math.sin(Math.PI*u)*50);c.setAttribute('opacity',Math.sin(Math.PI*u))})}}}
const SC=[sSent,sMac,sRisk,sHedge],CAP=['Sentiment agent · scoring incoming news','Weather & macro agent · merging environment and economy','Risk agent · testing exposure against a shock','Hedging agent · rebalancing allocation'],TG=['DEMO DATA','DEMO DATA','DEMO DATA','SIMULATED · NOT EXECUTED'];
$('#pn').innerHTML='<div class="lab" id="ph"></div><svg id="pv" viewBox="0 0 560 400" role="img" aria-label="Animated visualization of the selected agent"><defs><linearGradient id="spg"><stop offset="0" stop-color="#dc2626"/><stop offset=".5" stop-color="#cbd5e1"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs><g id="sc"></g></svg><span class="tag" id="ptg"></span>';
let ai=3,scn=null,vA=false,lastT=0;
function bld(i){const g=$('#sc');g.innerHTML='';scn=SC[i](g);$('#ph').textContent=CAP[i];$('#ptg').textContent=TG[i];RM?scn.tick(7.5,10):scn.tick(performance.now()/1000,.1)}
function go(i,first){root.querySelectorAll('#al li').forEach((l,k)=>l.classList.toggle('on',k==i));ai=i;const g=$('#sc');
if(first||RM){bld(i);return}scn=null;g.getAnimations().forEach(a=>a.cancel());
g.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateX(-24px)'}],{duration:260,fill:'forwards'}).onfinish=()=>{bld(i);g.animate([{opacity:0,transform:'translateX(24px)'},{opacity:1,transform:'none'}],{duration:440,easing:'cubic-bezier(.2,.8,.2,1)',fill:'forwards'})}}
root.querySelectorAll('#al li').forEach((l,i)=>{l.onclick=()=>{if(i!=ai)go(i)};l.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();if(i!=ai)go(i)}}});
new IntersectionObserver(e=>vA=e[0].isIntersecting).observe($('#agents'));
(function al(now){requestAnimationFrame(al);if(!scn||!vA||RM)return;const t=now/1000;scn.tick(t,Math.min(t-lastT,.1));lastT=t})(0);
go(3,true);
// 3D
function scene(cv,full){if(!window.THREE)return;
const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:!MOB});R.setPixelRatio(Math.min(devicePixelRatio,1.5));
const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(50,1,.1,100);C.position.z=full?7:11;
const gold=new THREE.Color('#2563eb'),warm=new THREE.Color('#334155');
const G=new THREE.Group();S.add(G);
if(full){
const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.9,1),new THREE.MeshBasicMaterial({color:gold,wireframe:true,transparent:true,opacity:.7}));G.add(core);
const nodes=[];for(let i=0;i<7;i++){const a=i/7*Math.PI*2,p=new THREE.Vector3(Math.cos(a)*(MOB?3:4.2),Math.sin(a*2)*1.3,Math.sin(a)*3);
const m=new THREE.Mesh(new THREE.SphereGeometry(.09,12,12),new THREE.MeshBasicMaterial({color:warm}));m.position.copy(p);G.add(m);nodes.push(p);
G.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),p]),new THREE.LineBasicMaterial({color:gold,transparent:true,opacity:.35})));}
G.userData.n=nodes}
const N=MOB?120:full?320:200,pos=new Float32Array(N*3),meta=[];
for(let i=0;i<N;i++){pos.set([(Math.random()-.5)*(MOB?12:26),(Math.random()-.5)*6,(Math.random()-.5)*8],i*3);meta.push(full&&i<(MOB?30:70)?{n:i%7,t:Math.random(),s:.002+Math.random()*.004}:null)}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:warm,size:.035,transparent:true,opacity:.55}));G.add(pts);
let mx=0,my=0,vis=true,t0=0;
addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
const rs=()=>{const w=cv.clientWidth,h=cv.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()};rs();addEventListener('resize',rs);
new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(cv);
(function loop(){requestAnimationFrame(loop);if(!vis)return;t0+=.003;
if(!RM){G.rotation.y=(full?Math.sin(t0*1.2)*.35:t0*.6)+mx*.5;G.rotation.x=my*.25+Math.sin(t0)*.05;
if(full){const nd=G.userData.n,a=pg.attributes.position.array;meta.forEach((m,i)=>{if(!m)return;m.t+=m.s;if(m.t>1)m.t=0;const p=nd[m.n];a[i*3]=p.x*(1-m.t);a[i*3+1]=p.y*(1-m.t);a[i*3+2]=p.z*(1-m.t)});pg.attributes.position.needsUpdate=true}}
if(full)C.position.z=7+Math.min(scrollY/innerHeight,1)*3;
R.render(S,C)})()}
scene($('#cv'),true);scene($('#cv2'),false);

// ===== scenario lab: state -> simulateScenario() -> SVG =====
(()=>{
const PF=2400,NP=60,HN=26,BF=[-.3,.5,1,1.5,2],DUR=650,clp=(v,a,b)=>Math.min(b,Math.max(a,v)),fm=v=>'$'+Math.round(v)+'K',sg=v=>(v<0?'−':'+')+'$'+Math.round(Math.abs(v))+'K';
const state={eventIntensity:6,energyExposure:40,hedgeSize:25};
// Deterministic, illustrative model. Values are P&L in $K vs. the current portfolio.
function simulateScenario({eventIntensity:i,energyExposure:e,hedgeSize:h}){
 const H=h/100,ex=PF*e/100,v=ex*(.03+.012*i)*1.6,d=.6+.08*i,amp=v*.1,rate=2.2+.45*i,den=1-Math.exp(-rate);
 const path=(L,ph,dm)=>Array.from({length:NP},(_,n)=>{const t=n/(NP-1);return -L*(1-Math.exp(-rate*t))/den+amp*dm*Math.sin(Math.PI*t)*Math.sin(3*Math.PI*t+ph)});
 const Lu=BF.map(b=>v*(1+(b-1)*d)),Lh=Lu.map(L=>L>0?L*(1-.8*H):L*(1-.3*H)),dm=1-.6*H,vh=v*(1-.8*H);
 const S=(kind,L,k,m)=>({kind,y:path(L,k*1.7,m)});
 return{eventIntensity:i,
  series:[S('fan',Lu[0],0,1),S('fan',Lu[1],1,1),S('fan',Lu[3],3,1),S('fan',Lu[4],4,1),S('unh',Lu[2],2,1),S('hed',Lh[2],2,dm),S('band',Lh[0],0,0),S('band',Lh[4],4,0)],
  metrics:{v,es:v*(1.2+.03*i),c:ex*H*.06*(.8+.04*i),vh,rr:80*H,lr:(v-vh)*.9}}}
window.simulateScenario=simulateScenario;

const sv=$('#lg'),LB=$('#lab'),HY=Array.from({length:HN},(_,j)=>{const u=j/(HN-1);return 22*Math.sin(6*Math.PI*u)*(.4+.6*u)-18*(1-u)});
let G,R,cur,tw=null,intro=null,vis=false,started=false;
function geom(){const mob=innerWidth<820;G={mob,W:mob?400:680,H:mob?380:400,pr:mob?96:120,ex:mob?112:206,top:58,bot:322};G.xe=G.W-G.pr;G.k=(G.bot-G.top)/590;G.y0=G.top+140*G.k}
const Yc=v=>v>=0?140*Math.tanh(v/140):-450*Math.tanh(-v/450),Y=v=>G.y0-Yc(v)*G.k,X=n=>G.ex+n/(NP-1)*(G.xe-G.ex);
function part(ys,N,xf,r){if(r<=0)return'';const f=r*(N-1),n=Math.floor(f),fr=f-n;let d='';for(let j=0;j<=n&&j<N;j++)d+=(j?'L':'M')+xf(j).toFixed(1)+' '+Y(ys[j]).toFixed(1);
 if(fr>0&&n<N-1)d+='L'+(xf(n)+(xf(n+1)-xf(n))*fr).toFixed(1)+' '+(Y(ys[n])+(Y(ys[n+1])-Y(ys[n]))*fr).toFixed(1);return d}
function build(){geom();sv.setAttribute('viewBox',`0 0 ${G.W} ${G.H}`);sv.innerHTML='';R={p:[],pt:[]};
 const g=G,T=(t,a,c,an)=>{const e=el('text',{x:a[0],y:a[1],class:c||'lt','text-anchor':an||'start'},sv);e.textContent=t;return e};
 el('path',{d:`M14 ${g.bot+24}H${g.xe}`,stroke:'#e2e8f0',fill:'none'},sv);
 T('HISTORY',[14,g.bot+42]);T('SIMULATED · 10 TRADING DAYS',[g.xe,g.bot+42],'lt','end');
 R.band=el('path',{fill:'#16a34a','fill-opacity':0},sv);
 el('path',{d:`M14 ${g.y0}H${g.xe}`,stroke:'#94a3b8','stroke-dasharray':'3 5',fill:'none'},sv);
 R.hist=el('path',{fill:'none',stroke:'#64748b','stroke-width':1.8,'stroke-linecap':'round','stroke-linejoin':'round'},sv);
 R.ev=el('line',{x1:g.ex,x2:g.ex,y1:g.top-22,y2:g.top-22,stroke:'#0f172a','stroke-dasharray':'2 4','stroke-linecap':'round'},sv);
 R.evt=T('EVENT',[g.ex+8,g.top-30],'lt');R.evt.style.fill='#0f172a';R.evs=T('',[g.ex+8,g.top-17],'lt');R.evs.style.fill='#2563eb';
 const col={fan:'#2563eb',unh:'#dc2626',hed:'#16a34a'},op=[.3,.42,.42,.28,1,1],wd=[1.5,1.5,1.5,1.5,2.6,2.8];
 for(let s=0;s<6;s++)R.p.push(el('path',{fill:'none',stroke:col[s<4?'fan':s==4?'unh':'hed'],'stroke-opacity':op[s],'stroke-width':wd[s],'stroke-linecap':'round','stroke-linejoin':'round'},sv));
 for(let s=0;s<6;s++)for(let k=0;k<2;k++){const c=el('circle',{r:s>3?3:2.4,fill:col[s<4?'fan':s==4?'unh':'hed'],opacity:0},sv);c.s=s;c.k=k;R.pt.push(c)}
 R.halo=el('circle',{cx:g.ex,cy:g.y0,fill:'rgba(37,99,235,.14)',opacity:0},sv);R.dot=el('circle',{cx:g.ex,cy:g.y0,r:5.5,fill:'#fff',stroke:'#2563eb','stroke-width':2.2,opacity:0},sv);
 R.lbl=el('g',{opacity:0},sv);const old=sv;
 const L=(t,a,c,an)=>{const e=el('text',{x:a[0],y:a[1],class:c||'lt','text-anchor':an||'start'},R.lbl);e.textContent=t;return e};
 R.cur=L('CURRENT',[g.ex-10,g.y0+24],'lt','end');R.rng=L('SCENARIO RANGE',[0,0],'lt','middle');R.rng.style.fill='#15803d';
 R.gap=el('path',{stroke:'#16a34a','stroke-opacity':.55,'stroke-width':1.5,fill:'none'},R.lbl);
 R.un=L('UNHEDGED',[0,0]);R.uv=L('',[0,0],'lv');R.hn=L('HEDGED',[0,0]);R.hv=L('',[0,0],'lv');
 R.un.style.fill='#b91c1c';R.uv.style.fill='#dc2626';R.hn.style.fill='#15803d';R.hv.style.fill='#16a34a'}
function draw(now){
 const g=G,c=cur,T=RM?99:intro==null?0:(now-intro)/1000,rv=(a,d)=>clp((T-a)/d,0,1),ez=t=>1-Math.pow(1-t,3);
 R.hist.setAttribute('d',part(HY,HN,j=>14+j/(HN-1)*(g.ex-14),ez(rv(0,.9))));
 R.ev.setAttribute('y2',(g.top-22+(g.bot+24-g.top+22)*ez(rv(.8,.6))).toFixed(1));R.ev.setAttribute('stroke-width',(.9+.14*c.i).toFixed(2));R.ev.setAttribute('stroke-opacity',.35+.05*c.i);
 R.evt.setAttribute('opacity',rv(1.1,.5));R.evs.setAttribute('opacity',rv(1.1,.5));R.evs.textContent='INTENSITY '+Math.round(c.i)+'/10';
 R.dot.setAttribute('opacity',rv(.3,.4));R.halo.setAttribute('opacity',rv(.3,.4));R.halo.setAttribute('r',(9+c.i*1.3).toFixed(1));
 for(let s=0;s<6;s++)R.p[s].setAttribute('d',part(c.y[s],NP,X,ez(rv(1.3+s*.32,1.5))));
 const bt=c.y[6],bb=c.y[7];let bd='';for(let n=0;n<NP;n++)bd+=(n?'L':'M')+X(n).toFixed(1)+' '+Y(bt[n]).toFixed(1);for(let n=NP-1;n>=0;n--)bd+='L'+X(n).toFixed(1)+' '+Y(bb[n]).toFixed(1);
 R.band.setAttribute('d',bd+'Z');R.band.setAttribute('fill-opacity',(.13*ez(rv(3.6,.9))).toFixed(3));
 R.lbl.setAttribute('opacity',ez(rv(4.2,.6)));
 const yu=c.y[4][NP-1],yh=c.y[5][NP-1];let pu=Y(yu),ph=Y(yh);R.gap.setAttribute('d',`M${g.xe+4} ${ph}V${pu}`);
 if(pu-ph<34){const m=(pu+ph)/2;pu=m+17;ph=m-17}
 const x=g.xe+12;R.un.setAttribute('x',x);R.un.setAttribute('y',pu-12);R.uv.setAttribute('x',x);R.uv.setAttribute('y',pu+4);R.uv.textContent=sg(yu);
 R.hn.setAttribute('x',x);R.hn.setAttribute('y',ph-12);R.hv.setAttribute('x',x);R.hv.setAttribute('y',ph+4);R.hv.textContent=sg(yh);
 const rn=Math.round(.62*(NP-1));R.rng.setAttribute('x',X(rn));R.rng.setAttribute('y',Math.max(g.top-2,Y(bt[rn])-9));
 const live=!RM&&T>4.4;R.pt.forEach(q=>{if(!live){q.setAttribute('opacity',0);return}const u=((now/(2800+q.s*240))+q.k*.5+q.s*.13)%1,f=u*(NP-1),n=Math.min(NP-2,Math.floor(f)),fr=f-n,ys=c.y[q.s];
  q.setAttribute('cx',(X(n)+(X(n+1)-X(n))*fr).toFixed(1));q.setAttribute('cy',(Y(ys[n])+(Y(ys[n+1])-Y(ys[n]))*fr).toFixed(1));q.setAttribute('opacity',(Math.sin(Math.PI*u)*(q.s>3?.95:.6)).toFixed(2))});
 const m=c.m;$('#mv').textContent=fm(m.v);$('#me').textContent=fm(m.es);$('#mc').textContent=fm(m.c);$('#mh').textContent=fm(m.vh);$('#mr').textContent='−'+Math.round(m.rr)+'%';$('#ml').textContent=fm(m.lr)}
function frame(now){requestAnimationFrame(frame);if(!vis)return;
 if(tw){const k=clp((now-tw.t0)/(tw.dur||1),0,1),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
  cur.y=tw.fy.map((a,s)=>a.map((v,n)=>v+(tw.ty[s][n]-v)*e));for(const q in tw.tm)cur.m[q]=tw.fm[q]+(tw.tm[q]-tw.fm[q])*e;cur.i=tw.fi+(tw.ti-tw.fi)*e;if(k>=1)tw=null}
 draw(now)}
function retarget(sim,delay,dur){tw={t0:performance.now()+delay,dur,fy:cur.y.map(a=>a.slice()),fm:{...cur.m},fi:cur.i,ty:sim.series.map(s=>s.y),tm:sim.metrics,ti:sim.eventIntensity}}
function readout(sim){const i=+$('#r1').value,e=+$('#r2').value,h=+$('#r3').value;state.eventIntensity=i;state.energyExposure=e;state.hedgeSize=h;
 $('#v1').textContent=i+'/10';$('#v2').textContent=e+'%';$('#v3').textContent=h+'%';
 ['r1','r2','r3'].forEach(id=>{const r=$('#'+id);r.style.setProperty('--p',((r.value-r.min)/(r.max-r.min)*100)+'%')});return simulateScenario(state)}
function aria(sim){const m=sim.metrics;sv.setAttribute('aria-label',`Simulation, not a forecast. Event intensity ${state.eventIntensity} of 10, energy exposure ${state.energyExposure}%, hedge ${state.hedgeSize}%. Unhedged VaR ${fm(m.v)}, VaR after hedge ${fm(m.vh)}.`)}
const sim0=readout();aria(sim0);
cur={y:sim0.series.map(s=>s.y.slice()),m:RM?{...sim0.metrics}:Object.fromEntries(Object.keys(sim0.metrics).map(k=>[k,0])),i:sim0.eventIntensity};
build();
['r1','r2','r3'].forEach(id=>$('#'+id).addEventListener('input',()=>{const s=readout();aria(s);retarget(s,0,RM?0:DUR)}));
new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&!started){started=true;intro=performance.now();if(!RM)retarget(sim0,1300,1600)}},{threshold:.25}).observe(LB);
addEventListener('resize',()=>{if((innerWidth<820)!==G.mob)build()});
requestAnimationFrame(frame);
})();

// ===== ask: multi-agent pipeline =====
(()=>{
const AG=[{id:'query',lb:'Query received',sb:'',rl:'Question',txt:'Received'},
{id:'sentiment',lb:'Sentiment agent',sb:'analyzing news',rl:'Risk sentiment',v:72,f:n=>'+'+Math.round(n)+'%'},
{id:'weather',lb:'Weather & macro',sb:'analyzing event',rl:'Energy impact',v:8.4,f:n=>'−'+n.toFixed(1)+'%'},
{id:'historical',lb:'Historical RAG',sb:'finding analogs',rl:'Analogs',v:3,f:n=>Math.round(n)+' found'},
{id:'risk',lb:'Risk agent',sb:'calculating exposure',rl:'VaR',v:138,f:n=>'$'+Math.round(n)+'K'},
{id:'scenario',lb:'Scenario engine',sb:'simulating impact',rl:'Simulating',v:6,f:n=>Math.round(n)+' scenarios'},
{id:'hedging',lb:'Hedging agent',sb:'testing risk reduction',rl:'Risk reduction',v:20,f:n=>'−'+Math.round(n)+'%'},
{id:'complete',lb:'Intelligence ready',sb:''}],N=AG.length;
const STEP=RM?140:900,A0=RM?100:600,AT=k=>A0+k*STEP,VD=RM?1:800,clp=(v,a,b)=>Math.min(b,Math.max(a,v)),E=(a,b,p)=>{const t=clp((p-a)/(b-a||1),0,1);return t*t*(3-2*t)};
const pl=$('#pl'),svg=$('#qpv'),btn=$('#run'),bdg=$('#bdg'),qq=$('#qq'),res=$('#res');
const state={activeStep:-1,isRunning:false,completedSteps:0,simulationComplete:false};
pl.querySelectorAll('.rw').forEach(e => e.remove());
pl.insertAdjacentHTML('beforeend',AG.map(a=>`<div class="rw"><div class="lb"><b>${a.lb.replace('&','&amp;')}</b>${a.sb?`<span>${a.sb}</span>`:''}</div><div class="vz"><svg viewBox="0 0 220 44"></svg></div><div class="rs"><small>${a.rl||''}</small><b></b></div></div>`).join(''));
const rows=[...pl.querySelectorAll('.rw')],lbs=rows.map(r=>r.querySelector('.lb'));
const lnQ=el('line',{x1:14,x2:14,y1:0,stroke:'#cbd5e1','stroke-dasharray':'2 4'},svg),lnG=el('line',{x1:14,x2:14,stroke:'#e2e8f0','stroke-width':1.5},svg),lnB=el('line',{x1:14,x2:14,y1:0,y2:0,stroke:'#2563eb','stroke-width':1.6},svg);
const nodes=AG.map(()=>{const g=el('g',{},svg);return{g,h:el('circle',{cx:14,r:0,fill:'rgba(37,99,235,.18)'},g),rp:el('circle',{cx:14,r:0,fill:'none',stroke:'#2563eb',opacity:0},g),c:el('circle',{cx:14,r:6,fill:'#fff',stroke:'#cbd5e1','stroke-width':1.6},g),k:el('path',{d:'M10 .5L13 3.5L18.5-2',fill:'none',stroke:'#fff','stroke-width':2,'stroke-linecap':'round','stroke-linejoin':'round',opacity:0},g)}});
const tr=[0,1,2,3].map(i=>el('circle',{cx:14,r:i?3.4-i*.6:4.4,fill:'#2563eb',opacity:0,class:i?'':'pp'},svg));
const T=(g,x,y,t,an)=>{const e=el('text',{x,y,class:'vx','text-anchor':an||'start'},g);e.textContent=t;return e},Lp=(g,d,c)=>el('path',{d,class:c||'vl'},g);
const V={
sentiment(g){T(g,0,6,'NEWS');const ys=[12,20,28,36],ds=ys.map(y=>{Lp(g,`M8 ${y}L150 22`);return el('circle',{r:2.4,fill:'#2563eb',opacity:0},g)}),nd=el('circle',{cx:150,cy:22,r:6,fill:'#fff',stroke:'#2563eb','stroke-width':1.6},g);T(g,164,25,'AGENT');
 return p=>{ds.forEach((c,i)=>{const t=E(i*.09,.5+i*.09,p);c.setAttribute('cx',8+142*t);c.setAttribute('cy',ys[i]+(22-ys[i])*t);c.setAttribute('opacity',t>0&&t<1?1:0)});nd.setAttribute('r',6+2.5*Math.sin(Math.PI*E(.45,.9,p)))}},
weather(g){T(g,0,12,'WEATHER');T(g,0,40,'MACRO · %');Lp(g,'M44 1l-2 5M50 1l-2 5M56 1l-2 5','vs2').style.strokeDasharray='none';
 const a=Lp(g,'M64 12C104 12 112 22 150 22','vs2'),b=Lp(g,'M58 40C104 40 112 22 150 22','vs2'),nd=el('circle',{cx:150,cy:22,r:6,fill:'#fff',stroke:'#2563eb','stroke-width':1.6},g);
 return p=>{[a,b].forEach(x=>{x.setAttribute('stroke-dashoffset',-p*70);x.setAttribute('opacity',E(0,.25,p))});nd.setAttribute('r',6+2.5*Math.sin(Math.PI*E(.4,.85,p)))}},
historical(g){T(g,0,8,'PAST ANALOGS');Lp(g,'M10 30H170');const xs=[10,42,74,106,138,170],M=[1,3,4],cs=xs.map(x=>el('circle',{cx:x,cy:30,r:4.5,fill:'#fff',stroke:'#cbd5e1','stroke-width':1.5},g)),sc=el('rect',{y:20,width:2,height:20,fill:'#2563eb',opacity:0},g);
 return p=>{const t=E(.05,.7,p),x=10+170*t;sc.setAttribute('x',x);sc.setAttribute('opacity',t>0&&t<1?.7:0);cs.forEach((c,i)=>{const hit=t>0&&x>=xs[i]-2,m=M.includes(i)&&hit;c.setAttribute('fill',m?'#2563eb':'#fff');c.setAttribute('stroke',m?'#2563eb':hit?'#94a3b8':'#cbd5e1');c.setAttribute('r',m?6:4.5)})}},
risk(g){const R=[['EXPOSURE',140,'#bfd1f5'],['VaR',62,'#2563eb'],['STRESS',100,'#dc2626']],bs=R.map(([n,w,c],i)=>{T(g,0,12+i*14,n);return el('rect',{x:58,y:5+i*14,height:8,rx:2,fill:c,width:0,opacity:i==2?.75:1},g)});
 return p=>bs.forEach((b,i)=>b.setAttribute('width',R[i][1]*E(i*.22,.4+i*.22,p)))},
scenario(g){const dy=[-19,-11,-4,4,12,20],ps=dy.map((d,i)=>{const e=el('path',{d:`M14 22C70 22 110 ${22+d*.3} 206 ${22+d}`,fill:'none',stroke:i==3?'#dc2626':'#2563eb','stroke-opacity':[.35,.5,.7,.9,.55,.35][i],'stroke-width':i==3?1.8:1.3,'stroke-linecap':'round'},g),Ln=e.getTotalLength();e.style.strokeDasharray=Ln;e.style.strokeDashoffset=Ln;e.L=Ln;return e});
 el('circle',{cx:14,cy:22,r:3.5,fill:'#2563eb'},g);return p=>ps.forEach((e,i)=>e.style.strokeDashoffset=e.L*(1-E(.08+i*.1,.55+i*.1,p)))},
hedging(g){T(g,0,12,'BEFORE');T(g,0,38,'AFTER');const f='#bfd1f5',a=el('rect',{x:64,y:5,width:0,height:8,rx:2,fill:f},g),b=el('rect',{x:64,y:31,width:0,height:8,rx:2,fill:f},g),h=el('rect',{x:176,y:5,width:28,height:8,rx:2,fill:f,opacity:0},g);
 return p=>{const t=E(.35,.8,p);a.setAttribute('width',140*E(0,.3,p));b.setAttribute('width',112*E(.3,.6,p));h.setAttribute('opacity',p>.35?1:0);h.setAttribute('y',5+26*t);h.setAttribute('fill',t>.5?'#16a34a':f)}}};
let raf=0,t0=0,lastE=null,vizs=[];
const NY=()=>{const pr=pl.getBoundingClientRect();return lbs.map(l=>{const r=l.getBoundingClientRect();return r.top+r.height/2-pr.top+34})};
function draw(e){const ny=NY(),act=state.activeStep;lnQ.setAttribute('y2',ny[0]);lnG.setAttribute('y1',ny[0]);lnG.setAttribute('y2',ny[N-1]);
 let by=0,py=0,pa=0;
 if(e!=null){if(e<AT(0)){py=by=ny[0]*E(0,AT(0),e);pa=1}else{by=ny[act];if(act<N-1){const t=E(AT(act)+120,AT(act+1),e);if(t>0){py=by=ny[act]+(ny[act+1]-ny[act])*t;pa=1}}}}
 lnB.setAttribute('y2',by);tr.forEach((c,i)=>{c.setAttribute('cy',Math.max(0,py-i*9));c.setAttribute('opacity',pa*(.95-.24*i))});
 nodes.forEach((o,k)=>{const on=e!=null&&k<=act,cu=e!=null&&k==act,age=e==null?0:e-AT(k),fin=k==N-1&&cu;o.g.setAttribute('transform',`translate(0 ${ny[k]})`);
  o.c.setAttribute('r',!on?6:fin?11:cu?8+Math.max(0,1-age/300)*2.5:6.5);o.c.setAttribute('fill',on?'#2563eb':'#fff');o.c.setAttribute('stroke',on?'#2563eb':'#cbd5e1');
  o.h.setAttribute('r',cu&&!fin?14+2*Math.sin(age/350):0);o.k.setAttribute('opacity',fin?E(0,300,age):0);
  const rp=fin&&!RM&&age<3600?(age%1200)/1200:1;o.rp.setAttribute('r',11+16*rp);o.rp.setAttribute('opacity',fin&&rp<1?.5*(1-rp):0)})}
function setRs(k,p){const a=AG[k],r=rows[k].querySelector('.rs'),b=r.querySelector('b');if(a.txt)b.textContent=a.txt;else if(a.v!=null)b.textContent=a.f(a.v*E(.5,.95,p));else return;r.classList.toggle('show',p>.45||!!a.txt)}
function setStep(act){const prev=state.activeStep;state.activeStep=act;state.completedSteps=Math.max(0,act);
 rows.forEach((r,k)=>{r.classList.toggle('on',k==act);r.classList.toggle('done',k<act)});
 for(let k=Math.max(0,prev);k<act;k++){if(vizs[k])vizs[k](1);setRs(k,1)}
 if(act>=0&&V[AG[act].id]){const g=rows[act].querySelector('.vz svg');g.innerHTML='';vizs[act]=V[AG[act].id](g)}if(act==0)setRs(0,1);if(act==N-1)dispatchEvent(new Event('ask:done'))}
const xs=[['#xi',8.4,n=>'−'+n.toFixed(1)+'%'],['#xr',20,n=>'−'+Math.round(n)+'%'],['#xc',87,n=>Math.round(n)+'%']];
function frame(now){const e=now-t0;let act=-1;for(let k=0;k<N;k++)if(e>=AT(k))act=k;
 if(act!=state.activeStep)setStep(act);
 if(act>0&&act<N-1){const p=clp((e-AT(act))/VD,0,1);vizs[act]&&vizs[act](p);setRs(act,p)}
 const re=e-(AT(N-1)+500);if(re>=0){if(!res.classList.contains('in'))res.classList.add('in');xs.forEach(([q,v,f])=>$(q).textContent=f(v*E(0,RM?1:900,re)))}
 lastE=e;draw(e);
 if(e>=AT(N-1)+(RM?400:1500)){state.isRunning=false;state.simulationComplete=true;state.completedSteps=N;btn.disabled=false;btn.textContent='RUN AGAIN';bdg.classList.remove('run');qq.classList.remove('hot');return}
 raf=requestAnimationFrame(frame)}
function reset(){cancelAnimationFrame(raf);Object.assign(state,{activeStep:-1,isRunning:false,completedSteps:0,simulationComplete:false});vizs=[];lastE=null;
 rows.forEach(r=>{r.className='rw';r.querySelector('.rs').className='rs';r.querySelector('.vz svg').innerHTML=''});res.classList.remove('in');draw(null)}
btn.addEventListener('click',()=>{if(state.isRunning)return;reset();btn.style.transform='';state.isRunning=true;btn.disabled=true;btn.textContent='RUNNING...';dispatchEvent(new Event('ask:run'));bdg.classList.add('run');qq.classList.add('hot');
 const a=$('.ask').getBoundingClientRect();if(a.top<0||a.bottom>innerHeight)$('.ask').scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
 t0=performance.now();raf=requestAnimationFrame(frame)});
const redraw=()=>draw(state.isRunning||state.simulationComplete?lastE:null);
addEventListener('resize',redraw);addEventListener('load',redraw);draw(null);
})();

// ===== ask: intelligence field =====
(()=>{
const stg=$('#stg'),fs=$('#fs'),fld=$('#fld'),CL=['#2563eb','#8b5cf6','#06b6d4','#4f46e5','#22c55e','#06b6d4'],SRC=[['NEWS',.07,.1,0,.2],['WEATHER',.93,.1,1,.2],['MARKET',.04,.5,0,.5],['MACRO',.96,.5,1,.5],['FILINGS',.08,.9,0,.8],['HISTORY',.92,.9,1,.8]];
let G,fl=[],am=[],bu=[],ring=null,ev=null,running=false,vis=false;
const clp=(v,a,b)=>Math.min(b,Math.max(a,v));
function build(){const sr=stg.getBoundingClientRect(),W=Math.min(document.documentElement.clientWidth,1440),mob=W<820,pw=sr.width,ph=sr.height,H=ph+220,py=110,px=(W-pw)/2;
 fs.style.width=W+'px';fs.style.height=H+'px';fs.setAttribute('viewBox',`0 0 ${W} ${H}`);fs.innerHTML='';G={W,H,px,py,pw,ph,cx:W/2,cy:py+ph/2,mob};fl=[];am=[];bu=[];
 const src=mob?[SRC[0],SRC[1],SRC[4],SRC[5]]:SRC;
 src.forEach(([n,xf,yf,sd,tf],i)=>{const sx=W*xf,sy=H*yf,tx=sd?px+pw:px,ty=py+ph*tf,dx=tx-sx,d=`M${sx} ${sy}C${sx+dx*.55} ${sy},${tx-dx*.45} ${ty},${tx} ${ty}`,c=CL[SRC.findIndex(q=>q[0]==n)];
  const p=el('path',{d,class:'fl'},fs);el('circle',{cx:sx,cy:sy,r:2.6,fill:c,opacity:.7},fs);
  if(!mob){const t=el('text',{x:sd?sx-10:sx+10,y:sy+3,'text-anchor':sd?'end':'start'},fs);t.textContent=n}
  fl.push({p,L:p.getTotalLength(),c:el('circle',{r:2.8,fill:'#2563eb',opacity:0,class:'pp'},fs),ph:i*.17})});
 const rx=pw/2+(mob?12:70),ry=ph/2+(mob?8:34),oe=`M${G.cx-rx} ${G.cy}A${rx} ${ry} 0 1 1 ${G.cx+rx} ${G.cy}A${rx} ${ry} 0 1 1 ${G.cx-rx} ${G.cy}`,n=mob?2:4;
 [1,-1].forEach((dir,j)=>{const p=el('path',{d:oe,fill:'none',stroke:'none'},fs),L=p.getTotalLength();for(let k=0;k<n;k++)am.push({p,L,dir,ph:k/n+j*.13,per:(70+k*13)*1000,c:el('circle',{r:1.8,fill:CL[(k+j*2)%5],opacity:0},fs)})});
 ring=el('rect',{x:px,y:py,width:pw,height:ph,rx:16,fill:'none',stroke:'#2563eb','stroke-width':1.4,opacity:0},fs);
 for(let i=0;i<(mob?5:10);i++)bu.push({a:i/(mob?5:10)*Math.PI*2+.3,c:el('circle',{r:2.2,fill:i%2?'#06b6d4':'#2563eb',opacity:0},fs)});
 fs.classList.toggle('run',running)}
let sz='';new ResizeObserver(()=>{const r=stg.getBoundingClientRect(),k=Math.round(r.width)+'x'+Math.round(r.height)+'x'+innerWidth;if(k!=sz){sz=k;build()}}).observe(stg);
new IntersectionObserver(e=>vis=e[0].isIntersecting,{rootMargin:'100px'}).observe($('#ask'));
addEventListener('ask:run',()=>{running=true;ev=null;fs.classList.add('run')});
addEventListener('ask:done',()=>{running=false;fs.classList.remove('run');fld.classList.add('pop');setTimeout(()=>fld.classList.remove('pop'),600);if(!RM)ev=performance.now()});
(function lp(now){requestAnimationFrame(lp);if(RM||!vis||!G)return;
 am.forEach(a=>{let u=((now/a.per)*a.dir+a.ph)%1;if(u<0)u+=1;const q=a.p.getPointAtLength(u*a.L);a.c.setAttribute('cx',q.x);a.c.setAttribute('cy',q.y);a.c.setAttribute('opacity',.5)});
 fl.forEach(f=>{if(!running){f.c.setAttribute('opacity',0);return}const u=((now/2300)+f.ph)%1,q=f.p.getPointAtLength(u*f.L);f.c.setAttribute('cx',q.x);f.c.setAttribute('cy',q.y);f.c.setAttribute('opacity',Math.sin(Math.PI*u)*.95)});
 if(ev){const k=(now-ev)/1500,e=1-Math.pow(1-clp(k,0,1),3),g=70*e;ring.setAttribute('x',G.px-g);ring.setAttribute('y',G.py-g);ring.setAttribute('width',G.pw+2*g);ring.setAttribute('height',G.ph+2*g);ring.setAttribute('rx',16+g);ring.setAttribute('opacity',.35*(1-e));
  bu.forEach(b=>{const r=Math.max(G.pw/2,G.ph/2)*.6*(1+0.0)+0,ex=Math.cos(b.a)*(G.pw/2+10+80*e),ey=Math.sin(b.a)*(G.ph/2+10+80*e);b.c.setAttribute('cx',G.cx+ex);b.c.setAttribute('cy',G.cy+ey);b.c.setAttribute('opacity',Math.sin(Math.PI*clp(k,0,1))*.8)});
  if(k>=1){ev=null;ring.setAttribute('opacity',0);bu.forEach(b=>b.c.setAttribute('opacity',0))}}})(0);
})();


    // Intercept navigation
    // Removed root redeclaration
    if(root) {
      const navLinks = root.querySelectorAll('a[href^="#"]');
      navLinks.forEach(l => {
        l.addEventListener('click', (e) => {
          const id = l.getAttribute('href');
          const target = root.querySelector(id);
          if(target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });
      
      const launchLinks = root.querySelectorAll('a[href="/terminal"]');
      launchLinks.forEach(l => {
        l.addEventListener('click', (e) => {
          e.preventDefault();
          if (onLaunch) onLaunch();
        });
      });
    }

    return () => {
      observers.forEach(obs => obs.disconnect());
      rafIds.forEach(id => window.cancelAnimationFrame(id));
      eventListeners.forEach(({ event, handler, options, target }) => {
        target.removeEventListener(event, handler, options);
      });
    };
  }, [onLaunch]);

  return (
    <div className="landing-page-root" ref={containerRef} dangerouslySetInnerHTML={{ __html: `
<div class="cur" id="cur" aria-hidden="true"></div>
<nav id="nav" aria-label="Primary">
  <a href="#hero" class="logo">PillerStreet<small>MARKET INTELLIGENCE PLATFORM</small></a>
  <div class="links"><a href="#signals">PLATFORM</a><a href="#agents">AGENTS</a><a href="#ask">INTELLIGENCE</a><a href="#lab">RISK</a></div>
  <a class="btn p mag" href="/terminal">LAUNCH PILLERSTREET</a>
</nav>

<main>
<section id="hero">
  <div class="hero-in">
    <div class="lab fade">System online · demo environment</div>
    <h1 style="margin-top:22px"><span class="ln"><span>Turn market noise</span></span><span class="ln"><span>into financial intelligence.</span></span></h1>
    <div class="hrow"><div class="hl"><p class="sub fade" style="margin-top:28px">Connect markets, news, macro events, weather, historical context and portfolio risk through one intelligent terminal.</p>
    <div class="cta fade"><a class="btn p mag" href="/terminal">LAUNCH PILLERSTREET</a><a class="btn mag" href="#signals">EXPLORE INTELLIGENCE</a></div></div><canvas id="cv" aria-hidden="true"></canvas></div>
  </div>
</section>

<section id="signals">
  <h2>Every market move leaves a signal.</h2>
  <div class="sgw"><svg id="sgs" role="group" aria-label="Six signals feeding one financial intelligence engine"></svg><div class="sgt" id="sgt" aria-live="polite"></div></div>
  <div class="sgv">Six signals. One <em>financial intelligence</em>.</div>
</section>

<section id="agents">
  <h2>One question. Multiple specialized agents.</h2>
  <div class="ag">
    <ul class="al" id="al" aria-label="Agents">
      <li tabindex="0" class="on" data-i="0"><b>Sentiment agent</b><span>Financial news · FinBERT · sentiment</span></li>
      <li tabindex="0" data-i="1"><b>Weather &amp; macro agent</b><span>Weather events · macroeconomic conditions</span></li>
      <li tabindex="0" data-i="2"><b>Risk agent</b><span>Exposure · VaR · Expected Shortfall · stress</span></li>
      <li tabindex="0" data-i="3"><b>Hedging agent</b><span>Simulated hedge · reallocation</span></li>
    </ul>
    <div class="panel" id="pn"></div>
  </div>
  <p class="lab" style="margin-top:30px">Shared context: Contextual RAG · cross-asset context · scenario engine · FinBuddy synthesis</p>
</section>

<section id="ask">
  <div class="fld" id="fld" aria-hidden="true"><i class="bl b1"></i><i class="bl b2"></i><i class="bl b3"></i><i class="bl b4"></i><i class="bl b5"></i></div>
  <h2>Ask the market<br>a question.</h2>
  <div class="stage" id="stg"><div class="glow" aria-hidden="true"></div><svg id="fs" aria-hidden="true"></svg>
  <div class="ask">
    <p class="q" id="qq">“What happens to my energy portfolio if a major weather event disrupts regional production?”</p>
    <div class="pl" id="pl"><svg id="qpv" aria-hidden="true"></svg></div>
    <button class="btn mag" id="run">RUN DEMO QUERY</button>
    <span class="tag" id="bdg" style="margin-left:12px"><i class="bd"></i>BAY OF BENGAL FLOOD EVENT · SIMULATION</span>
    <p class="lab" style="margin:16px 0 0">Simulation · not live data · no trade execution</p>
    <div class="res" id="res" aria-live="polite"><div class="lab">Intelligence ready</div>
      <div class="rr"><span>Portfolio impact</span><b id="xi" style="color:var(--risk)"></b></div>
      <div class="rr"><span>Risk reduction</span><b id="xr" style="color:var(--ok)"></b></div>
      <div class="rr" style="border:0"><span>Confidence</span><b id="xc"></b></div>
      <div class="rf"><span class="tag">SIMULATED · NOT EXECUTED</span><span class="lab">Not live data</span></div></div>
  </div>
  </div>
</section>

<section id="lab">
  <h2>Don't predict one future. Simulate several.</h2>
  <div class="lab-g">
    <div class="ctl">
      <div><label for="r1"><span>EVENT INTENSITY</span><span class="num cv" id="v1"></span></label><input id="r1" type="range" min="1" max="10" step="1" value="6"><p class="hint">How hard the simulated shock hits, and how widely outcomes spread.</p></div>
      <div><label for="r2"><span>ENERGY EXPOSURE</span><span class="num cv" id="v2"></span></label><input id="r2" type="range" min="10" max="90" step="1" value="40"><p class="hint">Share of the portfolio that reacts to the energy shock.</p></div>
      <div><label for="r3"><span>HEDGE SIZE</span><span class="num cv" id="v3"></span></label><input id="r3" type="range" min="0" max="80" step="1" value="25"><p class="hint">Protection layered over the downside. Costs more as it grows.</p></div>
      <span class="tag" style="margin-top:28px">SIMULATION ONLY · NO REAL TRADE EXECUTION</span>
    </div>
    <div>
      <div class="gcard">
        <div class="ghd"><span class="tag">SIMULATION · NOT A FORECAST · NOT REAL TRADE EXECUTION</span>
          <div class="lg"><span><i style="background:var(--risk)"></i>Unhedged</span><span><i style="background:var(--ok)"></i>Hedged</span><span><i style="background:var(--g1);opacity:.45"></i>Other scenarios</span></div></div>
        <svg id="lg" role="img" aria-label="Simulated portfolio scenario paths after an energy shock"></svg>
      </div>
      <div class="met num">
        <div class="r"><span class="lab">VaR</span><b id="mv"></b></div>
        <div class="r"><span class="lab">Exp. shortfall</span><b id="me"></b></div>
        <div class="y"><span class="lab">Hedge cost</span><b id="mc"></b></div>
        <div class="g"><span class="lab">VaR after hedge</span><b id="mh"></b></div>
        <div class="g"><span class="lab">Risk reduction</span><b id="mr"></b></div>
        <div class="g"><span class="lab">Loss reduction</span><b id="ml"></b></div>
      </div>
      <p class="lab" style="margin-top:18px">Illustrative model · demo portfolio $2.4M · hypothetical</p>
    </div>
  </div>
  <div class="tw"><table>
    <thead><tr><th>ASSET</th><th>ACTION</th><th>ALLOCATION</th><th>EXPECTED EFFECT</th><th>REASON</th></tr></thead>
    <tbody>
      <tr><td>Energy equities</td><td>Reduce</td><td class="num">−6%</td><td class="ok">Lower concentration</td><td>Regional production exposure</td></tr>
      <tr><td>Crude futures</td><td>Hedge (simulated)</td><td class="num">+4%</td><td class="ok">Offsets supply shock</td><td>Matches historical analog</td></tr>
      <tr><td>Treasuries</td><td>Increase</td><td class="num">+2%</td><td class="ok">Lower volatility</td><td>Cross-asset context</td></tr>
    </tbody></table></div>
  <p class="tag">SIMULATION ONLY · NOT EXECUTED</p>
</section>

<section id="evidence">
  <h2>Every decision leaves a trail.</h2>
  <div class="jg">
    <div class="jl" id="jc" aria-live="polite"><div class="lab" id="jk"></div><h3 id="jt"></h3><div class="js" id="js"></div><p id="jd"></p><span class="tag" id="jtag"></span></div>
    <svg id="jsv" viewBox="0 0 620 520" role="group" aria-label="Decision journey: select a milestone">
      <defs><linearGradient id="jgr" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="580" y2="0"><stop offset="0" stop-color="#06b6d4"/><stop offset="1" stop-color="#4f46e5"/></linearGradient><filter id="jf" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs>
      <path id="jb" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
      <path id="jglow" fill="none" stroke="url(#jgr)" stroke-width="12" stroke-linecap="round" opacity=".3" filter="url(#jf)"/>
      <path id="ja" fill="none" stroke="url(#jgr)" stroke-width="4" stroke-linecap="round"/>
      <g id="jn"></g>
    </svg>
  </div>
  <p class="lab" style="margin-top:28px">Auditable · explainable · traceable · demo evidence</p>
</section>

<section id="end">
  <canvas id="cv2" aria-hidden="true"></canvas>
  <h2>Ask better questions. Understand the risk. See what matters next.</h2>
  <p class="sub">Turn fragmented financial and alternative data into explainable portfolio intelligence.</p>
  <div class="cta"><a class="btn p mag" href="/terminal">LAUNCH PILLERSTREET</a><a class="btn mag" href="#hero">EXPLORE INTELLIGENCE</a></div>
</section>
</main>

<footer>
  <div><span class="logo" style="font-size:15px">PillerStreet</span><br>MARKET INTELLIGENCE PLATFORM</div>
  <nav aria-label="Footer"><a href="#signals">Platform</a><a href="#ask">Intelligence</a><a href="#agents">Agents</a><a href="#lab">Risk</a><a href="https://github.com/">GitHub</a></nav>
  <div>BUILT FOR CODE UTSAVA X.0</div>
</footer>

` }} />
  );
};
