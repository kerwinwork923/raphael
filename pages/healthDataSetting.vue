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
          <!-- Toggle -->
          <label class="toggle" :aria-pressed="hrvEnabled.toString()">
            <input
              class="toggle__input"
              type="checkbox"
              v-model="hrvEnabled"
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
import { ref } from "vue";
import TitleMenu from "~/components/TitleMenu.vue";

const hrvEnabled = ref(true); // 預設開啟/關閉自己改
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;

      width: 100%;
      min-height: 64px;
      padding: 12px 16px;
      margin-top: 0.5rem;

      border-radius: var(--Radius-r-50, 50px);
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
          margin-top: 0.25rem;
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
