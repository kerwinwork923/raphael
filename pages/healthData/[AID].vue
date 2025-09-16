<template>
  <RaphaelLoading v-if="loading" />
  <div class="healthData">
    <Alert
      :showRedirectButton="false"
      :defaultContent="alertMessage"
      redirectTarget="/HRVHistoryAll"
      @close="handleClose"
      v-if="alertVisable === true"
    />
    <TitleMenu Text="健康數據" link="back" />
    <h3 class="healthDataContentTitle">請輸入手環上的健康數據</h3>
    <div class="healthDataContent">
      <div class="healthDataForm">
        <div class="ageGroup">
          <img class="icon1" src="../../assets/imgs/healthDataAge.svg" alt="" />
          <select
            v-model="age"
            :class="['custom-select', { 'has-value': isSelected }]"
          >
            <option value="" disabled selected hidden>請選擇生理年齡</option>
            <option value="1~5">1~5歲</option>
            <option value="6~10">6~10歲</option>
            <option value="11~15">11~15歲</option>
            <option value="16~20">16~20歲</option>
            <option value="21~25">21~25歲</option>
            <option value="26~30">26~30歲</option>
            <option value="31~35">31~35歲</option>
            <option value="36~40">36~40歲</option>
            <option value="41~45">41~45歲</option>
            <option value="46~50">46~50歲</option>
            <option value="51~55">51~55歲</option>
            <option value="56~60">56~60歲</option>
            <option value="61~65">61~65歲</option>
            <option value="66~70">66~70歲</option>
            <option value="71~75">71~75歲</option>
            <option value="76~80">76~80歲</option>
            <option value="81~85">81~85歲</option>
            <option value="86~90">86~90歲</option>
            <option value="91~95">91~95歲</option>
            <option value="96~100">96~100歲</option>
          </select>
          <img class="icon2" src="../../assets/imgs/arrowDown.svg" />
        </div>
        <div class="heartBeatGroup">
          <img
            class="icon1"
            src="../../assets/imgs/healthDataHeartBeat.svg"
            alt=""
          />
          <input type="text" placeholder="請輸入平均心率" v-model="heartBeat" />
        </div>
        <div class="heartSDNNGroup">
          <img
            class="icon1"
            src="../../assets/imgs/healthDataHeartRate.svg"
            alt=""
          />
          <input type="text" placeholder="請輸入您的SDNN" v-model="SDNN" />
        </div>
        <div class="heartRMSSDGroup">
          <img
            class="icon1"
            src="../../assets/imgs/healthDataHeartRate.svg"
            alt=""
          />
          <input type="text" placeholder="請輸入您的RMSSD" v-model="RMSSD" />
        </div>
        <div class="heartSNSGroup">
          <img class="icon1" src="../../assets/imgs/healthDataSNS.svg" alt="" />
          <input type="text" placeholder="請輸入您交感神經數值" v-model="SNS" />
        </div>
        <div class="heartPNSroup">
          <img class="icon1" src="../../assets/imgs/healthDataPNS.svg" alt="" />
          <input
            type="text"
            placeholder="請輸入您副交感神經數值"
            v-model="PNS"
          />
        </div>

        <div class="heartCommonGroup">
          <img class="icon1" src="../../assets/imgs/healthDataR.svg" alt="" />
          <input
            type="text"
            placeholder="選擇您的血壓計測量手"
            v-model="BPHand"
          />
        </div>
        <div class="heartCommonGroup">
          <img class="icon1" src="../../assets/imgs/healthDataR.svg" alt="" />
          <input
            type="text"
            placeholder="請輸入您的血壓計收縮壓"
            v-model="MSBP"
          />
        </div>
        <div class="heartCommonGroup">
          <img class="icon1" src="../../assets/imgs/healthDataR.svg" alt="" />
          <input
            type="text"
            placeholder="請輸入您的血壓計舒張壓"
            v-model="MDBP"
          />
        </div>
        <div class="heartCommonGroup">
          <img class="icon1" src="../../assets/imgs/healthDataR.svg" alt="" />
          <input type="text" placeholder="請輸入您的血壓計心率" v-model="MHR" />
        </div>
      </div>
    </div>
    <div class="healthDataBtnGroup">
      <button @click="handleHealthData">送出</button>
    </div>
  </div>
</template>

<style lang="scss">
.healthData {
  background-color: $raphael-gray-100;
  height: 100vh;
  padding: 0 1rem;
  .healthDataContentTitle {
    color: #1e1e1e;
    
    font-size: 20px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: 0.15px;
    margin-top: 1rem;
  }
  .healthDataContent {
    background-color: $raphael-white;
    border-radius: 1rem;
    padding: 1rem;
    margin-top: 1rem;
    height: calc(100vh - 217px);
    overflow-y: scroll;
  }
  .custom-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: url("../assets/imgs/arrow-down.svg") no-repeat right 10px center;
    background-size: 12px;
    color: $raphael-gray-300;
    font-size: 1.2rem;

    padding-left: 36px;
    padding-bottom: 12px;
    padding-top: 16px;

    &.has-value {
      color: $raphael-black; // 選擇後變為黑色
    }
  }

  option {
    color: $raphael-black; // 選項字體保持非灰色
  }
  .custom-select.selected {
    color: $raphael-black;
  }
  .ageGroup {
    display: flex;
    position: relative;
    width: 100%;
    margin-bottom: 0.5rem;
    .icon1 {
      position: absolute;
      top: 50%;
      left: 2px;
      transform: translateY(-50%);
      z-index: 2;
    }
    .icon2 {
      position: absolute;
      top: 50%;
      right: 2px;
      transform: translateY(-50%);
      z-index: 1;
      width: 18px;
    }
    select {
      outline: none;
      border: none;
      padding-left: 36px;
      padding-bottom: 16px;
      padding-top: 16px;
      font-size: 1.2rem;
      width: 100%;
      border-bottom: 1px solid $raphael-gray-300;
      appearance: none;
      color: $raphael-gray-300;
      font-family: Inter;
      font-size: 1.2rem;

      &::placeholder {
        color: $raphael-gray-300;
        font-family: Inter;
        font-size: 1.2rem;
        font-weight: 400;
      }

      &::-ms-expand {
        display: none;
      }
    }
  }

  .heartBeatGroup,
  .heartRateGroup,
  .heartSDNNGroup,
  .heartRMSSDGroup,
  .heartSNSGroup,
  .heartPNSroup,
  .heartCommonGroup {
    position: relative;
    margin-bottom: 1rem;

    .icon1 {
      position: absolute;
      top: 50%;
      left: 2px;
      transform: translateY(-50%);
      z-index: 2;
    }

    .icon2 {
      position: absolute;
      top: 50%;
      right: 2px;
      transform: translateY(-50%);
      width: 18px;
      z-index: 1;
    }
  }

  .healthDataBtnGroup {
    margin-top: 1rem;
    button {
      background-color: $raphael-green-400;
      border: none;
      padding: 8px;
      color: #fff;
      width: 100%;
      border-radius: 0.5rem;

      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
    }
  }

  input[type="text"],
  input[type="password"],
  input[type="number"],
  input[type="email"] {
    outline: none;
    border: none;
    border-bottom: 1px solid $raphael-gray-300;
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 12px;
    padding-top: 16px;
    color: $raphael-black;
    &::placeholder {
      color: $raphael-gray-300;
      font-family: Inter;
      font-size: 1.2rem;
      font-weight: 400;
    }
  }
}
</style>
<script>
import { useRouter } from "vue-router";
import axios from "axios";
import { ref, computed, onMounted } from "vue";
import { useSeo } from "~/composables/useSeo";

export default {
  setup() {
    useSeo({
      title: "",
      description:
        "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
      url: "https://neuroplus.com.tw",
    });
    const router = useRouter(); // 使用路由
    const age = ref("");
    const isSelected = computed(() => age.value !== "");
    const heartBeat = ref("");
    const SDNN = ref("");
    const RMSSD = ref("");
    const SNS = ref("");
    const PNS = ref("");
    const BPHand = ref(""); // 左右手
    const MSBP = ref(""); // 機器收縮壓
    const MDBP = ref(""); // 機器舒張壓
    const MHR = ref(""); // 機器心跳

    const loading = ref(false);

    const alertVisable = ref(false);
    const alertMessage = ref("");
    const AID = ref(router.currentRoute.value.params.AID || "");

    // 從 localStorage 取出用戶資料
    const localData = localStorage.getItem("userData");
    if (!localData) {
      alertVisable.value = true;
      alertMessage.value = "用戶資料不存在，請重新登入！";
      router.push("/");
      return;
    }

    const { MID, Token, MAID, Mobile } = JSON.parse(localData);
    if (!MID || !Token || !MAID || !Mobile ) {
      alertVisable.value = true;
      alertMessage.value = "用戶資料不完整，請重新登入！";
      router.push("/");
      return;
    }

    // **從 API 獲取 HRV 詳情**
    const API_HRV3Detail = async () => {
      try {
        loading.value = true;
        const response = await axios.post(
          "https://23700999.com:8081/HMA/api/fr/HRV3Detail",
          {
            MID,
            Token,
            MAID,
            Mobile,
            AID: router.currentRoute.value.params.AID || "",
          }
        );

        console.log("API 回傳的 HRV 數據:", response.data);

        if (response.status === 200) {
          const data = response.data|| {};
          age.value = data.ltage || "";
          heartBeat.value = data.ltHR || "";
          SDNN.value = data.ltSDNN || "";
          RMSSD.value = data.ltRMSSD || "";
          SNS.value = data.ltLF || "";
          PNS.value = data.ltHF || "";

          // 確保這 4 個欄位有值
          BPHand.value = data.BPHand || "";
          MSBP.value = data.MSBP || "";
          MDBP.value = data.MDBP || "";
          MHR.value = data.MHR || "";
        } else {
          throw new Error("伺服器返回非預期結果。");
        }
      } catch (err) {
        console.error("API Error:", err);
        alertVisable.value = true;
        alertMessage.value = "無法獲取健康數據，請稍後重試。";
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      API_HRV3Detail(); // 初始化請求
    });

    // **提交健康數據**
    const handleHealthData = async () => {
      if (!age.value || !heartBeat.value || !SDNN.value || !RMSSD.value) {
        alertVisable.value = true;
        alertMessage.value = "請填寫所有必填欄位！";
        return;
      }

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/api/fr/HRV3Update",
          {
            MID,
            Token,
            MAID,
            Mobile,
            AID: AID.value || "",
            ltage: age.value,
            ltLF: SNS.value,
            ltHF: PNS.value,
            ltHR: heartBeat.value,
            ltSDNN: SDNN.value,
            ltRMSSD: RMSSD.value,
            BPHand: BPHand.value,
            MSBP: MSBP.value,
            MDBP: MDBP.value,
            MHR: MHR.value,
          }
        );

        if (response.status === 200) {
          alertVisable.value = true;
          alertMessage.value = "已成功提交健康數據，請繼續保持健康生活！";
        } else {
          throw new Error("提交失敗，伺服器返回非預期結果。");
        }
      } catch (err) {
        console.error("API Error:", err);
        alertVisable.value = true;
        alertMessage.value =
          err.response?.data?.message || "提交數據時發生錯誤，請稍後重試。";
      }
    };

    const handleClose = () => {
      alertVisable.value = false;
      if (window.history.length > 1) {
        router.back(); // 使用 router.back() 返回上一頁
      } else {
        router.push("/user"); // 如果沒有上一頁，跳轉到默認頁
      }
    };

    return {
      age,
      heartBeat,
      SDNN,
      RMSSD,
      SNS,
      PNS,
      handleHealthData,
      alertVisable,
      alertMessage,
      handleClose,
      isSelected,
      loading,
      BPHand,
      MSBP,
      MDBP,
      MHR,
    };
  },
};
</script>
