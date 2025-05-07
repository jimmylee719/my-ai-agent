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

  addMessage(`🧑 你：${input}`);
  userInput.value = "";
  addMessage(`🤖 Jimmy AI: 搜尋「${input}」的相關學術資料中...`);

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

function addMessage(message, useHTML = false) {
  const messageElement = document.createElement("div");
  messageElement.className = "message";
  if (useHTML) {
    messageElement.innerHTML = message;
  } else {
    messageElement.textContent = message;
  }
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function translateToEnglish(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-TW&tl=en&dt=t&q=${encodeURIComponent(text)}`;
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
            const cardHTML = `
              <div class="result-card">
                <a href="https://pubmed.ncbi.nlm.nih.gov/${id}/" target="_blank">${item.title}</a>
              </div>
            `;
            addMessage(cardHTML, true);
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
  addMessage(`🔗 <a href="${googleUrl}" target="_blank">點此瀏覽 Google 學術搜尋結果</a>`, true);
  
  // 範例模擬卡片
  for (let i = 1; i <= 3; i++) {
    const cardHTML = `
      <div class="result-card">
        <a href="${googleUrl}" target="_blank">📄 範例文獻 ${i}：關於「${originalQuery}」的研究</a>
      </div>
    `;
    addMessage(cardHTML, true);
  }
}

// 回到頂部按鈕功能
const backToTop = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTop.style.display = "block";
  } else {
    backToTop
