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
    <div class="disclaimer">
      數據僅供健康參考，無醫療診斷效力，請勿自行解讀或調藥，應諮詢醫師
    </div>
    <ul>
      <li>
        智平衡AI穿戴紀錄系統透過非接觸式人臉HRV量測（rPPG），推估使用者自律神經、疲勞、血管壓力與心情緊繃狀態，並提供即時個人化健康建議。
      </li>
      <li>
        系統同步紀錄保健衣穿戴時間與頻率，協助醫師掌握身體變化，優化刺激點配置。所蒐集數據亦將用於AI模型持續優化，使系統更精準。
      </li>
      <li>
        測量僅需<span class="point">20秒</span
        >，請保持穩定、安靜、全程臉部入鏡。
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
      let redirectUrl = "/HRV";

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

  .disclaimer {
    font-size: 1.5rem;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid $raphael-red-300;
    color: $raphael-red-300;
    text-align: justify;
    line-height: 1.3em;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 40vh;
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
}
</style>
