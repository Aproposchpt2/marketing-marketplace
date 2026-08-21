const RFCP='https://federalcontractorportal.aproposgroupllc.com';
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});

export default async (req)=>{
  try{
    const url=new URL(req.url);
    const action=String(url.searchParams.get('action')||'').trim();
    const token=String(url.searchParams.get('t')||'').trim();

    if(action==='claim'&&req.method==='POST'){
      const payload=await req.json().catch(()=>({}));
      const r=await fetch(`${RFCP}/.netlify/functions/ngcc-federal-claim`,{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify(payload),
        signal:AbortSignal.timeout(30000),
      });
      return new Response(await r.text(),{status:r.status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
    }

    if(token.length<32) return json(400,{ok:false,error:'A valid federal Opportunity Workspace token is required.'});

    if(action==='workspace'&&req.method==='GET'){
      const r=await fetch(`${RFCP}/.netlify/functions/ngcc-federal-workspace?t=${encodeURIComponent(token)}`,{
        headers:{accept:'application/json'},
        signal:AbortSignal.timeout(35000),
      });
      return new Response(await r.text(),{status:r.status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'private, no-store'}});
    }

    if(action==='package'&&req.method==='GET'){
      const r=await fetch(`${RFCP}/.netlify/functions/ngcc-federal-package?t=${encodeURIComponent(token)}`,{
        signal:AbortSignal.timeout(90000),
      });
      if(!r.ok){
        return new Response(await r.text(),{status:r.status,headers:{'content-type':r.headers.get('content-type')||'application/json','cache-control':'no-store'}});
      }
      return new Response(await r.arrayBuffer(),{status:200,headers:{
        'content-type':'application/zip',
        'content-disposition':r.headers.get('content-disposition')||'attachment; filename="APROPOS_Federal_Contract_Package.zip"',
        'cache-control':'private, no-store',
        'x-content-type-options':'nosniff',
        'x-apropos-package-status':r.headers.get('x-apropos-package-status')||'',
      }});
    }

    return json(405,{ok:false,error:'Unsupported federal opportunity action.'});
  }catch(error){
    console.error('[federal-opportunity]',error);
    return json(502,{ok:false,error:'The APROPOS federal opportunity service is temporarily unavailable.'});
  }
};

export const config={path:'/api/federal-opportunity'};
