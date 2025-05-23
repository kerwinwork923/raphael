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
        測量時間<span class="point">約1分鐘</span>。測量時請保持安靜與穩定，避免晃動、交談、憋氣或深呼吸。
      </li>
      <li>建議在<span class="point">光線充足、安靜無干擾</span>的獨立空間進行測量，並確保全程臉部位於畫面中。</li>
      <li>測量結束後，網頁會自動跳轉至 「檢測結果」頁面。</li>
      <li>
        本工具提供的心跳、心率變異率、血壓、血氧、呼吸與壓力指數等資訊，僅供保健參考，不具醫療診斷用途。請勿依據本數據自行診斷或調整藥物，應遵循醫師指示。
      </li>
      <li>
        本工具不對因測量結果引發的健康或法律問題負責，請於做出任何健康決策前，諮詢醫療專業人員。
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
    @include btnStyle($raphael-green-400,$raphael-white);
  }
}
</style>
