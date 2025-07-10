export default defineNuxtPlugin(() => {
  // 只在客戶端執行
  if (process.client) {
    // 全域頁面可見性處理
    const handleGlobalVisibilityChange = () => {
      if (document.hidden) {
        console.log('全域頁面進入背景');
        // 發送全域事件
        window.dispatchEvent(new CustomEvent('pwa-background', {
          detail: { timestamp: Date.now() }
        }));
      }
    };

    // 添加全域監聽器
    document.addEventListener('visibilitychange', handleGlobalVisibilityChange);

    // 清理函數
    return {
      provide: {
        pwaUtils: {
          // 檢查是否為 PWA 模式
          isPWA: () => {
            return window.matchMedia('(display-mode: standalone)').matches || 
                   (window.navigator as any).standalone;
          },
          // 停止所有媒體流
          stopAllMedia: () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              // 嘗試停止所有可能的媒體流
              navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then(stream => {
                  stream.getTracks().forEach(track => track.stop());
                })
                .catch(() => {
                  // 忽略錯誤，可能沒有權限
                });
            }
          }
        }
      }
    };
  }
}); 