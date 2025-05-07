// 用來顯示對話內容的函數
function addMessage(message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // 滾動到最新訊息
  }
  
  // PubMed 搜尋函數
  async function searchPubMed(query) {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=xml&retmax=5`;
  
    try {
      const response = await fetch(url);
      const data = await response.text();
      const ids = data.match(/<Id>(\d+)<\/Id>/g).map(id => id.replace(/<\/?Id>/g, ''));  // 提取PubMed ID
  
      if (ids.length > 0) {
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
  
  // 解析 PubMed 文獻詳細資料
  function parsePubMedDetails(xmlData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, "application/xml");
    const articles = xmlDoc.getElementsByTagName("PubmedArticle");
  
    Array.from(articles).forEach(article => {
      const title = article.querySelector("ArticleTitle").textContent;
      const abstract = article.querySelector("AbstractText") ? article.querySelector("AbstractText").textContent : "無摘要";
      addMessage(`📘 標題：${title}`);
      addMessage(`📄 摘要：${abstract}`);
    });
  }
  
  // Google 學術搜尋函數
  async function searchGoogleScholar(query) {
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&hl=zh-TW&as_sdt=0,5`;
  
    try {
      const response = await fetch(url);
      const data = await response.text();
      const titles = data.match(/<h3 class="gs_rt">.*?<\/h3>/g);
  
      if (titles && titles.length > 0) {
        titles.forEach(title => {
          const articleTitle = title.replace(/<\/?h3.*?>/g, ''); // 去掉標籤
          addMessage(`📚 Google 學術：${articleTitle}`);
        });
      } else {
        addMessage("🔍 找不到相關的 Google 學術文獻。");
      }
    } catch (error) {
      console.error(error);
      addMessage("❌ 發生錯誤，無法取得 Google 學術資料。");
    }
  }
  
  // 處理表單提交事件
  document.getElementById('chat-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // 防止表單重新加載頁面
  
    const query = document.getElementById('query').value;
    if (query.trim()) {
      addMessage(`🤖 Jimmy AI: 搜尋「${query}」的相關學術資料中...`);
  
      // 同時進行 PubMed 和 Google 學術的搜尋
      searchPubMed(query);
      searchGoogleScholar(query);
    } else {
      addMessage("❌ 請輸入搜尋關鍵字。");
    }
  
    document.getElementById('query').value = ''; // 清空輸入框
  });
  
