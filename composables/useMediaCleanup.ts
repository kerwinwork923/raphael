export const useMediaCleanup = () => {
  // 強制停止所有媒體流
  const forceStopAllMedia = () => {
    console.log('🔴 強制停止所有媒體流開始');
    
    // 方法1：停止所有已知的 MediaStream
    const stopMediaStream = (stream: MediaStream) => {
      if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => {
          console.log(`停止 ${track.kind} 軌道:`, track.id);
          track.stop();
        });
      }
    };

    // 方法2：停止所有 video 元素的媒體流
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((video, index) => {
      if (video.srcObject) {
        console.log(`停止 video 元素 ${index} 的媒體流`);
        stopMediaStream(video.srcObject as MediaStream);
        video.srcObject = null;
      }
    });

    // 方法3：停止所有 audio 元素的媒體流
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio, index) => {
      if (audio.srcObject) {
        console.log(`停止 audio 元素 ${index} 的媒體流`);
        stopMediaStream(audio.srcObject as MediaStream);
        audio.srcObject = null;
      }
    });

    // 方法4：停止所有 MediaRecorder
    const stopMediaRecorder = (recorder: MediaRecorder) => {
      if (recorder && recorder.state !== 'inactive') {
        try {
          console.log('停止 MediaRecorder:', recorder.state);
          recorder.stop();
        } catch (e) {
          console.log('MediaRecorder 停止失敗:', e);
        }
      }
    };

    // 方法5：清理全域變數
    if ((window as any).mediaRecorder) {
      stopMediaRecorder((window as any).mediaRecorder);
      (window as any).mediaRecorder = null;
    }

    if ((window as any).stream) {
      stopMediaStream((window as any).stream);
      (window as any).stream = null;
    }

    // 方法6：嘗試停止所有可能的媒體設備
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // 嘗試取得並立即停止所有媒體流
      const mediaTypes = [
        { video: true, audio: false },
        { video: false, audio: true },
        { video: true, audio: true }
      ];

      mediaTypes.forEach(async (constraints) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('取得媒體流進行清理:', constraints);
          stopMediaStream(stream);
        } catch (error) {
          // 忽略錯誤，這表示沒有活躍的媒體流
        }
      });
    }

    // 方法7：發送全域事件
    window.dispatchEvent(new CustomEvent('media-cleanup-complete', {
      detail: { 
        timestamp: Date.now(),
        message: '所有媒體流已清理完成'
      }
    }));

    console.log('🔴 強制停止所有媒體流完成');
  };

  // 監聽頁面可見性變化
  const setupVisibilityListener = () => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 頁面進入背景，執行媒體清理');
        forceStopAllMedia();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 返回清理函數
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  // 監聽強制清理事件
  const setupForceCleanupListener = () => {
    const handleForceCleanup = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🚨 收到強制清理事件:', customEvent.detail);
      forceStopAllMedia();
    };

    window.addEventListener('force-stop-media', handleForceCleanup);
    
    // 返回清理函數
    return () => {
      window.removeEventListener('force-stop-media', handleForceCleanup);
    };
  };

  // 初始化所有監聽器
  const initializeMediaCleanup = () => {
    const cleanupVisibility = setupVisibilityListener();
    const cleanupForce = setupForceCleanupListener();
    
    // 返回清理函數
    return () => {
      cleanupVisibility();
      cleanupForce();
    };
  };

  return {
    forceStopAllMedia,
    setupVisibilityListener,
    setupForceCleanupListener,
    initializeMediaCleanup
  };
}; 