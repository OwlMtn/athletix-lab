// Athletix Lab — contact form handler (Vercel serverless function)
// Sends appointment requests via Resend. Env: RESEND_API_KEY, CONTACT_TO (optional, defaults to site owner).
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const { RESEND_API_KEY, CONTACT_TO } = process.env;
  if (!RESEND_API_KEY) return res.status(500).json({ ok: false, error: 'Email service not configured' });

  // Basic validation + sanitize
  const name = String(req.body?.name || '').slice(0, 200).trim();
  const phone = String(req.body?.phone || '').slice(0, 50).trim();
  const email = String(req.body?.email || '').slice(0, 200).trim();
  const topic = String(req.body?.topic || 'Not specified').slice(0, 100);
  const message = String(req.body?.message || '').slice(0, 2000).trim();
  if (!name || !phone) return res.status(400).json({ ok: false, error: 'Name and phone are required' });
  const suspicious = /<script|javascript:|onerror=/i.test(name + phone + email + message);
  if (suspicious) return res.status(400).json({ ok: false, error: 'Invalid input' });

  const to = CONTACT_TO || 'owlmountainstudios@gmail.com';
  const from = 'Athletix Lab Website <onboarding@resend.dev>';
  const subject = `New appointment request — ${name} (${topic})`;
  const text = [
    `New appointment request from theathletixlab website:`,
    ``,
    `Name:    ${name}`,
    `Phone:   ${phone}`,
    `Email:   ${email || '—'}`,
    `Topic:   ${topic}`,
    `Message: ${message || '—'}`,
  ].join('\n');
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6"><h2 style="margin:0 0 12px">New appointment request</h2>
    <p style="margin:0 0 6px"><b>Name:</b> ${name.replace(/</g, '&lt;')}</p>
    <p style="margin:0 0 6px"><b>Phone:</b> ${phone.replace(/</g, '&lt;')}</p>
    <p style="margin:0 0 6px"><b>Email:</b> ${email ? email.replace(/</g, '&lt;') : '—'}</p>
    <p style="margin:0 0 6px"><b>Topic:</b> ${topic.replace(/</g, '&lt;')}</p>
    <p style="margin:12px 0 0"><b>Message:</b><br>${message ? message.replace(/</g, '&lt;').replace(/\n/g, '<br>') : '—'}</p></div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, text, html, reply_to: email || undefined }),
    });
    if (!r.ok) {
      const errText = await r.text();
      console.error('Resend error', r.status, errText.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'Email send failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Contact handler error', e);
    return res.status(502).json({ ok: false, error: 'Email send failed' });
  }
}
