import {orderedAccounts,accountScorecard} from './account-access.js';
const $=s=>document.querySelector(s);
const WIDTH=1440,HEIGHT=810;
const overlay=document.createElement('div');
overlay.id='presentation';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Executive slide presentation');
overlay.innerHTML=`<div class="deck-viewport"><div class="deck-stage"></div></div><div class="deck-toolbar"><div class="deck-identity">AJ <span>OPENAI / NORDICS</span></div><div class="deck-navigation"><button id="deck-prev" aria-label="Previous slide">←</button><label class="deck-jump-label"><span class="sr-only">Choose slide</span><select id="deck-jump" aria-label="Choose slide"></select></label><span id="deck-counter" aria-live="polite"></span><button id="deck-next" aria-label="Next slide">→</button></div><div class="deck-actions"><button id="deck-fullscreen">Full screen ⛶</button><button id="deck-exit">Exit <span>Esc</span></button></div></div><div id="deck-status" role="status" class="sr-only"></div>`;
document.body.append(overlay);
const stage=overlay.querySelector('.deck-stage');
let slides=[],current=0,active=false,hadFullscreen=false,returnFocus=null;
const titleMarkup=(eyebrow,title,intro='')=>`<div class="eyebrow">${eyebrow}</div><h2 class="story-title">${title}</h2>${intro?`<p class="section-intro">${intro}</p>`:''}`;
function part(selector){
 const source=$(selector);if(!source)return '';
 const clone=source.cloneNode(true);
 [clone,...clone.querySelectorAll('[id]')].forEach(el=>el.removeAttribute('id'));
 clone.querySelectorAll('[aria-labelledby],[aria-describedby]').forEach(el=>{el.removeAttribute('aria-labelledby');el.removeAttribute('aria-describedby')});
 return clone.outerHTML;
}
function chapter(id,omit=[]){return [...$('#'+id).children].filter(x=>!omit.some(selector=>x.matches(selector))).map(x=>{const clone=x.cloneNode(true);[clone,...clone.querySelectorAll('[id]')].forEach(el=>el.removeAttribute('id'));return clone.outerHTML}).join('')}
function buildSlides(){
 const won=orderedAccounts('history');
 slides=[
  {group:'overview',title:'Nordic opportunity & future state',class:'deck-opening',html:part('#overview>.eyebrow')+part('.opportunity-opening')+part('.future-state')},
  {group:'overview',title:'The $12B market opportunity',class:'deck-market',html:titleMarkup('01 / MARKET OPPORTUNITY','Early adoption. <em>Global enterprise potential.</em>')+part('.opportunity-grid')+'<p class="fine">Full-adoption planning scenario, not a published market measurement. Worker eligibility, group counts and spend are assumptions; source links support market readiness. The lower-spend case is $5.66B.</p>'},
  {group:'pains',title:'Trust and the cost of delay',class:'deck-risks',html:chapter('pains')},
  {group:'capabilities',title:'Five required capabilities',class:'deck-capabilities',html:chapter('capabilities')},
  {group:'leadership',title:'Alexander — build and sell',class:'deck-leadership',html:chapter('leadership',['.leader-network'])},
  {group:'wins',title:'Customer wins & relationship access',class:'deck-wins-summary',html:titleMarkup('05 / CUSTOMER WINS & TRUSTED ACCESS','Business won. <em>Relationships built.</em>','27 prior-business accounts, six connection-only accounts and one relationship to confirm. Access totals cover all 34 names.')+part('#wins .wins-metrics')+part('#wins .scorecard-legend')+'<div class="deck-account-intro"><h3>Every account. A clear first opportunity.</h3><p>The next slides list each customer’s logo, modeled annual TAM and first workflow to qualify. Relationship access is consolidated in the scorecard above.</p><p>Seven prior-business accounts and two connection-only accounts are proposed lighthouses. Lighthouse status is a pursuit priority, not a customer commitment.</p></div><p class="fine">TAM is full-adoption annual spend across global operations, not historic bookings or current pipeline. Contacts may hold both roles; do not add champion and EB totals as unique people.</p>'},
 ];
 for(let start=0;start<won.length;start+=7){
  slides.push({group:'wins',title:`Customer accounts ${start+1}–${Math.min(start+7,won.length)}`,class:'deck-accounts',html:titleMarkup('05 / CUSTOMER-WIN & PRIOR-BUSINESS ACCOUNTS',`Trusted access. <em>Accounts ${start+1}–${Math.min(start+7,won.length)} of ${won.length}.</em>`)+part('#wins .scorecard-legend')+accountScorecard(won.slice(start,start+7),{links:false})+'<p class="fine">TAM uses the base full-adoption model; opportunity descriptions are hypotheses, with buyer, budget and deal value still to qualify.</p>'});
 }
 slides.push(
  {group:'wins',title:'Additional champion & buyer connections',class:'deck-accounts',html:titleMarkup('05 / CONNECTION-ONLY ACCOUNTS','Six more routes <em>to open.</em>','These accounts are not counted as prior business. Lighthouse icons mark proposed priorities.')+accountScorecard(orderedAccounts('connection'),{links:false})+'<p class="fine">Account access is self-reported. Counts do not imply current buying intent. Hafslund is also included in the 34-account totals; its relationship status remains to confirm.</p>'},
  {group:'execution',title:'Execution, hiring milestones & ARR',class:'deck-execution',html:chapter('execution',['.execution-hiring','.fine'])+'<p class="fine">Proposed cumulative targets. ARR is incremental recurring revenue, excluding existing business and one-off fees. Timing depends on hiring, buying cycles and adoption. Managers are first-line sales managers.</p>'},
  {group:'execution',title:'Build the Nordic team — my hiring plan',class:'deck-hiring',html:chapter('hiring',['.brief-detail'])},
  {group:'asks',title:'The mandate & next steps',class:'deck-mandate',html:chapter('asks',['.brief-detail'])}
 );
 stage.innerHTML=slides.map((slide,i)=>`<section class="deck-slide ${slide.class}" data-slide="${i}" aria-label="Slide ${i+1}: ${slide.title}" hidden><div class="deck-slide-body">${slide.html}</div><div class="deck-slide-footer"><span>Alexander Jaballah · Nordic growth plan</span><span>OPENAI / NORDICS <b>${String(i+1).padStart(2,'0')}</b></span></div></section>`).join('');
 $('#deck-jump').innerHTML=slides.map((s,i)=>`<option value="${i}">${i+1}. ${s.title}</option>`).join('');
}
function resize(){
 if(!active)return;
 const viewport=overlay.querySelector('.deck-viewport');
 const scale=Math.min((viewport.clientWidth-32)/WIDTH,(viewport.clientHeight-24)/HEIGHT);
 stage.style.width=WIDTH+'px';stage.style.height=HEIGHT+'px';stage.style.transform=`scale(${Math.max(.1,scale)})`;
}
function showSlide(index){
 current=Math.max(0,Math.min(slides.length-1,index));
 stage.querySelectorAll('.deck-slide').forEach((slide,i)=>{slide.hidden=i!==current});
 $('#deck-counter').textContent=`${current+1} / ${slides.length}`;
 $('#deck-jump').value=String(current);
 $('#deck-prev').disabled=current===0;$('#deck-next').disabled=current===slides.length-1;
 $('#deck-status').textContent=`Slide ${current+1} of ${slides.length}: ${slides[current].title}`;
 resize();
}
async function fullScreen(){
 if(document.fullscreenElement){await document.exitFullscreen();return}
 try{if(!overlay.requestFullscreen)throw new Error('unsupported');await overlay.requestFullscreen();hadFullscreen=true;$('#deck-fullscreen').textContent='Window ⛶'}
 catch{$('#deck-status').textContent='Presentation opened in this window. Full-screen display is unavailable in this browser.';$('#deck-fullscreen').textContent='Try full screen ⛶'}
 resize();
}
function enter(){
 if(active)return;
 returnFocus=document.activeElement;
 buildSlides();active=true;overlay.hidden=false;document.body.classList.add('presenting');
 $('.workspace').inert=true;$('.sidebar').inert=true;
 const requestedGroup=location.hash.slice(1)||'overview';const group=requestedGroup==='hiring'?'execution':requestedGroup;showSlide(Math.max(0,slides.findIndex(s=>s.group===group)));
 $('#deck-exit').focus();fullScreen();
}
function exit(){
 if(!active)return;
 active=false;hadFullscreen=false;overlay.hidden=true;document.body.classList.remove('presenting');
 $('.workspace').inert=false;$('.sidebar').inert=false;
 const restoreFocus=()=>requestAnimationFrame(()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})});
 if(document.fullscreenElement===overlay)document.exitFullscreen().then(restoreFocus).catch(restoreFocus);
 else restoreFocus();
}
$('#present').addEventListener('click',enter);
$('#deck-prev').addEventListener('click',()=>showSlide(current-1));
$('#deck-next').addEventListener('click',()=>showSlide(current+1));
$('#deck-jump').addEventListener('change',e=>showSlide(Number(e.target.value)));
$('#deck-exit').addEventListener('click',exit);
$('#deck-fullscreen').addEventListener('click',()=>{if(document.fullscreenElement){hadFullscreen=false}fullScreen()});
document.addEventListener('fullscreenchange',()=>{
 if(active&&hadFullscreen&&!document.fullscreenElement){exit();return}
 $('#deck-fullscreen').textContent=document.fullscreenElement?'Window ⛶':'Full screen ⛶';resize();
});
document.addEventListener('keydown',event=>{
 if(!active)return;
 if(event.key==='Escape'){event.preventDefault();exit();return}
 if(event.key==='Tab'){
  const controls=[...overlay.querySelectorAll('button:not(:disabled),a[href],select')].filter(e=>e.getClientRects().length);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  return;
 }
 if(event.target.matches('select,input,textarea'))return;
 if(['ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();showSlide(current+1)}
 else if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();showSlide(current-1)}
 else if(event.key==='Home'){event.preventDefault();showSlide(0)}
 else if(event.key==='End'){event.preventDefault();showSlide(slides.length-1)}
});
overlay.addEventListener('click',event=>{const link=event.target.closest('a[href^="#"]');if(link){exit()}});
window.addEventListener('resize',resize);
