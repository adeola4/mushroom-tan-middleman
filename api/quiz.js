const getSheetUrl = () => {
  return [process.env.SUBMISSION_SHEET, process.env.SUBMISSION_SHEET_URL, process.env.GOOGLE_SCRIPT_URL, process.env.GOOGLE_APPS_SCRIPT_URL, process.env.GOOGLE_SHEETS_URL, process.env.SHEET_URL, process.env.SUBMISSION_GOOGLE_SHEET].find(Boolean) || null;
};

const defaultQuestions = [
  {
    id: "q1", layer: 1, parent_option: "",
    question_text: "What best describes your business?",
    option_a_text: "Restaurant, retailer, or kitchen buying mushrooms for resale or use",
    option_a_key: "buyer",
    option_a_img: "/assets/quiz/buyer.png",
    option_b_text: "Distributor or brand seeking white-label partnerships",
    option_b_key: "wholesaler",
    option_b_img: "/assets/quiz/wholesaler.png",
    active: "true", is_variant: "false", variant_parent_id: ""
  },
  {
    id: "q2_buyer", layer: 2, parent_option: "buyer",
    question_text: "What's your typical monthly order volume?",
    option_a_text: "Regular volume (50+ lbs / recurring orders)",
    option_a_key: "high_volume",
    option_a_img: "/assets/quiz/high_volume.png",
    option_b_text: "Occasional or trial orders to start",
    option_b_key: "trial",
    option_b_img: "/assets/quiz/trial.png",
    active: "true", is_variant: "false", variant_parent_id: ""
  },
  {
    id: "q2_wholesaler", layer: 2, parent_option: "wholesaler",
    question_text: "What's your timeline for launching?",
    option_a_text: "Immediate — ready to discuss within 30 days",
    option_a_key: "immediate",
    option_a_img: "/assets/quiz/immediate.png",
    option_b_text: "Researching options for future launch",
    option_b_key: "researching",
    option_b_img: "/assets/quiz/researching.png",
    active: "true", is_variant: "false", variant_parent_id: ""
  }
];

const callAppsScript = async (payload) => {
  const sheetUrl = getSheetUrl();
  if (!sheetUrl) throw new Error("Google Sheets App Script URL not configured.");
  const response = await fetch(sheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Apps Script responded with ${response.status}`);
  return response.json();
};

const readAppsScriptSheet = async (sheetName) => {
  const sheetUrl = getSheetUrl();
  if (!sheetUrl) throw new Error("Google Sheets App Script URL not configured.");
  const url = `${sheetUrl}?action=read-sheet&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Apps Script read-sheet failed: ${response.status}`);
  const result = await response.json();
  return result.data || [];
};

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end('');
  const { action } = req.query;

  try {
    if (req.method === 'GET' && action === 'get-questions') {
      let questions = [];
      try { questions = await readAppsScriptSheet('QuizQuestions'); } catch (e) { console.error(e); }

      if (questions.length === 0) {
        try {
          await callAppsScript({ action: "write-sheet", sheet: "QuizQuestions", rows: defaultQuestions });
        } catch (e) {
          console.error("Failed to seed default questions to Apps Script:", e);
        }
        questions = defaultQuestions;
      }

      const activeQuestions = questions.filter(q => String(q.active) === 'true');
      return res.json({ success: true, questions: activeQuestions });
    }

    if (req.method === 'POST' && action === 'track') {
      const { question_id, option_key, type } = req.body || {};
      if (!question_id) return res.status(400).json({ error: "question_id is required." });

      const analytics = await readAppsScriptSheet('QuizAnalytics');
      let row = analytics.find(r =>
        String(r.question_id) === String(question_id) &&
        String(r.option_key) === String(option_key || '')
      );

      if (!row) {
        row = {
          step: question_id.includes('q1') ? '1' : '2',
          question_id, option_key: option_key || '', option_text: '',
          views: 0, clicks: 0, completion_rate: 0,
          drop_off_count: 0, last_10_conversions: 0,
          sample_size: 0, updated_at: new Date().toISOString()
        };
      }

      if (type === 'view') row.views = Number(row.views || 0) + 1;
      else if (type === 'click') row.clicks = Number(row.clicks || 0) + 1;

      row.sample_size = row.views;
      if (row.views > 0) {
        row.completion_rate = (row.clicks / row.views) * 100;
        row.drop_off_count = row.views - row.clicks;
      }
      row.updated_at = new Date().toISOString();

      await callAppsScript({ Sheet: 'QuizAnalytics', ...row });
      return res.json({ success: true });
    }

    if (req.method === 'POST' && action === 'submit') {
      const { name, email, phone, funnelCategory, answers, session_id } = req.body || {};
      if (!email || !name) return res.status(400).json({ error: "Name and email are required." });

      let questions = [];
      try { questions = await readAppsScriptSheet('QuizQuestions'); } catch (e) { questions = defaultQuestions; }

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      const submitPayload = {
        Sheet: 'Entries',
        Timestamp: new Date().toISOString(),
        'Session ID': session_id || '',
        Name: name, Email: email, Phone: phone || '',
        Source: 'quiz-popup',
        'Funnel Category': funnelCategory,
        'IP / User Agent': `${clientIp} | ${userAgent}`,
        Message: `Quiz Selections: ${JSON.stringify(answers || {})}`
      };

      for (const qId of Object.keys(answers || {})) {
        const optKey = answers[qId];
        let selectedOptionText = "Selected";
        const qObj = questions.find(q => String(q.id) === String(qId));
        if (qObj) {
          if (qObj.option_a_key === optKey) selectedOptionText = qObj.option_a_text;
          if (qObj.option_b_key === optKey) selectedOptionText = qObj.option_b_text;
        }
        submitPayload[optKey] = selectedOptionText;
      }

      await callAppsScript(submitPayload);

      try {
        await callAppsScript({
          Sheet: 'Visitors',
          Timestamp: new Date().toISOString(),
          Page: '/index.html', Name, Email, Phone: phone || '',
          'Device / User Agent': userAgent, IP: clientIp
        });
      } catch (err) { console.error(err); }

      try {
        const analytics = await readAppsScriptSheet('QuizAnalytics');
        for (const qId of Object.keys(answers || {})) {
          const optKey = answers[qId];
          const row = analytics.find(r =>
            String(r.question_id) === String(qId) &&
            String(r.option_key) === String(optKey)
          );
          if (row) {
            row.last_10_conversions = Number(row.last_10_conversions || 0) + 1;
            await callAppsScript({ Sheet: 'QuizAnalytics', ...row });
          }
        }
      } catch (err) { console.error(err); }

      try {
        const entries = await readAppsScriptSheet('Entries');
        const submissionsCount = entries.filter(e => e.Source === 'quiz-popup' || e.source === 'quiz-popup').length;
        if (submissionsCount > 0 && submissionsCount % 10 === 0) {
          console.log(`Submissions: ${submissionsCount}. Triggering NIM optimization...`);
          await triggerNIMOptimization();
        }
      } catch (err) { console.error(err); }

      return res.json({ success: true });
    }

    if (req.method === 'POST' && action === 'submit-lead') {
      const { name, email, phone, session_id } = req.body || {};
      if (!name || !email) return res.status(400).json({ error: "Name and email are required." });

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await callAppsScript({
        Sheet: 'Entries',
        Timestamp: new Date().toISOString(),
        'Session ID': session_id || '',
        Name: name,
        Email: email,
        Phone: phone || '',
        Source: 'lead-popup',
        'IP / User Agent': `${clientIp} | ${userAgent}`
      });

      return res.json({ success: true, session_id: session_id || '' });
    }

    if (req.method === 'POST' && action === 'submit-selection') {
      const { session_id, question_id, option_key } = req.body || {};
      if (!session_id || !question_id || !option_key)
        return res.status(400).json({ error: "session_id, question_id, and option_key are required." });

      let questions = [];
      try { questions = await readAppsScriptSheet('QuizQuestions'); } catch (e) { questions = defaultQuestions; }

      let selectedOptionText = "Selected";
      const qObj = questions.find(q => String(q.id) === String(question_id));
      if (qObj) {
        if (qObj.option_a_key === option_key) selectedOptionText = qObj.option_a_text;
        if (qObj.option_b_key === option_key) selectedOptionText = qObj.option_b_text;
      }

      const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await callAppsScript({
        Sheet: 'Entries',
        Timestamp: new Date().toISOString(),
        'Session ID': session_id, Source: 'quiz-popup',
        'IP / User Agent': `${clientIp} | ${userAgent}`,
        [option_key]: selectedOptionText
      });

      return res.json({ success: true });
    }

    return res.status(400).json({ error: "Invalid action query parameter." });
  } catch (err) {
    console.error("Quiz API Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
};

const triggerNIMOptimization = async () => {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) { console.error("NVIDIA NIM API key missing."); return; }

  const analytics = await readAppsScriptSheet('QuizAnalytics');
  const questions = await readAppsScriptSheet('QuizQuestions');
  if (analytics.length === 0 || questions.length === 0) return;

  const lowPerformingNodes = analytics.filter(r =>
    Number(r.completion_rate || 0) < 35 && Number(r.views || 0) > 2
  );
  if (lowPerformingNodes.length === 0) {
    console.log("All nodes >= 35%. Skipping optimization.");
    return;
  }

  lowPerformingNodes.sort((a, b) => Number(a.completion_rate) - Number(b.completion_rate));
  const targetNode = lowPerformingNodes[0];
  const targetQuestion = questions.find(q => String(q.id) === String(targetNode.question_id));
  if (!targetQuestion) return;

  const prompt = `You are optimizing a conversion funnel quiz for MUSHROOM TAN, a wholesale mushroom supply company for commercial buyers.
The question with the lowest conversion is:
Question: "${targetQuestion.question_text}"
Option A: "${targetQuestion.option_a_text}" (key: "${targetQuestion.option_a_key}")
Option B: "${targetQuestion.option_b_text}" (key: "${targetQuestion.option_b_key}")

Performance Stats:
- Views: ${targetNode.views}
- Clicks: ${targetNode.clicks}
- Conversion Rate: ${targetNode.completion_rate.toFixed(1)}%

Rule B: Keep the same intent. Do not change the question topic. Change format, wording, or add one more relevant option if currently binary.

Draft ONE new optimized question and options variant to replace this node.
Respond with a JSON object ONLY. No markdown, no comments.
Format:
{
  "question_text": "new wording of question",
  "option_a_text": "new option a wording",
  "option_b_text": "new option b wording",
  "reason": "short explanation of changes"
}`;

  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`NVIDIA NIM returned ${response.status}`);
    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const result = JSON.parse(content.replace(/```json/g, "").replace(/```/g, "").trim());

    console.log("NIM Optimization Output:", result);

    const versionId = `v_${Date.now()}`;
    await callAppsScript({
      Sheet: 'QuizVersionHistory',
      version: versionId, active: 'true', replaced_by: '',
      reason: `Optimized question ${targetQuestion.id} due to low conversion (${targetNode.completion_rate.toFixed(1)}%). NIM: "${result.reason}"`
    });

    const updatedQuestions = questions.map(q => {
      if (String(q.id) === String(targetQuestion.id)) q.active = 'false';
      return q;
    });

    const newVariant = {
      id: `${targetQuestion.id}_var_${Date.now()}`,
      layer: targetQuestion.layer,
      parent_option: targetQuestion.parent_option,
      question_text: result.question_text,
      option_a_text: result.option_a_text,
      option_a_key: targetQuestion.option_a_key,
      option_b_text: result.option_b_text,
      option_b_key: targetQuestion.option_b_key,
      active: 'true', is_variant: 'true',
      variant_parent_id: targetQuestion.id
    };

    updatedQuestions.push(newVariant);

    await callAppsScript({ action: "write-sheet", sheet: "QuizQuestions", rows: updatedQuestions });

    try { await callAppsScript({ action: "append-blank", Sheet: "Entries" }); } catch (e) { console.error(e); }

    console.log("New quiz variant deployed.");
  } catch (err) {
    console.error("NIM Optimization failed:", err);
  }
};
