chrome.runtime.sendMessage({ action: "checkPhishingSite" }, (response) => {
// 检查当前网站是否已被标记为钓鱼网站
function checkPhishingSite(callback) {
    const currentUrl = window.location.href;
    chrome.runtime.sendMessage(
      { action: "checkPhishingSite", url: currentUrl },
      (response) => {
        callback(response);
      }
    );
  }
  
  // 显示弹窗提醒
  function showAlert() {
    const alertDiv = document.createElement("div");
    alertDiv.style.position = "fixed";
    alertDiv.style.top = "0";
    alertDiv.style.right = "0";
    alertDiv.style.zIndex = "99999";
    alertDiv.style.backgroundColor = "red";
    alertDiv.style.color = "white";
    alertDiv.style.padding = "10px";
    alertDiv.style.borderRadius = "5px";
    alertDiv.style.fontSize = "16px";
    alertDiv.innerText = "警告：此网站被标记为钓鱼网站！";
  
    document.body.appendChild(alertDiv);
    setTimeout(() => {
      document.body.removeChild(alertDiv);
    }, 5000);
  }
  
  // 检查并显示提醒
  checkPhishingSite((response) => {
    if (response.isBanned) {
      showAlert();
      chrome.runtime.sendMessage({ action: "showPopup" });
    }
  });

//   chrome.runtime.sendMessage({ action: "checkPhishingSite" }, (response) => {
//     if (response.isPhishingSite) {
//       alert("警告：您正在访问一个被标记为钓鱼网站的页面！");
//     }
  });

  // if (isVideoSite()) {
  //   chrome.runtime.sendMessage({ action: "showPopup" });
  // }
  
  // function isVideoSite() {
  //   return window.location.hostname.endsWith("youtube.com") || window.location.hostname.endsWith("vimeo.com");
  // }
  
// 向页面注入脚本
// const script = document.createElement('script');
// script.src = chrome.runtime.getURL('injected_script.js');
// document.head.appendChild(script);

// // 监听来自注入脚本的消息
// window.addEventListener('message', (event) => {
//   if (event.source !== window) return;

//   const message = event.data;

//   if (message.from === 'injected_script' && message.type === 'ETHEREUM_OBJECT') {
//     alert(message.payload)
//     console.log('MetaMask 对象：', message.payload);
//   }
// });

  