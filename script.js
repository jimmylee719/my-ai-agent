function addMessage(message) {
  const chatBox = document.getElementById('chat-box');
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.textContent = message;
  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// PubMed 搜尋
async function searchPubMed(query) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=xml&retmax=5`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    const ids = data.match(/<Id>(\d+)<\/Id>/g)?.map(id => id.replace(/<\/?Id>/g, ''));

    if (ids?.length > 0) {
      const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.text();
      parsePubMedDetails(detailsData);
    } else {
      addMessage("🔍 找不到相關的 PubMed 文獻。");
    }
  } catch (error) {
    console.error(error);
    addMessage("❌ 發生錯誤，無法取得 PubMed 資料。");
  }
}

function parsePubMedDetails(xmlData) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, "application/xml");
  const articles = xmlDoc.getElementsByTagName("PubmedArticle");

  Array.from(articles).forEach(article => {
    const title = article.querySelector("ArticleTitle")?.textContent || "無標題";
    const abstract = article.querySelector("AbstractText")?.textContent || "無摘要";
    addMessage(`📘 標題：${title}`);
    addMessage(`📄 摘要：${abstract}`);
  });
}

// Google 學術（僅顯示提示，無法直接爬取）
async function searchGoogleScholar(query) {
  const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&hl=zh-TW&as_sdt=0,5`;
  addMessage(`🔗 點此瀏覽 Google 學術搜尋結果：${url}`);
}

document.getElementById('chat-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const query = document.getElementById('user-input').value;
  if (query.trim()) {
    addMessage(`🤖 Jimmy AI: 搜尋「${query}」的相關學術資料中...`);
    searchPubMed(query);
    searchGoogleScholar(query);
  } else {
    addMessage("❌ 請輸入搜尋關鍵字。");
  }
  document.getElementById('user-input').value = '';
});
