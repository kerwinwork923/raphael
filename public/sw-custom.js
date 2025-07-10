// 自定義 Service Worker 處理 PWA 背景執行
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';

// 預快取所有資源
precacheAndRoute(self.__WB_MANIFEST);

// 處理導航請求
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  // 檢查請求是否為導航請求
  ({ request }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (request.method !== 'GET') {
      return false;
    }
    if (request.headers.get('accept')?.includes('text/html')) {
      return false;
    }
    return !fileExtensionRegexp.test(request.url);
  },
  createHandlerBoundToURL('/index.html')
);

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