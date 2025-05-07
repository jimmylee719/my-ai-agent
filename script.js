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
      searchEuropePMC(translated, input);
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
          let pubmedHtml = "📚 PubMed 搜尋結果：";
          const promises = ids.map(id => {
            const item = summary.result[id];
            const title = item.title;
            const link = `https://pubmed.ncbi.nlm.nih.gov/${id}/`;
            return translateToChinese(title).then(translatedTitle => {
              return `🔸 <a href="${link}" target="_blank">${title}</a><br>📘 中文：${translatedTitle}`;
            });
          });

          Promise.all(promises).then(results => {
            results.forEach(msg => {
              pubmedHtml += `<br>${msg}`;
            });
            addMessage(pubmedHtml);
          });
        });
    })
    .catch(error => {
      console.error("PubMed Error:", error);
      addMessage("❌ 取得 PubMed 資料時發生錯誤。");
    });
}

function searchEuropePMC(englishQuery, originalQuery) {
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(englishQuery)}&format=json&pageSize=3`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const results = data.resultList.result;
      if (!results || results.length === 0) {
        addMessage("🔍 找不到相關的 Europe PMC 文獻。");
        return;
      }

      let pmcHtml = "📘 Europe PMC 搜尋結果：";
      const promises = results.map(item => {
        const title = item.title;
        const link = `https://europepmc.org/article/${item.source}/${item.id}`;
        return translateToChinese(title).then(translatedTitle => {
          return `🔸 <a href="${link}" target="_blank">${title}</a><br>📘 中文：${translatedTitle}`;
        });
      });

      Promise.all(promises).then(results => {
        results.forEach(msg => {
          pmcHtml += `<br>${msg}`;
        });
        addMessage(pmcHtml);
      });
    })
    .catch(error => {
      console.error("Europe PMC Error:", error);
      addMessage("❌ 取得 Europe PMC 資料時發生錯誤。");
    });
}
