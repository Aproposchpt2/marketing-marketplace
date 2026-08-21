const NATCORP='https://natcorp.aproposgroupllc.com';
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});

export default async ()=>json(410,{
  ok:false,
  error:'This legacy complimentary state/local opportunity route has been retired. Continue with the National Corporate Contract Exchange (NAT-CORP).',
  redirect_url:NATCORP,
});

export const config={path:'/api/complimentary-opportunity'};
