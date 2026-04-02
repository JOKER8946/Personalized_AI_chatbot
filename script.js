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

// --- State ---
let userProfile = JSON.parse(localStorage.getItem('userProfile')) || { 
    name: 'Friend', 
    hobbies: 'exploring new things', 
    tone: 'friendly and helpful' 
};

let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

// --- API Config ---
// IMPORTANT: Get your API key from https://aistudio.google.com/app/apikey
let apiKey = (typeof LOCAL_API_KEY !== 'undefined') ? LOCAL_API_KEY : (localStorage.getItem('gemini_api_key') || ""); 

function getApiUrl() {
    return `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
}

// --- Initialization ---
function init() {
    // Load profile into inputs
    userNameInput.value = userProfile.name !== 'Friend' ? userProfile.name : "";
    userHobbiesInput.value = userProfile.hobbies !== 'exploring new things' ? userProfile.hobbies : "";
    botToneSelect.value = userProfile.tone;
    
    if (userProfile.name !== 'Friend') {
        chatHeader.innerText = `Chatting with ${userProfile.name}'s AI`;
    }

    // Load history
    if (chatHistory.length > 0) {
        chatContainer.innerHTML = ""; // Clear welcome message if history exists
        chatHistory.forEach(msg => addMessageToUI(msg.role, msg.text, false));
    }

    // Check for API key and show wizard if missing
    if (!apiKey) {
        document.getElementById('api-setup-modal').classList.remove('hidden');
    }
}

function toggleKeyVisibility() {
    const input = document.getElementById('wizardApiKey');
    const icon = document.getElementById('eye-icon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />`;
    } else {
        input.type = 'password';
        icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
    }
}

document.getElementById('saveWizardKey').addEventListener('click', () => {
    const keyInput = document.getElementById('wizardApiKey').value.trim();
    if (keyInput) {
        apiKey = keyInput;
        localStorage.setItem('gemini_api_key', keyInput);
        document.getElementById('api-setup-modal').classList.add('hidden');
        // Re-initialize API URL
        window.location.reload(); // Refresh to ensure all settings take effect
    } else {
        alert("Please enter a valid API key.");
    }
});

// --- Functions ---

function addMessageToUI(role, text, animate = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `${role}-message flex gap-3 max-w-[85%] ${role === 'user' ? 'ml-auto flex-row-reverse' : ''}`;
    
    const avatar = document.createElement('div');
    avatar.className = `w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`;
    avatar.innerText = role === 'user' ? 'YOU' : 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = `p-4 rounded-2xl shadow-sm leading-relaxed ${
        role === 'user' 
        ? 'bg-indigo-600 text-white rounded-tr-none' 
        : 'bg-slate-100 text-slate-700 rounded-tl-none'
    }`;
    contentDiv.innerText = text;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'bot-message flex gap-3 max-w-[85%]';
    indicator.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">AI</div>
        <div class="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center h-12 shadow-sm">
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

async function getAIResponse(userMessage) {
    if (!apiKey) {
        alert("API Key is missing. Please refresh and enter it.");
        return "Error: No API Key provided.";
    }

    showTypingIndicator();

    const systemPrompt = `You are a personalized AI assistant. 
    The user's name is ${userProfile.name}. 
    Their interests/hobbies are: ${userProfile.hobbies}. 
    Your tone should be: ${userProfile.tone}. 
    Always keep these traits in mind when responding. 
    Refer to their interests when relevant to make the conversation feel personal.`;

    try {
        const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { 
                        role: "user", 
                        parts: [{ text: `INSTRUCTION: ${systemPrompt}` }] 
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. I am now configured with your personal preferences and will respond accordingly." }]
                    },
                    ...chatHistory.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.text }]
                    })),
                    { role: "user", parts: [{ text: userMessage }] }
                ]
            })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (response.ok && data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error("API Error:", data);
            const errorMsg = data.error ? data.error.message : "Unexpected response format";
            return `I'm having trouble: ${errorMsg}. Please check your API key or connection.`;
        }
    } catch (error) {
        removeTypingIndicator();
        console.error("Fetch Error:", error);
        return "Connection error. Please try again later.";
    }
}

async function handleSendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // Clear input
    userInput.value = "";

    // Add to UI
    addMessageToUI('user', text);

    // Save to history
    chatHistory.push({ role: 'user', text });
    
    // Get AI response
    const botResponse = await getAIResponse(text);
    
    // Add to UI
    addMessageToUI('bot', botResponse);

    // Save to history
    chatHistory.push({ role: 'bot', text: botResponse });
    
    // Persist
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// --- Event Listeners ---

sendMessageBtn.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

saveProfileBtn.addEventListener('click', () => {
    userProfile.name = userNameInput.value || 'Friend';
    userProfile.hobbies = userHobbiesInput.value || 'exploring new things';
    userProfile.tone = botToneSelect.value;
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    chatHeader.innerText = `Chatting with ${userProfile.name}'s AI`;
    
    saveStatus.innerText = "Preferences saved!";
    saveStatus.classList.remove('opacity-0');
    saveStatus.classList.add('text-green-600');
    
    setTimeout(() => {
        saveStatus.classList.add('opacity-0');
    }, 2000);
});

clearChatBtn.addEventListener('click', () => {
    if (confirm("Clear all chat history?")) {
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

// Initialize the app
init();
