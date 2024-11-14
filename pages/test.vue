<template>
  <div>
    <h1>開啟鏡頭測試</h1>
    <video ref="videoElement" autoplay></video>
    <button @click="startCamera">開啟鏡頭</button>
    <button @click="stopCamera">停止鏡頭</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const videoElement = ref(null)
let mediaStream = null

// 開啟鏡頭
const startCamera = async () => {
  try {
    // 獲取用戶的媒體設備（鏡頭）
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
    
    // 將獲取到的流設置到 video 元素
    videoElement.value.srcObject = mediaStream
  } catch (error) {
    console.error('無法開啟鏡頭:', error)
  }
}

// 停止鏡頭
const stopCamera = () => {
  if (mediaStream) {
    // 停止流中的所有媒體
    mediaStream.getTracks().forEach(track => track.stop())
    videoElement.value.srcObject = null
  }
}
</script>

<style scoped>
video {
  width: 100%;
  height: auto;
  border: 1px solid #ccc;
}
</style>
