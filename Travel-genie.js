document.addEventListener('DOMContentLoaded', () => {
    const GENIE_BOT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" style="width: 100%; height: 100%;">
        <rect x="12" y="24" width="40" height="32" rx="12" fill="#10B981"/>
        <path d="M12 36C12 29.3726 17.3726 24 24 24H40C46.6274 24 52 29.3726 52 36V56H12V36Z" fill="#059669"/>
        <circle cx="24" cy="40" r="4" fill="white"/>
        <circle cx="40" cy="40" r="4" fill="white"/>
        <path d="M28 50H36" stroke="white" stroke-width="4" stroke-linecap="round"/>
        <path d="M16 26C16 16 24 12 32 12C40 12 48 16 48 26" fill="#FBBF24"/>
        <circle cx="32" cy="20" r="4" fill="#EF4444"/>
        <path d="M32 12V4" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
        <path d="M12 30H8C6.89543 30 6 30.8954 6 32V38C6 39.1046 6.89543 40 8 40H12" fill="#059669"/>
        <path d="M52 30H56C57.1046 30 58 30.8954 58 32V38C58 39.1046 57.1046 40 56 40H52" fill="#059669"/>
    </svg>`;

    const GENIE_BOT_SVG_WHITE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" style="width: 100%; height: 100%;">
        <rect x="12" y="24" width="40" height="32" rx="12" fill="#ffffff"/>
        <path d="M12 36C12 29.3726 17.3726 24 24 24H40C46.6274 24 52 29.3726 52 36V56H12V36Z" fill="#f1f5f9"/>
        <circle cx="24" cy="40" r="4" fill="#059669"/>
        <circle cx="40" cy="40" r="4" fill="#059669"/>
        <path d="M28 50H36" stroke="#059669" stroke-width="4" stroke-linecap="round"/>
        <path d="M16 26C16 16 24 12 32 12C40 12 48 16 48 26" fill="#FBBF24"/>
        <circle cx="32" cy="20" r="4" fill="#EF4444"/>
        <path d="M32 12V4" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
        <path d="M12 30H8C6.89543 30 6 30.8954 6 32V38C6 39.1046 6.89543 40 8 40H12" fill="#e2e8f0"/>
    </svg>`;

    // Inject Travel Genie Styles (Self-contained widget scoped styles)
    const tgStyles = document.createElement('style');
    tgStyles.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        .chatbot-toggle-container { position: fixed; bottom: 30px; right: 30px; z-index: 999999; display: flex; align-items: center; gap: 15px; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .chatbot-tooltip { background-color: white; color: #333; padding: 12px 20px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); font-weight: 500; font-size: 15px; display: flex; align-items: center; gap: 8px; animation: bounceTooltip 2s infinite ease-in-out; position: relative; cursor: pointer; letter-spacing: 0.2px; }
        .chatbot-tooltip::after { content: ''; position: absolute; right: -8px; top: 50%; transform: translateY(-50%); border-width: 8px 0 8px 8px; border-style: solid; border-color: transparent transparent transparent white; }
        @keyframes bounceTooltip { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .chatbot-toggle-btn { width: 65px; height: 65px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); cursor: pointer; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease; border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3) !important; padding: 0; }
        .chatbot-toggle-btn:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 15px 30px rgba(16, 185, 129, 0.4) !important; }
        .chatbot-toggle-btn svg { color: white; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
        .chatbot-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100%; height: 100dvh; z-index: 999999; background: #f8fafc; display: flex; flex-direction: column; animation: slideUpFullScreen 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; border: none; border-radius: 0 !important; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; letter-spacing: 0.1px; }
        .chatbot-container.d-none { display: none !important; }
        @keyframes slideUpFullScreen { from { opacity: 0; transform: translateY(100vh); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDownFullScreen { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(100vh); } }
        .chatbot-body { flex-grow: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #cbd5e1 #f8fafc; padding-bottom: 20px; }
        .chatbot-body::-webkit-scrollbar { width: 6px; }
        .chatbot-body::-webkit-scrollbar-track { background: #f1f5f9; }
        .chatbot-body::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .transition-hover { transition: all 0.2s ease; }
        .transition-hover:hover { background-color: #f8fafc !important; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(16, 185, 129, 0.08) !important; border-color: #10b981 !important; }
        .message-bubble { font-size: 1rem; line-height: 1.6; word-wrap: break-word; font-weight: 400; color: #1e293b; }
        .message-bubble table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .message-bubble th, .message-bubble td { border: 1px solid #dee2e6; padding: 6px; }
        .message-bubble p:last-child { margin-bottom: 0; }
        .typing-indicator { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 20px; }
        .typing-dot { width: 6px; height: 6px; background-color: #6c757d; border-radius: 50%; animation: typing 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @media (max-width: 576px) { .chatbot-toggle-container { right: 15px; bottom: 20px; flex-direction: column; align-items: flex-end; gap: 10px; } .chatbot-tooltip::after { right: 20px; top: 100%; transform: translateX(0); border-width: 8px 8px 0 8px; border-color: white transparent transparent transparent; } }
        .voice-btn.recording { background-color: #f8d7da !important; border-color: #dc3545 !important; animation: voice-pulse 1.5s infinite; }
        .voice-btn.recording .material-icons { color: #dc3545 !important; }
        @keyframes voice-pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .chat-date-picker { cursor: pointer; padding: 8px; font-size: 16px; transition: color 0.1s; }
        .chat-date-picker.empty { color: transparent; position: relative; }
        .chat-date-picker.empty::before { content: attr(data-placeholder); color: #888; position: absolute; left: 10px; font-weight: 500; font-size: 0.9rem; pointer-events: none; }
        .chat-date-picker:focus.empty::before, .chat-date-picker:active.empty::before { display: none; }
        .chat-date-picker:focus.empty, .chat-date-picker:active.empty { color: inherit; }
        .chat-date-picker::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(0.5) sepia(1) saturate(5) hue-rotate(175deg); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .lang-dropdown-menu { display: none; position: absolute; right: 0; top: 100%; margin-top: 5px; min-width: 140px; z-index: 1000; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden; flex-direction: column; padding: 5px 0; }
        .lang-dropdown-menu.show { display: flex; animation: fadeIn 0.15s ease-out; }
        .lang-item { display: flex; align-items: center; gap: 10px; padding: 10px 15px; background: white; border: none; width: 100%; text-align: left; cursor: pointer; font-size: 0.95rem; font-weight: 500; color: #1e293b; transition: background 0.2s; }
        .lang-item:hover { background: #f8fafc; color: #10b981; }
        .lang-item img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; }
        
        /* Safe scoped bootstrap overriding for text colors inside widget so hosts without it won't break */
        .chatbot-container .bg-primary { background-color: #10b981 !important; color: white !important; }
        .chatbot-container .btn-primary { background-color: #10b981 !important; border-color: #10b981 !important; color: white !important;}
        .chatbot-container .btn-primary:hover { background-color: #059669 !important; border-color: #059669 !important; }
        .chatbot-container .text-primary { color: #10b981 !important; }
        .chatbot-container .border-primary { border-color: #10b981 !important; }
        .chatbot-container .btn-outline-primary { color: #10b981 !important; border-color: #10b981 !important; }
        .chatbot-container .btn-outline-primary:hover { background-color: #10b981 !important; color: white !important; }
    `;
    document.head.appendChild(tgStyles);

    // Inject Travel Genie Widget HTML into the DOM
    const tgWrapper = document.createElement('div');
    tgWrapper.innerHTML = `
        <div id="chatbot-container" class="chatbot-container shadow-lg d-none">
            <div class="chatbot-header bg-white p-3 d-flex justify-content-between align-items-center shadow-sm" style="border-radius: 0; border-bottom: 1px solid #e2e8f0;">
                <div class="d-flex align-items-center gap-3">
                    <div style="width: 40px; height: 40px; filter: drop-shadow(0 4px 6px rgba(16,185,129,0.3)); padding: 2px;">${GENIE_BOT_SVG}</div>
                    <div class="d-flex flex-column">
                        <span class="fw-bold fs-5 text-dark mb-0" style="line-height: 1.1; letter-spacing: -0.5px;">Travel Genie</span>
                        <div class="d-flex align-items-center gap-1 mt-1">
                            <span style="width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; display: inline-block;"></span>
                            <span class="small text-muted" style="font-size: 0.75rem; font-weight: 500;">Online</span>
                        </div>
                    </div>
                </div>
                <div class="d-flex gap-3 align-items-center">
                    <div class="position-relative" id="lang-dropdown-container">
                        <button id="lang-toggle-btn" class="btn btn-sm btn-light border d-flex align-items-center gap-2" style="border-radius: 8px; padding: 6px 10px; font-weight: 600; color: #1e293b; background: white;">
                            <span class="material-icons text-primary" style="font-size: 18px;">language</span>
                            <span id="lang-current-text">English</span>
                            <span class="material-icons text-muted" style="font-size: 16px;">expand_more</span>
                        </button>
                        <div id="lang-dropdown-menu" class="lang-dropdown-menu">
                            <button class="lang-item" data-lang="English">English</button>
                            <button class="lang-item" data-lang="Hindi">Hindi</button>
                            <button class="lang-item" data-lang="Malayalam">Malayalam</button>
                            <button class="lang-item" data-lang="Tamil">Tamil</button>
                        </div>
                    </div>
                    <button id="close-chat" class="btn btn-sm btn-light p-2 rounded-circle hover-opacity d-flex align-items-center justify-content-center" style="width: 35px; height: 35px;"><span class="material-icons text-secondary" style="font-size: 20px;">close</span></button>
                </div>
            </div>
            <div id="chat-body" class="chatbot-body p-4 bg-light overflow-auto flex-grow-1 d-flex flex-column">
                <div class="chat-message bot mb-3 d-flex align-items-start gap-3">
                    <div class="avatar bg-white text-dark border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 40px; height: 40px; overflow: hidden; padding: 6px;">
                        ${GENIE_BOT_SVG}
                    </div>
                    <div id="initial-greeting-msg" class="message-bubble bg-white p-3 text-dark rounded-4 shadow-sm border" style="max-width: 85%; border-top-left-radius: 0 !important; font-size: 1.05rem;">
                        Hello! 👋 I'm Travel Genie, your AI travel assistant 🧞‍♂️. How can I help you find the best budget trips today? ✈️
                    </div>
                </div>
                <!-- Quick replies will dynamically append here to scroll up -->
            </div>
            <div class="chatbot-footer p-3 bg-white border-top shadow-sm pb-4">
                <div class="container-fluid p-0 max-w-4xl mx-auto">
                    <form id="chat-form" class="d-flex gap-3 align-items-center px-lg-4">
                        <button type="button" id="voice-btn" class="btn btn-light d-flex align-items-center justify-content-center flex-shrink-0 border voice-btn shadow-sm" style="width: 48px; height: 48px; border-radius: 50%; padding: 0;" title="Speak">
                            <span class="material-icons text-secondary">mic</span>
                        </button>
                        <input type="text" id="chat-input" class="form-control border-secondary flex-grow-1 py-3 px-4 fs-6" placeholder="Message Travel Genie..." autocomplete="off" style="border-radius: 25px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);">
                        <button type="submit" class="btn btn-primary d-flex align-items-center justify-content-center flex-shrink-0 shadow" style="width: 48px; height: 48px; border-radius: 50%; padding: 0;">
                            <span class="material-icons">send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <div class="chatbot-toggle-container">
            <div class="chatbot-tooltip" id="chatbot-tooltip">
                Hi! I am Travel Genie, your AI Assistant <span class="fs-5">✨</span>
            </div>
            <button id="chatbot-toggle" class="chatbot-toggle-btn shadow-lg d-flex align-items-center justify-content-center">
                <div class="d-flex align-items-center justify-content-center" style="width: 42px; height: 42px; transform: translateY(-1px);">
                    ${GENIE_BOT_SVG_WHITE}
                </div>
            </button>
        </div>
    `;
    document.body.appendChild(tgWrapper);

    // --- UI Elements ---
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const closeChat = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');
    const voiceBtn = document.getElementById('voice-btn');

    // Create quick replies container dynamically so it maps inside chatBody
    let quickRepliesContainer = document.createElement('div');
    quickRepliesContainer.id = 'quick-replies-container';

    // API key moved to backend .env

    let isChatOpen = false;
    let chatHistory = [];
    let currentChatLanguage = 'English';

    // Handle Custom Language Dropdown Logic
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const langDropdownMenu = document.getElementById('lang-dropdown-menu');
    const langCurrentText = document.getElementById('lang-current-text');

    langToggleBtn.addEventListener('click', () => {
        langDropdownMenu.classList.toggle('show');
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!langToggleBtn.contains(e.target) && !langDropdownMenu.contains(e.target)) {
            langDropdownMenu.classList.remove('show');
        }
    });

    const langItems = document.querySelectorAll('.lang-item');
    langItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const lang = e.currentTarget.getAttribute('data-lang');

            if (currentChatLanguage !== lang) {
                currentChatLanguage = lang;
                langCurrentText.textContent = lang;
                langDropdownMenu.classList.remove('show');

                // Reset chat for new language greeting
                chatHistory = [];
                chatBody.innerHTML = '';
                addMessageToUI('model', greetings[lang]);
                updateQuickReplies(initialSuggestions[lang], true);
            } else {
                langDropdownMenu.classList.remove('show');
            }
        });
    });

    // Center Quick Replies Options initially if they were hardcoded
    quickRepliesContainer.classList.add('justify-content-center');

    const greetings = {
        'English': "Hello! 👋 I'm Travel Genie, your AI travel assistant 🧞‍♂️. How can I help you find the best budget trips today? ✈️",
        'Hindi': "नमस्ते! 👋 मैं ट्रैवल जिनी हूँ, आपका AI ट्रैवल असिस्टेंट 🧞‍♂️। आज मैं आपको सबसे अच्छे बजट ट्रिप खोजने में कैसे मदद कर सकता हूँ? ✈️",
        'Malayalam': "നമസ്കാരം! 👋 ഞാൻ ട്രാവൽ ജീനി, നിങ്ങളുടെ AI ട്രാവൽ അസിസ്റ്റന്റ് 🧞‍♂️. മികച്ച ബജറ്റ് യാത്രകൾ കണ്ടെത്താൻ ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും? ✈️",
        'Tamil': "வணக்கம்! 👋 நான் டிராவல் ஜினி, உங்கள் AI பயண உதவியாளர் 🧞‍♂️. சிறந்த பட்ஜெட் பயணங்களை கண்டறிய இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? ✈️"
    };

    const initialSuggestions = {
        'English': ["Find budget trips", "Beach holidays", "Family packages"],
        'Hindi': ["बजट ट्रिप खोजें", "समुद्र तट की छुट्टियां", "पारिवारिक पैकेज"],
        'Malayalam': ["ബഡ്ജറ്റ് യാത്രകൾ", "ബീച്ച് ഹോളിഡേ", "ഫാമിലി പാക്കേജുകൾ"],
        'Tamil': ["பட்ஜெட் பயணங்கள்", "கடற்கரை விடுமுறை", "குடும்பப் பேக்கேஜ்கள்"]
    };

    let userRegion = "";

    // Fetch user location for personalization
    fetch("http://ip-api.com/json/")
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success' && data.regionName) {
                userRegion = data.regionName;

                const localizedSuffix = {
                    'English': ` from ${userRegion}`,
                    'Hindi': ` ${userRegion} से`,
                    'Malayalam': ` ${userRegion}-ൽ നിന്നുള്ള`,
                    'Tamil': ` ${userRegion}-லிருந்து`
                };

                greetings['English'] = `Hello! 👋 I'm Travel Genie, your AI travel assistant 🧞‍♂️. How can I help you find the best budget trips${localizedSuffix['English']} today? ✈️`;
                greetings['Hindi'] = `नमस्ते! 👋 मैं ट्रैवल जिनी हूँ, आपका AI ट्रैवल असिस्टेंट 🧞‍♂️। आज मैं आपको${localizedSuffix['Hindi']} सबसे अच्छे बजट ट्रिप खोजने में कैसे मदद कर सकता हूँ? ✈️`;
                greetings['Malayalam'] = `നമസ്കാരം! 👋 ഞാൻ ട്രാവൽ ജീനി, നിങ്ങളുടെ AI ട്രാവൽ അസിസ്റ്റന്റ് 🧞‍♂️.${localizedSuffix['Malayalam']} മികച്ച ബജറ്റ് യാത്രകൾ കണ്ടെത്താൻ ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും? ✈️`;
                greetings['Tamil'] = `வணக்கம்! 👋 நான் டிராவல் ஜினி, உங்கள் AI பயண உதவியாளர் 🧞‍♂️.${localizedSuffix['Tamil']} சிறந்த பட்ஜெட் பயணங்களை கண்டறிய இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? ✈️`;

                // Update UI if still on first message and English
                if (chatHistory.length === 0 && currentChatLanguage === 'English') {
                    const initMsg = document.getElementById('initial-greeting-msg');
                    if (initMsg) {
                        initMsg.innerHTML = greetings['English'];
                    }
                }

                // Suggest language based on region
                const regionMap = {
                    'Tamil Nadu': 'Tamil',
                    'Kerala': 'Malayalam'
                };

                // Grouping primarily Hindi-speaking regions
                const hindiStates = ['Delhi', 'Maharashtra', 'Uttar Pradesh', 'Bihar', 'Rajasthan', 'Madhya Pradesh', 'Haryana', 'Gujarat', 'Chhattisgarh', 'Jharkhand', 'Uttarakhand'];
                if (hindiStates.includes(data.regionName)) {
                    regionMap[data.regionName] = 'Hindi';
                }

                const suggestedLang = regionMap[data.regionName];

                // Add translation prompt to first suggestions
                if (suggestedLang && currentChatLanguage === 'English') {
                    const suggestionText = `Ask in ${suggestedLang}`;
                    if (!initialSuggestions['English'].includes(suggestionText)) {
                        initialSuggestions['English'].unshift(suggestionText);

                        // Push immediately if chat just started loaded
                        if (chatHistory.length === 0) {
                            updateQuickReplies(initialSuggestions['English'], true);
                        }
                    }
                }
            }
        })
        .catch(err => console.error("Location fetch err:", err));

    // Handle Quick Reply Clicks (Delegated to chatBody since container moves)
    chatBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-reply');
        if (btn) {
            const val = btn.getAttribute('data-value') || btn.textContent.trim();

            if (val.toLowerCase() === 'start over') {
                chatHistory = []; // Reset memory
                updateQuickReplies(initialSuggestions[currentChatLanguage], true);
            } else if (val.startsWith('Ask in ')) {
                // Intercept dynamic translate suggestion button
                const targetLang = val.replace('Ask in ', '').trim();
                const matchedBtn = document.querySelector(`.lang-item[data-lang="${targetLang}"]`);
                if (matchedBtn) {
                    matchedBtn.click(); // Trigger native UI language switch visually
                }
                return; // Stop here, don't send anything into chat log
            }

            chatInput.value = val;
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Initialize initial quick replies
    updateQuickReplies(initialSuggestions['English'], true);

    // Hide tooltip on scroll
    window.addEventListener('scroll', () => {
        const tooltip = document.getElementById('chatbot-tooltip');
        if (tooltip && tooltip.style.display !== 'none') {
            tooltip.style.display = 'none';
        }
    });

    // --- Event Listeners ---
    chatbotToggle.addEventListener('click', () => {
        isChatOpen = true;
        const tooltip = document.getElementById('chatbot-tooltip');
        const toggleContainer = document.querySelector('.chatbot-toggle-container');

        chatbotContainer.classList.remove('d-none');
        chatbotContainer.style.animation = 'slideUpFullScreen 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';

        if (toggleContainer) toggleContainer.style.display = 'none';
        if (tooltip) tooltip.style.display = 'none';

        // Don't auto-focus on mobile devices to prevent keyboard jumping up immediately
        if (window.innerWidth >= 768) {
            chatInput.focus();
        }

        scrollToBottom();
    });

    closeChat.addEventListener('click', () => {
        isChatOpen = false;
        chatbotContainer.style.animation = 'slideDownFullScreen 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        setTimeout(() => {
            chatbotContainer.classList.add('d-none');
            chatbotContainer.style.animation = ''; // Reset animation
            const toggleContainer = document.querySelector('.chatbot-toggle-container');
            if (toggleContainer) toggleContainer.style.display = 'flex';
        }, 500);
    });



    // Handle Date Picker changes
    chatBody.addEventListener('change', (e) => {
        if (e.target.classList.contains('chat-date-picker')) {
            const dateVal = e.target.value;

            // Handle placeholder logic
            if (dateVal) {
                e.target.classList.remove("empty");
            } else {
                e.target.classList.add("empty");
            }

            if (dateVal) {
                const dateObj = new Date(dateVal);
                const valStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                chatInput.value = valStr;
                e.target.disabled = true; // disable after selection
                e.target.parentElement.remove(); // Remove the date picker element from UI after selection
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Voice Input (Web Speech API)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let isRecording = false;

    if (SpeechRecognition && voiceBtn) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            chatForm.dispatchEvent(new Event('submit'));
        };

        recognition.onend = () => {
            isRecording = false;
            voiceBtn.classList.remove('recording');
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            isRecording = false;
            voiceBtn.classList.remove('recording');
        };

        voiceBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                const langMap = { 'English': 'en-US', 'Hindi': 'hi-IN', 'Malayalam': 'ml-IN', 'Tamil': 'ta-IN' };
                recognition.lang = langMap[chatLanguage ? chatLanguage.value : 'English'] || 'en-US';
                recognition.start();
                isRecording = true;
                voiceBtn.classList.add('recording');
            }
        });
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none'; // Hide if not supported in browser
    }

    // Form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        // User message
        addMessageToUI('user', message);
        chatInput.value = '';
        quickRepliesContainer.innerHTML = ''; // clear suggestions

        if (message.toLowerCase() === 'start over') {
            chatHistory = [];
        }

        chatHistory.push({
            role: "user",
            parts: [{ text: message }]
        });

        const typingId = showTypingIndicator();
        try {
            const response = await fetchGeminiResponse();
            removeTypingIndicator(typingId);

            let botMessage = response.candidates[0].content.parts[0].text;

            // Extract suggestions
            const suggestions = [];
            const suggestionRegex = /\[\[SUGGESTION:\s*(.*?)\]\]/gi;
            let match;
            while ((match = suggestionRegex.exec(botMessage)) !== null) {
                suggestions.push(match[1]);
            }

            // Extract date picker boolean
            const needsDatePicker = botMessage.includes('[[DATE_PICKER]]');

            // Strip suggestions and tokens from displayed text
            let displayMessage = botMessage
                .replace(/\[\[SUGGESTION:\s*(.*?)\]\]/gi, '')
                .replace(/\[\[DATE_PICKER\]\]/gi, '')
                .trim();

            addMessageToUI('model', displayMessage);

            if (needsDatePicker) {
                addDatePickerToUI();
            }

            if (suggestions.length > 0) {
                updateQuickReplies(suggestions, false);
            } else {
                updateQuickReplies(["Ask something else...", "Start Over"], false);
            }

            // Add to history
            chatHistory.push({
                role: "model",
                parts: [{ text: botMessage }] // Save original text containing tokens so AI has context
            });

        } catch (error) {
            console.error('API Error:', error);
            removeTypingIndicator(typingId);
            addMessageToUI('model', 'Sorry, I am having trouble connecting right now. Please check your network connection.');
            chatHistory.pop(); // Remove stuck user message
        }
    });

    async function fetchGeminiResponse() {
        const API_URL = `http://localhost:8000/api/chat`;

        const requestBody = {
            contents: chatHistory,
            language: currentChatLanguage,
            region: userRegion
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // --- UI Helpers ---
    function updateQuickReplies(suggestions, isInitial = false) {
        if (quickRepliesContainer && quickRepliesContainer.parentNode) {
            quickRepliesContainer.parentNode.removeChild(quickRepliesContainer);
        }
        quickRepliesContainer = document.createElement('div');
        quickRepliesContainer.id = 'quick-replies-container';
        quickRepliesContainer.className = isInitial ? 'd-flex flex-column align-items-center gap-2 overflow-auto mt-2 w-100 ms-auto me-auto mb-3' : 'd-flex flex-wrap gap-2 mt-2 w-100 align-items-start mb-3';

        if (isInitial) {
            quickRepliesContainer.className = 'd-flex flex-column align-items-center gap-3 overflow-visible py-2 mt-2 w-100 mb-3';
            const emojis = ['💰', '🏖️', '👨‍👩‍👧‍👦', '🎒', '✈️'];
            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']; // Green, Blue, Orange, Purple, Pink
            suggestions.forEach((suggestion, i) => {
                const color = colors[i % colors.length];
                const btn = document.createElement('button');
                btn.className = 'btn bg-white border-0 rounded-pill shadow-sm text-start py-2 px-3 quick-reply fw-medium d-flex align-items-center gap-3 transition-hover';
                // explicit width ensures all cards perfectly align their edges 
                btn.style.width = '100%';
                btn.style.maxWidth = '280px';
                btn.setAttribute('data-value', suggestion);
                btn.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style="width: 36px; height: 36px; background-color: ${color}20;">
                        <span style="font-size: 1.1rem;">${emojis[i % emojis.length]}</span>
                    </div>
                    <span class="text-dark fw-semibold" style="font-size: 0.95rem; flex-grow: 1;">${suggestion}</span>
                    <div class="d-flex align-items-center justify-content-center bg-light rounded-circle" style="width: 24px; height: 24px;">
                        <span class="material-icons text-muted" style="font-size: 14px;">chevron_right</span>
                    </div>
                `;
                quickRepliesContainer.appendChild(btn);
            });
        } else {
            suggestions.forEach(suggestion => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-sm btn-outline-primary rounded-pill text-nowrap quick-reply d-flex align-items-center gap-1 bg-white shadow-sm fw-medium px-3 py-2 transition-hover';
                btn.setAttribute('data-value', suggestion);
                btn.textContent = suggestion;
                quickRepliesContainer.appendChild(btn);
            });
        }

        chatBody.appendChild(quickRepliesContainer);
        scrollToBottom();
    }

    function addDatePickerToUI() {
        const msgWrapper = document.createElement('div');
        msgWrapper.className = 'chat-message bot mb-3 d-flex align-items-start gap-2 date-picker-wrapper';

        const today = new Date().toISOString().split('T')[0];

        msgWrapper.innerHTML = `
            <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 35px; height: 35px;">
                <span class="material-icons" style="font-size: 18px;">event</span>
            </div>
            <div class="message-bubble bg-white p-2 text-dark rounded-3 shadow-sm border mt-1 d-flex flex-column align-items-center gap-2" style="max-width: 80%; border-top-left-radius: 0 !important; animation: fadeIn 0.3s ease-in-out;">
                <span class="small text-muted w-100 fw-medium">Pick travel date</span>
                <input type="date" class="form-control form-control-sm chat-date-picker empty border-primary text-primary fw-medium text-center" data-placeholder="Select date" min="${today}" style="box-shadow: none; cursor: pointer; background-color: #f8fafc; min-width: 150px;">
            </div>
        `;

        chatBody.appendChild(msgWrapper);
        scrollToBottom();
    }

    function addMessageToUI(sender, text) {
        const msgWrapper = document.createElement('div');
        msgWrapper.className = `chat-message ${sender} mb-3 d-flex align-items-start gap-2 ${sender === 'user' ? 'flex-row-reverse' : ''}`;

        const isUser = sender === 'user';
        const avatarBg = isUser ? 'bg-secondary text-white' : 'bg-white text-dark border';
        const iconElement = isUser
            ? `<img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" style="width: 100%; height: 100%; object-fit: contain;">`
            : GENIE_BOT_SVG;

        const avatar = `
            <div class="avatar ${avatarBg} rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 40px; height: 40px; overflow: hidden; padding: 6px;">
                ${iconElement}
            </div>
        `;

        const bubbleClass = isUser
            ? 'bg-primary text-white p-3 rounded-4 shadow-sm'
            : 'bg-white text-dark p-3 rounded-4 shadow-sm border mt-1';

        const borderStyle = isUser
            ? 'border-top-right-radius: 0 !important;'
            : 'border-top-left-radius: 0 !important;';

        // Use marked.js if available (unless it's user input or already HTML)
        let formattedText = text;
        if (!isUser) {
            if (typeof marked !== 'undefined') {
                formattedText = marked.parse(text);
            } else {
                formattedText = text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>');
            }
        }

        msgWrapper.innerHTML = `
            ${avatar}
            <div class="message-bubble ${bubbleClass}" style="max-width: 80%; width: 100%; overflow-x: auto; ${borderStyle} animation: fadeIn 0.3s ease-in-out;">
                ${formattedText}
            </div>
        `;

        chatBody.appendChild(msgWrapper);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgWrapper = document.createElement('div');
        msgWrapper.id = id;
        msgWrapper.className = 'chat-message bot mb-3 d-flex align-items-start gap-2';

        msgWrapper.innerHTML = `
            <div class="avatar bg-white text-dark border rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" style="width: 40px; height: 40px; overflow: hidden; padding: 6px;">
                ${GENIE_BOT_SVG}
            </div>
            <div class="message-bubble bg-white p-3 rounded-4 shadow-sm border mt-1" style="max-width: 80%; border-top-left-radius: 0 !important; animation: fadeIn 0.3s ease-in-out;">
                <div class="typing-indicator d-flex gap-1 align-items-center justify-content-center px-1" style="height: 18px;">
                    <div class="spinner-grow bg-primary opacity-75" style="width: 6px; height: 6px;" role="status"></div>
                    <div class="spinner-grow bg-primary opacity-75" style="width: 6px; height: 6px; animation-delay: 0.2s;" role="status"></div>
                    <div class="spinner-grow bg-primary opacity-75" style="width: 6px; height: 6px; animation-delay: 0.4s;" role="status"></div>
                </div>
            </div>
        `;

        chatBody.appendChild(msgWrapper);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatBody.style.scrollBehavior = 'smooth';
        chatBody.scrollTop = chatBody.scrollHeight;
    }

});
