<template>
  <div v-if="store.showHRVForUseAlert" class="cover"></div>
  <div v-if="store.showHRVForUseAlert" class="HRVAlert">
    <img
      v-if="showHRVForUseAlert"
      class="HRVAlertClose"
      @click="handleCloseHRVAlert"
      src="/assets/imgs/selectClose.svg"
      alt="close"
    />
    <h3>{{ store.HRVAlertTitle }}</h3>

    <ul>
      <li>
        測量時間<span class="point">約1分鐘</span
        >。測量時請保持安靜與穩定，避免晃動、交談、憋氣或深呼吸。
      </li>
      <li>
        建議在<span class="point">光線充足、安靜無干擾</span
        >的獨立空間進行測量，並確保全程臉部位於畫面中。
      </li>
      <li>測量結束後，網頁會自動跳轉至 「檢測結果」頁面。</li>
      <li>
        本工具提供的心跳、心率變異率、血壓、血氧、呼吸與壓力指數等資訊，僅供保健參考，不具醫療診斷用途。請勿依據本數據自行診斷或調整藥物，應遵循醫師指示。
      </li>
      <li>
        本工具不對因測量結果引發的健康或法律問題負責，請於做出任何健康決策前，諮詢醫療專業人員。
      </li>
    </ul>

    <div class="HRVAlertForUseBtnGroup">
      <!-- 「放棄」按鈕 → 帶參數 "abandon" -->
      <button
        class="HRVAlertBtn HRVAlertBtnAbandon"
        @click="convertAndSaveUserData('abandon')"
      >
        放棄
      </button>

      <!-- 「確定」按鈕 → 帶參數 "confirm" -->
      <button class="HRVAlertBtn" @click="convertAndSaveUserData('confirm')">
        確定
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { useCommon } from "@/stores/common";

export default {
  props: {
    showCloseButton: {
      type: Boolean,
      default: true,
    },
  },
  setup() {
    const store = useCommon();
    // ✅ 先定義或宣告 apiRequest
    const apiRequest = async (url, payload) => {
      try {
        const response = await axios.post(url, payload);
        return response.data;
      } catch (error) {
        console.error("API Request Error:", error);
        throw error;
      }
    };
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
    // 關閉彈窗
    const handleCloseHRVAlert = () => {
      store.showHRVForUseAlert = false;
    };

    // 計算西元年齡
    const calculateAge = (birthday) => {
      const [year, month, day] = birthday.split("/").map(Number);
      const currentYear = new Date().getFullYear();
      return currentYear - (1911 + year); // 民國年轉西元年
    };

    // ======= 單一方法：包含「放棄」與「確定」兩種行為 =======
    const convertAndSaveUserData = async (action) => {
      // (A) 如果使用者點擊了「放棄」
      if (action === "abandon") {
        await handleAbandon();
        handleCloseHRVAlert();
        location.reload();
        return; // 直接結束，不往下執行「確定」的邏輯
      }

      // (B) 使用者點擊「確定」 → 執行原有檢查與測量流程
      const localData = JSON.parse(localStorage.getItem("userData"));
      if (!localData) {
        alert("尚未登入。");
        handleCloseHRVAlert();
        return;
      }

      // 1) 檢查身高
      const isInteger = (value) => Number.isInteger(parseInt(value, 10));
      if (!isInteger(localData.Height) || parseInt(localData.Height) <= 0) {
        alert("您的身高格式不正確，請修改會員資料");
        window.location.href = "/changeMember";
        return;
      }

      // 2) 檢查體重
      if (!isInteger(localData.Weight) || parseInt(localData.Weight) <= 0) {
        alert("您的體重格式不正確，請修改會員資料");
        window.location.href = "/changeMember";
        return;
      }

      // 3) 檢查生日
      const birthdayParts = localData.Birthday.split("/");
      if (
        birthdayParts.length !== 3 ||
        parseInt(birthdayParts[0]) <= 0 ||
        parseInt(birthdayParts[1]) < 1 ||
        parseInt(birthdayParts[1]) > 12 ||
        parseInt(birthdayParts[2]) < 1 ||
        parseInt(birthdayParts[2]) > 31 ||
        isNaN(calculateAge(localData.Birthday))
      ) {
        alert("生日格式不正確或包含無效日期，請修改會員資料。");
        window.location.href = "/changeMember";
        return;
      }

      // 4) 檢查性別
      let scanAge = parseInt(localData.Sex);
      if (scanAge !== 1 && scanAge !== 2 && scanAge !== 0) {
        alert("性別格式不正確，請修改會員資料。");
        window.location.href = "/changeMember";
        return;
      }
      if (scanAge === 2) {
        scanAge = 0; // 後端若以 0 表示女性，可依需求
      }

      // 5) 檢查高血壓分組
      const validDSPRValues = ["normal", "prehypertension", "hypertension"];
      if (!validDSPRValues.includes(localData.DSPR)) {
        store.showDSPRSelect = true; // 顯示選擇彈窗
        handleCloseHRVAlert();
        return;
      }

      // 6) 組裝要傳給 /vital/scan.html 的參數
      const convertedData = {
        age: calculateAge(localData.Birthday),
        bp_group: localData.DSPR,
        bp_mode: "ternary",
        facing_mode: "user",
        height: parseInt(localData.Height),
        sex: scanAge,
        weight: parseInt(localData.Weight),
        time: parseInt(localData.HRVCalTime) || 2,
      };

      // 存到 sessionStorage
      sessionStorage.setItem("data", JSON.stringify(convertedData));

      // 7) 根據 store 參數做跳轉
      const detectUID = store.detectUID;
      const detectFlag = store.detectFlag; // "1"=前測, "2"=後測
      const detectForm = store.detectForm;

      let redirectUrl = "/vital/scan.html";
      if (detectFlag) {
        redirectUrl += `?UID=${detectUID}&flag=${detectFlag}&form=${detectForm}`;
      }

      window.location.href = redirectUrl;
    };

    // 只示範「放棄」部分
    // 其餘部分(如計時、會員檢查)維持原本邏輯
    const handleAbandon = async () => {
      const isSure = confirm("確定要放棄嗎？");
      if (!isSure) return;

      // 根據 detectFlag 判斷要放棄前測 or 後測
      let beforeFlag = "N";
      let afterFlag = "N";
      if (store.detectFlag === "1") {
        beforeFlag = "Y"; // 放棄前測
      } else if (store.detectFlag === "2") {
        afterFlag = "Y"; // 放棄後測
      }

      try {
        // 改用 "API_Use_Set_Abandon.jsp"
        const payload = {
          MID,
          Token,
          MAID,
          Mobile,
          UID: store.detectUID,
          BeforeHRVAbandon: beforeFlag,
          AfterHRVAbandon: afterFlag,
        };
        const response = await apiRequest(
          "https://23700999.com:8081/HMA/API_Use_Set_Abandon.jsp",
          payload
        );

        console.log("✅ 放棄成功", response);

        // 後續：是否關閉彈窗
        // store.showHRVAlert = false;
      } catch (error) {
        console.error("❌ 放棄失敗：", error);
      }
    };

    return {
      store,
      handleCloseHRVAlert,
      convertAndSaveUserData,
    };
  },
};
</script>

<style lang="scss" scoped>
.cover {
  @include coverbg();
}
.HRVAlert {
  @include alertStyle();

  ul {
    display: grid;
    gap: 0.75rem;
    height: 45vh;
    padding-top: 0.75rem;
    border-top: 1px solid $raphael-black;
    list-style: disc;
    overflow-x: scroll;
    @include scrollbarStyle();
    li {
      margin-left: 1.5rem;
      color: $raphael-gray-500;
      font-size: 18px;
      letter-spacing: 4px;
      line-height: 29.1px;
      .point {
        color: $raphael-red-300;
      }
    }
    li::marker {
      color: $raphael-gray-500;
    }
  }
  .HRVAlertBtn {
    @include btnStyle($raphael-green-400, $raphael-white);
  }
  .HRVAlertBtnAbandon {
    background-color: #ec4f4f;
  }
}
.HRVAlertForUseBtnGroup {
  display: flex;
  gap: 1rem;
}
</style>
