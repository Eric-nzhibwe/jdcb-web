import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid  = process.env.TWILIO_ACCOUNT_SID;
const authToken   = process.env.TWILIO_AUTH_TOKEN;
const fromNumber  = process.env.TWILIO_PHONE_NUMBER;

export async function POST(req: NextRequest) {
  /* ── guard: env vars must be set ── */
  if (!accountSid || !authToken || !fromNumber) {
    console.error('[SMS] Twilio env vars missing');
    return NextResponse.json(
      { error: 'SMS service not configured' },
      { status: 503 },
    );
  }

  /* ── parse body ── */
  let to: string, body: string;
  try {
    const json = await req.json();
    to   = (json.to   ?? '').toString().trim();
    body = (json.body ?? '').toString().trim();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!to || !body) {
    return NextResponse.json(
      { error: '`to` and `body` are required' },
      { status: 400 },
    );
  }

  /* ── normalise phone number to E.164 ──
     Zambian numbers: 09xxxxxxxx → +2609xxxxxxxx
     If already has + or country code, leave it alone             */
  const digits = to.replace(/\D/g, '');
  let e164 = to.startsWith('+') ? to : `+${digits}`;
  // Handle local ZM format: 09... or 07... → +26097... / +26077...
  if (digits.length === 10 && (digits.startsWith('09') || digits.startsWith('07'))) {
    e164 = `+26${digits.slice(1)}`; // drop leading 0, prepend +260
  }

  /* ── send via Twilio ── */
  try {
    const client  = twilio(accountSid, authToken);
    const message = await client.messages.create({
      from: fromNumber,
      to:   e164,
      body,
    });

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[SMS] Twilio error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
