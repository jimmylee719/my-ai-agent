document.getElementById('chat-form').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const userInput = document.getElementById('user-input').value.trim();
    if (!userInput) return;
  
    addMessage('🧑 你：' + userInput);
  
    document.getElementById('user-input').value = '';
    addMessage('🤖 Jimmy AI：正在搜尋「' + userInput + '」的學術資料中...');
  
    try {
      // 模擬呼叫 Google Scholar 的 API
      const response = await fetch(`https://api.jimmy-scholar-fake.com/search?q=${encodeURIComponent(userInput)}`);
      const data = await response.json();
  
      if (data.results && data.results.length > 0) {
        const topResult = data.results[0]; // 取第一筆結果
        const title = topResult.title;
        const summary = topResult.abstract;
  
        // 模擬翻譯摘要
        const translated = await fakeTranslate(summary);
  
        addMessage(`🎓 <b>標題</b>：${title}`);
        addMessage(`📘 <b>英文摘要</b>：${summary}`);
        addMessage(`📗 <b>中文摘要</b>：${translated}`);
      } else {
        addMessage("😕 找不到相關的學術資料。");
      }
    } catch (error) {
      console.error(error);
      addMessage("❌ 發生錯誤，無法取得資料。");
    }
  });
  
  function addMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  // 模擬翻譯功能（未接串 Google 翻譯 API）
  async function fakeTranslate(text) {
    // 模擬延遲
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "（這是模擬翻譯）" + text.split(" ").slice(0, 10).join(" ") + "…";
  }
  