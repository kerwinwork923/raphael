<template>
  <div class="usageHRVResultWrap">
    <h1>結果分析</h1>

    <!-- 總共使用 xx 分鐘 -->
    <div class="thxGroup">
      <div class="textGroup">
        <h3 class="nameText">總共使用 {{ totalUsedMin }} 分鐘</h3>
      </div>
      <div class="imgGroup">
        <img src="/assets/imgs/doctor_nocomment.png" class="doctorImg" alt="" />
      </div>
    </div>

    <!-- (如有需要) 生理年齡圖表 -->
    <div class="resultChartGroup">
      <h2>生理年齡</h2>
      <ResultChart v-if="listBioage.length > 0" :bioageData="listBioage" />
    </div>

    <!-- 時間區塊 -->
    <div class="resultTimeGroup">
      <div class="leftHintGroup">
        <div class="resultHint"></div>
        <div class="resultHint"></div>
        <div class="resultHint"></div>
        <div class="resultHint"></div>
      </div>
      <div class="hintContentGroup">
        <!-- 開始時間 -->
        <div class="hintContent">
          <div class="hintContentIcon">
            <img src="../../assets/imgs/hrvUsageResult/play.svg" alt="" />
          </div>
          <div class="hintText">
            <h5>開始時間</h5>
            {{ formatTime(startTime) || "-" }}
          </div>
        </div>

        <!-- (使用前)HRV檢測 -->
        <div class="hintContent">
          <div class="hintContentIcon">
            <img
              src="../../assets/imgs/hrvUsageResult/hrvResultFace.svg"
              alt=""
              @click="handleWatchClick(HRVBeforeData)"
            />
          </div>
          <div class="hintText">
            <h5>(使用前)HRV檢測</h5>
            {{ beforeHRVTime || "-" }}
          </div>
        </div>

        <!-- 結束時間 -->
        <div class="hintContent">
          <div class="hintContentIcon">
            <img src="../../assets/imgs/hrvUsageResult/stop.svg" alt="" />
          </div>
          <div class="hintText">
            <h5>結束時間</h5>
            {{ formatTime(endTime) || "-" }}
          </div>
        </div>

        <!-- (使用後)HRV檢測 -->
        <div class="hintContent">
          <div class="hintContentIcon">
            <img
              src="../../assets/imgs/hrvUsageResult/hrvResultFace.svg"
              alt=""
              @click="handleWatchClick(HRVAfterData)"
            />
          </div>
          <div class="hintText">
            <h5>(使用後)HRV檢測</h5>
            {{ afterHRVTime || "-" }}
          </div>
        </div>
      </div>
    </div>

    <!-- 整體結果卡片區 (健康數據) -->
    <div class="BAGroup">
      <h2>健康數據</h2>

      <!-- 生理年齡 -->
      <div class="BACard">
        <div class="titleGroup">
          <img src="/assets/imgs/HRVFaceSmall.svg" alt="" />
          <h3>生理年齡</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{
                HRVBeforeData?.bioage != null
                  ? `${HRVBeforeData.bioage - 5}~${HRVBeforeData.bioage}`
                  : "-"
              }}
            </div>
            <div class="unit">years old</div>
          </div>
          <!-- 箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.8536 4.35355C17.0488 4.15829 17.0488 3.84171 16.8536 3.64645L13.6716 0.464466C13.4763 0.269204 13.1597 0.269204 12.9645 0.464466C12.7692 0.659728 12.7692 0.976311 12.9645 1.17157L15.7929 4 12.9645 6.82843C12.7692 7.02369 12.7692 7.34027 12.9645 7.53553C13.1597 7.7308 13.4763 7.7308 13.6716 7.53553L16.8536 4.35355ZM0.5 4.5H16.5V3.5H0.5V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{
                HRVAfterData?.bioage != null
                  ? `${HRVAfterData.bioage - 5}~${HRVAfterData.bioage}`
                  : "-"
              }}
            </div>
            <div class="unit">years old</div>
          </div>
        </div>
      </div>

      <!-- 心律變異性 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/heartRateSmall.svg" alt="" />
          <h3>心律變異性</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{
                HRVBeforeData?.HRV != null
                  ? Math.round(HRVBeforeData.HRV * 10) / 10
                  : "-"
              }}
            </div>
            <div class="unit">ms</div>
          </div>
          <!-- 箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.8536 4.35355C17.0488 4.15829 17.0488 3.84171 16.8536 3.64645L13.6716 0.464466C13.4763 0.269204 13.1597 0.269204 12.9645 0.464466C12.7692 0.659728 12.7692 0.976311 12.9645 1.17157L15.7929 4 12.9645 6.82843C12.7692 7.02369 12.7692 7.34027 12.9645 7.53553C13.1597 7.7308 13.4763 7.7308 13.6716 7.53553L16.8536 4.35355ZM0.5 4.5H16.5V3.5H0.5V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{
                HRVAfterData?.HRV != null
                  ? Math.round(HRVAfterData.HRV * 10) / 10
                  : "-"
              }}
            </div>
            <div class="unit">ms</div>
          </div>
        </div>
      </div>

      <!-- 心率 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/heartBeatSmall.svg" alt="" />
          <h3>心率</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.HR ?? "-" }}
            </div>
            <div class="unit">bpm</div>
          </div>
          <!-- 箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.8536 4.35355C17.0488 4.15829 17.0488 3.84171 16.8536 3.64645L13.6716 0.464466C13.4763 0.269204 13.1597 0.269204 12.9645 0.464466C12.7692 0.659728 12.7692 0.976311 12.9645 1.17157L15.7929 4 12.9645 6.82843C12.7692 7.02369 12.7692 7.34027 12.9645 7.53553C13.1597 7.7308 13.4763 7.7308 13.6716 7.53553L16.8536 4.35355ZM0.5 4.5H16.5V3.5H0.5V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.HR ?? "-" }}
            </div>
            <div class="unit">bpm</div>
          </div>
        </div>
      </div>

      <!-- 血壓 -->
      <div class="BACard">
        <div class="titleGroup">
          <img src="/assets/imgs/bloodPressure.svg" alt="" />
          <h3>血壓</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{
                HRVBeforeData?.SBP != null && HRVBeforeData?.DBP != null
                  ? `${HRVBeforeData.SBP}/${HRVBeforeData.DBP}`
                  : "-"
              }}
            </div>
            <div class="unit">mmHg</div>
          </div>
          <!-- 箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.8536 4.35355C17.0488 4.15829 17.0488 3.84171 16.8536 3.64645L13.6716 0.464466C13.4763 0.269204 13.1597 0.269204 12.9645 0.464466C12.7692 0.659728 12.7692 0.976311 12.9645 1.17157L15.7929 4 12.9645 6.82843C12.7692 7.02369 12.7692 7.34027 12.9645 7.53553C13.1597 7.7308 13.4763 7.7308 13.6716 7.53553L16.8536 4.35355ZM0.5 4.5H16.5V3.5H0.5V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{
                HRVAfterData?.SBP != null && HRVAfterData?.DBP != null
                  ? `${HRVAfterData.SBP}/${HRVAfterData.DBP}`
                  : "-"
              }}
            </div>
            <div class="unit">mmHg</div>
          </div>
        </div>
        <span class="waiting">血壓值為演算法估計值，個人效正模式優化中...</span>
      </div>

      <!-- 血氧 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/spo2Small.svg" alt="" />
          <h3>血氧</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.SPO2 ?? "-" }}
            </div>
            <div class="unit">SpO2%</div>
          </div>
          <!-- 箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.8536 4.35355C17.0488 4.15829 17.0488 3.84171 16.8536 3.64645L13.6716 0.464466C13.4763 0.269204 13.1597 0.269204 12.9645 0.464466C12.7692 0.659728 12.7692 0.976311 12.9645 1.17157L15.7929 4 12.9645 6.82843C12.7692 7.02369 12.7692 7.34027 12.9645 7.53553C13.1597 7.7308 13.4763 7.7308 13.6716 7.53553L16.8536 4.35355ZM0.5 4.5H16.5V3.5H0.5V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.SPO2 ?? "-" }}
            </div>
            <div class="unit">SpO2%</div>
          </div>
        </div>
      </div>

      <!-- 呼吸 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/breathSmall.svg" alt="" />
          <h3>呼吸</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.rr ?? "-" }}
            </div>
            <div class="unit">bpm</div>
          </div>
          <!-- 箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.8536 4.35355C17.0488 4.15829 17.0488 3.84171 16.8536 3.64645L13.6716 0.464466C13.4763 0.269204 13.1597 0.269204 12.9645 0.464466C12.7692 0.659728 12.7692 0.976311 12.9645 1.17157L15.7929 4 12.9645 6.82843C12.7692 7.02369 12.7692 7.34027 12.9645 7.53553C13.1597 7.7308 13.4763 7.7308 13.6716 7.53553L16.8536 4.35355ZM0.5 4.5H16.5V3.5H0.5V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.rr ?? "-" }}
            </div>
            <div class="unit">bpm</div>
          </div>
        </div>
      </div>

      <!-- 壓力 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/pressureSmall.svg" alt="" />
          <h3>壓力</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.stress ?? "-" }}
            </div>
            <div class="pressureLevel">
              {{ getPressureLevel(HRVBeforeData?.stress) }}
            </div>
          </div>
          <!-- 箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.8536 4.35355C17.0488 4.15829 17.0488 3.84171 16.8536 3.64645L13.6716 0.464466C13.4763 0.269204 13.1597 0.269204 12.9645 0.464466C12.7692 0.659728 12.7692 0.976311 12.9645 1.17157L15.7929 4 12.9645 6.82843C12.7692 7.02369 12.7692 7.34027 12.9645 7.53553C13.1597 7.7308 13.4763 7.7308 13.6716 7.53553L16.8536 4.35355ZM0.5 4.5H16.5V3.5H0.5V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.stress ?? "-" }}
            </div>
            <div class="pressureLevel">
              {{ getPressureLevel(HRVAfterData?.stress) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 若需要「交感/副交感比例」或其它圖表可自行擴充 -->

    <div class="usageBtnGroup">
      <button class="nextBtn" @click="goNext">返回穿衣紀錄</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import ResultChart from "~/components/ResultChart.vue";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

/** 解析 YYYYMMDDHHmmss => Date */
function parseYMDHMS(str) {
  if (!str || str.length < 14) return null;
  const yyyy = Number(str.slice(0, 4));
  const MM = Number(str.slice(4, 6)) - 1;
  const dd = Number(str.slice(6, 8));
  const HH = Number(str.slice(8, 10));
  const mm = Number(str.slice(10, 12));
  return new Date(yyyy, MM, dd, HH, mm);
}

/** 將 Date => 'YYYY/M/D HH:mm' (月份/日期不補零, 時分補零) */
function formatMDHM(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return "-";
  const YYYY = dateObj.getFullYear();
  const M = dateObj.getMonth() + 1;
  const D = dateObj.getDate();
  const HH = String(dateObj.getHours()).padStart(2, "0");
  const mm = String(dateObj.getMinutes()).padStart(2, "0");
  return `${YYYY}/${M}/${D} ${HH}:${mm}`;
}

export default {
  name: "UsageHRVResultView",
  components: {
    ResultChart,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    // (API_UIDInfo.jsp) 取得開始/結束時間
    const startTime = ref("");
    const endTime = ref("");

    // (API_HRV2UseAf_Compare) 取得 (使用前)HRV & (使用後)HRV
    const beforeHRVTime = ref("");
    const afterHRVTime = ref("");
    const totalUsedMin = ref(0);

    // 健康數據
    const HRVBeforeData = ref(null);
    const HRVAfterData = ref(null);

    // 生理年齡圖表
    const listBioage = ref([]);

    // 產品名稱 (用於返回按鈕)
    const productName = ref("");

    // 路由參數 UID
    const UID = route.params.HRVID;

    // 取出 localStorage
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    // 1. 先 call API_UIDInfo => 拿到 StartTime & EndTime
    async function fetchUIDInfo() {
      try {
        const resp = await fetch(
          "https://23700999.com:8081/HMA/API_UIDInfo.jsp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ MID, Token, MAID, Mobile, UID }),
          }
        );
        const data = await resp.json();
        if (data.Result === "OK") {
          startTime.value = data.StartTime;
          endTime.value = data.EndTime;
          totalUsedMin.value = calcUsedMin(data.StartTime, data.EndTime);
          productName.value = data.ProductName || "";
        }
      } catch (error) {
        console.error("fetchUIDInfo error:", error);
      }
    }

    // 2. 再 call API_HRV2UseAf_Compare => 拿 (使用前/後)HRV 時間 + 健康數據
    async function fetchHRVCompare() {
      try {
        const resp = await fetch(
          "https://23700999.com:8081/HMA/API_HRV2UseAf_Compare.jsp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ MID, Token, MAID, Mobile, UID }),
          }
        );
        const data = await resp.json();
        if (data.Result === "OK") {
          // 使用前 (BcUse) & 使用後 (AfUse)
          HRVBeforeData.value = data.HRV2.BcUse;
          HRVAfterData.value = data.HRV2.AfUse;

          // (使用前)/(使用後) 檢測時間
          beforeHRVTime.value = data.HRV2?.BcUse?.CheckTime || "";
          afterHRVTime.value = data.HRV2?.AfUse?.CheckTime || "";

          // 生理年齡圖表
          listBioage.value = data.HRV2.listBioage || [];
        }
      } catch (error) {
        console.error("fetchHRVCompare error:", error);
      }
    }

    // 計算 (EndTime - StartTime) => 分鐘
    function calcUsedMin(s, e) {
      const sDate = parseYMDHMS(s);
      const eDate = parseYMDHMS(e);
      if (!sDate || !eDate || eDate < sDate) return 0;
      return Math.round((eDate - sDate) / 60000);
    }

    // 顯示用: 'YYYY/M/D HH:mm'
    function formatTime(str) {
      const dt = parseYMDHMS(str);
      return formatMDHM(dt);
    }

    // 點擊返回 => 帶 productName 回到 usage/xxx
    function goNext() {
      router.push(`/usage/${productName.value}`);
    }

    // 壓力判斷
    function getPressureLevel(stress) {
      if (stress === "低") return "low";
      if (stress === "中") return "middle";
      if (stress === "高") return "high";
      return "";
    }

    // 頁面載入
    onMounted(async () => {
      await Promise.all([fetchUIDInfo(), fetchHRVCompare()]);
    });

    // 點擊查看某筆檢測資料
    function handleWatchClick(dataItem) {
      console.log("你點擊了：", dataItem);
      // 假設要帶 AID 去「健康數據」詳細頁：
      if (dataItem && dataItem.AID) {
        router.push(`/healthData/${dataItem.AID}`);
      } else {
        alert("沒有檢測資料可查看");
      }
    }

    return {
      startTime,
      endTime,
      beforeHRVTime,
      afterHRVTime,
      totalUsedMin,
      HRVBeforeData,
      HRVAfterData,
      listBioage,
      productName,

      formatTime,
      calcUsedMin,
      goNext,
      getPressureLevel,
      handleWatchClick,
    };
  },
};
</script>

<style lang="scss" scoped>
.usageHRVResultWrap {
  background-color: $raphael-gray-100;
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 116px;
  h1 {
    position: sticky;
    background: $raphael-gray-100;
    color: $raphael-black;
    text-align: center;
    font-size: 24px;
    font-weight: 400;
    letter-spacing: 0.5px;
    padding: 0.75rem 0;
    top: 0;
    z-index: 1;
  }
  .thxGroup {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    width: 100%;
    .textGroup {
      flex: 1;
      padding: 0.75rem;

      & > h3 {
        margin: 0;
        color: var(--shade-black, #1e1e1e);
        font-family: "Noto Sans";
        font-size: 24px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%;
        letter-spacing: var(--Body-Large-Tracking, 0.5px);
      }
    }
    .imgGroup {
      position: relative;
      .doctorImg {
        height: 150px;
      }
    }
  }
  .resultChartGroup {
    display: none;
    background-color: $raphael-white;
    border-radius: 0.5rem;
    padding: 12px;
    h2 {
      margin-bottom: 0.75rem;
      color: $raphael-black;
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.15px;
    }
  }
  .BAGroup {
    display: grid;
    grid-template-columns: repeat(2, fr);
    gap: 0.75rem;
    width: 100%;
    margin-top: -0.75rem;
    h2 {
      color: #000;
      font-size: 20px;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    .pressureLevel {
      color: $raphael-gray-300;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: 0.5px;
    }
    .BACard {
      position: relative;
      background-color: $raphael-white;
      border-left: 2px solid $raphael-green-400;
      border-radius: 8px;
      padding: 12px;
      overflow: hidden;

      &:nth-child(1),
      &:nth-child(2) {
        display: none;
      }
      &:nth-child(3),
      &:nth-child(4),
      &:nth-child(5) {
        grid-column: span 2; // 讓它跨 2 格
      }

      .titleGroup {
        display: flex;
        gap: 2px;
        color: $raphael-black;
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        margin-bottom: 0.75rem;
        letter-spacing: 0.15px;

        img {
          position: absolute;
          width: 144px;
          right: -24px;
          bottom: -24px;
          opacity: 0.2;
          filter: grayscale(1) contrast(3);
          mix-blend-mode: darken;
        }
      }
      .BAContent {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        .BA {
          .subTitle {
            color: $raphael-gray-500;
            margin-bottom: 0.25rem;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 1.25;
            letter-spacing: 0.5px;
          }
          .value {
            color: $raphael-green-400;
            text-align: left;
            font-size: 36px;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.09px;
            margin-bottom: 0.25rem;
          }
          .afterValue {
            color: $raphael-cyan-400;
          }
          .unit {
            color: $raphael-gray-300;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.5px;
          }
        }
        & > svg {
          transform: scale(2);
        }
      }
      .waiting {
        font-size: 12px;
        color: #74bc1f;
        margin-top: 0.5rem;
        letter-spacing: 0.5px;
      }
    }
    .BACardS {
      /* 需就視窗大小適度調整或補充樣式 */
    }
  }

  .usageBtnGroup {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: $raphael-gray-100;
    z-index: 99;
    padding: 1rem;
    padding-bottom: 3.125rem;

    .nextBtn {
      @include btnStyle($raphael-green-400, $raphael-white);
    }
  }
  .resultTimeGroup {
    display: flex;
    gap: 2.5%;
    margin-bottom: 2rem;

    .leftHintGroup {
      width: 0.5rem;
      border-radius: 50px;
      background: var(--shade-white, #fff);
      box-shadow: 0px -1px 2px 0px rgba(0, 0, 0, 0.25) inset;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      .resultHint {
        width: 8px;
        height: 8px;
        transform: rotate(-90deg);
        border-radius: 50%;
        &:nth-child(1) {
          background-color: #74bc1f;
        }
        &:nth-child(2) {
          background-color: #65558f;
        }
        &:nth-child(3) {
          background-color: #ec1f1f;
        }
        &:nth-child(4) {
          background-color: #65558f;
        }
      }
    }
    .hintContentGroup {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .hintContent {
      display: flex;
      align-items: center;
      padding: 6px 12px;
      width: 100%;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0px -2px 3px 0px rgba(0, 0, 0, 0.25) inset;
      gap: 0.25rem;
      .hintText {
        display: flex;
        flex-direction: column;
        color: var(--shade-gray-500, #666);
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%;
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
        h5 {
          line-height: 1.25;
        }
      }
    }
  }
}
</style>
