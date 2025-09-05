<template>
  <RaphaelLoading v-if="loading" />
  <div class="point">
    <div class="pointContainer">
      <TitleMenu Text="獎勵積分" link="/member" :showImg1="read" :showImg2="time" @handleImg1Click="handleImg1Click" @handleImg2Click="handleImg2Click"></TitleMenu>
      <MemberInfo :showPointInfo="true" />
      <div class="todayMissionGroup">
        <h3>今日任務</h3>
        <small
          >今日可獲得 {{ dailyAvailablePoints }} 積分，目前已獲得
          {{ completedPoints }} 積分</small
        >

        <!-- 有任務時顯示任務列表 -->
        <template v-if="todayMissionList && todayMissionList.length > 0">
          <div
            class="todayMisstion"
            v-for="(task, index) in todayMissionList"
            :key="index"
          >
            <div class="todayMisstionItem">
              {{ task.Name }}
              <div
                v-if="task.Info === '去完成'"
                class="goMisstion"
                @click="handleTodayMissionClick(task)"
              >
                去完成<img src="../assets/imgs/point/next.svg" alt="" />
              </div>
              <div
                v-else-if="task.Info === '已經完成'"
                class="missionCompleted"
              >
                <img src="../assets/imgs/point/check.svg" alt="" />
              </div>
              <div v-else class="missionInfo">
                {{ task.Info }}
              </div>
            </div>
            <h5>+{{ task.Points }}積分</h5>
          </div>
        </template>

        <!-- 沒有任務時顯示空狀態 -->
        <div v-else class="noMissionState">
          <p>今日暫無任務</p>
        </div>
      </div>

      <BottomNav />
    </div>
  </div>

  <div class="priceExchangeBox" @click="handlePriceExchange">
    <button @click="handlePriceExchange">獎品兌換 <img src="../assets/imgs/point/next_white.svg" alt="" /></button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { usePoint } from "@/stores/point";
import { nextTick } from "vue";
import { useSeo } from "~/composables/useSeo";
import BottomNav from "@/components/BottomNav.vue";
import MemberInfo from "@/components/MemberInfo.vue";
import read from "@/assets/imgs/point/read.svg"
import time from "@/assets/imgs/point/time.svg"


/** ---------------------
  其餘 template, style 已存在，此處只改動 script 區
---------------------- **/

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

const pointStore = usePoint();
const router = useRouter();
const loading = ref(false);

const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
if (!MID || !Token || !MAID || !Mobile) {
  router.push("/");
}

const handlePriceExchange = () => {
  router.push("/pointExange");
}
/** 在 mounted 時，若有需要預設去撈 */
onMounted(() => {
  fetchTodayMissions(); // 新增：調用 API_Bonus 獲取任務數據
});

// 新增：調用 API_Bonus 獲取任務數據
async function fetchTodayMissions() {
  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_Bonus.jsp",
      { MID, Token, MAID, Mobile }
    );
    if (response.status === 200) {
      // 設定 API 回傳的 NowBonusState
      pointStore.setNowBonusState(response.data.NowBonusState);
      console.log("NowBonusState:", response.data.NowBonusState);
    } else {
      console.log("API_Bonus error:", response);
    }
  } catch (err) {
    console.log("API_Bonus catch error:", err);
  }
}

const dailyAvailablePoints = computed(() => {
  return pointStore.nowBonusState?.Cando || 0;
});

// 處理今日任務點擊
function handleTodayMissionClick(task) {
  if (task.Info !== "去完成") return;

  // 設置 loading 狀態
  loading.value = true;

  let path = "";
  switch (task.Name) {
    case "使用紀錄":
      path = "/UsageHistory";
      break;
    case "自律神經檢測":
      path = "/weekly";
      break;
    case "生活紀錄檢測":
      path = "/userRecord";
      break;
    case "寶貝記錄檢測":
      path = "/babyRecord";
      break;
    default:
      loading.value = false;
      return;
  }

  // 延遲一下再跳轉，讓用戶看到 loading 狀態
  setTimeout(() => {
    loading.value = false;
    window.open(path, "_blank");

    // 跳轉後延遲刷新任務數據，確保數據是最新的
    setTimeout(() => {
      fetchTodayMissions();
    }, 1000);
  }, 500);
}

// 今日任務列表 (從 store 獲取)
const todayMissionList = computed(() => {
  return pointStore.todayMissionList;
});

// 今日已獲得積分 (從 store 獲取)
const completedPoints = computed(() => {
  return pointStore.todayCompletedPoints;
});

function handleImg1Click() {
  router.push("/pointRules");
}
function handleImg2Click() {
  router.push("/pointRecord");
}
</script>

<style lang="scss">
.point {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;

  .pointContainer {
    width: 100%;
    padding: 0 3% 12rem;


    .todayMissionGroup {
      h3 {
        color: var(--Neutral-black, #1e1e1e);
        font-size: var(--Text-font-size-20, 20px);
        font-style: normal;
        font-weight: 700;
        letter-spacing: 3px;
        margin-bottom: 0.25rem;
      }
      small {
        color: var(--Neutral-500, #666);
        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 2.1px;
        margin-bottom: 0.25rem;
      }
      .todayMisstion {
        margin-top: 0.75rem;
        display: flex;
        flex-direction: column;
        padding: 0.5rem 1rem;

        margin-bottom: 0.75rem;
        border-radius: var(--Radius-r-20, 20px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        .todayMisstionItem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
          color: var(--Neutral-black, #1e1e1e);

          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 700;

          letter-spacing: 2.7px;
          .goMisstion {
            color: var(--Primary-default, #74bc1f);

            font-size: var(--Text-font-size-18, 18px);
            font-style: normal;
            font-weight: 400;

            letter-spacing: 2.7px;
            display: flex;
            align-items: center;
            border-radius: var(--Radius-r-50, 50px);
            background: var(--Secondary-100, #f5f7fa);
            box-shadow: 2px 4px 12px 0
              var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
            padding: 0.5rem 0.75rem;
            img {
              transform: translateY(1px);
            }
          }
          .missionCompleted {
            border-radius: var(--Radius-r-50, 50px);
            background: var(--Secondary-100, #f5f7fa);
            box-shadow: 2px 4px 12px 0
              var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
            padding: 0.5rem;
            img {
              width: 18px;
            }
          }
          .missionInfo {
            color: var(--Neutral-500, #666);
            font-size: var(--Text-font-size-14, 14px);
            font-style: normal;
            font-weight: 400;
            letter-spacing: 1.4px;
            padding: 0.5rem 0.75rem;
            border-radius: var(--Radius-r-50, 50px);
            background: var(--Secondary-100, #f5f7fa);
            box-shadow: 2px 4px 12px 0
              var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
          }
        }
        h5 {
          color: var(--Primary-default, #74bc1f);
          font-size: var(--Text-font-size-14, 14px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 2.1px;
        }
      }
      .noMissionState {
        text-align: center;
        padding: 1rem;
        color: var(--Neutral-500, #666);
        font-size: var(--Text-font-size-16, 16px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
      }
    }
  }


}

.priceExchangeBox {
  position: fixed;
  bottom: 90px;
  width: 100%;

  margin: 0 auto;
  z-index: 1001;
  background-color: #fff;

  

  button {
    width: 100%;
    padding: 10px 20px;
    border-radius: 8px;
    background-color: #74bc1f;
    color: var(--Neutral-white, #fff);

    font-size: var(--Text-font-size-18, 18px);
    font-style: normal;
    font-weight: 400;

    letter-spacing: 2.7px;
    border: none;
    margin-top: 1rem;
    cursor: pointer;
    width: 90%;
    margin-left: 5%;
    margin-bottom: 1rem;
    border-radius: var(--Radius-r-50, 50px);
    background: linear-gradient(
      90deg,
      var(--primary-400-opacity-70, rgba(116, 188, 31, 0.7)) 0%,
      var(--Primary-default, #74bc1f) 100%
    );
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;

  }
}
</style>
