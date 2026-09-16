const json=(status,data,extra={})=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=60, stale-while-revalidate=300',...extra}});

function env(name){
  try{return Netlify.env.get(name)||''}catch{return''}
}

export default async req=>{
  if(req.method!=='GET')return json(405,{ok:false,error:'GET only.'},{'cache-control':'no-store'});

  const url=env('SUPABASE_URL');
  const key=env('SUPABASE_SERVICE_ROLE_KEY')||env('SUPABASE_SERVICE_KEY');
  if(!url||!key)return json(500,{ok:false,error:'Marketplace review service is not configured.'},{'cache-control':'no-store'});

  const requestUrl=new URL(req.url);
  const requested=Math.max(1,Math.min(Number(requestUrl.searchParams.get('limit')||24)||24,50));
  const query=new URLSearchParams({
    select:'id,business_name,reviewer_name,rating,comment,created_at,published_at',
    approved:'eq.true',
    permission_to_publish:'eq.true',
    order:'published_at.desc.nullslast,created_at.desc',
    limit:String(requested),
  });

  try{
    const response=await fetch(`${url.replace(/\/$/,'')}/rest/v1/marketplace_reviews?${query.toString()}`,{
      headers:{apikey:key,authorization:`Bearer ${key}`},
      signal:AbortSignal.timeout(15000),
    });
    const text=await response.text();
    if(!response.ok)throw new Error(`Review read ${response.status}: ${text.slice(0,200)}`);
    const reviews=text?JSON.parse(text):[];
    return json(200,{ok:true,reviews:Array.isArray(reviews)?reviews:[]});
  }catch(error){
    console.error('[marketplace-reviews]',error);
    return json(500,{ok:false,error:'Marketplace reviews are temporarily unavailable.'},{'cache-control':'no-store'});
  }
};

export const config={path:'/api/marketplace-reviews'};
