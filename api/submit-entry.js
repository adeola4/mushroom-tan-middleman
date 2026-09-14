export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sheetUrl = [process.env.SUBMISSION_SHEET, process.env.SUBMISSION_SHEET_URL, process.env.GOOGLE_SCRIPT_URL, process.env.GOOGLE_APPS_SCRIPT_URL, process.env.GOOGLE_SHEETS_URL, process.env.SHEET_URL, process.env.SUBMISSION_GOOGLE_SHEET].find(Boolean);
  if (!sheetUrl) return res.status(500).json({ error: "Sheets URL not configured" });

  const body = req.body || {};
  const email = body.Email || body.email;
  if (!email) return res.status(400).json({ error: "Email is required." });

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const payload = {
    Sheet: 'Entries',
    Timestamp: new Date().toISOString(),
    'IP / User Agent': `${clientIp} | ${userAgent}`,
    ...body
  };

  if (payload.email && !payload.Email) payload.Email = payload.email;
  delete payload.email;

  try {
    await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
