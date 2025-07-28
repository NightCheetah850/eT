const historyList = document.getElementById('history-list');
const newChatBtn = document.getElementById('new-chat');
const sendBtn = document.getElementById('send-btn');
const mediaBtn = document.getElementById('media-btn');
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');

let sessions = [];
let activeSession = null;

// Ganti dengan endpoint dan API key DeepSeek AI Anda
const DEEPSEEK_API_URL = 'https://api.deepseek.ai/v1/chat';
const DEEPSEEK_API_KEY = 'sk-10c8ab1ad7964c9297b0ac3e76b0a977';

async function callDeepseek(messages) {
  const payload = {
    messages: messages.map(m => ({ role: m.role, text: m.content })),
    // opsi lain sesuai dokumentasi DeepSeek
  };

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  // Asumsi format balasan DeepSeek: { reply: '...' }
  return data.reply;
}

function renderHistory() {
  historyList.innerHTML = '';
  sessions.forEach((sess, idx) => {
    const li = document.createElement('li');
    li.textContent = sess.title;
    li.addEventListener('click', () => selectSession(idx));
    historyList.appendChild(li);
  });
}

function selectSession(idx) {
  activeSession = sessions[idx];
  chatWindow.innerHTML = '';
  activeSession.messages.forEach(msg => {
    const div = document.createElement('div');
    div.textContent = `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}`;
    chatWindow.appendChild(div);
  });
}

newChatBtn.addEventListener('click', () => {
  const title = prompt('Enter chat title:');
  const sess = { title: title || `Chat ${sessions.length+1}`, messages: [] };
  sessions.push(sess);
  activeSession = sess;
  renderHistory();
  chatWindow.innerHTML = '';
});

sendBtn.addEventListener('click', async () => {
  if (!activeSession) return alert('Please start a new chat first.');
  const userText = userInput.value.trim();
  if (!userText) return;

  // Tambahkan pesan user ke sesi
  activeSession.messages.push({ role: 'user', content: userText });
  const userDiv = document.createElement('div');
  userDiv.textContent = `You: ${userText}`;
  chatWindow.appendChild(userDiv);
  userInput.value = '';

  // Panggil API DeepSeek
  const aiReply = await callDeepseek(activeSession.messages);

  // Tambahkan balasan AI ke sesi dan tampilan
  activeSession.messages.push({ role: 'assistant', content: aiReply });
  const aiDiv = document.createElement('div');
  aiDiv.textContent = `AI: ${aiReply}`;
  chatWindow.appendChild(aiDiv);
});

mediaBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.onchange = e => alert(`Selected file: ${e.target.files[0].name}`);
  input.click();
});