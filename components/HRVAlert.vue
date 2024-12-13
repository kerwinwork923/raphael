<template>
  <div v-if="store.showHRVAlert" class="cover"></div>
  <div v-if="store.showHRVAlert" class="HRVAlert">
    <img
      v-if="showCloseButton"
      class="HRVAlertClose"
      @click="handleCloseHRVAlert"
      src="/assets/imgs/selectClose.svg"
      alt=""
    />
    <h3>智平衡健康集團提醒事項</h3>
    <ul>
      <li>
        測量過程長<span class="point">約60秒</span
        >，量測過程中，勿晃動、交談、故意憋氣或勿深呼吸/腹式呼吸等。
      </li>
      <li>量測地點最好是獨立空間，避免有吵雜環境與干擾。</li>
      <li>
        為了獲得最佳測量結果，請在光線充足、無干擾的環境中進行測量，並保持穩定，確保臉部全程位於畫面中。
      </li>
      <li>完成後網頁會自行跳轉至「檢測結果」頁面。</li>
      <li>
        Raphael檢測心跳、心率變異率、血壓、血氧、呼吸、壓力指數相關資訊，僅為一般保健用途，非醫療目的而設計。請勿根據此資訊診斷或調整藥物，應依照醫師的指示和規定。
      </li>
      <li>
        受測後應適度自我身心舒壓與調整生活型態。若有疑問可諮詢相關專業服務人士。
      </li>
      <li>
        Raphael不對因使用本平台測量結果所引發的健康或法律問題負責。請在進行任何健康決策前，諮詢專業醫療人員。
      </li>
    </ul>
    <button class="HRVAlertBtn" @click="convertAndSaveUserData">確定</button>
  </div>
</template>

<script>
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

    const handleCloseHRVAlert = () => {
      store.showHRVAlert = false;
    };

    const calculateAge = (birthday) => {
      const [year, month, day] = birthday.split("/").map(Number);
      const currentYear = new Date().getFullYear();
      return currentYear - (1911 + year); // Adjust for ROC year format
    };

    const convertAndSaveUserData = async () => {
      const localData = JSON.parse(localStorage.getItem("userData"));

      if (!localData) {
        alert("尚未登入。");
        handleCloseHRVAlert();
        return;
      }

      const isInteger = (value) => Number.isInteger(parseInt(value, 10));

      if (!isInteger(localData.Height) || parseInt(localData.Height) <= 0) {
        alert("您的身高格式不正確，請修改會員資料");
        window.location.href = "/changeMember";

        return;
      }

      if (!isInteger(localData.Weight) || parseInt(localData.Weight) <= 0) {
        alert("您的體重格式不正確，請修改會員資料");
        window.location.href = "/changeMember";

        return;
      }

      const birthdayParts = localData.Birthday.split("/");
      if (
        birthdayParts.length !== 3 ||
        parseInt(birthdayParts[0]) <= 0 || // 年份檢查
        parseInt(birthdayParts[1]) < 1 || // 月份檢查
        parseInt(birthdayParts[1]) > 12 || // 月份上限檢查
        parseInt(birthdayParts[2]) < 1 || // 日期下限檢查
        parseInt(birthdayParts[2]) > 31 || // 日期上限檢查
        isNaN(calculateAge(localData.Birthday)) // 年齡計算有效性檢查
      ) {
        alert("生日格式不正確或包含無效日期，請修改會員資料。");

        window.location.href = "/changeMember";
        return;
      }

      let scanAge = parseInt(localData.Sex);
      if (scanAge !== 1 && scanAge !== 2 && scanAge !== 0) {
        alert("性別格式不正確，請修改會員資料。");
        window.location.href = "/changeMember";

        return;
      }
      if (scanAge == "2") {
        scanAge = 0;
      }

      // DSPR 檢查 - 判斷是否為預期的三個值之一
      const validDSPRValues = ["normal", "prehypertension", "hypertension"];
      if (!validDSPRValues.includes(localData.DSPR)) {
        // alert("請選擇有效的血壓範圍。");
        store.showDSPRSelect = true; // 顯示選擇彈窗
        handleCloseHRVAlert();
        return;
      }

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

      sessionStorage.setItem("data", JSON.stringify(convertedData));
      const detectUID = store.detectUID;
      const detectFlag = store.detectFlag;
      const detectForm = store.detectForm;
      let redirectUrl = "/vital/scan.html";

      if (detectFlag) {
        redirectUrl += `?UID=${detectUID}&flag=${detectFlag}&form=${detectForm}`;
      }

      window.location.href = redirectUrl;
    };

    return {
      store,
      handleCloseHRVAlert,
      convertAndSaveUserData,
    };
  },
};
</script>

<style lang="scss">
.cover {
  position: fixed;
  left: 0;
  top: 0;

  width: 100%;
  height: 100vh;
  z-index: 102;
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
}
.HRVAlert {
  display: grid;
  gap: 1rem;
  width: 90%;

  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  z-index: 1000;
  border-radius: 12px;
  background: var(--Grays-White, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  max-width: 648px;
  padding: 0.75rem;
  .HRVAlertClose {
    width: 24px;
    height: 24px;
    cursor: pointer;
    place-self: end;
  }
  h3 {
    text-align: center;
    color: $raphael-green-400;
    font-weight: bold;
    letter-spacing: 0.12px;
    font-size: 1.5rem;
  }
  ul {
    display: grid;
    gap: 0.75rem;
    height: 45vh;
    padding-top: 0.75rem;
    border-top: 1px solid #1e1e1e;
    list-style: disc;
    overflow-x: scroll;
    li {
      margin-left: 1.5rem;
      color: #666;
      font-size: 18px;
      letter-spacing: 4px;
      line-height: 29.1px;
      .point {
        color: #ec4f4f;
      }
    }
    li::marker {
      color: #666;
    }
  }
  .HRVAlertBtn {
    background-color: $raphael-green-400;
    border: none;
    color: #fff;
    cursor: pointer;
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    font-size: 1.125rem;
    font-weight: 400;
    letter-spacing: 0.09px;
    transition: all 0.3s ease;
    &:hover {
      background-color: $raphael-green-500;
    }
  }
}
</style>
