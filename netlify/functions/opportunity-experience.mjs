const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const safe=value=>String(value??'').trim();

function env(name){
  try{return Netlify.env.get(name)||''}catch{return''}
}

async function supabaseInsert(table,row){
  const url=env('SUPABASE_URL');
  const key=env('SUPABASE_SERVICE_ROLE_KEY')||env('SUPABASE_SERVICE_KEY');
  if(!url||!key)throw new Error('Marketplace database is not configured.');
  const response=await fetch(`${url.replace(/\/$/,'')}/rest/v1/${table}`,{
    method:'POST',
    headers:{apikey:key,authorization:`Bearer ${key}`,'content-type':'application/json',prefer:'return=minimal'},
    body:JSON.stringify([row]),
    signal:AbortSignal.timeout(20000),
  });
  if(!response.ok){
    const text=await response.text().catch(()=> '');
    throw new Error(`${table} insert ${response.status}: ${text.slice(0,240)}`);
  }
}

async function notifyOwner({kind,business,contactName,email,reference,comment,rating,permission}){
  const resendKey=env('RESEND_API_KEY');
  if(!resendKey)return;
  const from=env('RESEND_FROM_EMAIL')||'APROPOS Group LLC <jmitchell@aproposgroupllc.com>';
  const to=env('RESEND_TO_EMAIL')||'jmitchell@aproposgroupllc.com';
  const text=[
    `Type: ${kind}`,
    `Business: ${business}`,
    `Contact: ${contactName||'Unavailable'}`,
    `Email: ${email||'Unavailable'}`,
    `Opportunity Reference: ${reference||'Unavailable'}`,
    kind==='COMMENT'?`Rating: ${rating||'Not provided'}`:'',
    kind==='COMMENT'?`Permission to publish: ${permission?'YES':'NO'}`:'',
    kind==='COMMENT'?`Comment: ${comment||'(blank)'}`:'Offer: qualified opportunity delivery interest',
  ].filter(Boolean).join('\n');
  await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{authorization:`Bearer ${resendKey}`,'content-type':'application/json'},
    body:JSON.stringify({
      from,
      to:[to],
      subject:kind==='COMMENT'?`Marketplace Review Submitted: ${business}`:`Opportunity Delivery Interest: ${business}`,
      text,
    }),
    signal:AbortSignal.timeout(20000),
  }).catch(()=>{});
}

export default async req=>{
  if(req.method!=='POST')return json(405,{ok:false,error:'POST only.'});

  const body=await req.json().catch(()=>({}));
  const kind=safe(body.kind);
  if(!['COMMENT','QUALIFIED_OPPORTUNITY_DELIVERY_INTEREST'].includes(kind)){
    return json(400,{ok:false,error:'Unsupported response type.'});
  }

  const business=safe(body.business_name)||'Opportunity recipient';
  const contactName=safe(body.contact_name);
  const email=safe(body.contact_email);
  const reference=safe(body.opportunity_reference).toUpperCase();
  const noticeId=safe(body.notice_id);
  const comment=safe(body.comment);
  const rawRating=Number(body.rating);
  const rating=Number.isInteger(rawRating)&&rawRating>=1&&rawRating<=5?rawRating:null;
  const permission=body.permission_to_publish===true;

  try{
    if(kind==='COMMENT'){
      if(!comment)return json(400,{ok:false,error:'Please enter a comment before submitting.'});
      await supabaseInsert('marketplace_reviews',{
        business_name:business,
        reviewer_name:contactName||null,
        contact_email:email||null,
        opportunity_reference:reference||null,
        notice_id:noticeId||null,
        rating,
        comment,
        permission_to_publish:permission,
        approved:false,
        source:'opportunity_experience',
      });
    }else{
      await supabaseInsert('marketplace_lead_intake',{
        business_name:business,
        contact_name:contactName||'Opportunity recipient',
        contact_email:email||'unknown@recipient.invalid',
        contact_phone:null,
        business_website:null,
        city:null,
        state:null,
        naics_hint:null,
        notes:`Interested in qualified opportunity delivery. Reference: ${reference||'Unavailable'}`,
        source:'opportunity_experience',
      });
    }

    await notifyOwner({kind,business,contactName,email,reference,comment,rating,permission});
    return json(200,{ok:true,review_status:kind==='COMMENT'?'PENDING_APPROVAL':undefined});
  }catch(error){
    console.error('[opportunity-experience]',error);
    return json(500,{ok:false,error:'Your response could not be saved. Please try again.'});
  }
};

export const config={path:'/api/opportunity-experience'};
