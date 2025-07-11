// 自定義 Service Worker 處理 PWA 背景執行
// 簡化版本，不使用 workbox 模組

// 自定義事件處理

// 自定義事件處理
self.addEventListener('install', (event) => {
  console.log('Service Worker 安裝中...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker 啟動中...');
  event.waitUntil(self.clients.claim());
});

// 處理頁面可見性變化
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'VISIBILITY_CHANGE') {
    if (event.data.hidden) {
      console.log('PWA 進入背景，通知頁面停止錄影');
      // 通知所有客戶端停止錄影
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'STOP_RECORDING',
            reason: 'PWA_BACKGROUND'
          });
        });
      });
    }
  }
}); 