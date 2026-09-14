const getSheetUrl = () => {
  return [process.env.SUBMISSION_SHEET, process.env.SUBMISSION_SHEET_URL, process.env.GOOGLE_SCRIPT_URL, process.env.GOOGLE_APPS_SCRIPT_URL, process.env.GOOGLE_SHEETS_URL, process.env.SHEET_URL, process.env.SUBMISSION_GOOGLE_SHEET].find(Boolean) || null;
};

const logMessageToSheet = async (sessionId, sender, messageText, ipUserAgent) => {
  const sheetUrl = getSheetUrl();
  if (!sheetUrl) return;
  try {
    await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Sheet: 'ChatLogs',
        Timestamp: new Date().toISOString(),
        'Session ID': sessionId || 'anonymous',
        Sender: sender,
        Message: messageText,
        'IP / User Agent': ipUserAgent || ''
      })
    });
  } catch (err) {
    console.error("Failed to log message to sheet:", err);
  }
};

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, name, email, phone, message, history, session_id, user_name } = req.body || {};
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';
  const ipUserAgent = `${clientIp} | ${userAgent}`;

  if (action === 'visitor') {
    const sheetUrl = getSheetUrl();
    if (!sheetUrl) return res.status(500).json({ error: "Sheets URL not configured" });
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Sheet: 'Visitors',
          Timestamp: new Date().toISOString(),
          Page: '/index.html',
          Name: name,
          Email: email,
          Phone: phone,
          'Device / User Agent': userAgent,
          IP: clientIp
        })
      });
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  logMessageToSheet(session_id, 'User', message, ipUserAgent);
  const activeUserName = user_name || 'Guest';

  const systemPrompt = `You are MUSHROOM TAN Support, a real commercial sales representative at MUSHROOM TAN, a premium wholesale mushroom supply company serving restaurants, retailers, and distributors across the United States.

The visitor you are speaking with is named ${activeUserName}.
You must converse naturally, keep responses very brief (1-2 sentences), and use human mannerisms. Never reveal or state that you are an AI, a chatbot, or a language model. Do not assign yourself any personal first name — you speak on behalf of the MUSHROOM TAN sales desk.

Do not disclose sensitive internal operational details. Answer generically but professionally.

MUSHROOM TAN supplies wholesale grow kits, white-label tinctures, fresh restaurant-grade mushrooms, and foraged specialties. Bulk pricing and volume contracts available.

We segment buyers into 4 groups:
1. The Buyer — restaurants or retailers actively purchasing mushrooms for resale or kitchen use. Needs bulk pricing and regular delivery.
2. The Wholesaler — distributors or brands wanting white-label partnerships, private-label formulations, or large-volume contracts.
3. The Grower — commercial cultivators looking for supplies, cultures, or spawn.
4. The Tire Kicker — not a commercial buyer, no real business, no purchasing authority.

Your task:
- Answer ${activeUserName}'s questions concisely (1-2 sentences).
- Keep the tone professional, knowledgeable, and helpful.
- Your ultimate conversion goal is to direct them to request a quote at orders@mushroomtan.com or complete our quick qualification quiz.
- If they seem like a Buyer, emphasize bulk pricing and lead times. If they are a Wholesaler, emphasize white-label and volume contracts. If they are exploring, mention our product catalog.`;

  const messages = [{ role: 'system', content: systemPrompt }];
  if (history && Array.isArray(history)) {
    history.forEach(h => {
      messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content || '' });
    });
  } else {
    messages.push({ role: 'user', content: message || '' });
  }

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: messages,
        max_tokens: 150,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`NVIDIA NIM returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    let reply = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : "Thank you for your interest. A member of our sales team will follow up with pricing and availability. In the meantime, you can browse our catalog or request a quote.";

    logMessageToSheet(session_id, 'AI', reply, ipUserAgent);
    return res.json({ reply });
  } catch (err) {
    console.error("NVIDIA NIM Integration error:", err);
    const fallbackReply = "Thank you for reaching out. Our team can help with bulk pricing, white-label options, and delivery scheduling. Would you like to request a quote or browse our product catalog?";
    logMessageToSheet(session_id, 'AI', fallbackReply, ipUserAgent);
    return res.json({ reply: fallbackReply });
  }
};
