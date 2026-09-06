/**
 * sendSms — calls the secure /api/sms route.
 * Never imports Twilio directly; credentials stay server-side.
 *
 * @param to   Recipient phone number (any format — the API normalises to E.164)
 * @param body SMS message text (keep under 160 chars to avoid multi-part billing)
 * @returns    true on success, false on failure (errors are logged, never thrown)
 */
export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!to || !body) return false;

  try {
    const res = await fetch('/api/sms', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ to, body }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn('[sendSms] failed:', data.error ?? res.statusText);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[sendSms] network error:', err);
    return false;
  }
}
