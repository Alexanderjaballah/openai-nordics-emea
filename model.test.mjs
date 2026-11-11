import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate,presets} from './model.js';
import {roles,capacity,costs,headcount,isNordicPriority} from './plan.js';
import {network,accountPotential,portfolioPotential} from './network.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<.01,`${a} != ${b}`);

test('Nordic organisation respects manager and SE spans through all hiring waves',()=>{
  const byId=Object.fromEntries(roles.map(r=>[r.id,r]));
  assert.equal(byId.second.months[5],1);
  assert.equal(byId.first.months[5],3);
  assert.equal(byId.ae.months[5],21);
  assert.equal(byId.se.months[5],8);
  for(let i=0;i<6;i++){
    assert.ok(byId.ae.months[i]<=7*byId.first.months[i]);
    assert.ok(byId.se.months[i]<=8);
  }
  assert.deepEqual([1,2,3,6].map(headcount),[12,23,35,50]);
  assert.equal(21/8,2.625);
});
test('monthly hiring cost reconciles to the Nordic resource envelope',()=>{
  const r=costs();close(r.annualPeople,10880000);close(r.yearOnePeople,9231666.666666667);
  close(r.yearOneTotal,10731666.666666667);close(r.yearOneTotal-r.yearOnePeople,1500000);
});
test('ramped seller capacity supports the base Nordic ambition, not every scenario',()=>{
  const r=calculate(presets.ambition);close(r.sellerCapacity.productiveMonths,177.5);
  close(r.sellerCapacity.wins,44.375);close(r.wins,40);close(r.bookings,100000000);
  close(r.pipeline,400000000);close(r.coverage,4);close(r.capacityARR,110937500);
  assert.ok(calculate(presets.breakout).wins>r.sellerCapacity.wins);
  assert.ok(capacity({throughMonth:3}).wins>=2);assert.ok(capacity({throughMonth:3}).wins<4);
  assert.ok(capacity({throughMonth:6}).wins>=12);
});
test('hiring delay constrains capacity without inflating demand or changing TAM',()=>{
  const b=calculate(presets.ambition),d=calculate({...presets.ambition,hireDelay:1});
  close(d.sellerCapacity.wins,39.125);close(d.capacityConstrainedARR,97812500);
  close(d.tam,b.tam);close(d.bookings,b.bookings);
  close(calculate({...presets.ambition,hireDelay:2}).capacityARR,84687500);
  close(capacity({throughMonth:3,hireDelay:3}).wins,0);
});
test('market scenarios and commercial slippage retain their definitions',()=>{
  const b=calculate(presets.ambition);close(b.tam,12000000000);close(b.sam,6000000000);
  close(calculate(presets.measured).tam,5662500000);close(calculate(presets.breakout).tam,20025000000);
  close(calculate({...presets.ambition,slippage:20}).bookings,80000000);
});
test('all 34 accounts remain, with Nordic priority and wider network reconciled',()=>{
  assert.equal(network.length,34);assert.equal(new Set(network.map(a=>a.id)).size,34);
  const nordic=network.filter(isNordicPriority),wider=network.filter(a=>!isNordicPriority(a));
  assert.equal(nordic.length,31);assert.deepEqual(wider.map(a=>a.name).sort(),['Allianz','Deutsche Börse','Emirates']);
  const sum=arr=>arr.reduce((n,a)=>n+accountPotential(a).total,0);
  close(sum(nordic),1893412000);close(sum(nordic.filter(a=>a.relationship!=='review')),1887472400);
  close(sum(nordic)+sum(wider),portfolioPotential().total);close(portfolioPotential().total,2328620400);
});
