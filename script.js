const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("🧑‍💼 用戶", userMessage);
  input.value = "";

  // 模擬搜尋功能（未來你可以改這裡接 API）
  const reply = await searchGoogleScholar(userMessage);

  appendMessage("🤖 Jimmy AI", reply);
});

function appendMessage(sender, message) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `${sender}: ${message}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 模擬搜尋回應，這裡會替換成你的真實搜尋
async function searchGoogleScholar(query) {
  return `搜尋「${query}」的相關學術資料中...（目前是模擬回答）`;
}
