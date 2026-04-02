# 🤖 Personalized AI Chatbot

A highly customizable, modern, and responsive AI chatbot powered by Google Gemini. This chatbot "gets to know you" by adapting its personality and responses based on your name, interests, and preferred tone.

## 🌟 Key Features

- **Dynamic Personalization:** Set your name, hobbies, and choose from various bot personalities (Friendly, Professional, Witty, etc.).
- **Cutting-Edge AI:** Integrated with the latest **Gemini 2.5 Flash** model for lightning-fast and intelligent responses.
- **Persistent Memory:** Your chat history and profile preferences are automatically saved in your browser's local storage—no database required.
- **Polished User Experience:** 
    - Responsive sidebar for instant customization.
    - Smooth message animations and typing indicators.
    - Clean, modern design built with Tailwind CSS.
- **Security-First API Handling:** Includes a local `apikey.js` setup to keep your credentials safe and out of source control.

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JOKER8946/Personalized_AI_chatbot.git
   cd Personalized_AI_chatbot
   ```

2. **Configure your API Key:**
   - Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Create a file named `apikey.js` in the root directory (already ignored by Git).
   - Add your key: `const LOCAL_API_KEY = "YOUR_API_KEY_HERE";`
   - *Alternatively, the app will prompt you for a key on first launch and save it to your local storage.*

3. **Launch the app:**
   - Simply open `index.html` in any modern web browser.

4. **Personalize & Chat:**
   - Update your profile in the sidebar.
   - Click **Save Preferences**.
   - Start a conversation!

## 🛠️ Built With

- **Frontend:** HTML5, Tailwind CSS, Google Fonts (Inter).
- **Logic:** Vanilla JavaScript (ES6+).
- **API:** Google Gemini AI (`gemini-2.5-flash`).
- **Storage:** Browser `localStorage`.

---
*Created with ❤️ by JOKER8946*
