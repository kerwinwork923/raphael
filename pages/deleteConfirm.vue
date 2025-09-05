<template>
     <Alert v-if="showAlert"  :defaultContent="alertContent" @close="showAlert = false"/>
  <div class="deleteConfirmWrap">
    <h2>刪除帳號</h2>
 
    <div class="deleteConfirmContainer" v-if="showStep1">
      <div class="deleteConfirmAlert">
        <img src="../assets/imgs/member/bigAlert.svg" alt="" />
        <h3>確定要刪除帳號？</h3>
        <p>刪除後，資料將永久移除，無法復原</p>
      </div>
      <div class="deleteDataListGroup">
        <h3>將被刪除的資料</h3>
        <div class="deleteDataListItem">
          <h4>個人資料</h4>
          <p>姓名、電話、電子郵件等基本資訊</p>
        </div>
        <div class="deleteDataListItem">
          <h4>健康紀錄</h4>
          <p>HRV 檢測紀錄、健康數據等</p>
        </div>
        <div class="deleteDataListItem">
          <h4>購物記錄</h4>
          <p>訂單歷史、購物車內容等</p>
        </div>
        <div class="deleteDataListItem">
          <h4>積分與獎勵</h4>
          <p>累積的積分、優惠券等</p>
        </div>
        <div class="deleteDataListItem">
          <h4>應用程式設定</h4>
          <p>個人化設定、偏好選項等</p>
        </div>
        <div class="deleteDataListItem">
          <h4>裝置配對</h4>
          <p>已配對的藍芽裝置資訊</p>
        </div>
      </div>
      <div class="deleteConfirmBtn deleteConfirmBtnFixed">
        <button class="deleteConfirmBtnCancel" @click="goToMember">
          再想想
        </button>
        <button class="deleteConfirmBtnContinue" @click="goToDeleteConfirm">
          繼續
        </button>
      </div>
    </div>
    <div class="deleteConfirmContainer2" v-if="showStep2">
      <p>為了保護您的資料安全，請輸入手機號碼以進行驗證</p>
      <input 
         type="tel"
         inputmode="numeric"
        placeholder="請輸入手機號碼" 
        v-model="mobileInput"
        :disabled="isLoading"
      />
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div class="deleteConfirmBtn deleteConfirmBtnFixed">
        <button class="deleteConfirmBtnCancel" @click="goToMember">
          再想想
        </button>
        <button 
          class="deleteConfirmBtnContinue" 
          @click="deleteAccount"
          :disabled="isLoading || !mobileInput.trim()"
        >
          {{ isLoading ? '處理中...' : '刪除' }}
        </button>
      </div>
    </div>

    <div class="finalDeleteAlert" v-if="showStep3">
      <p>
        這是最後一步！刪除帳號後，您的所有資料將永久消失，無法復原。確定要繼續嗎？
      </p>
      <div class="finalDeleteAlertBtn">
        <button class="finalDeleteAlertCancel" @click="showStep3 = false">
          取消
        </button>
        <button 
          class="finalDeleteAlertContinue" 
          @click="confirmDeleteAccount"
          :disabled="isLoading"
        >
          {{ isLoading ? '刪除中...' : '確定刪除' }}
        </button>
      </div>
    </div>

    <div class="deleteCover" v-if="showStep3" @click="showStep3 = false"></div>
    <Alert v-if="showStep3" @close="showStep3 = false" :showRedirectButton="false" />
    <BottomNav />
  </div>
</template>
<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
import axios from "axios";
import Alert from "@/components/Alert.vue";
const router = useRouter();

const showStep1 = ref(true); // 新增 ref 來控制第一個 container 的顯示
const showStep2 = ref(false); // 新增 ref 來控制第二個 container 的顯示
const showStep3 = ref(false); // 新增 ref 來控制第三個 container 的顯示
const mobileInput = ref(""); // 手機號碼輸入
const isLoading = ref(false); // 載入狀態
const errorMessage = ref(""); // 錯誤訊息
const alertContent = ref(""); // 彈窗內容
const showAlert = ref(false); // 彈窗顯示

const goToMember = () => {
  router.push("/member");
};

const goToDeleteConfirm = () => {
  showStep1.value = false;
  showStep2.value = true; // 切換到第二個 container
  //滾動到上方
  window.scrollTo(0, 0);
};

// 刪除帳號 API 調用
const callDeleteAccountAPI = async (mobile) => {
  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/TTEDeleteFromMember.jsp",
      {
        Key: "qrt897hpmd",
        Mobile: mobile
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("刪除帳號 API 調用失敗:", error);
    throw error;
  }
};

// 驗證手機號碼格式
const validateMobile = (mobile) => {
  const mobileRegex = /^09\d{8}$/;
  return mobileRegex.test(mobile);
};

const deleteAccount = async () => {
  // 清除之前的錯誤訊息
  errorMessage.value = "";
  
  // 驗證手機號碼格式
  if (!mobileInput.value.trim()) {
 
    showAlert.value = true;
    alertContent.value = "請輸入手機號碼";
    return;
  }
  
  if (!validateMobile(mobileInput.value.trim())) {
    showAlert.value = true;
    alertContent.value = "請輸入正確的手機號碼格式 (09xxxxxxxx)";
    return;
  }
  
  isLoading.value = true;
  
  try {
    const result = await callDeleteAccountAPI(mobileInput.value.trim());
    
    // 根據 API 回應處理結果
    if (result && result.Result === "OK") {
      // 手機號碼存在，顯示最終確認視窗
      showStep3.value = true;
      document.body.style.overflow = "hidden";
    } else if (result && result.Result === "ERROR") {
      // 查無此帳號
      showAlert.value = true;
      alertContent.value = "查無此手機號碼的帳號，請確認後重新輸入";
    } else {
      // 其他錯誤
      showAlert.value = true;
      alertContent.value = "驗證失敗，請稍後再試";
    }
  } catch (error) {
    console.error("刪除帳號驗證失敗:", error);
    showAlert.value = true;
    alertContent.value = "網路連線錯誤，請檢查網路後重試";
  } finally {
    isLoading.value = false;
  }
};

// 最終確認刪除帳號
const confirmDeleteAccount = async () => {
  isLoading.value = true;
  
  try {
    const result = await callDeleteAccountAPI(mobileInput.value.trim());
    
    if (result && result.Result === "OK") {
      // 刪除成功，清除本地資料並跳轉
      localStorage.removeItem("userData");
      showAlert.value = true;
      alertContent.value = "帳號已成功刪除";
      router.push("/");
    } else {
      showAlert.value = true;
      alertContent.value = "刪除失敗，請稍後再試";
    }
  } catch (error) {
    console.error("最終刪除失敗:", error);
    showAlert.value = true;
    alertContent.value = "刪除失敗，請稍後再試";
  } finally {
    isLoading.value = false;
    showStep3.value = false;
    document.body.style.overflow = "auto";
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/styles/mixins.scss";
.deleteConfirmWrap {
  width: 100%;
  padding: 0 3%;
  @include gradientBg();
  min-height: calc(120dvh + 140px);
  padding: 1rem 0;
  overflow: hidden;
  h2 {
    color: var(--Neutral-black, #1e1e1e);
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: var(--Static-Body-Large-Tracking, 0.5px);
  }

  .deleteConfirmContainer {
    width: 100%;
    padding: 1rem;

    .deleteConfirmAlert {
      border-radius: var(--Radius-r-20, 20px);
      background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
      padding: 0.5rem 0 1rem;
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      color: var(--Warning-hover, #d41c1c);
      text-align: center;
      font-size: var(--Text-font-size-24, 24px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.12px;
      p {
        color: var(--Warning-hover, #d41c1c);
        text-align: center;
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
        margin-top: 0.65rem;
      }
    }
    .deleteDataListGroup {
      margin-top: 1rem;
      h3 {
        color: var(--Neutral-black, #1e1e1e);

        font-size: var(--Text-font-size-20, 20px);
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 20px */
        letter-spacing: 3px;
      }
      .deleteDataListItem {
        border-radius: var(--Radius-r-20, 20px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        margin-top: 1rem;
        padding: 1rem;
        h4 {
          color: var(--Neutral-black, #1e1e1e);

          font-size: var(--Text-font-size-20, 20px);
          font-style: normal;
          font-weight: 400;

          letter-spacing: 0.1px;
        }
        p {
          color: var(--Neutral-500, #666);

          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;

          letter-spacing: 0.072px;
          margin-top: 0.3rem;
        }
      }
    }
  }

  .deleteConfirmContainer2 {
    width: 100%;
    padding: 1rem;
    p {
      color: var(--Neutral-black, #1e1e1e);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 700;

      letter-spacing: 3px;
    }
    input {
      border-radius: var(--Radius-r-16, 16px);
      background: var(--Secondary-100, #f5f7fa);
      box-shadow: 2px 4px 12px 0
        var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
      width: 100%;
      padding: 1rem 1rem;
      margin-top: 1rem;
      border: none;
      letter-spacing: 2.7px;
      font-size: var(--Text-font-size-18, 18px);
      &::placeholder {
        overflow: hidden;
        color: var(--neutral-500-opacity-70, rgba(102, 102, 102, 0.7));
        text-overflow: ellipsis;

        font-style: normal;
        font-weight: 400;

        letter-spacing: 2.7px;
      }
    }
  }
  .deleteConfirmBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin-top: 1rem;
    gap: 1rem;
  }
  .deleteConfirmBtnFixed {
    position: fixed;
    bottom: 112px;
    left: 5%;
    right: 0;
    z-index: 1000;
    width: 90%;
  }
  .deleteConfirmBtnCancel {
    width: 100%;
    padding: 0.25rem 1rem;

    background: var(--Secondary-100, #f5f7fa);
    border-radius: var(--Radius-r-50, 50px);

    border: 1px solid var(--Secondary-default, #1fbcb3);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
    color: var(--Secondary-default, #1fbcb3);

    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;

    letter-spacing: 2.7px;
  }
  .deleteConfirmBtnContinue {
    width: 100%;
    padding: 0.25rem 1rem;
    border-radius: var(--Radius-r-50, 50px);
    color: var(--Neutral-white, #fff);
    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
    background: var(--Warning-default, #ec4f4f);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
    border: 1px solid var(--Warning-default, #ec4f4f);
    
    &:disabled {
      background: var(--Neutral-300, #ccc);
      border-color: var(--Neutral-300, #ccc);
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
  .finalDeleteAlert {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    border-radius: 12px;
    width: 90%;
    border-radius: var(--Radius-r-20, 20px);
    background: var(--neutral-white-opacity-65, rgba(255, 255, 255, 0.65));
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
    backdrop-filter: blur(50px);
    padding: 1rem;
    z-index: 1001;
    p {
      color: var(--Neutral-black, #1e1e1e);
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 3px;
      line-height: 1.5;
    }
    .finalDeleteAlertBtn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
      .finalDeleteAlertCancel {
        width: 100%;
        border: none;
        background: transparent;
        color: var(--Neutral-400, #b3b3b3);
        text-align: center;
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 700;
        letter-spacing: 2.7px;
      }
      .finalDeleteAlertContinue {
        width: 100%;
        border-radius: var(--Radius-r-8, 8px);
        background: var(--Warning-default, #ec4f4f);
        color: var(--Neutral-white, #fff);
        text-align: center;
        font-family: "Noto Sans";
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 18px */
        letter-spacing: 2.7px;
        border: none;
        padding: 0.75rem 1rem;
        
        &:disabled {
          background: var(--Neutral-300, #ccc);
          cursor: not-allowed;
          opacity: 0.6;
        }
      }
    }
  }
  
  .error-message {
    color: var(--Warning-default, #ec4f4f);
    font-size: var(--Text-font-size-16, 16px);
    font-weight: 400;
    margin-top: 0.5rem;
    text-align: center;
  }
  
  .deleteCover {
    background: rgba(217, 217, 217, 0.5);
    backdrop-filter: blur(2.5px);
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 11;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;

  }
}
</style>
