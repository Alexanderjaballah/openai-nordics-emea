import {network,networkCases,accountPotential} from './network.js';

// Only user-supplied, publishable aggregate counts belong here. Unknown is null, never zero.
export const accessCounts = Object.fromEntries(network.map(a=>[a.id,{champions:null,economicBuyers:null}]));
Object.assign(accessCounts,{seb:{champions:3,economicBuyers:1},nordea:{champions:4,economicBuyers:2},danske:{champions:1,economicBuyers:1},dnb:{champions:2,economicBuyers:2},swedbank:{champions:{min:3,max:4},economicBuyers:3}});
Object.assign(accessCounts,{ericsson:{champions:4,economicBuyers:2},novo:{champions:2,economicBuyers:2}});
Object.assign(accessCounts,{nbim:{champions:2,economicBuyers:1}});
export const lighthouseIds = ['seb','nordea','danske','dnb','swedbank','ericsson','novo','ikea','nokia'];
export const isLighthouse = a => lighthouseIds.includes(typeof a==='string'?a:a.id);
export function countBounds(value){
 if(Number.isInteger(value)&&value>=0)return {min:value,max:value};
 if(value&&Number.isInteger(value.min)&&Number.isInteger(value.max)&&value.min>=0&&value.max>=value.min)return value;
 return null;
}
export const countLabel = value => {const r=countBounds(value);return r?r.min===r.max?String(r.min):`${r.min}–${r.max}`:'To confirm'};
export function accessSummary(items,key){
 const values=items.map(a=>countBounds(accessCounts[a.id]?.[key]));
 return values.every(Boolean)?countLabel(values.reduce((n,v)=>({min:n.min+v.min,max:n.max+v.max}),{min:0,max:0})):'To confirm';
}
export function accessProgress(items,key){
 const values=items.map(a=>countBounds(accessCounts[a.id]?.[key])).filter(Boolean);
 return {reported:values.length,total:items.length,label:values.length?countLabel(values.reduce((n,v)=>({min:n.min+v.min,max:n.max+v.max}),{min:0,max:0})):'To confirm'};
}
export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const lighthouseBadge=a=>isLighthouse(a)?'<span class="lighthouse-badge" title="Proposed lighthouse priority"><img src="lighthouse.svg" alt="Proposed lighthouse" width="22" height="22"></span>':'';
export const accountMoney=n=>'$'+(n/1e6).toLocaleString('en-US',{maximumFractionDigits:2})+'M';
export function orderedAccounts(relationship){
 return network.filter(a=>a.relationship===relationship).sort((a,b)=>Number(isLighthouse(b))-Number(isLighthouse(a))||a.name.localeCompare(b.name));
}
export function accountScorecard(items,{links=true,scenario='ambition'}={}){
 return `<table class="relationship-scorecard"><thead><tr><th scope="col">Account</th><th scope="col">Champions</th><th scope="col">Economic buyers</th><th scope="col">Annual TAM</th><th scope="col">First opportunity to qualify</th></tr></thead><tbody>${items.map(a=>{
 const c=accessCounts[a.id];const total=accountPotential(a,networkCases[scenario]).total;
 const name=links?`<a href="#accounts" data-open-account="${a.id}">${escapeHtml(a.name)}</a>`:escapeHtml(a.name);
 return `<tr data-scorecard-account="${a.id}"><th scope="row"><span class="account-name-cell">${lighthouseBadge(a)}<span>${name}${['deutsche','emirates','allianz'].includes(a.id)?'<small>Wider EMEA network</small>':''}</span></span></th><td class="access-count ${c.champions===null?'unconfirmed':''}">${countLabel(c.champions)}</td><td class="access-count ${c.economicBuyers===null?'unconfirmed':''}">${countLabel(c.economicBuyers)}</td><td class="account-value">${accountMoney(total)}</td><td class="account-opportunity">${escapeHtml(a.wedge)}</td></tr>`;
 }).join('')}</tbody></table>`;
}
