import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCbpIdqzaSdcOI6ab25xifKy9TjL3lhKb4",
    authDomain: "trip-genie-490305.firebaseapp.com",
    projectId: "trip-genie-490305",
    storageBucket: "trip-genie-490305.firebasestorage.app",
    messagingSenderId: "34042949621",
    appId: "1:34042949621:web:16469186fc7dfcb4273abc",
    measurementId: "G-6PL062VVV3"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

isAnalyticsSupported()
    .then((supported) => {
        if (supported) {
            getAnalytics(firebaseApp);
        }
    })
    .catch(() => {
        // Analytics is optional for the chat widget.
    });

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
        <path d="M52 30H56C57.1046 30 58 30.8954 58 32V38C58 39.1046 57.1046 40 56 40H52" fill="#e2e8f0"/>
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
        @media (min-width: 768px) { .chat-date-picker.empty { color: inherit; } .chat-date-picker.empty::before { display: none; } }
        .chat-date-picker::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(0.5) sepia(1) saturate(5) hue-rotate(175deg); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .lang-dropdown-menu { display: none; position: absolute; right: 0; top: 100%; margin-top: 5px; min-width: 140px; z-index: 1000; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden; flex-direction: column; padding: 5px 0; }
        .lang-dropdown-menu.show { display: flex; animation: fadeIn 0.15s ease-out; }
        .lang-item { display: flex; align-items: center; gap: 10px; padding: 10px 15px; background: white; border: none; width: 100%; text-align: left; cursor: pointer; font-size: 0.95rem; font-weight: 500; color: #1e293b; transition: background 0.2s; }
        .lang-item:hover { background: #f8fafc; color: #10b981; }
        .lang-item img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; }
        .auth-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; height: 32px; padding: 0 12px; border-radius: 999px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
        .auth-chip.signed-in { background: #ecfdf5; border-color: #a7f3d0; color: #047857; }
        .auth-chip.signed-out { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
        .auth-btn { border-radius: 999px; padding: 8px 14px; font-size: 0.85rem; font-weight: 700; border: 1px solid #dbeafe; background: #eff6ff; color: #1d4ed8; transition: all 0.2s ease; white-space: nowrap; }
        .auth-btn:hover { background: #dbeafe; }
        .auth-btn.logout { border-color: #e2e8f0; background: #fff; color: #475569; }
        .auth-btn.logout:hover { background: #f8fafc; }
        
        /* Sidebar CSS */
        .sidebar-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1000; display: none; opacity: 0; transition: opacity 0.3s ease; }
        .sidebar-overlay.show { display: block; opacity: 1; }
        .chatbot-sidebar { position: absolute; top: 0; left: -300px; width: 300px; height: 100%; max-width: 80%; background: #fff; z-index: 1001; box-shadow: 2px 0 15px rgba(0,0,0,0.1); transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }
        .chatbot-sidebar.open { left: 0; }
        .sidebar-header { padding: 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
        .sidebar-content { padding: 20px; flex-grow: 1; overflow: hidden; display: flex; flex-direction: column; gap: 16px; }
        .sidebar-item-btn { display: flex; align-items: center; gap: 12px; padding: 12px 15px; width: 100%; border: none; background: transparent; border-radius: 10px; color: #1e293b; font-weight: 500; font-size: 1rem; transition: background 0.2s, color 0.2s; text-align: left; }
        .sidebar-item-btn:hover { background: #f1f5f9; color: #10b981; }
        .sidebar-item-btn .material-icons { color: #64748b; font-size: 22px; transition: color 0.2s; }
        .sidebar-item-btn:hover .material-icons { color: #10b981; }
        .lang-selector-sidebar { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; flex-shrink: 0; background: #fff; }
        .lang-selector-sidebar-header { padding: 12px 15px; background: #f8fafc; font-weight: 600; color: #475569; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e2e8f0; font-size: 0.95rem; cursor: pointer; user-select: none; }
        .chatbot-title-wrap { min-width: 0; }
        .chatbot-title-text { font-size: 1rem; font-weight: 700; color: #0f172a; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
        .chatbot-subtitle-text { font-size: 0.78rem; color: #64748b; font-weight: 500; }
        .recent-chats-section { padding-top: 4px; display: flex; flex-direction: column; min-height: 0; flex: 1 1 auto; }
        .recent-chats-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
        .recent-chats-list { display: flex; flex-direction: column; gap: 6px; min-height: 0; overflow-y: auto; padding-right: 4px; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .recent-chat-row { position: relative; display: flex; align-items: center; border-radius: 12px; background: #fff; border: 1px solid #edf2f7; transition: all 0.2s ease; min-height: 46px; }
        .recent-chat-row:hover { border-color: #dbeafe; background: #f8fafc; }
        .recent-chat-row.active { background: #ecfdf5; border-color: #86efac; }
        .recent-chat-row.reveal-delete { border-color: #fecaca; background: #fff1f2; }
        .recent-chat-item { flex: 1 1 auto; min-width: 0; border: none; background: transparent; padding: 12px 14px; text-align: left; transition: all 0.2s ease; font-size: 0.9rem; font-weight: 600; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .recent-chat-row.active .recent-chat-item { color: #047857; }
        .recent-chat-delete { width: 0; opacity: 0; overflow: hidden; border: none; background: transparent; color: #dc2626; align-self: stretch; transition: width 0.18s ease, opacity 0.18s ease, padding 0.18s ease; padding: 0; display: flex; align-items: center; justify-content: center; }
        .recent-chat-row.reveal-delete .recent-chat-delete { width: 44px; opacity: 1; padding-right: 8px; }
        .recent-chat-delete:hover { color: #991b1b; }
        .recent-chat-empty { display: none; }
        .sidebar-clear-btn { border: none; background: transparent; color: #ef4444; font-size: 0.78rem; font-weight: 700; padding: 0; }
        .sidebar-clear-btn:hover { color: #b91c1c; }
        .lang-selector-body { max-height: 220px; overflow: hidden; transition: max-height 0.25s ease; }
        .lang-selector-sidebar.collapsed .lang-selector-body { max-height: 0; }
        .lang-selector-sidebar.collapsed .lang-chevron { transform: rotate(-90deg); }
        .lang-chevron { transition: transform 0.25s ease; }
        .lang-selector-list { display: flex; flex-direction: column; gap: 8px; padding: 10px; background: white; }
        .lang-item-sidebar { justify-content: flex-start; border: 1px solid #e2e8f0; padding: 12px 14px; font-size: 0.95rem; border-radius: 12px; background: #fff; }
        
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
        <div id="chatbot-container" class="chatbot-container shadow-lg d-none overflow-hidden">
            <div class="sidebar-overlay" id="sidebar-overlay"></div>
            <div class="chatbot-sidebar" id="chatbot-sidebar">
                <div class="sidebar-header">
                    <h5 class="fw-bold m-0 d-flex align-items-center gap-2 text-dark"><span class="material-icons text-primary fs-3">account_circle</span> <span id="auth-status-chip-sidebar" class="fs-6 text-truncate" style="max-width: 150px;">Guest</span></h5>
                    <button id="close-sidebar-btn" class="btn btn-sm btn-light p-1 rounded-circle d-flex align-items-center justify-content-center border" style="width: 30px; height: 30px;"><span class="material-icons text-secondary" style="font-size: 18px;">close</span></button>
                </div>
                <div class="sidebar-content">
                    <button id="new-chat-btn" class="sidebar-item-btn shadow-sm" style="border: 1px solid #e2e8f0;">
                        <span class="material-icons">add_box</span> New Chat
                    </button>

                    <div class="recent-chats-section shadow-sm">
                        <div class="recent-chats-header">
                            <div class="d-flex align-items-center gap-2 text-dark fw-semibold">
                                <span class="material-icons text-primary" style="font-size: 20px;">history</span>
                                <span>Recent chats</span>
                            </div>
                            <button id="clear-history-btn" type="button" class="sidebar-clear-btn">Clear all</button>
                        </div>
                        <div id="recent-chats-list" class="recent-chats-list"></div>
                    </div>
                    
                    <div id="lang-selector-sidebar" class="lang-selector-sidebar mt-2 shadow-sm collapsed">
                        <div id="lang-selector-toggle" class="lang-selector-sidebar-header">
                            <span class="material-icons text-primary">language</span> Language: <span id="lang-current-text-sidebar" class="text-primary fw-bold ms-auto">English</span>
                            <span class="material-icons text-secondary lang-chevron" style="font-size: 20px;">expand_more</span>
                        </div>
                        <div class="lang-selector-body">
                        <div class="lang-selector-list">
                            <button class="lang-item-sidebar sidebar-item-btn py-2 px-3 rounded-2" data-lang="English">English</button>
                            <button class="lang-item-sidebar sidebar-item-btn py-2 px-3 rounded-2" data-lang="Hindi">Hindi</button>
                            <button class="lang-item-sidebar sidebar-item-btn py-2 px-3 rounded-2" data-lang="Malayalam">Malayalam</button>
                            <button class="lang-item-sidebar sidebar-item-btn py-2 px-3 rounded-2" data-lang="Tamil">Tamil</button>
                        </div>
                        </div>
                    </div>

                    <div class="mt-auto">
                        <button id="google-auth-btn-sidebar" type="button" class="btn btn-outline-primary w-100 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-2 mb-2">
                            <span class="material-icons" id="auth-btn-icon">login</span> <span id="auth-btn-text">Sign in</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="chatbot-header bg-white p-3 d-flex justify-content-between align-items-center shadow-sm position-relative z-1" style="border-radius: 0; border-bottom: 1px solid #e2e8f0;">
                <div class="d-flex align-items-center gap-3">
                    <button id="open-sidebar-btn" class="btn btn-sm btn-link p-0 text-decoration-none hover-opacity d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; border: none;"><span class="material-icons text-secondary transition-hover" style="font-size: 28px;">menu</span></button>
                    <div style="width: 40px; height: 40px; filter: drop-shadow(0 4px 6px rgba(16,185,129,0.3)); padding: 2px;">${GENIE_BOT_SVG}</div>
                    <div class="d-flex flex-column chatbot-title-wrap">
                        <span id="chat-title" class="chatbot-title-text">Travel Genie</span>
                        <div class="d-flex align-items-center gap-2 mt-1">
                            <span style="width: 8px; height: 8px; background-color: #10b981; border-radius: 50%; display: inline-block;"></span>
                            <span id="chat-subtitle" class="chatbot-subtitle-text">Online</span>
                        </div>
                    </div>
                </div>
                <div class="d-flex gap-2 align-items-center">
                    <button id="close-chat" class="btn btn-sm btn-light p-2 rounded-circle hover-opacity d-flex align-items-center justify-content-center shadow-sm border" style="width: 38px; height: 38px;"><span class="material-icons text-secondary" style="font-size: 22px;">close</span></button>
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
    const googleAuthBtn = document.getElementById('google-auth-btn-sidebar');
    const authStatusChip = document.getElementById('auth-status-chip-sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const chatbotSidebar = document.getElementById('chatbot-sidebar');
    const newChatBtn = document.getElementById('new-chat-btn');
    const langCurrentTextSidebar = document.getElementById('lang-current-text-sidebar');
    const authBtnText = document.getElementById('auth-btn-text');
    const authBtnIcon = document.getElementById('auth-btn-icon');
    const recentChatsList = document.getElementById('recent-chats-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const chatTitle = document.getElementById('chat-title');
    const chatSubtitle = document.getElementById('chat-subtitle');
    const langSelectorSidebar = document.getElementById('lang-selector-sidebar');
    const langSelectorToggle = document.getElementById('lang-selector-toggle');

    function openSidebar() {
        sidebarOverlay.classList.add('show');
        chatbotSidebar.classList.add('open');
    }
    
    function closeSidebar() {
        sidebarOverlay.classList.remove('show');
        chatbotSidebar.classList.remove('open');
    }

    openSidebarBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Create quick replies container dynamically so it maps inside chatBody
    let quickRepliesContainer = document.createElement('div');
    quickRepliesContainer.id = 'quick-replies-container';

    // API key moved to backend .env

    let isChatOpen = false;
    let chatHistory = [];
    let currentChatLanguage = 'English';
    let currentUser = null;
    let currentChatId = null;
    let chatSessions = [];
    let renderedMessages = [];
    let activeQuickReplies = [];
    let pendingDatePicker = false;
    let isRestoringChat = false;
    let recentChatLongPressTimer = null;
    let longPressTargetChatId = null;
    let deleteRevealChatId = null;
    const CHAT_STORAGE_KEY = 'travel-genie.chatSessions.v1';
    const MAX_SAVED_CHATS = 12;

    updateComposerState(true); // Always enable composer

    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateAuthUI(user);
        updateUserGreeting(user);
    });

    googleAuthBtn.addEventListener('click', async () => {
        googleAuthBtn.disabled = true;
        try {
            if (currentUser) {
                await signOut(auth);
                clearAllChatsAndReset();
            } else {
                await signInWithPopup(auth, googleProvider);
            }
        } catch (error) {
            console.error('Firebase auth error:', error);
            addMessageToUI('model', 'Google sign-in failed. Please try again.');
        } finally {
            googleAuthBtn.disabled = false;
            closeSidebar();
        }
    });

    const langItems = document.querySelectorAll('.lang-item-sidebar');
    newChatBtn.addEventListener('click', () => {
        startNewChat(currentChatLanguage);
    });

    langItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const lang = e.currentTarget.getAttribute('data-lang');

            if (currentChatLanguage !== lang) {
                startNewChat(lang);
                return;
            }

            closeSidebar();
        });
    });
    setActiveLanguageButton('English');
    langSelectorToggle.addEventListener('click', () => {
        langSelectorSidebar.classList.toggle('collapsed');
    });

    clearHistoryBtn.addEventListener('click', () => {
        clearAllChatsAndReset();
    });

    recentChatsList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('[data-delete-chat-id]');
        if (deleteButton) {
            e.stopPropagation();
            removeChatSession(deleteButton.getAttribute('data-delete-chat-id'));
            return;
        }

        const chatCard = e.target.closest('.recent-chat-item[data-chat-id]');
        if (!chatCard) {
            return;
        }
        if (deleteRevealChatId && deleteRevealChatId === chatCard.getAttribute('data-chat-id')) {
            hideRecentChatActions();
            return;
        }
        switchToSession(chatCard.getAttribute('data-chat-id'));
    });

    recentChatsList.addEventListener('contextmenu', (e) => {
        const row = e.target.closest('.recent-chat-row[data-chat-id]');
        if (!row) {
            return;
        }
        e.preventDefault();
        deleteRevealChatId = row.getAttribute('data-chat-id');
        renderRecentChats();
    });

    recentChatsList.addEventListener('mousedown', (e) => {
        const row = e.target.closest('.recent-chat-row[data-chat-id]');
        if (!row || e.button !== 0) {
            return;
        }
        clearLongPressTimer();
        longPressTargetChatId = row.getAttribute('data-chat-id');
        recentChatLongPressTimer = setTimeout(() => {
            deleteRevealChatId = longPressTargetChatId;
            renderRecentChats();
            clearLongPressTimer();
        }, 550);
    });

    recentChatsList.addEventListener('touchstart', (e) => {
        const row = e.target.closest('.recent-chat-row[data-chat-id]');
        if (!row) {
            return;
        }
        clearLongPressTimer();
        longPressTargetChatId = row.getAttribute('data-chat-id');
        recentChatLongPressTimer = setTimeout(() => {
            deleteRevealChatId = longPressTargetChatId;
            renderRecentChats();
            clearLongPressTimer();
        }, 550);
    }, { passive: true });

    ['mouseup', 'mouseleave', 'touchend', 'touchcancel', 'touchmove'].forEach((eventName) => {
        recentChatsList.addEventListener(eventName, clearLongPressTimer, { passive: true });
    });

    document.addEventListener('click', (e) => {
        if (deleteRevealChatId && !e.target.closest('.recent-chat-row[data-chat-id]')) {
            hideRecentChatActions();
        }
    });

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

    function sanitizeChatTitle(title) {
        return (title || 'New chat').replace(/\s+/g, ' ').trim().slice(0, 48) || 'New chat';
    }

    function createChatTitleFromMessage(message) {
        const normalized = sanitizeChatTitle(message.replace(/\[\[.*?\]\]/g, ''));
        return normalized.length > 32 ? `${normalized.slice(0, 32)}...` : normalized;
    }

    function getCurrentSubtitle() {
        return chatHistory.length > 0 ? `Ready for follow-up in ${currentChatLanguage}` : 'Online';
    }

    function updateChatHeader() {
        chatTitle.textContent = 'Travel Genie';
        chatSubtitle.textContent = getCurrentSubtitle();
    }

    function setActiveLanguageButton(language) {
        langItems.forEach((btn) => btn.classList.remove('bg-light', 'text-primary', 'fw-bold'));
        const activeButton = document.querySelector(`.lang-item-sidebar[data-lang="${language}"]`);
        if (activeButton) {
            activeButton.classList.add('bg-light', 'text-primary', 'fw-bold');
        }
        langCurrentTextSidebar.textContent = language;
    }

    function createChatSession(language = currentChatLanguage) {
        return {
            id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: 'New chat',
            language,
            history: [],
            messages: [{ sender: 'model', text: greetings[language] }],
            quickReplies: [...initialSuggestions[language]],
            pendingDatePicker: false,
            updatedAt: Date.now()
        };
    }

    function loadChatSessions() {
        try {
            const saved = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || '[]');
            if (!Array.isArray(saved)) {
                return [];
            }
            return saved.filter((item) => item && item.id && Array.isArray(item.messages)).slice(0, MAX_SAVED_CHATS);
        } catch (error) {
            console.error('Failed to load saved chats:', error);
            return [];
        }
    }

    function saveChatSessions() {
        try {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatSessions.slice(0, MAX_SAVED_CHATS)));
        } catch (error) {
            console.error('Failed to save chats:', error);
        }
    }

    function hideRecentChatActions() {
        deleteRevealChatId = null;
        renderRecentChats();
    }

    function clearLongPressTimer() {
        if (recentChatLongPressTimer) {
            clearTimeout(recentChatLongPressTimer);
            recentChatLongPressTimer = null;
        }
        longPressTargetChatId = null;
    }

    function removeChatSession(sessionId) {
        const nextSessions = chatSessions.filter((item) => item.id !== sessionId);
        if (nextSessions.length === chatSessions.length) {
            return;
        }

        chatSessions = nextSessions;
        deleteRevealChatId = null;

        if (currentChatId === sessionId) {
            saveChatSessions();
            renderRecentChats();
            if (chatSessions.length > 0) {
                switchToSession(chatSessions[0].id);
            } else {
                startNewChat(currentChatLanguage);
            }
            return;
        }

        saveChatSessions();
        renderRecentChats();
    }

    function clearAllChatsAndReset() {
        chatSessions = [];
        currentChatId = null;
        deleteRevealChatId = null;
        saveChatSessions();
        renderRecentChats();
        startNewChat(currentChatLanguage, false);
    }

    function renderRecentChats() {
        if (!recentChatsList) {
            return;
        }

        const recentSessions = [...chatSessions]
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
            .slice(0, MAX_SAVED_CHATS);

        if (recentSessions.length === 0) {
            recentChatsList.innerHTML = '';
            return;
        }

        recentChatsList.innerHTML = recentSessions.map((session) => `
            <div class="recent-chat-row ${session.id === currentChatId ? 'active' : ''} ${deleteRevealChatId === session.id ? 'reveal-delete' : ''}" data-chat-id="${session.id}">
                <button type="button" class="recent-chat-item" data-chat-id="${session.id}" title="${escapeHtml(session.title || 'New chat')}">${escapeHtml(session.title || 'New chat')}</button>
                <button type="button" class="recent-chat-delete" data-delete-chat-id="${session.id}" aria-label="Delete chat">
                    <span class="material-icons" style="font-size: 18px;">delete</span>
                </button>
            </div>
        `).join('');
    }

    function persistCurrentSession() {
        if (isRestoringChat || !currentChatId) {
            return;
        }

        const existingIndex = chatSessions.findIndex((item) => item.id === currentChatId);
        const previous = existingIndex >= 0 ? chatSessions[existingIndex] : {};
        const firstUserMessage = renderedMessages.find((item) => item.sender === 'user');
        const nextSession = {
            ...previous,
            id: currentChatId,
            title: firstUserMessage ? createChatTitleFromMessage(firstUserMessage.text) : (previous.title || 'New chat'),
            language: currentChatLanguage,
            history: chatHistory,
            messages: renderedMessages,
            quickReplies: activeQuickReplies,
            pendingDatePicker,
            updatedAt: Date.now()
        };

        if (existingIndex >= 0) {
            chatSessions.splice(existingIndex, 1);
        }
        chatSessions.unshift(nextSession);
        chatSessions = chatSessions.slice(0, MAX_SAVED_CHATS);
        saveChatSessions();
        updateChatHeader();
        renderRecentChats();
    }

    function rebuildChatBody(session) {
        isRestoringChat = true;
        chatBody.innerHTML = '';
        renderedMessages = [];
        activeQuickReplies = [];
        pendingDatePicker = false;

        (session.messages || []).forEach((message) => {
            addMessageToUI(message.sender, message.text);
        });

        if (session.pendingDatePicker) {
            addDatePickerToUI();
        }

        if (Array.isArray(session.quickReplies) && session.quickReplies.length > 0) {
            updateQuickReplies(session.quickReplies, session.history.length === 0);
        } else {
            updateQuickReplies(initialSuggestions[session.language] || initialSuggestions.English, session.history.length === 0);
        }

        isRestoringChat = false;
        scrollToBottom();
    }

    function switchToSession(sessionId) {
        const session = chatSessions.find((item) => item.id === sessionId);
        if (!session) {
            return;
        }

        currentChatId = session.id;
        currentChatLanguage = session.language || 'English';
        chatHistory = Array.isArray(session.history) ? [...session.history] : [];
        setActiveLanguageButton(currentChatLanguage);
        rebuildChatBody(session);
        updateChatHeader();
        renderRecentChats();
        closeSidebar();
    }

    function startNewChat(language = currentChatLanguage, shouldPersist = true) {
        currentChatLanguage = language;
        setActiveLanguageButton(language);
        const session = createChatSession(language);
        currentChatId = session.id;
        chatHistory = [];
        rebuildChatBody(session);
        if (shouldPersist) {
            persistCurrentSession();
        } else {
            updateChatHeader();
        }
        closeSidebar();
    }

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

                if (chatHistory.length === 0 && currentChatId) {
                    const activeSession = chatSessions.find((item) => item.id === currentChatId);
                    if (activeSession && activeSession.messages.length > 0) {
                        activeSession.messages[0] = { sender: 'model', text: greetings[currentChatLanguage] };
                        rebuildChatBody(activeSession);
                        persistCurrentSession();
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
                            persistCurrentSession();
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
                startNewChat(currentChatLanguage);
                return;
            } else if (val.startsWith('Ask in ')) {
                // Intercept dynamic translate suggestion button
                const targetLang = val.replace('Ask in ', '').trim();
                const matchedBtn = document.querySelector(`.lang-item-sidebar[data-lang="${targetLang}"]`);
                if (matchedBtn) {
                    matchedBtn.click(); // Trigger native UI language switch visually
                }
                return; // Stop here, don't send anything into chat log
            }

            chatInput.value = val;
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    chatSessions = loadChatSessions();
    renderRecentChats();
    if (chatSessions.length > 0) {
        switchToSession(chatSessions[0].id);
    } else {
        startNewChat('English');
    }

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
                pendingDatePicker = false;
                persistCurrentSession();
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
                recognition.lang = langMap[currentChatLanguage] || 'en-US';
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
        activeQuickReplies = [];
        pendingDatePicker = false;

        if (message.toLowerCase() === 'start over') {
            startNewChat(currentChatLanguage);
            return;
        }

        chatHistory.push({
            role: "user",
            parts: [{ text: message }]
        });
        persistCurrentSession();

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

            // Extract packages
            const packages = [];
            const packageRegex = /\[\[PACKAGE:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]\]/gi;
            let pkgMatch;
            while ((pkgMatch = packageRegex.exec(botMessage)) !== null) {
                packages.push({
                    id: pkgMatch[1].trim(),
                    name: pkgMatch[2].trim(),
                    days: pkgMatch[3].trim(),
                    price: pkgMatch[4].trim(),
                    image: pkgMatch[5].trim()
                });
            }

            // Strip suggestions, date picker and packages from displayed text
            let displayMessage = botMessage
                .replace(/\[\[SUGGESTION:\s*(.*?)\]\]/gi, '')
                .replace(/\[\[DATE_PICKER\]\]/gi, '')
                .replace(/\[\[PACKAGE:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]\]/gi, '')
                .trim();

            if (packages.length > 0) {
                let packageHtml = '<div class="d-flex overflow-auto pb-3 pt-2 px-1 mt-3" style="scrollbar-width: none; gap: 1rem;">';
                packages.forEach(pkg => {
                    let formattedPrice = pkg.price.replace('₹', '').replace(',', '').trim();
                    // Basic format back to number with commas if valid
                    let parsedPrice = parseInt(formattedPrice, 10);
                    let finalPrice = isNaN(parsedPrice) ? pkg.price : parsedPrice.toLocaleString('en-IN');
                
                    packageHtml += '<div class="card shadow border-0 overflow-hidden flex-shrink-0 position-relative transition-hover" style="width: 250px; border-radius: 16px; background: #fff;">' +
                        '<div class="position-absolute top-0 end-0 m-2 px-2 py-1 bg-white rounded-pill shadow-sm small fw-bold text-success" style="z-index: 2; font-size: 0.75rem;"><span class="material-icons align-middle text-warning" style="font-size: 14px;">star</span> 4.8</div>' +
                        '<div style="height: 160px; overflow: hidden;"><img src="' + pkg.image + '" class="card-img-top w-100 h-100" alt="' + pkg.name + '" style="object-fit: cover; transition: transform 0.3s ease;"></div>' +
                        '<div class="card-body p-3 d-flex flex-column border-top">' +
                        '<h6 class="card-title fw-bold text-dark text-truncate mb-2 fs-6">' + pkg.name + '</h6>' +
                        '<div class="d-flex align-items-center gap-2 mb-2">' +
                        '<span class="badge bg-light text-secondary rounded-pill border fw-medium px-2 py-1 d-flex align-items-center gap-1"><span class="material-icons" style="font-size: 12px;">flight_takeoff</span> ' + pkg.days + ' DAYS</span>' +
                        '</div>' +
                        '<p class="text-success fw-bold mb-3 fs-5 mt-1">₹' + finalPrice + ' <span class="text-muted small fw-normal d-block" style="font-size: 0.75rem; letter-spacing: 0;">per person</span></p>' +
                        '<button class="btn w-100 btn-primary rounded-pill fw-semibold shadow-sm mt-auto" style="padding: 10px 0;">View Package</button>' +
                        '</div></div>';
                });
                packageHtml += '</div>';
                displayMessage += packageHtml;
            }

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
            persistCurrentSession();

        } catch (error) {
            console.error('API Error:', error);
            removeTypingIndicator(typingId);
            addMessageToUI('model', 'Sorry, I am having trouble connecting right now. Please check your network connection.');
            chatHistory.pop(); // Remove stuck user message
            persistCurrentSession();
        }
    });

    async function fetchGeminiResponse() {
        const API_URL = `http://192.168.180.244:8000/api/chat`;

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
    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function updateQuickReplies(suggestions, isInitial = false) {
        if (quickRepliesContainer && quickRepliesContainer.parentNode) {
            quickRepliesContainer.parentNode.removeChild(quickRepliesContainer);
        }
        quickRepliesContainer = document.createElement('div');
        quickRepliesContainer.id = 'quick-replies-container';
        quickRepliesContainer.className = isInitial ? 'd-flex flex-column align-items-center gap-2 overflow-auto mt-2 w-100 ms-auto me-auto mb-3' : 'd-flex flex-wrap gap-2 mt-2 w-100 align-items-start mb-3';
        activeQuickReplies = [...suggestions];

        if (isInitial) {
            quickRepliesContainer.className = 'd-flex flex-column align-items-center gap-2 overflow-visible py-2 w-100 mb-3';
            const emojis = ['✨', '🏝️', '🎒', '🗺️', '✈️'];
            const gradients = [
                'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald Theme
                'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // Deep Blue
                'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
                'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Violet
                'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'  // Pink
            ];
            suggestions.forEach((suggestion, i) => {
                const gradient = gradients[i % gradients.length];
                const btn = document.createElement('button');
                btn.className = 'btn border-0 rounded-4 shadow-sm text-start p-3 quick-reply fw-medium d-flex align-items-center gap-3 position-relative overflow-hidden';
                btn.style.width = '100%';
                btn.style.maxWidth = '300px';
                btn.style.background = '#ffffff';
                btn.style.border = '1px solid #f1f5f9';
                btn.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                btn.setAttribute('data-value', suggestion);
                btn.innerHTML = `
                    <div class="position-absolute top-0 start-0 w-100 h-100 bg-hover-layer" style="background: ${gradient}; opacity: 0; z-index: 0; transition: opacity 0.3s ease;"></div>
                    <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 position-relative shadow-sm" style="width: 44px; height: 44px; background: ${gradient}; z-index: 1;">
                        <span style="font-size: 1.3rem; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));">${emojis[i % emojis.length]}</span>
                    </div>
                    <span class="text-dark fw-bold position-relative suggestion-text" style="font-size: 0.95rem; flex-grow: 1; z-index: 1; letter-spacing: 0.2px; transition: color 0.3s ease;">${suggestion}</span>
                    <div class="d-flex align-items-center justify-content-center bg-light rounded-circle position-relative icon-wrapper" style="width: 30px; height: 30px; z-index: 1; transition: all 0.3s ease;">
                        <span class="material-icons text-secondary position-relative arrow-icon" style="font-size: 18px; transition: color 0.3s ease;">east</span>
                    </div>
                `;
                
                // Add explicit hover event listeners because inline stylesheet scopes can be messy in injected HTML
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-3px)';
                    btn.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.15)';
                    btn.style.borderColor = '#10b981';
                    btn.querySelector('.bg-hover-layer').style.opacity = '0.04';
                    btn.querySelector('.suggestion-text').style.color = '#10b981';
                    btn.querySelector('.suggestion-text').classList.remove('text-dark');
                    btn.querySelector('.icon-wrapper').style.background = '#10b981';
                    btn.querySelector('.icon-wrapper').classList.remove('bg-light');
                    btn.querySelector('.icon-wrapper').style.transform = 'translateX(2px)';
                    btn.querySelector('.arrow-icon').style.color = 'white';
                    btn.querySelector('.arrow-icon').classList.remove('text-secondary');
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = '';
                    btn.style.borderColor = '#f1f5f9';
                    btn.querySelector('.bg-hover-layer').style.opacity = '0';
                    btn.querySelector('.suggestion-text').style.color = '';
                    btn.querySelector('.suggestion-text').classList.add('text-dark');
                    btn.querySelector('.icon-wrapper').style.background = '';
                    btn.querySelector('.icon-wrapper').classList.add('bg-light');
                    btn.querySelector('.icon-wrapper').style.transform = 'translateX(0)';
                    btn.querySelector('.arrow-icon').style.color = '';
                    btn.querySelector('.arrow-icon').classList.add('text-secondary');
                });

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
        persistCurrentSession();
    }

    function addDatePickerToUI() {
        const msgWrapper = document.createElement('div');
        msgWrapper.className = 'chat-message bot mb-3 d-flex align-items-start gap-2 date-picker-wrapper';
        pendingDatePicker = true;

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
        persistCurrentSession();
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
        renderedMessages.push({ sender, text });
        scrollToBottom();
        updateChatHeader();
        persistCurrentSession();
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

    function updateComposerState(isEnabled) {
        chatInput.disabled = !isEnabled;
        chatInput.placeholder = 'Message Travel Genie...';

        if (voiceBtn) {
            voiceBtn.disabled = !isEnabled;
            voiceBtn.style.opacity = isEnabled ? '1' : '0.5';
            voiceBtn.style.cursor = isEnabled ? 'pointer' : 'not-allowed';
        }
    }

    function updateAuthUI(user) {
        if (user) {
            const displayName = user.displayName || user.email || 'Traveler';
            authStatusChip.textContent = displayName;
            authStatusChip.classList.remove('text-muted');
            authStatusChip.classList.add('text-primary');
            authBtnText.textContent = 'Logout';
            authBtnIcon.textContent = 'logout';
            googleAuthBtn.classList.replace('btn-outline-primary', 'btn-outline-danger');
            
        } else {
            authStatusChip.textContent = 'Guest';
            authStatusChip.classList.add('text-muted');
            authStatusChip.classList.remove('text-primary');
            authBtnText.textContent = 'Sign in';
            authBtnIcon.textContent = 'login';
            googleAuthBtn.classList.replace('btn-outline-danger', 'btn-outline-primary');
        }
    }

    function updateUserGreeting(user) {
        let localizedSuffix = {
            'English': userRegion ? ` from ${userRegion}` : '',
            'Hindi': userRegion ? ` ${userRegion} से` : '',
            'Malayalam': userRegion ? ` ${userRegion}-ൽ നിന്നുള്ള` : '',
            'Tamil': userRegion ? ` ${userRegion}-லிருந்து` : ''
        };

        if (user) {
            const firstName = (user.displayName || user.email || 'Traveler').split(' ')[0];
            greetings['English'] = `Hello, ${firstName}! 👋 I'm Travel Genie, your AI travel assistant 🧞‍♂️. How can I help you find the best budget trips${localizedSuffix['English']} today? ✈️`;
            greetings['Hindi'] = `नमस्ते, ${firstName}! 👋 मैं ट्रैवल जिनी हूँ, आपका AI ट्रैवल असिस्टेंट 🧞‍♂️। आज मैं आपको${localizedSuffix['Hindi']} सबसे अच्छे बजट ट्रिप खोजने में कैसे मदद कर सकता हूँ? ✈️`;
            greetings['Malayalam'] = `നമസ്കാരം, ${firstName}! 👋 ഞാൻ ട്രാവൽ ജീനി, നിങ്ങളുടെ AI ട്രാവൽ അസിസ്റ്റന്റ് 🧞‍♂️.${localizedSuffix['Malayalam']} മികച്ച ബജറ്റ് യാത്രകൾ കണ്ടെത്താൻ ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും? ✈️`;
            greetings['Tamil'] = `வணக்கம், ${firstName}! 👋 நான் டிராவல் ஜினி, உங்கள் AI பயண உதவியாளர் 🧞‍♂️.${localizedSuffix['Tamil']} சிறந்த பட்ஜெட் பயணங்களை கண்டறிய இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? ✈️`;
        } else {
            greetings['English'] = `Hello! 👋 I'm Travel Genie, your AI travel assistant 🧞‍♂️. How can I help you find the best budget trips${localizedSuffix['English']} today? ✈️`;
            greetings['Hindi'] = `नमस्ते! 👋 मैं ट्रैवल जिनी हूँ, आपका AI ट्रैवल असिस्टेंट 🧞‍♂️। आज मैं आपको${localizedSuffix['Hindi']} सबसे अच्छे बजट ट्रिप खोजने में कैसे मदद कर सकता हूँ? ✈️`;
            greetings['Malayalam'] = `നമസ്കാരം! 👋 ഞാൻ ട്രാവൽ ജീനി, നിങ്ങളുടെ AI ട്രാവൽ അസിസ്റ്റന്റ് 🧞‍♂️.${localizedSuffix['Malayalam']} മികച്ച ബജറ്റ് യാത്രകൾ കണ്ടെത്താൻ ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും? ✈️`;
            greetings['Tamil'] = `வணக்கம்! 👋 நான் டிராவல் ஜினி, உங்கள் AI பயண உதவியாளர் 🧞‍♂️.${localizedSuffix['Tamil']} சிறந்த பட்ஜெட் பயணங்களை கண்டறிய இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? ✈️`;
        }

        if (chatHistory.length === 0 && currentChatId) {
            const activeSession = chatSessions.find((item) => item.id === currentChatId);
            if (activeSession && activeSession.messages.length > 0) {
                activeSession.messages[0] = { sender: 'model', text: greetings[currentChatLanguage] };
                rebuildChatBody(activeSession);
                persistCurrentSession();
            }
        }
    }

    function scrollToBottom() {
        chatBody.style.scrollBehavior = 'smooth';
        chatBody.scrollTop = chatBody.scrollHeight;
    }

});
