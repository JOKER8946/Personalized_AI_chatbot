// DOM references
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('userInput');
const sendMessageBtn = document.getElementById('sendMessage');
const saveProfileBtn = document.getElementById('saveProfile');
const clearChatBtn = document.getElementById('clearChat');
const userNameInput = document.getElementById('userName');
const userHobbiesInput = document.getElementById('userHobbies');
const botToneSelect = document.getElementById('botTone');
const saveStatus = document.getElementById('saveStatus');
const chatHeader = document.getElementById('chatHeader');
const apiSetupModal = document.getElementById('api-setup-modal');
const wizardApiKeyInput = document.getElementById('wizardApiKey');
const saveWizardKeyBtn = document.getElementById('saveWizardKey');

// --- State ---
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || {
    name: 'Friend',
    hobbies: 'exploring new things',
    tone: 'friendly and helpful'
};

let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// --- API Config ---
let apiKey = (typeof LOCAL_API_KEY !== 'undefined' && LOCAL_API_KEY)
    ? LOCAL_API_KEY
    : (localStorage.getItem('gemini_api_key') || '');

const SUPPORTED_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

// Clear any stale cached model name — old entries cause the app to start
// from a dead model and exhaust the whole list before trying valid ones.
localStorage.removeItem('working_gemini_model');

function getApiUrl(modelName) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function addMessageToUI(role, text) {
    const isUser = role === 'user';

    const wrapper = document.createElement('div');
    wrapper.className = isUser
        ? 'user-message flex gap-3 max-w-[85%] ml-auto flex-row-reverse'
        : 'bot-message flex gap-3 max-w-[85%]';

    const avatar = document.createElement('div');
    avatar.className = isUser
        ? 'w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0'
        : 'w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0';
    avatar.textContent = isUser ? 'You' : 'AI';

    const bubble = document.createElement('div');
    bubble.className = isUser
        ? 'bg-indigo-600 text-white p-4 rounded-2xl rounded-tr-none leading-relaxed shadow-sm whitespace-pre-wrap'
        : 'bg-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-700 leading-relaxed shadow-sm whitespace-pre-wrap';
    bubble.textContent = text;

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    chatContainer.appendChild(wrapper);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'bot-message flex gap-3 max-w-[85%]';
    indicator.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">AI</div>
        <div class="bg-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center" style="min-width:60px">
            <div class="dot-flashing"></div>
        </div>
    `;
    chatContainer.appendChild(indicator);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Called from inline onclick in index.html
function toggleKeyVisibility() {
    const input = document.getElementById('wizardApiKey');
    const icon = document.getElementById('eye-icon');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    icon.innerHTML = isHidden
        ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7
                 a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243
                 M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29
                 M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943
                 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />`
        : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943
                 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
}

// ─── Initialisation ───────────────────────────────────────────────────────────

function init() {
    // Show API key wizard if no key is available
    if (!apiKey) {
        apiSetupModal.classList.remove('hidden');
    }

    // Populate sidebar from saved profile
    userNameInput.value  = userProfile.name    !== 'Friend'               ? userProfile.name    : '';
    userHobbiesInput.value = userProfile.hobbies !== 'exploring new things' ? userProfile.hobbies : '';
    botToneSelect.value  = userProfile.tone;

    // Update chat header
    chatHeader.innerText = `Chatting with ${userProfile.name}'s AI`;

    // Replay saved chat history
    if (chatHistory.length > 0) {
        chatContainer.innerHTML = ''; // remove welcome message
        chatHistory.forEach(msg => addMessageToUI(msg.role, msg.text));
    }
}

// ─── API Key Wizard ───────────────────────────────────────────────────────────

saveWizardKeyBtn.addEventListener('click', () => {
    const key = wizardApiKeyInput.value.trim();
    if (!key) {
        wizardApiKeyInput.classList.add('border-red-400');
        wizardApiKeyInput.placeholder = 'Please enter a valid API key!';
        return;
    }
    apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    apiSetupModal.classList.add('hidden');
});

// ─── AI Response ──────────────────────────────────────────────────────────────

async function getAIResponse(userMessage) {
    if (!apiKey) {
        apiSetupModal.classList.remove('hidden');
        return 'Please provide an API key to continue.';
    }

    showTypingIndicator();

    const systemPrompt = `You are a personalized AI assistant.
The user's name is ${userProfile.name}.
Their interests/hobbies are: ${userProfile.hobbies}.
Your tone should be: ${userProfile.tone}.
Always keep these traits in mind when responding.
Refer to their interests when relevant to make the conversation feel personal.`;

    let currentModelIndex = 0;
    const lastWorkingModel = localStorage.getItem('working_gemini_model');
    if (lastWorkingModel) {
        const idx = SUPPORTED_MODELS.indexOf(lastWorkingModel);
        if (idx !== -1) currentModelIndex = idx;
    }

    async function tryModel(index) {
        if (index >= SUPPORTED_MODELS.length) {
            return { error: 'Could not find any supported model for your API key. Please check your Google AI Studio account.' };
        }

        const modelName = SUPPORTED_MODELS[index];
        console.log(`Trying model: ${modelName}`);

        try {
            const response = await fetch(getApiUrl(modelName), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            role: 'user',
                            parts: [{ text: `INSTRUCTION: ${systemPrompt}` }]
                        },
                        {
                            role: 'model',
                            parts: [{ text: 'Understood. I am now configured with your personal preferences and will respond accordingly.' }]
                        },
                        ...chatHistory.map(msg => ({
                            role: msg.role === 'user' ? 'user' : 'model',
                            parts: [{ text: msg.text }]
                        })),
                        { role: 'user', parts: [{ text: userMessage }] }
                    ]
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates[0].content) {
                localStorage.setItem('working_gemini_model', modelName);
                return { text: data.candidates[0].content.parts[0].text };
            }

            const errorMsg = data.error ? data.error.message : '';
            if (errorMsg.includes('not found') || errorMsg.includes('not supported') || response.status === 404) {
                console.warn(`Model ${modelName} not available, trying next…`);
                return await tryModel(index + 1);
            }
            return { error: errorMsg || 'Unexpected response format.' };

        } catch (err) {
            console.error(`Fetch error for ${modelName}:`, err);
            return { error: 'Connection error. Please try again later.' };
        }
    }

    const result = await tryModel(currentModelIndex);
    removeTypingIndicator();

    return result.text
        ? result.text
        : `I'm having trouble: ${result.error}. Please check your API key or connection.`;
}

// ─── Send Message ─────────────────────────────────────────────────────────────

async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = '';
    addMessageToUI('user', text);

    const botResponse = await getAIResponse(text);
    addMessageToUI('bot', botResponse);

    chatHistory.push({ role: 'user', text });
    chatHistory.push({ role: 'bot',  text: botResponse });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

sendMessageBtn.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

saveProfileBtn.addEventListener('click', () => {
    userProfile.name    = userNameInput.value    || 'Friend';
    userProfile.hobbies = userHobbiesInput.value || 'exploring new things';
    userProfile.tone    = botToneSelect.value;

    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    chatHeader.innerText = `Chatting with ${userProfile.name}'s AI`;

    saveStatus.innerText = 'Preferences saved!';
    saveStatus.classList.remove('opacity-0');
    saveStatus.classList.add('text-green-600');

    setTimeout(() => saveStatus.classList.add('opacity-0'), 2000);
});

clearChatBtn.addEventListener('click', () => {
    if (confirm('Clear all chat history?')) {
        chatHistory = [];
        localStorage.removeItem('chatHistory');
        chatContainer.innerHTML = `
            <div class="bot-message flex gap-3 max-w-[85%]">
                <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">AI</div>
                <div class="bg-slate-100 p-4 rounded-2xl rounded-tl-none text-slate-700 leading-relaxed shadow-sm">
                    History cleared! How can I help you today, ${userProfile.name}?
                </div>
            </div>
        `;
    }
});

// ─── Start ────────────────────────────────────────────────────────────────────
init();
