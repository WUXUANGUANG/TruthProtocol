
  // 从后端获取的被禁用列表
  var bannedUrlList=[]

  let phishingSites = [
      // 示例数据，实际项目中应从存储中读取
      { url: "https://example1.com", score: 6, count: 1 }
    ];
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

      if (request.action === "addPhishingSite") {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const newPhishingSite = { url: currentTab.url, count: 1, score: request.score || 0 };
        
            chrome.storage.sync.get("phishingSites", (data) => {
              let phishingSites = data.phishingSites || [];
              const siteIndex = phishingSites.findIndex((site) => site.url === currentTab.url);
        
              if (siteIndex !== -1) {
                phishingSites[siteIndex].count += 1;
                phishingSites[siteIndex].score = (phishingSites[siteIndex].score + newPhishingSite.score) / 2;
              } else {
                phishingSites.push(newPhishingSite);
              }
        
              chrome.storage.sync.set({ phishingSites }, () => {
                sendResponse({ success: true });
              });
            });
          });
          
          return true; // 保持消息通道打开以等待异步响应
        }       
    
      else if (request.action === "removePhishingSite") {
        chrome.storage.sync.get("phishingSites", (data) => {
          let phishingSites = data.phishingSites || [];
          const siteIndex = phishingSites.findIndex(
            (site) => site.url === request.url
          );
    
          if (siteIndex !== -1) {
            phishingSites.splice(siteIndex, 1);
            chrome.storage.sync.set({ phishingSites }, () => {
              sendResponse({ success: true });
            });
          } else {
            sendResponse({ success: false });
          }
        });
    
        return true; // 保持消息通道打开以等待异步响应
      } else if (request.action === "getPhishingSiteList") {
        chrome.storage.sync.get("phishingSites", (data) => {
          let phishingSiteList = data.phishingSites || [];
          sendResponse({ phishingSiteList });
        });
    
        return true; // 保持消息通道打开以等待异步响应
      } else if (request.action === "checkPhishingSite") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const currentTab = tabs[0];
          chrome.storage.sync.get("phishingSites", (data) => {
            let phishingSites = data.phishingSites || [];
            console.log(phishingSites);
            phishingSites=phishingSites.concat(bannedUrlList)
            let isPhishingSite=false
            let bannedScore=0
            for (var i=0;i<phishingSites.length;i++){
              if(phishingSites[i].url == currentTab.url){
                
                isPhishingSite=true
                bannedScore=phishingSites[i].score
              }
            }
            // let isPhishingSite = phishingSites.some(
            //   (site) => site.url === currentTab.url
            // );
            const res={
              isBanned: isPhishingSite,
              score:bannedScore
            }
            sendResponse(res);
          });
        });
    
        return true; // 保持消息通道打开以等待异步响应
      }

      // 允许排名网站访问数据
      if (request.action === "getPhishingSiteListFromRanking") {
          chrome.storage.sync.get("phishingSites", (data) => {
            const phishingSiteList = data.phishingSites || [];
            console.log({ phishingSiteList });
            sendResponse({ phishingSiteList }); // 确保在这里调用了 sendResponse
          });
      
          // 注意：在 chrome.runtime.onMessage 监听器中，如果您要异步响应，请返回 true。
          return true; // 确保在这里返回 true
        }
      
      // 处理添加安全网站操作
    if (request.action === "addSafeSite") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const newSafeSite = { url: currentTab.url, count: 1 };

        chrome.storage.sync.get("safeSites", (data) => {
          let safeSites = data.safeSites || [];
          const existingSiteIndex = safeSites.findIndex(
            (site) => site.url === newSafeSite.url
          );

          if (existingSiteIndex !== -1) {
            safeSites[existingSiteIndex].count += 1;
          } else {
            safeSites.push(newSafeSite);
          }

          chrome.storage.sync.set({ safeSites }, () => {
            sendResponse({ success: true });
          });
        });
      });

      return true; // 保持消息通道打开以等待异步响应
    }

    // 处理删除安全网站操作
    if (request.action === "removeSafeSite") {
      chrome.storage.sync.get("safeSites", (data) => {
        let safeSites = data.safeSites || [];
        const siteIndex = safeSites.findIndex((site) => site.url === request.url);

        if (siteIndex !== -1) {
          safeSites.splice(siteIndex, 1);
          chrome.storage.sync.set({ safeSites }, () => {
            sendResponse({ success: true });
          });
        } else {
          sendResponse({ success: false });
        }
      });

      return true; // 保持消息通道打开以等待异步响应
    }

    // 处理获取安全网站列表操作
    if (request.action === "getSafeSiteList") {
      chrome.storage.sync.get("safeSites", (data) => {
        let safeSiteList = data.safeSites || [];
        sendResponse({ safeSiteList });
      });
      return true; // 保持消息通道打开以等待异步响应
    }

    if (request.action === "showPopup") {
      console.log("asdasdasdasdadad")
      console.log(chrome.browserAction)
      chrome.browserAction.openPopup();
      return true;
    }

    });
    
    function sendRequest(){
      const xhr = new XMLHttpRequest();
      xhr.open('GET' , "http://127.0.0.1:3001/api/getBannedUrlList")
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
          bannedUrlList=[]
          const response = JSON.parse(xhr.responseText) || [];
          // 获取插件存储的网站
          for (var i= 0; i< response.data.length;i++){
            bannedUrlList.push({url:response.data[i].url,score: response.data[i].score,count:response.data[i].pool_trade_times})
          }
          console.log(bannedUrlList);
        }
      };
      xhr.send()
    };

    // 初始化时先获取一次钓鱼网站地址
    sendRequest()
    // 每10s获取一次钓鱼网站
    setInterval(sendRequest,10000);
  