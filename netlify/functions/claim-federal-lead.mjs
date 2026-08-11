// Claim step for federal (SAM.gov-sourced) opportunities sent via NGCC
// outreach. Deliberately does NOT reuse the BusinessContracts claim flow
// (complimentary-opportunity.mjs -> marketplace-claim -> opportunity-workspace)
// -- that one is built around a locally-verified, hosted document package,
// which doesn't exist for federal contracts here. This is intentionally
// thin: capture the lead, then hand back the real SAM.gov URL the client
// already carried in the email link. No SAM.gov API call at claim time,
// no local package -- "we don't have to store much... we'll be using
// sam.gov's database" (Jeff, 2026-08-10).
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM = process.env.RESEND_FROM_EMAIL || 'APROPOS Group LLC <jmitchell@aproposgroupllc.com>';
const RESEND_TO = process.env.RESEND_TO_EMAIL || 'jmitchell@aproposgroupllc.com';

const json = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
const safe = v => String(v ?? '').trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAM_URL_RE = /^https:\/\/sam\.gov\//i;

async function insertClaim(row) {
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
  if (!RESEND_KEY) { console.error('[claim-federal-lead] RESEND_API_KEY not configured — skipping notification.'); return; }
  const text = [
    `Business: ${row.business_name}`,
    `Contact: ${row.contact_name}`,
    `Email: ${row.contact_email}`,
    `Opportunity reference: ${row.source_reference || 'Not provided'}`,
    `SAM.gov URL: ${row.redirect_url || 'Not provided'}`,
    `Source: ${row.source}`,
    `Claimed: ${row.created_at}`,
  ].join('\n');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${RESEND_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: RESEND_FROM, to: [RESEND_TO], subject: `Federal opportunity claimed: ${row.business_name}`, text }),
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) console.error('[claim-federal-lead] operator notification failed:', res.status, await res.text().catch(() => ''));
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'POST only.' });
  if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('[claim-federal-lead] Supabase credentials not configured.'); return json(500, { ok: false, error: 'Something went wrong — please try again or email us directly at jmitchell@aproposgroupllc.com.' }); }

  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, error: 'Invalid request body.' }); }

  const business_name = safe(body.business_name);
  const contact_name = safe(body.contact_name);
  const contact_email = safe(body.contact_email);
  const redirect_url = safe(body.redirect_url);
  const source_reference = safe(body.source_reference) || null;
  if (!business_name || !contact_name || !contact_email) return json(400, { ok: false, error: 'Business name, contact name, and contact email are required.' });
  if (!EMAIL_RE.test(contact_email)) return json(400, { ok: false, error: 'A valid email address is required.' });
  if (!redirect_url || !SAM_URL_RE.test(redirect_url)) return json(400, { ok: false, error: 'A valid SAM.gov opportunity link is required.' });

  const row = { business_name, contact_name, contact_email, source_reference, redirect_url, source: 'ngcc_outreach_claim' };

  try {
    const inserted = await insertClaim(row);
    try { await notifyOperator(inserted || { ...row, created_at: new Date().toISOString() }); }
    catch (notifyError) { console.error('[claim-federal-lead] notifyOperator threw:', notifyError.message); }
    return json(200, { ok: true, redirect_url });
  } catch (error) {
    console.error('[claim-federal-lead]', error.message);
    return json(500, { ok: false, error: 'Something went wrong — please try again or email us directly at jmitchell@aproposgroupllc.com.' });
  }
};

export const config = { path: '/api/claim-federal-lead' };
