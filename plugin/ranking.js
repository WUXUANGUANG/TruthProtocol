function getPhishingSiteList() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "getPhishingSiteListFromRanking" },
        (response) => {
          console.log(response); // 添加此行以检查收到的响应
          resolve(response.phishingSiteList);
        }
      );
    });
  }
  
  function displayPhishingSiteRanking(rankingData) {
    const rankingTbody = document.getElementById("ranking-tbody");
  
    rankingData.forEach((site, index) => {
      const tr = document.createElement("tr");
  
      const rankTd = document.createElement("td");
      rankTd.textContent = index + 1;
      tr.appendChild(rankTd);
  
      const urlTd = document.createElement("td");
      urlTd.textContent = site.url;
      tr.appendChild(urlTd);
  
      const countTd = document.createElement("td");
      countTd.textContent = site.count;
      tr.appendChild(countTd);
  
      rankingTbody.appendChild(tr);
    });
  }
  
  (async function () {
    const phishingSiteList = await getPhishingSiteList();
    console.log(phishingSiteList); // 添加此行以检查收到的钓鱼网站列表
  
    const sortedList = phishingSiteList.sort((a, b) => b.count - a.count);
  
    displayPhishingSiteRanking(sortedList);
  })();

  
  