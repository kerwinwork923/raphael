// 自定義 Service Worker 處理 PWA 背景執行
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

// 處理 PWA 啟動
self.addEventListener('fetch', (event) => {
  // 確保 PWA 能正常載入
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/');
      })
    );
  }
}); 