<template>
    <div class="cover"></div>
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
  </template>
  
  <script setup>
  import { defineEmits } from "vue";
  
  const emit = defineEmits(["selectHRVMethod"]);
  
  const selectMethod = (method) => {
    emit("selectHRVMethod", method);
  };
  </script>
  

<style scoped>
.cover {
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
  z-index: 98;
}
.chooseHRVUseMethod {
  border-radius: 12px;
  background: var(--shade-white, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 14px 12px;
  position: fixed;
  z-index: 99;
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
</style>
