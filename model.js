export const segments = [
  { name: 'Strategic groups', accounts: 100, workers: 25000, api: 25000000 },
  { name: 'Large enterprises', accounts: 400, workers: 5000, api: 5000000 },
  { name: 'Upper mid-market', accounts: 1500, workers: 750, api: 500000 }
];
export const presets = {
  measured: {workers:75, price:60, api:50, adoption:30, apiAdoption:30, opportunities:100, win:20, acv:2500, slippage:10},
  ambition: {workers:100, price:100, api:100, adoption:50, apiAdoption:50, opportunities:160, win:25, acv:2500, slippage:0},
  breakout: {workers:120, price:150, api:150, adoption:60, apiAdoption:65, opportunities:240, win:30, acv:3000, slippage:5}
};
export function calculate(p) {
  const eligibleWorkers = segments.reduce((s,x)=>s+x.accounts*x.workers,0)*p.workers/100;
  const seats = eligibleWorkers*p.price*12;
  const api = segments.reduce((s,x)=>s+x.accounts*x.api,0)*p.api/100;
  const tam = seats+api;
  const sam = seats*p.adoption/100+api*p.apiAdoption/100;
  const wins = p.opportunities*p.win/100*(1-p.slippage/100);
  const pipeline = p.opportunities*p.acv*1000;
  const bookings = wins*p.acv*1000;
  return {eligibleWorkers,seats,api,tam,sam,wins,pipeline,bookings,coverage:bookings?pipeline/bookings:0};
}
