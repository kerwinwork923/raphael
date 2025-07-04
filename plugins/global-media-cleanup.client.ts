export default defineNuxtPlugin(() => {
  // 只在客戶端執行
  if (process.client) {
    console.log('🔧 全域媒體清理插件初始化');
    
    // 強制停止所有媒體流
    const forceStopAllMedia = () => {
      console.log('🔴 全域強制停止所有媒體流');
      
      // 停止所有 video 元素的媒體流
      const videoElements = document.querySelectorAll('video');
      videoElements.forEach((video, index) => {
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          if (stream && stream.getTracks) {
            stream.getTracks().forEach(track => {
              console.log(`停止 video ${index} 的 ${track.kind} 軌道`);
              track.stop();
            });
          }
          video.srcObject = null;
        }
      });

      // 停止所有 audio 元素的媒體流
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio, index) => {
        if (audio.srcObject) {
          const stream = audio.srcObject as MediaStream;
          if (stream && stream.getTracks) {
            stream.getTracks().forEach(track => {
              console.log(`停止 audio ${index} 的 ${track.kind} 軌道`);
              track.stop();
            });
          }
          audio.srcObject = null;
        }
      });

      // 清理全域變數
      if ((window as any).mediaRecorder) {
        try {
          (window as any).mediaRecorder.stop();
          console.log('停止全域 MediaRecorder');
        } catch (e) {
          console.log('全域 MediaRecorder 停止失敗');
        }
        (window as any).mediaRecorder = null;
      }

      if ((window as any).stream) {
        (window as any).stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        (window as any).stream = null;
      }

      // 嘗試停止所有可能的媒體設備
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaTypes = [
          { video: true, audio: false },
          { video: false, audio: true },
          { video: true, audio: true }
        ];

        mediaTypes.forEach(async (constraints) => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('取得媒體流進行清理:', constraints);
            stream.getTracks().forEach(track => track.stop());
          } catch (error) {
            // 忽略錯誤，這表示沒有活躍的媒體流
          }
        });
      }

      console.log('🔴 全域媒體流清理完成');
    };

    // 頁面可見性變化處理
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 全域頁面進入背景，執行媒體清理');
        forceStopAllMedia();
      }
    };

    // 強制清理事件處理
    const handleForceCleanup = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🚨 收到全域強制清理事件:', customEvent.detail);
      forceStopAllMedia();
    };

    // 頁面卸載處理
    const handleBeforeUnload = () => {
      console.log('📄 頁面即將卸載，執行媒體清理');
      forceStopAllMedia();
    };

    // 添加事件監聽器
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('force-stop-media', handleForceCleanup);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    // 提供全域方法
    return {
      provide: {
        globalMediaCleanup: {
          forceStopAllMedia,
          // 檢查是否有活躍的媒體流
          hasActiveMedia: () => {
            const videoElements = document.querySelectorAll('video');
            const audioElements = document.querySelectorAll('audio');
            
            for (const video of videoElements) {
              if (video.srcObject) return true;
            }
            
            for (const audio of audioElements) {
              if (audio.srcObject) return true;
            }
            
            return false;
          },
          // 發送強制清理事件
          triggerForceCleanup: () => {
            window.dispatchEvent(new CustomEvent('force-stop-media', {
              detail: { 
                timestamp: Date.now(),
                source: 'global-plugin'
              }
            }));
          }
        }
      }
    };
  }
}); 