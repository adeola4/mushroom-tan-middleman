(function () {
  'use strict';

  var API_BASE = '';
  if (typeof window !== 'undefined' && window.location) {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !window.location.hostname.includes('vercel.app')) {
      API_BASE = 'https://mushroom-tan.vercel.app';
    }
  }
  var BRAND = 'MUSHROOM TAN';
  var SUPPORT_DESK = 'Sales Desk';
  var SEGMENTS = {
    buyer_high: { name: 'Volume Buyer', label: 'Bulk Purchaser', cta: 'Request a Quote', redirect: '/api/go?plan=standard' },
    buyer_trial: { name: 'New Buyer', label: 'Trial Customer', cta: 'Browse Catalog', redirect: '#shop' },
    wholesaler_immediate: { name: 'Wholesale Partner', label: 'White-Label Partner', cta: 'Start Partnership', redirect: '/api/go?plan=consultation' },
    wholesaler_researching: { name: 'Researcher', label: 'Market Researcher', cta: 'Download Guide', redirect: '/api/go?plan=guide' }
  };

  var COLORS = {
    primary: '#B33939',
    primaryHover: '#932F2F',
    bg: '#FAFAF8',
    surface: '#FFFFFF',
    text: '#181818',
    muted: '#616161',
    border: '#E6E6E2',
    success: '#3A7A5C'
  };

  var OPTION_IMAGES = {
    buyer: '/assets/quiz/buyer.png',
    wholesaler: '/assets/quiz/wholesaler.png',
    high_volume: '/assets/quiz/high_volume.png',
    trial: '/assets/quiz/trial.png',
    immediate: '/assets/quiz/immediate.png',
    researching: '/assets/quiz/researching.png'
  };

  var sessionId = 'chat_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  var chatHistory = [];
  var leadSessionId = 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  var quizState = { step: 0, answers: {}, session_id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) };
  var questionsCache = [];

  // =============== STYLES ===============
  var CSS = `
#mt-chat-launcher {
  position: fixed; bottom: 24px; right: 24px; z-index: 9998;
  width: 56px; height: 56px; border-radius: 50%;
  background: ${COLORS.primary}; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(179,57,57,0.3);
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  color: ${COLORS.bg};
}
#mt-chat-launcher:hover { transform: scale(1.05); box-shadow: 0 6px 28px rgba(179,57,57,0.4); }
#mt-chat-launcher svg { width: 24px; height: 24px; }

#mt-chat-panel {
  position: fixed; bottom: 90px; right: 24px; z-index: 9999;
  width: 360px; max-height: 560px;
  background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
  border-radius: 12px; box-shadow: 0 12px 48px rgba(0,0,0,0.1);
  display: none; flex-direction: column; overflow: hidden;
  animation: mtSlideUp 0.3s cubic-bezier(0.22,1,0.36,1);
}
#mt-chat-panel.open { display: flex; }

@keyframes mtSlideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.mt-chat-header {
  background: ${COLORS.primary}; color: ${COLORS.bg};
  padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;
}
.mt-chat-header h3 { margin: 0; font-size: 0.95rem; font-weight: 600; color: ${COLORS.bg}; font-family: 'Figtree', sans-serif; }
.mt-chat-header span { font-size: 0.75rem; opacity: 0.8; }
.mt-chat-close { background: none; border: none; color: ${COLORS.bg}; cursor: pointer; padding: 4px; opacity: 0.7; transition: opacity 0.15s; }
.mt-chat-close:hover { opacity: 1; }

.mt-chat-body {
  flex: 1; overflow-y: auto; padding: 16px 20px;
  display: flex; flex-direction: column; gap: 8px;
  min-height: 200px;
}

.mt-gate-form { display: flex; flex-direction: column; gap: 10px; padding: 8px 0; }
.mt-gate-form input {
  padding: 10px 14px; border: 1px solid ${COLORS.border}; border-radius: 6px;
  font-family: 'Figtree', sans-serif; font-size: 0.85rem;
  background: ${COLORS.bg}; color: ${COLORS.text};
  transition: border-color 0.15s;
}
.mt-gate-form input:focus { outline: none; border-color: ${COLORS.primary}; box-shadow: 0 0 0 2px rgba(179,57,57,0.1); }
.mt-gate-form button {
  padding: 10px 20px; background: ${COLORS.primary}; color: ${COLORS.bg};
  border: none; border-radius: 6px; font-weight: 600; font-size: 0.85rem;
  cursor: pointer; transition: background 0.2s; font-family: 'Figtree', sans-serif;
}
.mt-gate-form button:hover { background: ${COLORS.primaryHover}; }
.mt-gate-form .mt-error { color: ${COLORS.primary}; font-size: 0.78rem; margin: 0; }

.mt-msg { max-width: 85%; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; line-height: 1.5; animation: mtFadeIn 0.25s ease; }
.mt-msg.user { align-self: flex-end; background: ${COLORS.primary}; color: ${COLORS.bg}; border-bottom-right-radius: 2px; }
.mt-msg.ai { align-self: flex-start; background: ${COLORS.bg}; color: ${COLORS.text}; border: 1px solid ${COLORS.border}; border-bottom-left-radius: 2px; }
.mt-msg.system { align-self: center; background: transparent; color: ${COLORS.muted}; font-size: 0.78rem; font-style: italic; border: none; }

@keyframes mtFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

.mt-typing {
  align-self: flex-start; display: flex; gap: 4px; padding: 12px 16px;
  background: ${COLORS.bg}; border: 1px solid ${COLORS.border}; border-radius: 8px;
  border-bottom-left-radius: 2px;
}
.mt-typing span {
  width: 6px; height: 6px; border-radius: 50%; background: ${COLORS.muted};
  animation: mtBounce 1.2s ease-in-out infinite;
}
.mt-typing span:nth-child(2) { animation-delay: 0.2s; }
.mt-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes mtBounce { 0%,80%,100% { transform: scale(0.6); } 40% { transform: scale(1); } }

.mt-chat-input-area {
  padding: 12px 16px; border-top: 1px solid ${COLORS.border};
  display: flex; gap: 8px; background: ${COLORS.surface};
}
.mt-chat-input-area input {
  flex: 1; padding: 8px 12px; border: 1px solid ${COLORS.border}; border-radius: 6px;
  font-family: 'Figtree', sans-serif; font-size: 0.85rem;
  background: ${COLORS.bg}; color: ${COLORS.text};
}
.mt-chat-input-area input:focus { outline: none; border-color: ${COLORS.primary}; }
.mt-chat-input-area button {
  padding: 8px 14px; background: ${COLORS.primary}; color: ${COLORS.bg};
  border: none; border-radius: 6px; cursor: pointer; font-weight: 600;
  font-size: 0.82rem; transition: background 0.2s; font-family: 'Figtree', sans-serif;
}
.mt-chat-input-area button:hover { background: ${COLORS.primaryHover}; }
.mt-chat-input-area button:disabled { opacity: 0.5; cursor: not-allowed; }

/* Quiz Styles */
.mt-quiz-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(8,11,9,0.7); backdrop-filter: blur(10px);
  display: none; align-items: center; justify-content: center; padding: 20px;
  animation: mtFadeIn 0.25s ease;
}
.mt-quiz-overlay.open { display: flex; }

.mt-quiz-modal {
  background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
  border-radius: 16px; padding: 36px; max-width: 640px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  animation: mtSlideUp 0.35s cubic-bezier(0.22,1,0.36,1);
  position: relative;
}

.mt-quiz-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; color: ${COLORS.muted}; cursor: pointer;
  padding: 6px; border-radius: 4px; transition: all 0.15s;
}
.mt-quiz-close:hover { background: ${COLORS.bg}; color: ${COLORS.text}; }

.mt-quiz-progress {
  display: flex; gap: 8px; margin-bottom: 28px; justify-content: center;
}
.mt-quiz-dot {
  width: 8px; height: 8px; border-radius: 50%; background: ${COLORS.border};
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
}
.mt-quiz-dot.active { background: ${COLORS.primary}; transform: scale(1.3); }
.mt-quiz-dot.done { background: ${COLORS.success}; }

.mt-quiz-question { margin-bottom: 24px; }
.mt-quiz-question h3 {
  font-size: 1.15rem; margin-bottom: 4px; line-height: 1.3;
  font-family: 'Playfair Display', Georgia, serif; font-weight: 700;
  color: ${COLORS.text};
}
.mt-quiz-question p {
  font-size: 0.85rem; color: ${COLORS.muted}; margin: 0;
}

.mt-quiz-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
@media (max-width: 580px) { .mt-quiz-options { grid-template-columns: 1fr; } }
.mt-quiz-option {
  padding: 0; border: 1px solid ${COLORS.border}; border-radius: 12px;
  background: ${COLORS.bg}; cursor: pointer; text-align: left;
  transition: all 0.3s cubic-bezier(0.22,1,0.36,1); font-family: 'Figtree', sans-serif;
  color: ${COLORS.text}; display: flex; flex-direction: column; overflow: hidden;
  position: relative;
}
.mt-quiz-option:hover { border-color: ${COLORS.primary}; transform: translateY(-3px); box-shadow: 0 10px 24px rgba(179,57,57,0.14); }
.mt-quiz-option.selected { border-color: ${COLORS.primary}; background: rgba(179,57,57,0.06); box-shadow: 0 0 0 2px ${COLORS.primary}; }

.mt-quiz-option-img-wrapper {
  width: 100%; height: 140px; overflow: hidden; position: relative; background: #eef0eb;
}
.mt-quiz-option-img {
  width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;
}
.mt-quiz-option:hover .mt-quiz-option-img { transform: scale(1.05); }

.mt-quiz-option-body {
  padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; flex: 1;
}
.mt-quiz-option-title {
  font-weight: 600; font-size: 0.88rem; line-height: 1.4; color: ${COLORS.text};
}

.mt-quiz-email { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
.mt-quiz-email input {
  padding: 12px 16px; border: 1px solid ${COLORS.border}; border-radius: 6px;
  font-family: 'Figtree', sans-serif; font-size: 0.88rem; background: ${COLORS.bg};
  color: ${COLORS.text};
}
.mt-quiz-email input:focus { outline: none; border-color: ${COLORS.primary}; box-shadow: 0 0 0 2px rgba(179,57,57,0.1); }
.mt-quiz-email button {
  padding: 12px 24px; background: ${COLORS.primary}; color: ${COLORS.bg};
  border: none; border-radius: 6px; font-weight: 600; font-size: 0.9rem;
  cursor: pointer; transition: background 0.2s; font-family: 'Figtree', sans-serif;
}
.mt-quiz-email button:hover { background: ${COLORS.primaryHover}; }
.mt-quiz-email button:disabled { opacity: 0.5; cursor: not-allowed; }
.mt-quiz-email .mt-error { color: ${COLORS.primary}; font-size: 0.78rem; margin: 0; }

.mt-quiz-result { text-align: center; padding: 16px 0; }
.mt-quiz-result .mt-check {
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(58,122,92,0.08); border: 1px solid rgba(58,122,92,0.2);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: ${COLORS.success};
}
.mt-quiz-result h3 { font-size: 1.3rem; margin-bottom: 8px; font-family: 'Playfair Display', Georgia, serif; }
.mt-quiz-result p { font-size: 0.88rem; color: ${COLORS.muted}; margin-bottom: 20px; line-height: 1.5; }
.mt-quiz-result button {
  padding: 12px 28px; background: ${COLORS.primary}; color: ${COLORS.bg};
  border: none; border-radius: 6px; font-weight: 600; font-size: 0.9rem;
  cursor: pointer; transition: all 0.2s; font-family: 'Figtree', sans-serif;
}
.mt-quiz-result button:hover { background: ${COLORS.primaryHover}; transform: translateY(-1px); }

.mt-inline-quiz { margin: 24px 0; }

/* Lead Popup Styles */
.mt-lead-overlay {
  position: fixed; inset: 0; z-index: 10001;
  background: rgba(8,11,9,0.7); backdrop-filter: blur(10px);
  display: none; align-items: center; justify-content: center; padding: 20px;
  animation: mtFadeIn 0.25s ease;
}
.mt-lead-overlay.open { display: flex; }

.mt-lead-modal {
  background: ${COLORS.surface}; border: 1px solid ${COLORS.border};
  border-radius: 12px; padding: 40px; max-width: 420px; width: 100%;
  animation: mtSlideUp 0.35s cubic-bezier(0.22,1,0.36,1);
  position: relative; text-align: center;
}
.mt-lead-modal h2 {
  font-family: 'Playfair Display', Georgia, serif; font-size: 1.35rem;
  margin: 0 0 4px; color: ${COLORS.text};
}
.mt-lead-modal p {
  font-size: 0.85rem; color: ${COLORS.muted}; margin: 0 0 20px; line-height: 1.4;
}
.mt-lead-close {
  position: absolute; top: 14px; right: 14px;
  width: 32px; height: 32px; border: none; background: transparent;
  color: ${COLORS.muted}; cursor: pointer; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, color 0.15s; padding: 0;
}
.mt-lead-close:hover { background: ${COLORS.surface}; color: ${COLORS.text}; }
.mt-lead-form { display: flex; flex-direction: column; gap: 10px; text-align: left; }
.mt-lead-form input {
  padding: 12px 16px; border: 1px solid ${COLORS.border}; border-radius: 6px;
  font-family: 'Figtree', sans-serif; font-size: 0.88rem;
  background: ${COLORS.bg}; color: ${COLORS.text};
  transition: border-color 0.15s;
}
.mt-lead-form input:focus { outline: none; border-color: ${COLORS.primary}; box-shadow: 0 0 0 2px rgba(179,57,57,0.1); }
.mt-lead-form button {
  padding: 12px 24px; background: ${COLORS.primary}; color: ${COLORS.bg};
  border: none; border-radius: 6px; font-weight: 600; font-size: 0.9rem;
  cursor: pointer; transition: background 0.2s; font-family: 'Figtree', sans-serif;
}
.mt-lead-form button:hover { background: ${COLORS.primaryHover}; }
.mt-lead-form button:disabled { opacity: 0.5; cursor: not-allowed; }
.mt-lead-form .mt-error { color: ${COLORS.primary}; font-size: 0.78rem; margin: 0; }
`;

  // =============== INJECT STYLES ===============
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // =============== CHAT API ===============
  function chatRequest(body) {
    return fetch(API_BASE + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  function leadRequest(data) {
    return fetch(API_BASE + '/api/quiz?action=submit-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); });
  }

  function quizRequest(method, action, body) {
    var opts = {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(API_BASE + '/api/quiz?action=' + action, opts).then(function (r) { return r.json(); });
  }

  // =============== CHAT WIDGET ===============
  function initChat() {
    var existingLauncher = document.getElementById('mt-chat-launcher');
    if (existingLauncher) return;

    var launcher = document.createElement('button');
    launcher.id = 'mt-chat-launcher';
    launcher.setAttribute('aria-label', 'Chat with MUSHROOM TAN');
    launcher.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    document.body.appendChild(launcher);

    var panel = document.createElement('div');
    panel.id = 'mt-chat-panel';
    panel.innerHTML =
      '<div class="mt-chat-header">' +
        '<div><h3>' + BRAND + '</h3><span>' + SUPPORT_DESK + '</span></div>' +
        '<button class="mt-chat-close" id="mt-chat-close" aria-label="Close chat">&times;</button>' +
      '</div>' +
      '<div class="mt-chat-body" id="mt-chat-body">' +
        '<div class="mt-msg ai">Welcome to ' + BRAND + '. Please share your contact info so we can assist you with bulk pricing and product availability.</div>' +
      '</div>' +
      '<div class="mt-chat-input-area" id="mt-chat-input-area"></div>';
    document.body.appendChild(panel);

    var bodyEl = document.getElementById('mt-chat-body');
    var inputArea = document.getElementById('mt-chat-input-area');

    var gateForm = document.createElement('div');
    gateForm.className = 'mt-gate-form';
    gateForm.innerHTML =
      '<input type="text" id="mt-gate-name" placeholder="Your name" required>' +
      '<input type="tel" id="mt-gate-phone" placeholder="Phone number" required>' +
      '<input type="email" id="mt-gate-email" placeholder="Email address" required>' +
      '<button id="mt-gate-submit">Start Chat</button>' +
      '<p class="mt-error" id="mt-gate-error" style="display:none"></p>';
    inputArea.appendChild(gateForm);

    var chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.id = 'mt-chat-input';
    chatInput.placeholder = 'Type your message...';
    chatInput.style.display = 'none';

    var sendBtn = document.createElement('button');
    sendBtn.id = 'mt-chat-send';
    sendBtn.textContent = 'Send';
    sendBtn.style.display = 'none';

    inputArea.appendChild(chatInput);
    inputArea.appendChild(sendBtn);

    var unlocked = sessionStorage.getItem('mt_chat_visitor_unlocked');
    var leadName = sessionStorage.getItem('mt_lead_name');
    var leadEmail = sessionStorage.getItem('mt_lead_email');
    var leadPhone = sessionStorage.getItem('mt_lead_phone');

    if (unlocked) {
      gateForm.style.display = 'none';
      chatInput.style.display = '';
      sendBtn.style.display = '';
      chatInput.focus();
    } else if (leadName && leadEmail) {
      unlocked = true;
      chatRequest({ action: 'visitor', name: leadName, email: leadEmail, phone: leadPhone || '', session_id: sessionId })
        .then(function () {
          sessionStorage.setItem('mt_chat_visitor_unlocked', 'true');
        }).catch(function () {});
      gateForm.style.display = 'none';
      chatInput.style.display = '';
      sendBtn.style.display = '';
      chatInput.focus();
    }

    // Gate form submit
    document.getElementById('mt-gate-submit').addEventListener('click', function () {
      var name = document.getElementById('mt-gate-name').value.trim();
      var phone = document.getElementById('mt-gate-phone').value.trim();
      var email = document.getElementById('mt-gate-email').value.trim();
      var errorEl = document.getElementById('mt-gate-error');

      if (!name || !phone || !email) {
        errorEl.textContent = 'Please fill in all fields.';
        errorEl.style.display = '';
        return;
      }
      errorEl.style.display = 'none';

      var submitBtn = document.getElementById('mt-gate-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Connecting...';

      chatRequest({ action: 'visitor', name: name, email: email, phone: phone, session_id: sessionId })
        .then(function () {
          sessionStorage.setItem('mt_chat_visitor_unlocked', 'true');
          sessionStorage.setItem('mt_user_name', name);
          gateForm.style.display = 'none';
          chatInput.style.display = '';
          sendBtn.style.display = '';
          chatInput.focus();
          addMessage('system', 'You\'re now chatting with ' + BRAND + ' ' + SUPPORT_DESK + '. How can we help you today?');
        })
        .catch(function () {
          // Storage is best-effort; still let the visitor chat.
          sessionStorage.setItem('mt_chat_visitor_unlocked', 'true');
          sessionStorage.setItem('mt_user_name', name);
          gateForm.style.display = 'none';
          chatInput.style.display = '';
          sendBtn.style.display = '';
          chatInput.focus();
          addMessage('system', 'You\'re now chatting with ' + BRAND + ' ' + SUPPORT_DESK + '. How can we help you today?');
        });
    });

    // Send message
    function sendMessage() {
      var text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      sendBtn.disabled = true;
      addMessage('user', text);
      showTyping();

      chatRequest({
        action: 'chat',
        message: text,
        history: chatHistory,
        session_id: sessionId,
        user_name: sessionStorage.getItem('mt_user_name') || 'Guest'
      }).then(function (data) {
        hideTyping();
        if (data && data.reply) {
          addMessage('ai', data.reply);
        } else if (data && data.error) {
          addMessage('ai', 'Our chat assistant is temporarily unavailable. Please email orders@mushroomtan.com and we\'ll respond shortly.');
        } else {
          addMessage('ai', 'Thanks for reaching out! A member of our sales team will follow up with pricing and availability. You can also request a quote at orders@mushroomtan.com.');
        }
        sendBtn.disabled = false;
        chatInput.focus();
      }).catch(function () {
        hideTyping();
        addMessage('ai', 'Thanks for your message. Our team will get back to you shortly with pricing and availability. Or email orders@mushroomtan.com directly.');
        sendBtn.disabled = false;
      });
    }

    document.getElementById('mt-chat-send').addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendMessage();
    });

    // Toggle panel
    launcher.addEventListener('click', function () {
      var isOpen = panel.classList.contains('open');
      panel.classList.toggle('open');
      launcher.style.display = isOpen ? '' : 'none';
      if (!isOpen) {
        var inp = document.getElementById('mt-chat-input');
        if (inp && inp.style.display !== 'none') inp.focus();
      }
    });

    document.getElementById('mt-chat-close').addEventListener('click', function () {
      panel.classList.remove('open');
      launcher.style.display = '';
    });

    function addMessage(role, text) {
      chatHistory.push({ role: role === 'ai' ? 'assistant' : role, content: text });
      var div = document.createElement('div');
      div.className = 'mt-msg ' + role;
      div.textContent = text;
      bodyEl.appendChild(div);
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }

    function showTyping() {
      var div = document.createElement('div');
      div.className = 'mt-typing';
      div.id = 'mt-typing-indicator';
      div.innerHTML = '<span></span><span></span><span></span>';
      bodyEl.appendChild(div);
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }

    function hideTyping() {
      var el = document.getElementById('mt-typing-indicator');
      if (el) el.remove();
    }
  }

  // =============== QUIZ ENGINE ===============
  function determineSegment(answers) {
    var q1 = answers['q1'];
    var q2 = answers['q2_buyer'] || answers['q2_wholesaler'];

    if (q1 === 'buyer' && q2 === 'high_volume') return 'buyer_high';
    if (q1 === 'buyer' && q2 === 'trial') return 'buyer_trial';
    if (q1 === 'wholesaler' && q2 === 'immediate') return 'wholesaler_immediate';
    if (q1 === 'wholesaler' && q2 === 'researching') return 'wholesaler_researching';
    return 'buyer_trial';
  }

  function getQuestionsForStep(questions, step, answers) {
    if (step === 0) return questions.filter(function (q) { return q.layer === 1 || Number(q.layer) === 1; });
    var prevAnswer = answers['q1'];
    var target = prevAnswer === 'buyer' ? 'q2_buyer' : 'q2_wholesaler';
    return questions.filter(function (q) { return q.id === target; });
  }

  function renderQuizStep(container, questions, step, answers) {
    var qs = getQuestionsForStep(questions, step, answers);

    if (step < 2) {
      var q = qs[0];
      if (!q) return;

      var imgA = q.option_a_img || OPTION_IMAGES[q.option_a_key] || '';
      var imgB = q.option_b_img || OPTION_IMAGES[q.option_b_key] || '';

      var renderOptionHtml = function (key, text, img) {
        var imgHtml = img ? '<div class="mt-quiz-option-img-wrapper"><img src="' + img + '" alt="' + text.replace(/"/g, '&quot;') + '" class="mt-quiz-option-img" /></div>' : '';
        return '<button class="mt-quiz-option" data-key="' + key + '">' +
          imgHtml +
          '<div class="mt-quiz-option-body">' +
            '<span class="mt-quiz-option-title">' + text + '</span>' +
          '</div>' +
        '</button>';
      };

      container.innerHTML =
        '<div class="mt-quiz-progress">' +
          '<span class="mt-quiz-dot ' + (step >= 0 ? (step > 0 ? 'done' : 'active') : '') + '"></span>' +
          '<span class="mt-quiz-dot ' + (step >= 1 ? (step > 1 ? 'done' : 'active') : '') + '"></span>' +
          '<span class="mt-quiz-dot ' + (step >= 2 ? 'active' : '') + '"></span>' +
        '</div>' +
        '<div class="mt-quiz-question">' +
          '<h3>' + q.question_text + '</h3>' +
          '<p>Step ' + (step + 1) + ' of 3</p>' +
        '</div>' +
        '<div class="mt-quiz-options">' +
          renderOptionHtml(q.option_a_key, q.option_a_text, imgA) +
          renderOptionHtml(q.option_b_key, q.option_b_text, imgB) +
        '</div>';

      var questionId = q.id;
      // Track view
      quizRequest('POST', 'track', { question_id: questionId, option_key: '', type: 'view' }).catch(function () {});

      container.querySelectorAll('.mt-quiz-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-key');
          container.querySelectorAll('.mt-quiz-option').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          btn.disabled = true;

          // Track click
          quizRequest('POST', 'track', { question_id: questionId, option_key: key, type: 'click' }).catch(function () {});

          var newAnswers = JSON.parse(JSON.stringify(answers));
          newAnswers[questionId] = key;

          // Submit selection to sheet
          quizRequest('POST', 'submit-selection', { session_id: quizState.session_id, question_id: questionId, option_key: key }).catch(function () {});

          if (step === 0) {
            var nextQuestions = getQuestionsForStep(questions, 1, newAnswers);
            if (nextQuestions.length > 0) {
              renderQuizStep(container, questions, 1, newAnswers);
            }
          } else {
            // Layer 2 answered → show email gate
            var seg = determineSegment(newAnswers);
            renderEmailGate(container, newAnswers, seg);
          }
        });
      });
    }
  }

  function renderEmailGate(container, answers, segment) {
    var savedName = sessionStorage.getItem('mt_lead_name') || '';
    var savedEmail = sessionStorage.getItem('mt_lead_email') || '';
    var savedPhone = sessionStorage.getItem('mt_lead_phone') || '';

    container.innerHTML =
      '<div class="mt-quiz-progress">' +
        '<span class="mt-quiz-dot done"></span>' +
        '<span class="mt-quiz-dot done"></span>' +
        '<span class="mt-quiz-dot active"></span>' +
      '</div>' +
      '<div class="mt-quiz-question">' +
        '<h3>You\'re a perfect fit for ' + BRAND + '</h3>' +
        '<p>Confirm your details to see your results and next steps.</p>' +
      '</div>' +
      '<div class="mt-quiz-email">' +
        '<input type="text" id="mt-quiz-name" placeholder="Your name" required value="' + savedName.replace(/"/g, '&quot;') + '">' +
        '<input type="email" id="mt-quiz-email-input" placeholder="you@company.com" required value="' + savedEmail.replace(/"/g, '&quot;') + '">' +
        '<input type="tel" id="mt-quiz-phone" placeholder="Phone number" value="' + savedPhone.replace(/"/g, '&quot;') + '">' +
        '<button id="mt-quiz-submit">See My Results</button>' +
        '<p class="mt-error" id="mt-quiz-email-error" style="display:none"></p>' +
      '</div>';

    document.getElementById('mt-quiz-submit').addEventListener('click', function () {
      var name = document.getElementById('mt-quiz-name').value.trim();
      var email = document.getElementById('mt-quiz-email-input').value.trim();
      var phone = document.getElementById('mt-quiz-phone').value.trim();
      var errorEl = document.getElementById('mt-quiz-email-error');

      if (!name || !email) {
        errorEl.textContent = 'Please enter your name and email.';
        errorEl.style.display = '';
        return;
      }

      sessionStorage.setItem('mt_lead_name', name);
      sessionStorage.setItem('mt_lead_email', email);
      if (phone) sessionStorage.setItem('mt_lead_phone', phone);

      var submitBtn = document.getElementById('mt-quiz-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      quizRequest('POST', 'submit', {
        name: name, email: email, phone: phone || savedPhone,
        funnelCategory: segment,
        answers: answers,
        session_id: quizState.session_id
      }).then(function () {
        renderResult(container, segment, name);
      }).catch(function () {
        renderResult(container, segment, name);
      });
    });
  }

  function renderResult(container, segment, name) {
    var segInfo = SEGMENTS[segment] || SEGMENTS.buyer_trial;
    var desc = segment === 'buyer_high'
      ? 'You\'re a high-volume buyer. Our team can set up bulk pricing and recurring deliveries tailored to your needs.'
      : segment === 'buyer_trial'
      ? 'You\'re ready to try our products. Browse our catalog and start with a trial order.'
      : segment === 'wholesaler_immediate'
      ? 'You\'re ready for white-label partnerships. Let\'s start the conversation about volume contracts and custom formulations.'
      : 'You\'re researching the market. Download our commercial guide to learn more about wholesale mushroom sourcing.';

    container.innerHTML =
      '<div class="mt-quiz-result">' +
        '<div class="mt-check">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
        '</div>' +
        '<h3>' + segInfo.name + '</h3>' +
        '<p>' + desc + '</p>' +
        '<button id="mt-quiz-cta">' + segInfo.cta + '</button>' +
      '</div>';

    document.getElementById('mt-quiz-cta').addEventListener('click', function () {
      var redirect = segInfo.redirect;
      if (redirect.startsWith('#')) {
        closeQuiz();
        var el = document.querySelector(redirect);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (redirect.startsWith('/api/')) {
        window.location.href = API_BASE + redirect + '?email=' + encodeURIComponent(document.getElementById('mt-quiz-email-input')?.value || '') + '&name=' + encodeURIComponent(name);
      } else {
        window.location.href = redirect;
      }
    });
  }

  function closeLeadPopup() {
    var overlay = document.getElementById('mt-lead-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function initLeadPopup() {
    if (sessionStorage.getItem('mt_lead_name')) return;
    if (sessionStorage.getItem('mt_lead_skipped')) return;

    setTimeout(function () {
      var existing = document.getElementById('mt-lead-overlay');
      if (existing) return;

      var overlay = document.createElement('div');
      overlay.id = 'mt-lead-overlay';
      overlay.className = 'mt-lead-overlay';
      overlay.innerHTML =
        '<div class="mt-lead-modal">' +
          '<button class="mt-lead-close" id="mt-lead-close" aria-label="Close">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
          '</button>' +
          '<h2>Get Started with ' + BRAND + '</h2>' +
          '<p>Enter your details to see wholesale pricing and product availability.</p>' +
          '<div class="mt-lead-form">' +
            '<input type="text" id="mt-lead-name" placeholder="Your name" required>' +
            '<input type="email" id="mt-lead-email" placeholder="Email address" required>' +
            '<input type="tel" id="mt-lead-phone" placeholder="Phone number" required>' +
            '<button id="mt-lead-submit">Show Me Pricing</button>' +
            '<p class="mt-error" id="mt-lead-error" style="display:none"></p>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      requestAnimationFrame(function () {
        overlay.classList.add('open');
      });

      document.getElementById('mt-lead-submit').addEventListener('click', function () {
        var name = document.getElementById('mt-lead-name').value.trim();
        var email = document.getElementById('mt-lead-email').value.trim();
        var phone = document.getElementById('mt-lead-phone').value.trim();
        var errorEl = document.getElementById('mt-lead-error');

        if (!name || !email || !phone) {
          errorEl.textContent = 'Please fill in all fields.';
          errorEl.style.display = '';
          return;
        }
        errorEl.style.display = 'none';

        var btn = document.getElementById('mt-lead-submit');
        btn.disabled = true;
        btn.textContent = 'Submitting...';

        leadRequest({ name: name, email: email, phone: phone, session_id: leadSessionId })
          .then(function () {
            sessionStorage.setItem('mt_lead_name', name);
            sessionStorage.setItem('mt_lead_email', email);
            sessionStorage.setItem('mt_lead_phone', phone);
            closeLeadPopup();
          })
          .catch(function () {
            sessionStorage.setItem('mt_lead_name', name);
            sessionStorage.setItem('mt_lead_email', email);
            sessionStorage.setItem('mt_lead_phone', phone);
            closeLeadPopup();
          });
      });

      document.getElementById('mt-lead-close').addEventListener('click', function () {
        sessionStorage.setItem('mt_lead_skipped', 'true');
        closeLeadPopup();
      });

      function dismissLead() {
        sessionStorage.setItem('mt_lead_skipped', 'true');
        closeLeadPopup();
        document.removeEventListener('keydown', onLeadKey);
        window.removeEventListener('scroll', dismissLead, true);
      }

      function onLeadKey(e) {
        if (e.key === 'Escape') dismissLead();
      }
      document.addEventListener('keydown', onLeadKey);
      window.addEventListener('scroll', dismissLead, true);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
          dismissLead();
        }
      });
    }, 1000);
  }

  function closeQuiz() {
    var overlay = document.getElementById('mt-quiz-overlay');
    if (overlay) overlay.classList.remove('open');
  }

  function openQuizPopup() {
    var existing = document.getElementById('mt-quiz-overlay');
    if (existing) {
      existing.classList.add('open');
      return;
    }

    var overlay = document.createElement('div');
    overlay.id = 'mt-quiz-overlay';
    overlay.className = 'mt-quiz-overlay';
    overlay.innerHTML = '<div class="mt-quiz-modal" id="mt-quiz-modal"><button class="mt-quiz-close" id="mt-quiz-close-btn">&times;</button><div id="mt-quiz-container"></div></div>';
    document.body.appendChild(overlay);

    document.getElementById('mt-quiz-close-btn').addEventListener('click', closeQuiz);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeQuiz();
    });

    overlay.classList.add('open');
    loadQuizInto(document.getElementById('mt-quiz-container'));
  }

  function initInlineQuiz(containerEl) {
    var wrapper = document.createElement('div');
    wrapper.className = 'mt-inline-quiz';
    wrapper.id = 'mt-inline-quiz-wrapper';
    containerEl.appendChild(wrapper);
    loadQuizInto(wrapper, true);
  }

  function loadQuizInto(container, _isInline) {
    quizState = { step: 0, answers: {}, session_id: 'quiz_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) };

    if (questionsCache.length > 0) {
      renderQuizStep(container, questionsCache, 0, {});
    } else {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:' + COLORS.muted + ';font-size:0.9rem">Loading...</div>';

      quizRequest('GET', 'get-questions').then(function (data) {
        if (data.success && data.questions && data.questions.length > 0) {
          questionsCache = data.questions;
          renderQuizStep(container, questionsCache, 0, {});
        } else {
          container.innerHTML = '<div style="text-align:center;padding:40px;color:' + COLORS.muted + '">Unable to load quiz. Please try again later.</div>';
        }
      }).catch(function () {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:' + COLORS.muted + '">Unable to load quiz. Please try again later.</div>';
      });
    }
  }

  // =============== EXPOSE GLOBALLY ===============
  window.MushroomTAN = {
    openChat: function () {
      var launcher = document.getElementById('mt-chat-launcher');
      if (launcher) launcher.click();
    },
    openQuiz: openQuizPopup,
    initInlineQuiz: initInlineQuiz,
    BRAND: BRAND
  };

  // =============== AUTO-INIT ===============
  function autoInit() {
    if (document.getElementById('ln-chat-launcher') || document.getElementById('mt-chat-launcher')) {
      return; // Already has launcher
    }
    initChat();
    initLeadPopup();

    // Check for inline quiz container
    var inlineContainer = document.getElementById('inline-quiz-container');
    if (inlineContainer) {
      initInlineQuiz(inlineContainer);
    }

    // Bind quiz trigger buttons
    document.querySelectorAll('#lead-trigger, .lt-text, [data-trigger="quiz"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        openQuizPopup();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
})();
