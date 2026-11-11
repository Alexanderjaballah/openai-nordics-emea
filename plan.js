// Nordic operating plan. Role starts, costs and ramp are planning assumptions.
export const roles = [
  {id:'second',name:'Second-line sales leader',annualCost:300000,months:[1,1,1,1,1,1],basis:'Reported sales plan'},
  {id:'first',name:'First-line sales managers',annualCost:300000,months:[1,2,3,3,3,3],basis:'Reported sales plan · 7 sellers each'},
  {id:'ae',name:'Enterprise sellers',annualCost:250000,months:[4,8,14,17,19,21],basis:'Reported sales plan · 21 total'},
  {id:'se',name:'Solutions engineers',annualCost:200000,months:[2,4,6,7,8,8],basis:'Proposed coverage · one team of 8'},
  {id:'seManager',name:'SE manager',annualCost:250000,months:[0,1,1,1,1,1],basis:'Planning assumption · separate from 8 SEs'},
  {id:'cs',name:'Customer success',annualCost:180000,months:[1,2,3,4,5,6],basis:'Supporting capacity assumption'},
  {id:'sdr',name:'Sales development',annualCost:120000,months:[2,3,4,5,6,6],basis:'Supporting capacity assumption'},
  {id:'partners',name:'Partner leads',annualCost:200000,months:[1,1,2,2,3,3],basis:'Supporting capacity assumption'},
  {id:'ops',name:'Enablement / operations',annualCost:180000,months:[0,1,1,1,1,1],basis:'Supporting capacity assumption'}
];
export const ramp = [.25,.5,.75,1];
export const winsPerProductiveSellerYear = 3;
export const activationBudget = 1500000;
export const widerNetworkIds = ['deutsche','allianz','emirates'];
export const isNordicPriority = account => !widerNetworkIds.includes(account.id);
export function headcount(month=6){return roles.reduce((n,r)=>n+r.months[Math.min(Math.max(month,1),6)-1],0)}
export function capacity({throughMonth=12,hireDelay=0}={}){
  const starts=roles.find(r=>r.id==='ae').months;
  let productiveMonths=0;
  starts.forEach((total,i)=>{
    const cohort=total-(starts[i-1]||0);
    for(let month=i+1+hireDelay;month<=throughMonth;month++){
      const tenure=month-(i+1+hireDelay);
      productiveMonths+=cohort*ramp[Math.min(tenure,ramp.length-1)];
    }
  });
  return {productiveMonths,productiveSellerYears:productiveMonths/12,wins:productiveMonths/12*winsPerProductiveSellerYear};
}
export function costs(){
  const annualPeople=roles.reduce((n,r)=>n+r.months[5]*r.annualCost,0);
  const yearOnePeople=roles.reduce((n,r)=>n+(r.months.reduce((a,b)=>a+b,0)+r.months[5]*6)/12*r.annualCost,0);
  return {annualPeople,yearOnePeople,activationBudget,yearOneTotal:yearOnePeople+activationBudget};
}
