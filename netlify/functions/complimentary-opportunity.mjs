const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});

function businessContractsBase(){
  const configured=String(Netlify.env.get('BUSINESSCONTRACTS_BASE_URL')||'').trim().replace(/\/+$/,'');
  if(!configured) throw new Error('BUSINESSCONTRACTS_BASE_URL is not configured.');
  const url=new URL(configured);
  const allowed=url.protocol==='https:'&&(
    url.hostname==='businesscontracts.aproposgroupllc.com'||
    url.hostname.endsWith('--apropos-opportunity-fulfillment.netlify.app')
  );
  if(!allowed) throw new Error('BUSINESSCONTRACTS_BASE_URL is not an approved BusinessContracts origin.');
  return url.origin;
}

async function proxyJson(url,options={}){
  const response=await fetch(url,{...options,signal:AbortSignal.timeout(30000)});
  return new Response(await response.text(),{
    status:response.status,
    headers:{
      'content-type':response.headers.get('content-type')||'application/json; charset=utf-8',
      'cache-control':'no-store',
      'x-content-type-options':'nosniff',
    },
  });
}

export default async req=>{
  try{
    const incoming=new URL(req.url);
    const action=String(incoming.searchParams.get('action')||'').trim();
    const base=businessContractsBase();

    if(action==='claim'&&req.method==='POST'){
      const payload=await req.json().catch(()=>({}));
      return proxyJson(`${base}/api/marketplace-claim`,{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify(payload),
      });
    }

    const token=String(incoming.searchParams.get('t')||'').trim();
    if(token.length<32) return json(400,{ok:false,error:'A valid workspace token is required.'});

    if(action==='workspace'&&req.method==='GET'){
      return proxyJson(`${base}/api/opportunity-workspace?t=${encodeURIComponent(token)}`,{
        headers:{accept:'application/json'},
      });
    }

    if(action==='workspace-event'&&req.method==='POST'){
      const payload=await req.json().catch(()=>({}));
      return proxyJson(`${base}/api/opportunity-workspace?t=${encodeURIComponent(token)}`,{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify(payload),
      });
    }

    if(action==='package'&&req.method==='GET'){
      const response=await fetch(`${base}/api/opportunity-package?t=${encodeURIComponent(token)}`,{
        signal:AbortSignal.timeout(60000),
      });
      if(!response.ok){
        return new Response(await response.text(),{
          status:response.status,
          headers:{
            'content-type':response.headers.get('content-type')||'application/json; charset=utf-8',
            'cache-control':'no-store',
            'x-content-type-options':'nosniff',
          },
        });
      }
      return new Response(await response.arrayBuffer(),{
        status:200,
        headers:{
          'content-type':response.headers.get('content-type')||'application/zip',
          'content-disposition':response.headers.get('content-disposition')||'attachment; filename="APROPOS_Contract_Package.zip"',
          'cache-control':'private, no-store',
          'x-content-type-options':'nosniff',
        },
      });
    }

    return json(405,{ok:false,error:'Unsupported Marketplace opportunity action.'});
  }catch(error){
    console.error('[complimentary-opportunity]',error);
    return json(502,{ok:false,error:'The APROPOS opportunity service is temporarily unavailable.'});
  }
};

export const config={path:'/api/complimentary-opportunity'};
