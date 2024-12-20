<template>
  <HRVAlert />
  <RaphaelLoading v-if="loading" />
  <DSPRSelect />
  <div class="HRVHistory">
    <div class="titleGroup">
      <img src="/assets/imgs/backArrow.svg" @click="goBack" alt="" />
      <h2>HRV 檢測</h2>
    </div>    
    <article>
      <h3>AI人臉HRV，輕鬆追蹤健康</h3>
      <ul>
        <li>智平衡健康集團運用FDA認證AI技術，推出全新人臉辨識HRV量測工具，透過手機相機掃描臉部，1-2分鐘即可快速分析生理數據（如心跳變化），評估心臟自律神經狀態，並推算生理年齡，提供簡易的健康管理方式。</li>
        <li>人臉辨識HRV量測<span class="point">僅反應心臟的交感與副交感神經功能</span>，若您需全面了解全身五臟六腑的自律神經狀態，請依醫師建議回診進行深入檢測。每天記錄數據，輕鬆追蹤健康變化，智平衡健康集團秉持專業與創新，結合AI智慧檢測與專業團隊與您攜手邁向更健康的未來！</li>
      </ul>
    </article>
    <button class="goToHRVBtn" @click="openHRVAlert">前往檢測</button>
    <div class="detectWrap">
      <h3>最近 10筆 檢測記錄</h3>
      <div class="detectList">
        <div class="detectItem" v-for="item in limitedHRVData" :key="item.AID">
          <a :href="`/vital/detail.html?AID=${item.AID}`">
            <div class="timeGroup">
              <div class="timeIcon">
                <img src="../assets/imgs/detectTime.svg" alt="" />
              </div>
              <div class="time">{{ formatTimestampMDH(item.CheckTime) }}</div>
            </div>
            <div class="infoGroup">
              <div class="detectAgeGroup">
                <h4>生理年齡</h4>
                <h5>
                  <span>{{ item.bioage }}</span
                  >歲
                </h5>
              </div>
              <div class="detectHRVGroup">
                <h4>HRV</h4>
                <h5 :class="{ redValue: isHRVBelowAverage(item.HRV) }">
                  <span>{{ Math.round(item.HRV * 10) / 10 }}</span
                  >ms
                </h5>
              </div>
              <svg data-v-8f83a543="" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><path data-v-8f83a543="" d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z" fill="#666666"></path></svg>
            </div>
          </a>
        </div>
        <div class="notDetectData" v-if="limitedHRVData.length === 0">
          無檢測資料
        </div>
      </div>
    </div>
    <a href="/HRVHistoryAll" class="goToHistoryAll"
      >歷史紀錄
      <img src="../assets/imgs/historyAllArrow.svg"/>
    </a>
  </div>
</template>
<script>
import { useRouter } from "vue-router";
import { formatTimestampMDH } from "~/fn/utils";
import HRVAlert from "~/components/HRVAlert.vue";
import RaphaelLoading from "../components/RaphaelLoading";
import DSPRSelect from "../components/DSPRSelect.vue";
import axios from "axios";
import { useCommon } from "../stores/common";
import { useUserData } from "~/fn/api";
export default {
  components: { RaphaelLoading, HRVAlert, DSPRSelect },
  setup() {
    const router = useRouter();
    const HRVData = ref([]);
    const userData = JSON.parse(localStorage.getItem("userData"));
    const store = useCommon();
    const loading = ref(false);
    const goBack = () => {
      router.push("/user");
    };
    const API_HRV2 = async () => {
      try {
        loading.value = true;
        const response = await fetch(
          "https://23700999.com:8081/HMA/API_HRV2.jsp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              MID: userData.MID,
              MAID: userData.MAID,
              Token: userData.Token,
              Mobile: userData.Mobile,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          HRVData.value = data.HRV2;
        } else {
          console.error("Response not OK", response.status);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        loading.value = false;
      }
    };

    API_HRV2();

    const limitedHRVData = computed(() => HRVData.value.slice(0, 10));

    function getHRVRange(age, gender) {
      if (age >= 0 && age <= 29) return gender === "M" ? [29, 53] : [30, 57];
      else if (age >= 30 && age <= 39)
        return gender === "M" ? [25, 47] : [25, 44];
      else if (age >= 40 && age <= 49)
        return gender === "M" ? [21, 40] : [20, 40];
      else if (age >= 50 && age <= 59)
        return gender === "M" ? [15, 34] : [18, 38];
      else if (age >= 60) return gender === "M" ? [16, 33] : [15, 30];

      return [0, Infinity];
    }

    function isHRVBelowAverage(HRV) {
      const age = userData.Birthday
        ? new Date().getFullYear() - new Date(userData.Birthday).getFullYear()
        : 0;

      const range = getHRVRange(age, userData.Sex);
      return HRV < range[0];
    }

    useUserData();

    const openHRVAlert = async () => {
      localStorage.removeItem("form");
      store.showHRVAlert = true;
    };

    return {
      HRVData,
      limitedHRVData,
      formatTimestampMDH,
      isHRVBelowAverage,
      goBack,
      openHRVAlert,
      loading,
    };
  },
};
</script>
<style lang="scss" scoped>
.HRVHistory {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 50px;
}
.titleGroup {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 0;
  max-width: 768px;

  img {
    position: absolute;
    left: 0;
    cursor: pointer;
  }
  h2 {
    text-align: center;
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
  }
}

article{
  display: grid;
  gap: 0.5rem;
  max-width: 768px;

  &>h3{
    font-size: 20px;
  }
  &>ul{
    display: grid;
    gap:0.5rem;
    list-style-type: disc;

    &>li{  
      line-height: 29.1px;
      color: $raphael-gray-500;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
      margin-left: 1.5rem;
      &::marker{
        font-size: 1rem;
      }
      .point{
        color: $raphael-red-300;
      }
    }
  }
}

.detectWrap {
  width: 100%;
  max-width: 768px;
  margin-top: 1.5rem;

  & > h3 {
    font-size: 20px;
    margin-bottom: 0.75rem;
  }
  .detectList {
    @include recordList($raphael-white,auto,0.75rem,0.75rem);    
    .notDetectData {
      position: absolute; 
      z-index: 11;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      letter-spacing: 10px;
      font-size: 1.25rem;
      white-space: nowrap;
      color: $raphael-gray-500;
    }
  }

  .detectItem {
    width: 100%;
    margin: 0 auto;
    transition: 0.2s ease all;
    animation: fadeIn2 1s ease forwards;
    animation-delay: 0s;
    opacity: 0;

    &:hover{
      box-shadow: 0px 5px 10px -2px $raphael-gray-300 inset;
      padding: 0 4px;
    }

    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: $i * 0.07s;
      }
    }
    a {
      text-decoration: none;
      color: $raphael-black;
      display: flex;
      justify-content: space-between;
      
      .timeGroup {
        display: flex;
        align-items: center;
        gap: 4px;
        .timeIcon {
          border-radius: 7px;
          padding: 6px;
          border: 1px solid $raphael-green-400;
        }
        .time {
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.15px;
        }
      }
      .infoGroup {
        display: flex;
        align-items: center;
        white-space: nowrap;
        justify-content: end;
        gap: 0.5rem;
        h4 {
          color: $raphael-gray-500;
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .detectAgeGroup {
          display: none;
          color: $raphael-gray-500;
        }
        .detectHRVGroup {
          display: none;
          color: $raphael-gray-500;      
          h5 {
            span {
              display: inline-flex;
              min-width: 50px;    
            }
          }
        }
        h5 {
          color: $raphael-gray-400;
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
          margin-top: 0.25rem;
          span {
            color: $raphael-black;
            font-size: 1.5rem;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
            margin-right: 0.25rem;
          }
        }
        .redValue {
          color: $raphael-red-300;
        }
        svg {
          width: 18px;
        }
      }
    }
  }
}

@keyframes fadeIn2 {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.goToHistoryAll {
  color: $raphael-red-300;
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  letter-spacing: 0.09px;
  width: 100%;
  max-width: 768px;
  margin-top: 0.75rem;
  transition: all 0.2s ease;
  &:hover{
    color: $raphael-red-500;
  }
}

.goToHRVBtn {
  @include btnStyle($raphael-green-400,$raphael-white);
  max-width: 768px;
  margin-top: 1.5rem;
}
</style>
