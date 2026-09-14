import path from 'path';
import fs from 'fs';

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const sheetUrl = [process.env.SUBMISSION_SHEET, process.env.SUBMISSION_SHEET_URL, process.env.GOOGLE_SCRIPT_URL, process.env.GOOGLE_APPS_SCRIPT_URL, process.env.GOOGLE_SHEETS_URL, process.env.SHEET_URL, process.env.SUBMISSION_GOOGLE_SHEET].find(Boolean);

  const email = req.query.email || '';
  const name = req.query.name || '';

  if (email && sheetUrl) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    try {
      await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Sheet: 'Newsletter',
          Timestamp: new Date().toISOString(),
          Name: name, Email: email,
          Source: 'guide-download',
          'IP / User Agent': `${clientIp} | ${userAgent}`
        })
      });
    } catch (e) { console.error(e); }
  }

  const pdfPath = path.join(process.cwd(), 'public', 'F1.UltimateGuideToLandStrategies.pdf');

  if (fs.existsSync(pdfPath)) {
    const stat = fs.statSync(pdfPath);
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="Mushroom-TAN-Commercial-Guide.pdf"'
    });
    const readStream = fs.createReadStream(pdfPath);
    readStream.pipe(res);
  } else {
    res.writeHead(302, { Location: '/' });
    res.end();
  }
};
