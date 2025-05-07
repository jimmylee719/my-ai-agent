// script.js

const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

sendButton.addEventListener("click", handleUserInput);
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleUserInput();
  }
});

function handleUserInput() {
  const input = userInput.value.trim();
  if (input === "") return;

  addMessage(`You：${input}`);
  userInput.value = "";
  addMessage(`🤖AskLepix.AI: 搜尋「${input}」的相關學術資料中...`);

  translateToEnglish(input)
    .then(translated => {
      searchPubMed(translated, input);
      showGoogleScholarResults(translated, input);
    })
    .catch(error => {
      addMessage("❌ 翻譯失敗，請重試。");
      console.error(error);
    });
}

function addMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.className = "message";
  messageElement.innerHTML = message;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function translateToEnglish(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  return fetch(url)
    .then(response => response.json())
    .then(data => data[0][0][0]);
}

function translateToChinese(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-TW&dt=t&q=${encodeURIComponent(text)}`;
  return fetch(url)
    .then(response => response.json())
    .then(data => data[0][0][0]);
}

function searchPubMed(englishQuery, originalQuery) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(englishQuery)}&retmode=json&retmax=3`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const ids = data.esearchresult.idlist;
      if (ids.length === 0) {
        addMessage("🔍 找不到相關的 PubMed 文獻。");
        return;
      }

      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;

      fetch(summaryUrl)
        .then(res => res.json())
        .then(summary => {
          addMessage("📚 PubMed 搜尋結果：");
          ids.forEach(id => {
            const item = summary.result[id];
            // 加入翻譯功能：顯示中英文標題
            translateToChinese(item.title).then(chineseTitle => {
              addMessage(`🔸 <a href="https://pubmed.ncbi.nlm.nih.gov/${id}/" target="_blank">${item.title}</a> - ${chineseTitle}`);
            });
          });
        });
    })
    .catch(error => {
      console.error("PubMed Error:", error);
      addMessage("❌ 取得 PubMed 資料時發生錯誤。");
    });
}

function showGoogleScholarResults(englishQuery, originalQuery) {
  const googleUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(englishQuery)}&hl=zh-TW&as_sdt=0,5`;
  addMessage(`🔗 點此瀏覽 Google 學術搜尋結果：<a href="${googleUrl}" target="_blank">${googleUrl}</a>`);

  // 顯示範例說明用的前三筆模擬結果
  addMessage("📘 Google 學術搜尋模擬結果（實際點擊上方連結查看）：");
  for (let i = 1; i <= 3; i++) {
    addMessage(`📄 範例文獻 ${i}：<em>「${originalQuery}」相關主題的研究文章</em>`);
  }
}
