import {accessProgress,orderedAccounts,accountScorecard} from './account-access.js';
import {network,accountPotential} from './network.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=(n,d=2)=>'$'+(n>=1e9?(n/1e9).toLocaleString('en-US',{maximumFractionDigits:d})+'B':n>=1e6?(n/1e6).toLocaleString('en-US',{maximumFractionDigits:d})+'M':Math.round(n/1000)+'k');
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>e.classList.remove('show'),3500)};
const storyIds=['overview','pains','capabilities','leadership','wins','execution','asks'];
function markNavigation(id){$$('[data-nav]').forEach(a=>{const active=a.dataset.nav===id;a.classList.toggle('active',active);active?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});}
function navigate(){
 const requested=location.hash.slice(1)||'overview';
 const aliases={main:'overview',hiring:'execution'};
 const id=aliases[requested]||requested;
 const valid=storyIds.includes(id)?id:'overview';
 markNavigation(valid);
 requestAnimationFrame(()=>{if(valid==='overview')window.scrollTo({top:0,behavior:'instant'});else $('#'+valid).scrollIntoView({behavior:'instant',block:'start'});});
}
window.addEventListener('hashchange',navigate);navigate();
const chapterObserver=new IntersectionObserver(entries=>{const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible.length)markNavigation(visible[0].target.id);},{rootMargin:'-5% 0px -70% 0px',threshold:0});
$$('.story-section').forEach(section=>chapterObserver.observe(section));
$('#copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('Link copied. Anyone with the link can view this dashboard.')}catch{const input=document.createElement('textarea');input.value=location.href;document.body.append(input);input.select();const copied=document.execCommand('copy');input.remove();toast(copied?'Link copied. Anyone with the link can view this dashboard.':'Copy the address from your browser to share this section.')}});
$('#print').addEventListener('click',()=>window.print());

const wonAccounts=orderedAccounts('history');
$('#won-account-scorecard').innerHTML=accountScorecard(wonAccounts,{links:false});
$('#connection-account-scorecard').innerHTML=accountScorecard(orderedAccounts('connection'),{links:false});
$('#wins-tam').textContent=money(network.reduce((total,a)=>total+accountPotential(a).total,0));
for(const [id,key] of [['wins-champions','champions'],['wins-buyers','economicBuyers']]){const progress=accessProgress(network,key);const el=$('#'+id);el.textContent=progress.label;el.classList.toggle('pending-total',!progress.reported);el.nextElementSibling.textContent=`${key==='champions'?'champion':'economic-buyer'} contacts · across all ${progress.total} named accounts`;}
