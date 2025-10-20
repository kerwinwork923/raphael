<template>
  <div class="healthDataSettingWrap">
    <TitleMenu Text="健康數據設定" link="back" />
    <div class="healthDataSettingContent">
        <div class="healthDataSettingItem">
            <div class="healthDataSettingTextGroup">
                <h3>HRV檢測</h3>
                <p>保持開啟，幫你更懂自己</p>
            </div> 

            <div class="optionGroup">
                <!-- 按鈕 -->
                 
                
            </div>
        </div>
    </div>
  </div>
</template>
<script setup>
import TitleMenu from "~/components/TitleMenu.vue";
</script>

<style lang="scss">
.healthDataSettingWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  padding: 16px 0 12px 0;
  .titleMenu {
    max-width: 768px;
    margin: 0 auto;
  }
  .healthDataSettingContent {
    max-width: 768px;
    margin: 0 auto;
    padding: 0 16px;
    .healthDataSettingItem {
      width: 100%;
      height: 100%;
      border-radius: var(--Radius-r-50, 50px);
background: var(--Secondary-100, #F5F7FA);
box-shadow: 2px 4px 12px 0 var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.70));
    }
  }
}
</style>