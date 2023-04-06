// async function requestMetaMaskAuthorization() {
//     try {
//       if (!window.ethereum) {
//         throw new Error('MetaMask未安装');
//       }
  
//       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//       return { success: true, account: accounts[0] };
//     } catch (error) {
//       return { success: false, error: error.message };
//     }
//   }
  
//   requestMetaMaskAuthorization().then((result) => {
//     // 将结果发送回content script
//     window.postMessage({
//       from: 'injected_script',
//       type: 'META_MASK_AUTH_RESULT',
//       payload: result
//     }, '*');
//   });
  