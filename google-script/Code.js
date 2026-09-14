/**
 * MUSHROOM TAN — Google Apps Script Web App
 * ==========================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Open Extensions → Apps Script from your Google Sheet
 * 2. Copy this file into the editor
 * 3. Update CONFIG.SPREADSHEET_ID below with your sheet ID
 * 4. Optionally set CONFIG.DISCORD_WEBHOOK_URL
 * 5. Run the function: fullSetup()
 * 6. Deploy → New Deployment → Web App (Anyone access)
 * 7. Copy the web app URL → set as SUBMISSION_SHEET in .env.local
 */

var CONFIG = {
  SPREADSHEET_ID: '1mbKTueUw5WhJJzV6ZhzljMUkVE76FV85HwBsZh0aFfQ',
  DISCORD_WEBHOOK_URL: 'https://discord.com/api/webhooks/1527650559975362591/hcIeebdw5lkNJ71bAXYDnMur0mOPKofPZ2YKy1GthhHOYm3QPLcqd-1FaVPrDCMcW27v',
  BRAND_NAME: 'MUSHROOM TAN',
  SITE_URL: 'https://mushroom-tan.vercel.app',
  WEBHOOK_VERIFICATION_TOKEN: 'mt_webhook_2024'
};

var SHEET_NAMES = [
  'Entries',
  'JointVentures',
  'Visitors',
  'QuizQuestions',
  'QuizAnalytics',
  'QuizVersionHistory',
  'ChatLogs',
  'Newsletter',
  'SetupLog'
];

var SHEET_HEADERS = {
  Entries: [
    'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone', 'Job Title',
    'Company', 'Website', 'Business Type', 'Monthly Volume',
    'Distribution Channels', 'Product Interests', 'Shipping State',
    'Tax ID', 'Timeframe', 'Contact Time', 'Referral',
    'Message', 'Source', 'Session ID', 'Funnel Category', 'IP / User Agent',
    'Location', 'Contributions', 'Proposal'
  ],
  JointVentures: [
    'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone',
    'Company', 'Business Type', 'Location', 'Contributions',
    'Proposal', 'Source', 'IP / User Agent'
  ],
  Visitors: ['Timestamp', 'Page', 'Name', 'Email', 'Phone', 'Device / User Agent', 'IP'],
  QuizQuestions: ['id', 'layer', 'parent_option', 'question_text', 'option_a_text', 'option_a_key', 'option_a_img', 'option_b_text', 'option_b_key', 'option_b_img', 'active', 'is_variant', 'variant_parent_id'],
  QuizAnalytics: ['step', 'question_id', 'option_key', 'option_text', 'views', 'clicks', 'completion_rate', 'drop_off_count', 'last_10_conversions', 'avg_path_to_segment', 'sample_size', 'updated_at'],
  QuizVersionHistory: ['version', 'active', 'replaced_by', 'replaced_at', 'reason'],
  ChatLogs: ['Timestamp', 'Session ID', 'Sender', 'Message', 'IP / User Agent'],
  Newsletter: ['Timestamp', 'Name', 'Email', 'Source', 'IP / User Agent'],
  SetupLog: ['Timestamp', 'Action', 'Status', 'Detail']
};

var DEFAULT_QUESTIONS = [
  { id: 'q1', layer: '1', parent_option: '', question_text: 'What best describes your business?', option_a_text: 'Restaurant, retailer, or kitchen buying mushrooms for resale or use', option_a_key: 'buyer', option_a_img: '/assets/quiz/buyer.png', option_b_text: 'Distributor or brand seeking white-label partnerships', option_b_key: 'wholesaler', option_b_img: '/assets/quiz/wholesaler.png', active: 'true', is_variant: 'false', variant_parent_id: '' },
  { id: 'q2_buyer', layer: '2', parent_option: 'buyer', question_text: 'What\'s your typical monthly order volume?', option_a_text: 'Regular volume (50+ lbs / recurring orders)', option_a_key: 'high_volume', option_a_img: '/assets/quiz/high_volume.png', option_b_text: 'Occasional or trial orders to start', option_b_key: 'trial', option_b_img: '/assets/quiz/trial.png', active: 'true', is_variant: 'false', variant_parent_id: '' },
  { id: 'q2_wholesaler', layer: '2', parent_option: 'wholesaler', question_text: 'What\'s your timeline for launching?', option_a_text: 'Immediate — ready to discuss within 30 days', option_a_key: 'immediate', option_a_img: '/assets/quiz/immediate.png', option_b_text: 'Researching options for future launch', option_b_key: 'researching', option_b_img: '/assets/quiz/researching.png', active: 'true', is_variant: 'false', variant_parent_id: '' }
];

// ============================================================
//  FULL SETUP — run this once after configuring CONFIG
// ============================================================
function fullSetup() {
  var log = [];
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  // --- 1. Create all sheets ---
  for (var i = 0; i < SHEET_NAMES.length; i++) {
    var name = SHEET_NAMES[i];
    try {
      var existing = ss.getSheetByName(name);
      if (existing) {
        log.push({ Timestamp: new Date().toISOString(), Action: 'Create Sheet', Status: 'SKIPPED', Detail: 'Sheet "' + name + '" already exists.' });
        continue;
      }
      var sheet = ss.insertSheet(name);
      var headers = SHEET_HEADERS[name];
      if (headers) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      log.push({ Timestamp: new Date().toISOString(), Action: 'Create Sheet', Status: 'OK', Detail: 'Sheet "' + name + '" created with ' + (headers ? headers.length : 0) + ' columns.' });
    } catch (e) {
      log.push({ Timestamp: new Date().toISOString(), Action: 'Create Sheet', Status: 'ERROR', Detail: 'Failed to create "' + name + '": ' + e.toString() });
    }
  }

  // --- 2. Seed default quiz questions ---
  try {
    var qSheet = ss.getSheetByName('QuizQuestions');
    var qData = qSheet.getDataRange().getValues();
    if (qData.length <= 1) {
      qSheet.clear();
      var qHeaders = SHEET_HEADERS.QuizQuestions;
      qSheet.getRange(1, 1, 1, qHeaders.length).setValues([qHeaders]);
      qSheet.getRange(1, 1, 1, qHeaders.length).setFontWeight('bold');

      for (var j = 0; j < DEFAULT_QUESTIONS.length; j++) {
        var qRow = [];
        for (var k = 0; k < qHeaders.length; k++) {
          qRow.push(DEFAULT_QUESTIONS[j][qHeaders[k]] || '');
        }
        qSheet.getRange(j + 2, 1, 1, qHeaders.length).setValues([qRow]);
      }
      log.push({ Timestamp: new Date().toISOString(), Action: 'Seed Questions', Status: 'OK', Detail: DEFAULT_QUESTIONS.length + ' default questions seeded to QuizQuestions.' });
    } else {
      log.push({ Timestamp: new Date().toISOString(), Action: 'Seed Questions', Status: 'SKIPPED', Detail: 'QuizQuestions already has data (' + (qData.length - 1) + ' rows).' });
    }
  } catch (e) {
    log.push({ Timestamp: new Date().toISOString(), Action: 'Seed Questions', Status: 'ERROR', Detail: e.toString() });
  }

  // --- 3. Send Discord test notification ---
  if (CONFIG.DISCORD_WEBHOOK_URL) {
    try {
      var discordPayload = {
        embeds: [{
          title: '✅ ' + CONFIG.BRAND_NAME + ' — Setup Complete',
          description: 'Google Sheets web app deployed successfully.\n\n**Sheets created:** ' + SHEET_NAMES.length + '\n**Quiz questions seeded:** ' + DEFAULT_QUESTIONS.length + '\n**Status:** Ready for submissions.',
          color: 0x3A7A5C,
          timestamp: new Date().toISOString(),
          footer: { text: CONFIG.BRAND_NAME + ' | ' + CONFIG.SITE_URL }
        }]
      };
      UrlFetchApp.fetch(CONFIG.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        contentType: 'application/json',
        payload: JSON.stringify(discordPayload),
        muteHttpExceptions: true
      });
      log.push({ Timestamp: new Date().toISOString(), Action: 'Discord Test', Status: 'OK', Detail: 'Test notification sent to Discord webhook.' });
    } catch (e) {
      log.push({ Timestamp: new Date().toISOString(), Action: 'Discord Test', Status: 'ERROR', Detail: 'Failed to send Discord notification: ' + e.toString() });
    }
  } else {
    log.push({ Timestamp: new Date().toISOString(), Action: 'Discord Test', Status: 'SKIPPED', Detail: 'No DISCORD_WEBHOOK_URL configured.' });
  }

  // --- 4. Write setup log ---
  try {
    var logSheet = ss.getSheetByName('SetupLog');
    logSheet.clear();
    var logHeaders = SHEET_HEADERS.SetupLog;
    logSheet.getRange(1, 1, 1, logHeaders.length).setValues([logHeaders]);
    logSheet.getRange(1, 1, 1, logHeaders.length).setFontWeight('bold');

    for (var m = 0; m < log.length; m++) {
      var logRow = [];
      for (var n = 0; n < logHeaders.length; n++) {
        logRow.push(log[m][logHeaders[n]] || '');
      }
      logSheet.getRange(m + 2, 1, 1, logHeaders.length).setValues([logRow]);
    }
  } catch (e) {
    console.error('Failed to write setup log: ' + e.toString());
  }

  // --- 5. Return summary ---
  var okCount = 0;
  var errCount = 0;
  for (var p = 0; p < log.length; p++) {
    if (log[p].Status === 'OK') okCount++;
    if (log[p].Status === 'ERROR') errCount++;
  }

  var summary = '✅ ' + CONFIG.BRAND_NAME + ' setup complete.\n';
  summary += '• Sheets created/verified: ' + SHEET_NAMES.length + '\n';
  summary += '• Quiz questions seeded: ' + DEFAULT_QUESTIONS.length + '\n';
  summary += '• ' + okCount + ' steps OK, ' + errCount + ' errors\n\n';
  summary += 'Next steps:\n';
  summary += '1. Deploy → New Deployment → Web App (Anyone access)\n';
  summary += '2. Copy the web app URL → set as SUBMISSION_SHEET in your .env.local\n';
  summary += '3. Set DISCORD_WEBHOOK_URL in CONFIG above for notifications\n\n';
  summary += 'Details written to SetupLog sheet.';

  Logger.log(summary);
  SpreadsheetApp.getActive().toast(summary, CONFIG.BRAND_NAME + ' Setup', 15);
  return summary;
}

// ============================================================
//  POST — handle form submissions from Vercel API
// ============================================================
function doPost(e) {
  try {
    var params;
    if (e && e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      params = e.parameter;
    } else {
      return jsonResponse({ success: false, error: 'No data received' });
    }

    // write-sheet: bulk write
    if (params.action === 'write-sheet') {
      var ws = params.sheet;
      var rows = params.rows;
      if (!ws || !rows) {
        return jsonResponse({ success: false, error: 'sheet and rows required' });
      }
      writeSheet(ws, rows);
      return jsonResponse({ success: true });
    }

    // append-blank: add empty row as cohort separator
    if (params.action === 'append-blank') {
      var blankSheet = params.Sheet;
      if (blankSheet) {
        var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
        var sh = ss.getSheetByName(blankSheet);
        if (sh) sh.appendRow([]);
      }
      return jsonResponse({ success: true });
    }

    // Default: append row to specified sheet
    var sheetName = params.Sheet || 'Entries';
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    var headers = sheet.getDataRange().getValues()[0] || [];
    var row = [];
    var keys = Object.keys(params);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === 'Sheet' || key === 'action') continue;
      var colIndex = headers.indexOf(key);
      if (colIndex === -1) {
        if (headers.length === 0 || (headers.length === 1 && headers[0] === '')) {
          headers = [key];
          sheet.getRange(1, 1, 1, 1).setValue(key);
          colIndex = 0;
        } else {
          colIndex = headers.length;
          headers.push(key);
          sheet.getRange(1, colIndex + 1).setValue(key);
        }
      }
      row[colIndex] = params[key];
    }

    sheet.appendRow(row.map(function(v) { return v || ''; }));
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

    // Send Discord notification for Entries & JointVentures
    if ((sheetName === 'Entries' || sheetName === 'JointVentures') && CONFIG.DISCORD_WEBHOOK_URL) {
      try {
        var entrySource = params.Source || 'b2b-modal';
        var entryFirstName = params['First Name'] || '';
        var entryLastName = params['Last Name'] || '';
        var entryName = (entryFirstName + ' ' + entryLastName).trim() || params.Name || 'N/A';
        var entryEmail = params.Email || 'N/A';
        var entryCompany = params.Company || 'N/A';

        var embed;
        if (sheetName === 'JointVentures' || entrySource === 'joint-venture') {
          embed = {
            title: '🤝 New Joint Venture Inquiry — ' + CONFIG.BRAND_NAME,
            color: 0x3A7A5C,
            fields: [
              { name: 'Name', value: String(entryName).substring(0, 100), inline: true },
              { name: 'Business', value: String(entryCompany).substring(0, 100), inline: true },
              { name: 'Email', value: String(entryEmail).substring(0, 100), inline: true },
              { name: 'Business Type', value: String(params['Business Type'] || 'Not specified').substring(0, 100), inline: true },
              { name: 'Location', value: String(params.Location || 'Not specified').substring(0, 100), inline: true },
              { name: 'Contributions', value: String(params.Contributions || 'Not specified').substring(0, 200), inline: false }
            ],
            timestamp: new Date().toISOString()
          };
        } else if (entrySource === 'quiz-popup') {
          embed = {
            title: '📝 New Quiz Submission — ' + CONFIG.BRAND_NAME,
            color: 0x8B5CF6,
            fields: [
              { name: 'Name', value: String(entryName).substring(0, 100), inline: true },
              { name: 'Email', value: String(entryEmail).substring(0, 100), inline: true },
              { name: 'Category', value: String(params['Funnel Category'] || 'Not categorized').substring(0, 100), inline: true }
            ],
            timestamp: new Date().toISOString()
          };
          for (var f = 0; f < keys.length; f++) {
            var k = keys[f];
            if (['Sheet', 'action', 'Name', 'First Name', 'Last Name', 'Email', 'Source', 'Funnel Category', 'Timestamp', 'Session ID', 'IP / User Agent', 'Message'].indexOf(k) === -1) {
              if (params[k]) {
                embed.fields.push({ name: k, value: String(params[k]).substring(0, 100), inline: true });
              }
            }
          }
        } else {
          embed = {
            title: '📥 New B2B Inquiry — ' + CONFIG.BRAND_NAME,
            color: 0xB33939,
            fields: [
              { name: 'Name', value: String(entryName).substring(0, 100), inline: true },
              { name: 'Company', value: String(entryCompany).substring(0, 100), inline: true },
              { name: 'Email', value: String(entryEmail).substring(0, 100), inline: true },
              { name: 'Business Type', value: String(params['Business Type'] || 'Not specified').substring(0, 100), inline: true },
              { name: 'Product Interests', value: String(params['Product Interests'] || 'Not specified').substring(0, 200), inline: false }
            ],
            timestamp: new Date().toISOString()
          };
        }

        UrlFetchApp.fetch(CONFIG.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          contentType: 'application/json',
          payload: JSON.stringify({ embeds: [embed] }),
          muteHttpExceptions: true
        });
      } catch (discordErr) {
        console.error('Discord notification failed: ' + discordErr.toString());
      }
    }

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

// ============================================================
//  GET — read sheet data
// ============================================================
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;
  if (action === 'read-sheet') {
    var sheetName = e.parameter.sheet;
    var data = readSheet(sheetName);
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var html = HtmlService.createHtmlOutput(
    '<h2>' + CONFIG.BRAND_NAME + ' — Submission Server</h2>' +
    '<p>This web app processes form submissions for the ' + CONFIG.BRAND_NAME + ' chatbot and quiz system.</p>' +
    '<p>Status: <strong>Running</strong></p>' +
    '<p><a href="' + CONFIG.SITE_URL + '" target="_blank">Visit ' + CONFIG.BRAND_NAME + '</a></p>'
  );
  return html.setTitle(CONFIG.BRAND_NAME + ' Submissions');
}

// ============================================================
//  HELPER: Read entire sheet as array of objects
// ============================================================
function readSheet(sheetName) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var result = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    var isEmpty = true;
    for (var j = 0; j < headers.length; j++) {
      var val = row[j];
      if (val && val.toString().trim()) isEmpty = false;
      obj[headers[j]] = val ? val.toString() : '';
    }
    if (!isEmpty) result.push(obj);
  }

  return result;
}

// ============================================================
//  HELPER: Bulk write sheet (replaces all data)
// ============================================================
function writeSheet(sheetName, rows) {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clear();

  if (!rows || rows.length === 0) return;

  var headers = Object.keys(rows[0]);
  var data = [headers];

  for (var i = 0; i < rows.length; i++) {
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      row.push(rows[i][headers[j]] || '');
    }
    data.push(row);
  }

  var range = sheet.getRange(1, 1, data.length, headers.length);
  range.setValues(data);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
}

// ============================================================
//  HELPER: JSON response
// ============================================================
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
//  HELPER: Send Discord notification manually
//  Call this from the editor to test your webhook
// ============================================================
function testDiscordWebhook() {
  if (!CONFIG.DISCORD_WEBHOOK_URL) {
    Logger.log('No DISCORD_WEBHOOK_URL configured. Set CONFIG.DISCORD_WEBHOOK_URL and try again.');
    return;
  }

  try {
    var payload = {
      embeds: [{
        title: '🔔 ' + CONFIG.BRAND_NAME + ' — Webhook Test',
        description: 'This is a test notification from your Google Apps Script.\n\nIf you received this, your Discord webhook is configured correctly.',
        color: 0x3A7A5C,
        timestamp: new Date().toISOString(),
        footer: { text: CONFIG.BRAND_NAME + ' | ' + CONFIG.SITE_URL }
      }]
    };

    UrlFetchApp.fetch(CONFIG.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    Logger.log('✅ Discord test notification sent successfully!');
  } catch (e) {
    Logger.log('❌ Discord test failed: ' + e.toString());
  }
}
