// /free-contract-offer lead intake — inserts into public.marketplace_lead_intake
// (Supabase, shared project) and fires an immediate email notification to the
// operator as a safety net, independent of whatever downstream process (the
// "Design Search Tool") later picks the lead up. Never exposes the Supabase
// service role key or internal error detail to the client.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'APROPOS Group LLC <jmitchell@aproposgroupllc.com>';
const RESEND_TO = process.env.RESEND_TO_EMAIL || 'jmitchell@aproposgroupllc.com';

const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
const safe = v => String(v ?? '').trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function insertLead(row) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/marketplace_lead_intake`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${SUPABASE_KEY}`, 'content-type': 'application/json', prefer: 'return=representation' },
    body: JSON.stringify([row]),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data?.[0];
}

async function notifyOperator(row) {
  if (!RESEND_KEY) { console.error('[submit-lead] RESEND_API_KEY not configured — skipping operator notification.'); return; }
  const lines = [
    `Business: ${row.business_name}`,
    `Contact: ${row.contact_name}`,
    `Email: ${row.contact_email}`,
    `Phone: ${row.contact_phone || 'Not provided'}`,
    `Website: ${row.business_website || 'Not provided'}`,
    `Location: ${[row.city, row.state].filter(Boolean).join(', ') || 'Not provided'}`,
    `NAICS (self-reported): ${row.naics_hint || 'Not provided'}`,
    `What they do: ${row.notes || 'Not provided'}`,
    `Source: ${row.source}`,
    `Submitted: ${row.created_at}`,
  ];
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${RESEND_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: RESEND_FROM,
      to: [RESEND_TO],
      subject: `New Free Contract Offer Lead: ${row.business_name}`,
      text: lines.join('\n'),
    }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) console.error('[submit-lead] operator notification failed:', res.status, await res.text().catch(() => ''));
}

export default async (req) => {
  if (new URL(req.url).searchParams.get('diag') === '1') {
    return json(200, { has_url: Boolean(SUPABASE_URL), has_key: Boolean(SUPABASE_KEY), has_resend: Boolean(RESEND_KEY), url_len: (SUPABASE_URL || '').length, key_len: (SUPABASE_KEY || '').length });
  }
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only.' });
  if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('[submit-lead] Supabase credentials not configured.'); return json(500, { ok: false, error: 'Something went wrong — please try again or email us directly at jmitchell@aproposgroupllc.com.' }); }

  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'Invalid request body.' }); }

  const business_name = safe(body.business_name);
  const contact_name = safe(body.contact_name);
  const contact_email = safe(body.contact_email);
  if (!business_name || !contact_name || !contact_email) return json(400, { ok: false, error: 'Business name, contact name, and contact email are required.' });
  if (!EMAIL_RE.test(contact_email)) return json(400, { ok: false, error: 'A valid email address is required.' });

  const row = {
    business_name, contact_name, contact_email,
    contact_phone: safe(body.contact_phone) || null,
    business_website: safe(body.business_website) || null,
    city: safe(body.city) || null,
    state: safe(body.state) || null,
    naics_hint: safe(body.naics_hint) || null,
    notes: safe(body.notes) || null,
    source: 'marketplace_cta',
  };

  try {
    const inserted = await insertLead(row);
    // Fire the safety-net notification regardless of what happens downstream —
    // failure here must not fail the client-facing response, since the lead
    // is already durably recorded at this point.
    try { await notifyOperator(inserted || { ...row, created_at: new Date().toISOString() }); }
    catch (notifyError) { console.error('[submit-lead] notifyOperator threw:', notifyError.message); }
    return json(200, { ok: true });
  } catch (error) {
    console.error('[submit-lead]', error.message);
    return json(500, { ok: false, error: 'Something went wrong — please try again or email us directly at jmitchell@aproposgroupllc.com.' });
  }
};

export const config = { path: '/api/submit-lead' };
