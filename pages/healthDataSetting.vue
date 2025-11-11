<template>
  <div class="healthDataSettingWrap">
    <div class="titleMenuWrap">
      <TitleMenu Text="健康數據設定" link="back" />
    </div>
    <div class="healthDataSettingContent">
      <div class="healthDataSettingItem">
        <div class="healthDataSettingTextGroup">
          <h3>HRV檢測</h3>
          <p>保持開啟，幫你更懂自己</p>
        </div>

        <div class="optionGroup">
          <!-- Toggle -->
          <label class="toggle" :aria-pressed="hrvEnabled.toString()">
            <input
              class="toggle__input"
              type="checkbox"
              v-model="hrvEnabled"
              :disabled="isUpdating"
              aria-label="切換 HRV 檢測"
            />
            <span class="toggle__track"></span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import TitleMenu from "~/components/TitleMenu.vue";
import { updateHRVSetting, reloadUserData } from "~/fn/api.js";

// 從 localStorage 讀取初始狀態
const getInitialHRVState = () => {
  try {
    const localData = localStorage.getItem("userData");
    if (localData) {
      const userData = JSON.parse(localData);
      // HRVONOFF: "Y" 為開啟, "N" 為關閉
      return userData?.Member?.HRVONOFF === "Y";
    }
  } catch (error) {
    console.error("讀取 localStorage 失敗:", error);
  }
  return false; // 預設關閉
};

const hrvEnabled = ref(false);
const isUpdating = ref(false);
const isInitialized = ref(false);

// 重新載入用戶資料並更新狀態
const refreshUserData = async () => {
  try {
    const newUserData = await reloadUserData();
    if (newUserData) {
      // 更新本地狀態（設置 isUpdating 避免觸發 watch）
      isUpdating.value = true;
      hrvEnabled.value = newUserData?.Member?.HRVONOFF === "Y";
      isUpdating.value = false;
      console.log("用戶資料已重新載入，HRV 狀態:", hrvEnabled.value);
    }
  } catch (error) {
    console.error("重新載入用戶資料失敗:", error);
    isUpdating.value = false;
  }
};

// 監聽 toggle 變化並調用 API
watch(hrvEnabled, async (newValue, oldValue) => {
  // 避免初始化時或更新中時觸發
  if (!isInitialized.value || isUpdating.value) return;
  
  isUpdating.value = true;
  const previousValue = oldValue;

  try {
    console.log(`更新 HRV 設定: ${newValue ? "開啟" : "關閉"}`);
    const result = await updateHRVSetting(newValue);

    if (result.success) {
      // API 成功後重新載入用戶資料
      await refreshUserData();
    } else {
      // API 失敗時恢復原狀態
      isUpdating.value = true;
      hrvEnabled.value = previousValue;
      isUpdating.value = false;
    }
  } catch (error) {
    console.error("更新 HRV 設定時發生錯誤:", error);
    // 發生錯誤時恢復原狀態
    isUpdating.value = true;
    hrvEnabled.value = previousValue;
    isUpdating.value = false;
    alert("更新 HRV 設定時發生錯誤，請稍後再試");
  }
});

onMounted(() => {
  // 組件掛載時設置初始狀態
  hrvEnabled.value = getInitialHRVState();
  // 標記為已初始化，之後的變化才會觸發 API
  isInitialized.value = true;
});
</script>

<style lang="scss">
.healthDataSettingWrap {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  padding: 0.75rem 0 12px 0;
  .titleMenuWrap{
    padding: 0 3%;
  }
  .titleMenu {
    max-width: 768px;
    margin: 0 auto;
  }

  .healthDataSettingContent {
    max-width: 768px;
    margin: 0 auto;
    padding: 0 16px;

    .healthDataSettingItem {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      width: 100%;
      min-height: 64px;
      padding: 16px;
      margin-top: 0.5rem;

      border-radius: var(--Radius-r-50, 20px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));

      .healthDataSettingTextGroup {
        h3 {
          color: var(--Neutral-black, #1e1e1e);
          text-overflow: ellipsis;
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 2.7px;
        }
        p {
          color: var(--Neutral-500, #666);
          font-size: var(--Text-font-size-16, 16px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 2.4px;
          margin-top: 0.5rem;
        }
      }

      .optionGroup {
        display: flex;
        align-items: center;
      }
    }
  }
}

/* ===== iOS 風格切換 ===== */
.toggle {
  position: relative;
  display: inline-block;
  width: 68px; /* 依照設計調整 */
  height: 34px;
  padding: 2px; /* 讓滑塊四週留白 */
  border-radius: 9999px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  .toggle__input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0; /* 保留可點、可鍵盤 */
    cursor: pointer;
  }

  .toggle__track {
    position: absolute;
    inset: 0;
    border-radius: 9999px;
    background: #e5e7eb; /* OFF 軌道色 */
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.12),
      0 1px 0 rgba(255, 255, 255, 0.6);
    transition: background-color 0.25s ease;

    /* 滑塊 */
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 4px;
      width: 30px;
      height: 30px;
      transform: translate(0, -50%);
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04);
      transition: transform 0.25s ease;
    }
  }

  /* Focus 樣式 (鍵盤導航) */
  .toggle__input:focus-visible + .toggle__track {
    outline: 2px solid #94a3b8;
    outline-offset: 2px;
  }

  /* Checked 狀態 */
  .toggle__input:checked + .toggle__track {
    background: linear-gradient(180deg, #dff3ff, #bfe6ff);
    background: #74bc1f;

    &::after {
      transform: translate(
        34px,
        -50%
      ); /* 右移，= track寬 - 滑塊寬 - 左右padding */
    }
  }

  /* Disabled 狀態 (可選) */
  .toggle__input:disabled + .toggle__track {
    background: #eaeaea;
    opacity: 0.7;
  }
}
</style>
