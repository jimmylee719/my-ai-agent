const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const clearButton = document.getElementById("clear-button");
const backToTopButton = document.getElementById("back-to-top");

let debounceTimeout;

sendButton.addEventListener("click", handleUserInput);
userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    handleUserInput();
  }
});

clearButton.addEventListener("click", clearChat);
backToTopButton.addEventListener("click", scrollToTop);

function handleUserInput() {
  const input = userInput.value.trim();
  if (input === "") return;

  addMessage(`🧑 你：${input}`);
  userInput.value = "";
  addMessage(`🤖 Jimmy AI: 搜尋「${input}」的相關學術資料中...`);

  showLoadingIndicator(true);

  // 去抖動處理，防止過快的連續請求
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    translateToEnglish(input)
      .then(translated => {
        searchPubMed(translated, input);
        searchEuropePMC(translated, input);
      })
      .catch(error => {
        addMessage("❌ 翻譯失敗，請重試。");
        console.error(error);
        showLoadingIndicator(false);
      });
  }, 500);
}

function addMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.className = "message";
  messageElement.innerHTML = message;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showLoadingIndicator(show) {
  if (show) {
    addMessage("🔄 請稍候，正在處理您的請求...");
  } else {
    const lastMessage = chatContainer.lastElementChild;
    if (lastMessage && lastMessage.textContent.includes("🔄")) {
      chatContainer.removeChild(lastMessage);
    }
  }
}

function clearChat() {
  chatContainer.innerHTML = "";
}

function scrollToTop() {
  window.scrollTo(0, 0);
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
        showLoadingIndicator(false);
        return;
      }

      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;

      fetch(summaryUrl)
        .then(res => res.json())
        .then(summary => {
          let pubmedHtml = "📚 PubMed 搜尋結果：";
          const promises = ids.map(id => {
            const item = summary.result[id];
            const title = item.title;
            const link = `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
            return translateToChinese(title).then(translatedTitle => {
              return `🔸 <a href="${link}" target="_blank">${title}</a><br>📘 中文標題：${translatedTitle}`;
            });
          });

          Promise.all(promises)
            .then(results => {
              pubmedHtml += "<br>" + results.join("<br>");
              addMessage(pubmedHtml);
              showLoadingIndicator(false);
            })
            .catch(() => {
              addMessage("❌ PubMed 文獻翻譯失敗。");
              showLoadingIndicator(false);
            });
        })
        .catch(() => {
          addMessage("❌ 無法抓取 PubMed 文獻資料。");
          showLoadingIndicator(false);
        });
    })
    .catch(() => {
      addMessage("❌ PubMed 搜尋失敗。");
      showLoadingIndicator(false);
    });
}

function searchEuropePMC(englishQuery, originalQuery) {
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(englishQuery)}&format=json&resulttype=lite`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.resultList.result.length === 0) {
        addMessage("🔍 找不到相關的 EuropePMC 文獻。");
        return;
      }

      let europePMCHtml = "📚 EuropePMC 搜尋結果：";
      data.resultList.result.slice(0, 3).forEach(item => {
        const title = item.title;
        const link = item.uri;
        europePMCHtml += `<br>🔸 <a href="${link}" target="_blank">${title}</a>`;
      });

      addMessage(europePMCHtml);
    })
    .catch(() => {
      addMessage("❌ EuropePMC 搜尋失敗。");
    });
}
