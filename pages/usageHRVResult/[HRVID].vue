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
    <!-- 改善區塊 -->
    <div class="improveGroup" v-if="improvement">
      <img src="@/assets/imgs/hrvUsageResult/star.png" alt="" />
      <div class="improveTextGroup">
        <h3>自律神經改善了</h3>
        <p>使用後各項指標都有明顯改善，建議持續使用以維持良好狀態。</p>
      </div>
    </div>
    <!-- 詳細數據比對區塊 -->
    <div class="detailDataGroup" v-if="improvement">
      <div class="detailDataTitleGroup">
        <h3>詳細數據比對</h3>
        <img 
          src="/assets/imgs/arrowGo.svg" 
          alt="" 
          @click="toggleDetail"
          :style="{ transform: arrowRotation }"
        />
      </div>
      <transition name="fade">
        <div v-show="isDetailVisible">
          <div class="detailDataItem">
            <div class="detailDataInnerGroup1">
              <div class="detailDataItemTag"></div>
              <h4>自律神經平衡</h4>
            </div>
            <div class="detailDataInnerGroup2">
              <div class="useBeforeGroup">
                <div class="useValue">{{ improvement.beforeScores.balance }}</div>
                <small>使用前</small>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="8"
                viewBox="0 0 17 8"
                fill="none"
              >
                <path
                  d="M16.3536 4.05668C16.5488 3.86142 16.5488 3.54483 16.3536 3.34957L13.1716 0.167591C12.9763 -0.0276711 12.6597 -0.0276711 12.4645 0.167591C12.2692 0.362853 12.2692 0.679436 12.4645 0.874698L15.2929 3.70312L12.4645 6.53155C12.2692 6.72681 12.2692 7.0434 12.4645 7.23866C12.6597 7.43392 12.9763 7.43392 13.1716 7.23866L16.3536 4.05668ZM0 3.70312V4.20312H16V3.70312V3.20312H0V3.70312Z"
                  fill="#74BC1F"
                />
              </svg>
              <div class="useBeforeGroup">
                <div class="useValue">{{ improvement.afterScores.balance }}</div>
                <small>使用後</small>
              </div>
            </div>
          </div>

          <div class="detailDataItem">
            <div class="detailDataInnerGroup1">
              <div class="detailDataItemTag"></div>
              <h4>生理疲勞</h4>
            </div>
            <div class="detailDataInnerGroup2">
              <div class="useBeforeGroup">
                <div class="useValue">{{ improvement.beforeScores.fatigue }}</div>
                <small>使用前</small>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="8"
                viewBox="0 0 17 8"
                fill="none"
              >
                <path
                  d="M16.3536 4.05668C16.5488 3.86142 16.5488 3.54483 16.3536 3.34957L13.1716 0.167591C12.9763 -0.0276711 12.6597 -0.0276711 12.4645 0.167591C12.2692 0.362853 12.2692 0.679436 12.4645 0.874698L15.2929 3.70312L12.4645 6.53155C12.2692 6.72681 12.2692 7.0434 12.4645 7.23866C12.6597 7.43392 12.9763 7.43392 13.1716 7.23866L16.3536 4.05668ZM0 3.70312V4.20312H16V3.70312V3.20312H0V3.70312Z"
                  fill="#1FBCB3"
                />
              </svg>
              <div class="useBeforeGroup">
                <div class="useValue">{{ improvement.afterScores.fatigue }}</div>
                <small>使用後</small>
              </div>
            </div>
          </div>
          <div class="detailDataItem">
            <div class="detailDataInnerGroup1">
              <div class="detailDataItemTag"></div>
              <h4>心情指北針</h4>
            </div>
            <div class="detailDataInnerGroup2">
              <div class="useBeforeGroup">
                <div class="useValue">{{ improvement.beforeScores.mood }}</div>
                <small>使用前</small>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="8"
                viewBox="0 0 17 8"
                fill="none"
              >
                <path
                  d="M16.3536 4.05668C16.5488 3.86142 16.5488 3.54483 16.3536 3.34957L13.1716 0.167591C12.9763 -0.0276711 12.6597 -0.0276711 12.4645 0.167591C12.2692 0.362853 12.2692 0.679436 12.4645 0.874698L15.2929 3.70312L12.4645 6.53155C12.2692 6.72681 12.2692 7.0434 12.4645 7.23866C12.6597 7.43392 12.9763 7.43392 13.1716 7.23866L16.3536 4.05668ZM0 3.70312V4.20312H16V3.70312V3.20312H0V3.70312Z"
                  fill="#EC4F4F"
                />
              </svg>
              <div class="useBeforeGroup">
                <div class="useValue">{{ improvement.afterScores.mood }}</div>
                <small>使用後</small>
              </div>
            </div>
          </div>
          <div class="detailDataItem">
            <div class="detailDataInnerGroup1">
              <div class="detailDataItemTag"></div>
              <h4>血壓氣球</h4>
            </div>
            <div class="detailDataInnerGroup2">
              <div class="useBeforeGroup">
                <div class="useValue">{{ improvement.beforeScores.pressure }}</div>
                <small>使用前</small>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="8"
                viewBox="0 0 17 8"
                fill="none"
              >
                <path
                  d="M16.3536 4.05668C16.5488 3.86142 16.5488 3.54483 16.3536 3.34957L13.1716 0.167591C12.9763 -0.0276711 12.6597 -0.0276711 12.4645 0.167591C12.2692 0.362853 12.2692 0.679436 12.4645 0.874698L15.2929 3.70312L12.4645 6.53155C12.2692 6.72681 12.2692 7.0434 12.4645 7.23866C12.6597 7.43392 12.9763 7.43392 13.1716 7.23866L16.3536 4.05668ZM0 3.70312V4.20312H16V3.70312V3.20312H0V3.70312Z"
                  fill="#74BC1F"
                />
              </svg>
              <div class="useBeforeGroup">
                <div class="useValue">{{ improvement.afterScores.pressure }}</div>
                <small>使用後</small>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <!-- 個人化建議 -->
    <div class="personalizedAdviceGroup">
      <h3>個人化建議</h3>
      <p>{{ advice }}</p>
    </div>

    <div class="usageBtnGroup">
      <button class="nextBtn" @click="goNext">返回穿衣紀錄</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
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

    // 計算各項指標分數
    const calculateScore = (data, type) => {
      if (!data) return 0;

      switch (type) {
        case 'balance': // 自律神經平衡
          const lf_hf = parseFloat(data.lf_hf);
          if (lf_hf > 2) return 5;
          if (lf_hf > 1.5) return 4;
          if (lf_hf >= 1) return 3;
          if (lf_hf >= 0.5) return 2;
          return 1;

        case 'fatigue': // 生理疲勞
          const sdnn = parseFloat(data.sdnn);
          if (sdnn < 20) return 5;
          if (sdnn < 30) return 4;
          if (sdnn < 50) return 3;
          if (sdnn < 70) return 2;
          return 1;

        case 'mood': // 心情指北針
          const hbr = parseInt(data.hbr);
          const rr = parseInt(data.rr);
          const lf = parseFloat(data.lf);
          const hf = parseFloat(data.hf);
          
          if (!hbr || !rr || !lf || !hf) return 0;
          
          let score = 0;
          if (hbr > 90) score += 5;
          else if (hbr > 80) score += 4;
          else if (hbr > 70) score += 3;
          else if (hbr > 60) score += 2;
          else score += 1;

          if (rr > 18) score += 5;
          else if (rr > 15) score += 4;
          else if (rr > 12) score += 3;
          else if (rr > 10) score += 2;
          else score += 1;

          const lf_hf_ratio = lf / hf;
          if (lf_hf_ratio > 2) score += 5;
          else if (lf_hf_ratio > 1.5) score += 4;
          else if (lf_hf_ratio > 1) score += 3;
          else if (lf_hf_ratio > 0.5) score += 2;
          else score += 1;

          if (score >= 14) return 5;
          if (score >= 12) return 4;
          if (score >= 9) return 3;
          if (score >= 5) return 2;
          return 1;

        case 'pressure': // 血壓氣球
          const sbp = parseInt(data.sbp);
          const dbp = parseInt(data.dbp);
          if (sbp > 145 || dbp > 95) return 5;
          if (sbp >= 130 || dbp >= 85) return 4;
          if (sbp >= 110 && sbp <= 129 && dbp >= 70 && dbp <= 84) return 3;
          if (sbp >= 95 && dbp >= 60) return 2;
          return 1;

        default:
          return 0;
      }
    };

    // 計算改善程度
    const calculateImprovement = () => {
      if (!HRVBeforeData.value || !HRVAfterData.value) return null;

      const beforeScores = {
        balance: calculateScore(HRVBeforeData.value, 'balance'),
        fatigue: calculateScore(HRVBeforeData.value, 'fatigue'),
        mood: calculateScore(HRVBeforeData.value, 'mood'),
        pressure: calculateScore(HRVBeforeData.value, 'pressure')
      };

      const afterScores = {
        balance: calculateScore(HRVAfterData.value, 'balance'),
        fatigue: calculateScore(HRVAfterData.value, 'fatigue'),
        mood: calculateScore(HRVAfterData.value, 'mood'),
        pressure: calculateScore(HRVAfterData.value, 'pressure')
      };

      const improvements = {
        balance: afterScores.balance - beforeScores.balance,
        fatigue: afterScores.fatigue - beforeScores.fatigue,
        mood: afterScores.mood - beforeScores.mood,
        pressure: afterScores.pressure - beforeScores.pressure
      };

      return {
        beforeScores,
        afterScores,
        improvements
      };
    };

    // 生成改善建議
    const generateAdvice = () => {
      const improvement = calculateImprovement();
      if (!improvement) return "無法生成建議";

      const advice = [];
      const { improvements, beforeScores, afterScores } = improvement;

      // 自律神經平衡建議
      if (improvements.balance > 0) {
        advice.push("自律神經平衡有所改善，建議繼續保持現有的生活習慣。");
      } else if (improvements.balance < 0) {
        advice.push("自律神經平衡略有下降，建議增加放鬆活動和規律作息。");
      }

      // 生理疲勞建議
      if (improvements.fatigue > 0) {
        advice.push("生理疲勞程度降低，建議維持現有的運動和休息習慣。");
      } else if (improvements.fatigue < 0) {
        advice.push("生理疲勞程度增加，建議適當增加休息時間，避免過度勞累。");
      }

      // 心情指北針建議
      if (improvements.mood > 0) {
        advice.push("心情狀態改善，建議保持積極樂觀的心態。");
      } else if (improvements.mood < 0) {
        advice.push("心情狀態略有波動，建議進行適當的壓力紓解活動。");
      }

      // 血壓建議
      if (improvements.pressure > 0) {
        advice.push("血壓狀態改善，建議繼續保持健康的生活方式。");
      } else if (improvements.pressure < 0) {
        advice.push("血壓狀態略有變化，建議注意飲食控制和規律運動。");
      }

      return advice.join("\n");
    };

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
          "https://23700999.com:8081/HMA/API_HRV3UseAf_Compare.jsp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ MID, Token, MAID, Mobile, UID }),
          }
        );
        const data = await resp.json();
        if (data.Result === "OK") {
          // 使用前 (BcUse) & 使用後 (AfUse)
          HRVBeforeData.value = data.HRV3.BcUse;
          HRVAfterData.value = data.HRV3.AfUse;

          // (使用前)/(使用後) 檢測時間
          beforeHRVTime.value = data.HRV3?.BcUse?.CheckTime || "";
          afterHRVTime.value = data.HRV3?.AfUse?.CheckTime || "";

          // 生理年齡圖表
          listBioage.value = data.HRV3.listBioage || [];
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

    // 點擊詳細數據比對 => 顯示/隱藏
    const isDetailVisible = ref(true);
    function toggleDetail() {
      isDetailVisible.value = !isDetailVisible.value;
    }

    // 計算屬性
    const improvement = computed(() => calculateImprovement());
    const advice = computed(() => generateAdvice());
    const arrowRotation = computed(() => isDetailVisible.value ? 'rotate(90deg)' : 'rotate(0deg)');

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
      improvement,
      advice,
      isDetailVisible,
      toggleDetail,
      arrowRotation,

      formatTime,
      calcUsedMin,
      goNext,
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
    margin-bottom: 0.75rem;

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
  .improveGroup {
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 8px;
    padding: 16px;
    background: rgba(116, 188, 31, 0.1);
    box-shadow: 0px 0px 12px 0px var(--Primary-default, #74bc1f) inset,
      0px 0px 6px 0px var(--Primary-default, #74bc1f);
    img {
      width: 50px;
      transform: rotate(-30deg);
    }
    .improveTextGroup {
      h3 {
        color: var(--Neutral-black, #1e1e1e);
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
      }
      p {
        color: var(--Neutral-500, #666);
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
        margin-top: 0.5rem;
      }
    }
  }
  .detailDataGroup {
    margin-top: 0.75rem;
    border-radius: 12px;
    border: 1px solid var(--Neutral-white, #fff);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0px 0px 12px 0px var(--Neutral-white, #fff) inset,
      0px 0px 6px 0px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(2px);
    padding: 1rem;
    .detailDataTitleGroup {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      img {
        transition: transform 0.3s ease;
        cursor: pointer;
      }
      h3 {
        color: var(--Neutral-black, #1e1e1e);
        font-size: 20px;
        font-style: normal;
      }
    }
    .detailDataItem {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.25rem;
      .detailDataInnerGroup1 {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .detailDataItemTag {
          width: 12px;

          border-radius: 50px;
          height: 40px;
          background-color: #74bc1f;
        }
      }
      .detailDataInnerGroup2 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        .useBeforeGroup,
        .useAfterGroup {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          .useValue {
            color: var(--Primary-default, #74bc1f);
            text-align: center;

            font-size: 32px;
            font-style: normal;
            font-weight: 700;

            letter-spacing: 0.08px;
          }
          small {
            color: var(--Neutral-300, #ccc);
            text-align: center;

            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            margin-top: 0.25rem;
            letter-spacing: 0.048px;
          }
        }
      }
      &:nth-child(2) {
        .detailDataInnerGroup1 {
          .detailDataItemTag {
            background-color: #1fbcb3;
          }
        }
        .detailDataInnerGroup2 {
          .useBeforeGroup,
          .useAfterGroup {
            .useValue {
              color: var(--Primary-default, #1fbcb3);
            }
          }
        }
      }
      &:nth-child(3) {
        .detailDataInnerGroup1 {
          .detailDataItemTag {
            background-color: #ec4f4f;
          }
        }
        .useBeforeGroup,
        .useAfterGroup {
          .useValue {
            color: var(--Primary-default, #ec4f4f);
          }
        }
      }
    }
  }
  .personalizedAdviceGroup {
    margin-top: 0.75rem;
    border-radius: 12px;
    border: 1px solid var(--Neutral-white, #fff);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 0px 0px 12px 0px var(--Neutral-white, #fff) inset,
      0px 0px 6px 0px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(2px);
    padding: 1rem;
    h3 {
      color: var(--Neutral-black, #1e1e1e);
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; 
      margin-bottom: 0.25rem;
      letter-spacing: var(--Static-Title-Medium-Tracking, 0.15px);
    }
    p {
      color: var(--Neutral-black, #1e1e1e);
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 29.124px; /* 161.8% */
      letter-spacing: 0.09px;
    }
  }
}

// 淡入淡出動畫
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
