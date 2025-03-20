<template>
  <div class="cover"></div>

  <transition name="fade">
    <div v-if="!loading">
    
      <RaphaelLoading v-if="loading" />
      <div class="chooseHRVUseMethod">
        <h6>請選擇</h6>
        <div class="hrvMethodGroup">
          <div class="hrvMethod" @click="selectMethod('before')">
            <img src="../assets/imgs/hrvUsageResult/hrvBefore.png" alt="" />
            <h3>穿衣前檢測</h3>
          </div>
          <div class="hrvMethod" @click="selectMethod('after')">
            <img src="../assets/imgs/hrvUsageResult/hrvAfter.png" alt="" />
            <h3>穿衣後檢測</h3>
            <small>補測</small>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

  
<script setup>
import { ref, onMounted, defineEmits } from "vue";
import RaphaelLoading from "@/components/RaphaelLoading.vue";

const emit = defineEmits(["selectHRVMethod"]);
const loading = ref(true); // 預設為 true，先顯示 loading

// 監聽圖片載入
const checkImagesLoaded = () => {
  const images = document.querySelectorAll(".chooseHRVUseMethod img");
  let loadedCount = 0;

  images.forEach((img) => {
    if (img.complete) {
      loadedCount++;
    } else {
      img.onload = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setTimeout(() => {
            loading.value = false; // 加入延遲，使過渡更順暢
          }, 300);
        }
      };
      img.onerror = () => {
        console.warn(`圖片載入失敗: ${img.src}`);
        loadedCount++;
        if (loadedCount === images.length) {
          setTimeout(() => {
            loading.value = false;
          }, 300);
        }
      };
    }
  });

  if (loadedCount === images.length) {
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
};

// **確保組件掛載後開始檢測圖片載入狀態**
onMounted(() => {
  checkImagesLoaded();
});

const selectMethod = (method) => {
  emit("selectHRVMethod", method);
};
</script>

  

<style scoped>
.cover {
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
  z-index: 111;
}
.chooseHRVUseMethod {
  border-radius: 12px;
  background: var(--shade-white, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 14px 12px;
  position: fixed;
  z-index: 120;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
}
.chooseHRVUseMethod h6 {
  color: #000;
  font-size: 24px;
  font-style: normal;
  letter-spacing: var(--Body-Large-Tracking, 0.5px);
}
.chooseHRVUseMethod .hrvMethodGroup {
  display: flex;
  justify-content: center;
  margin-top: 0.85rem;
  gap: 1.25rem;
}
.chooseHRVUseMethod .hrvMethod {
  border-radius: 12px;
  border: 1px solid var(--Color-Green-400, #74bc1f);
  background: var(--Color-Green-100, #fcfff7);
  padding: 8px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  position: relative;
}
.chooseHRVUseMethod .hrvMethod:hover {
  transform: scale(1.05);
}
.chooseHRVUseMethod .hrvMethod img {
  border-radius: 8px;
  width: 100%;
}
.chooseHRVUseMethod .hrvMethod h3 {
  color: var(--Color-Green-400, #74bc1f);
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  line-height: 100%;
  letter-spacing: 0.09px;
  text-align: center;
  margin-top: 0.35rem;
}
.chooseHRVUseMethod .hrvMethod small{
    position: absolute;
    top: 6%;
    right: 6%;
    color:#fff;
    letter-spacing: 1px;
    font-weight: bold;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease-in-out;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0.1;
}
</style>
