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
let userProfile = { name: 'there', hobbies: 'chatting with me', tone: 'friendly and helpful' };
let chatHistory = [];

// --- API Config ---
const apiKey = ""; 
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

// Add your existing JS functions here (addMessageToUI, getAIResponse, handleSendMessage, etc.)
// (Paste everything from your original <script> block)
