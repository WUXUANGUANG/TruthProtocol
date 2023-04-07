// 获取元素
const host="http://127.0.0.1:3001"
const phishingSiteWarning = document.getElementById("phishing-site-warning");
const addPhishingSiteButton = document.getElementById("add-phishing-site");
const removePhishingSiteButton = document.getElementById("remove-phishing-site");
const phishingSiteList = document.getElementById("phishing-site-list");
const numberEl = document.getElementById('number');
const link = document.getElementById("link");
// 获取安全网站相关元素
const safeSiteList = document.getElementById("safeSiteList");
const markSafeSiteButton = document.getElementById("markSafeSite");
const removeSafeSiteButton = document.getElementById("removeSafeSite");

// 显示钓鱼网站警告
function showPhishingSiteWarning() {
  phishingSiteWarning.style.display = "block";
}

// 更新颜色
// 更新数字并设置颜色
function updateNumber(number) {
  numberEl.textContent = number;
  if (number < 30) {
    numberEl.classList.add('red')
  } else if (number < 60) {
    numberEl.classList.add('yellow');
    numberEl.classList.remove('red');
    numberEl.classList.remove('green');
    } else {
    numberEl.classList.add('green');
    numberEl.classList.remove('red');
    numberEl.classList.remove('yellow');
    }
  }

// 检查当前网站是否已被标记为钓鱼网站
function checkPhishingSite(callback) {  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    chrome.runtime.sendMessage(
      { action: "checkPhishingSite", url: currentTab.url },
      (response) => {
        callback(response);
      }
    );
  });
}

// 在弹出界面中显示钓鱼网站警告（如果需要）
checkPhishingSite((response) => {
  console.log(response);
  if (response.isBanned) {
    updateNumber(response.score)
    showPhishingSiteWarning();
  }
});

// 添加钓鱼网站事件
addPhishingSiteButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      generateLink(currentTab.url)
      // const score = prompt("请输入该网站的分数（1-10分）：");
  
      // // 检查分数是否在 1-10 分之间
      // if (isNaN(score) || score < 1 || score > 10) {
      //   alert("请输入一个有效的分数（1-10 分）！");
      //   return;
      // }
  
      // chrome.runtime.sendMessage(
      //   { action: "addPhishingSite", url: currentTab.url, score },
      //   (response) => {
      //     if (response.success) {
      //       updatePhishingSiteList();
      //       alert("钓鱼网站添加成功！");
      //     } else {
      //       alert("钓鱼网站添加失败，请稍后重试。");
      //     }
      //   }
      // );
    });
  });  

// 删除钓鱼网站事件
removePhishingSiteButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    chrome.runtime.sendMessage(
      { action: "removePhishingSite", url: currentTab.url },
      (response) => {
        if (response.success) {
          updatePhishingSiteList();
          alert("钓鱼网站删除成功！");
        } else {
          alert("钓鱼网站删除失败，请稍后重试。");
        }
      }
    );
  });
});

// 获取并显示钓鱼网站排行榜
function updatePhishingSiteList() {
    chrome.runtime.sendMessage({ action: "getPhishingSiteList" }, (response) => {
      const phishingSiteListData = response.phishingSiteList;
  
      // 按照分数进行排序
      phishingSiteListData.sort((a, b) => b.score - a.score);
  
      // 清空现有列表
      phishingSiteList.innerHTML = "";
  
      // 生成新的列表
      phishingSiteListData.forEach((site) => {
        const listItem = document.createElement("li");
        listItem.innerText = `${site.url}（${site.score}分，${site.count}次标记）`;
        phishingSiteList.appendChild(listItem);
      });
    });
  }
  

updatePhishingSiteList();

// 获取并显示安全网站列表
// 获取并显示安全网站列表
function updateSafeSiteList() {
    chrome.runtime.sendMessage({ action: "getSafeSiteList" }, (response) => {
      const safeSiteListData = response.safeSiteList;
  
      // 清空现有列表
      safeSiteList.innerHTML = "";
  
      // 生成新的列表
      safeSiteListData.forEach((site) => {
        const listItem = document.createElement("li");
        listItem.innerText = `${site.url}`;
        safeSiteList.appendChild(listItem);
      });
    });
  }
  
  updateSafeSiteList();


  
  
  // 为安全网站标记按钮添加点击事件监听器
  markSafeSiteButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      // 向 background.js 发送添加安全网站的消息
      chrome.runtime.sendMessage(
        { action: "addSafeSite", url: currentTab.url },
        (response) => {
          if (response.success) {
            updateSafeSiteList();
            alert("安全网站添加成功！");
          } else {
            alert("安全网站添加失败！");
          }
        }
      );
    });
  });
  
  // 删除安全网站事件
  removeSafeSiteButton.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      chrome.runtime.sendMessage(
        { action: "removeSafeSite", url: currentTab.url },
        (response) => {
          if (response.success) {
            updateSafeSiteList();
            alert("安全网站删除成功！");
          } else {
            alert("安全网站删除失败，请稍后重试。");
          }
        }
      );
    });
  });

  // 在页面加载时调用 openPopup 函数
document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.getBackgroundPage(function(bgWindow) {
    bgWindow.openPopup();
  });
});

// 跳转到排名网站
function generateLink(url) {
  targetURL=host+"/index?attachUrl=" + encodeURIComponent(url)
  //link.href = rankUrl+"?attachUrl=" + encodeURIComponent(url)
  // 在新标签页中打开目标页面
  chrome.tabs.create({url: targetURL});
}



  
  
