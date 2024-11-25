<template>
  <div class="usageWrap">
    <TitleMenu Text="使用紀錄" link="/user" />
    <TimeRing :totalTime="90" />
    <div class="usageInfoGroup">
      <div class="usageInfoCard">
        <h3>電量提示燈使用說明</h3>
        <h4><span class="greenLight">•綠燈</span> 電量充足</h4>
        <h4><span class="redLight">•紅燈</span> 低電量，使用完請充電四小時</h4>
        <h4><span class="orangeLight">•橘燈閃爍</span> 使用次數剩餘3次</h4>
        <h4>
          <span class="orangeLight">•橘燈閃爍+1長聲嗶一次</span> 合約已到期
        </h4>
      </div>
      <div class="usageInfoCard">
        <h3>提示音說明</h3>
        <h4><span class="greenLight">•開始</span> 1短聲嗶一次</h4>
        <h4><span class="redLight">•結束</span> 低1長聲嗶一次</h4>
        <h4>
          <span class="orangeLight">•即將斷電 </span> 2短聲嗶三次(請盡速充電)
        </h4>
        <h4><span class="orangeLight">•今日已使用</span> 2短聲嗶一次</h4>
      </div>
    </div>
    <div class="usageRecord">
      <div class="usageRecordTitleGroup">
        <h3 :class="{ active: useActive }" @click="changeUseActive">
          使用紀錄
        </h3>
        <h3 :class="{ active: detectActive }" @click="changeDetectActive">
          檢測紀錄
        </h3>
      </div>
      <div class="detectSelectGroup">
        <div class="yearSelectGroup">
          <img src="/assets/imgs/filter.svg" alt="" />
          <div class="monthText" @click="toggleYearBox">
            {{ selectedYear }}年
          </div>
          <div class="yearBox" v-show="yearBoxVisible">
            <div
              class="year"
              v-for="year in displayYears"
              :key="year"
              @click="selectYear(year)"
            >
              {{ year }}
            </div>
          </div>
        </div>
        <div class="monthSelectGroup">
          <img src="/assets/imgs/filter.svg" alt="" />
          <div class="monthText" @click="toggleMonthBox">
            {{ selectedMonth }}月份
          </div>
          <div class="monthBox" v-show="monthBoxVisible">
            <div
              class="month"
              v-for="month in months"
              :key="month"
              @click="selectMonth(month)"
            >
              {{ month }}月
            </div>
          </div>
        </div>
      </div>

      <div class="useGroup" v-if="useActive">
        <div class="useList" v-for="(item, index) in 4" :key="index">
          <div class="dateList">
            <div class="timeGroup">
              <div class="timeIcon">
                <img src="../assets/imgs/detectTime.svg" alt="" />
              </div>
              <div class="time">8/30 20:00</div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
                fill="#666666"
              />
            </svg>
          </div>
          <div class="actionGroup">
            <div class="startGroup">
              <img src="/assets/imgs/play.svg" alt="" />
              <div class="actionContent">
                <h4>開始時間</h4>
                <p>2024/8/31 20:30</p>
              </div>
            </div>
            <div class="pauseGroup">
              <img src="/assets/imgs/pause.svg" alt="" />
              <div class="actionContent">
                <h4>暫停時間</h4>
                <p>2024/8/31 20:30</p>
              </div>
            </div>
            <div class="stopGroup">
              <img src="/assets/imgs/stop.svg" alt="" />
              <div class="actionContent">
                <h4>結束時間</h4>
                <p>2024/8/31 20:30</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="detectGroup" v-if="detectActive">
        <div class="detectItem" v-for="(item, index) in 4" :key="index">
          <a :href="`/vital/detail.html?AID=`">
            <div class="timeGroup">
              <div class="timeIcon">
                <img src="../assets/imgs/detectTime.svg" alt="" />
              </div>
              <div class="timeTextGroup">
                <div class="time">8/25</div>
                <div class="timeInfoText">紅光 治療後</div>
              </div>
            </div>
            <div class="infoGroup">
              <div class="detectAgeGroup">
                <h4>生理年齡</h4>
                <h5><span>23</span>歲</h5>
              </div>
              <div class="detectHRVGroup">
                <h4>HRV</h4>
                <h5><span>23</span>ms</h5>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M5.99159 3.37719L11.4726 8.99994L5.99159 14.6227C5.89346 14.7232 5.83853 14.858 5.83853 14.9984C5.83853 15.1389 5.89346 15.2737 5.99159 15.3742C6.03925 15.4228 6.09613 15.4615 6.15891 15.4879C6.2217 15.5142 6.28911 15.5278 6.35721 15.5278C6.42531 15.5278 6.49273 15.5142 6.55551 15.4879C6.61829 15.4615 6.67518 15.4228 6.72284 15.3742L12.5548 9.39257C12.6572 9.28752 12.7145 9.14664 12.7145 8.99994C12.7145 8.85325 12.6572 8.71236 12.5548 8.60732L6.72396 2.62569C6.67627 2.57671 6.61924 2.53777 6.55625 2.51119C6.49326 2.4846 6.42558 2.4709 6.35721 2.4709C6.28884 2.4709 6.22116 2.4846 6.15817 2.51119C6.09518 2.53777 6.03816 2.57671 5.99046 2.62569C5.89234 2.72615 5.8374 2.86101 5.8374 3.00144C5.8374 3.14187 5.89234 3.27673 5.99046 3.37719L5.99159 3.37719Z"
                  fill="#666666"
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
    </div>
    <div class="usageBtnGroup">
      <button class="preBtn" @click="goPre">上一步</button>
      <button class="nextBtn" @click="goNext">返回產品頁面</button>
    </div>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import TitleMenu from "@/components/TitleMenu.vue";
import TimeRing from "@/components/TimeRing.vue";
import { formatTimestampMDH } from "~/fn/utils";
export default {
  components: {
    TitleMenu,
    TimeRing,
  },
  setup() {
    const selectedYear = ref(new Date().getFullYear());
    const selectedMonth = ref(new Date().getMonth() + 1);
    const yearBoxVisible = ref(false);
    const monthBoxVisible = ref(false);

    const useActive = ref(true);
    const detectActive = ref(false);

    const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse();
    const displayYears = computed(() => {
      const currentYear = new Date().getFullYear();
      const startYear = 2024;
      const years = [];
      for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
      }
      return years;
    });

    const router = useRouter();
    function toggleYearBox() {
      yearBoxVisible.value = !yearBoxVisible.value;
      monthBoxVisible.value = false;
    }
    function toggleMonthBox() {
      monthBoxVisible.value = !monthBoxVisible.value;
      yearBoxVisible.value = false;
    }
    function selectYear(year) {
      selectedYear.value = year;
      yearBoxVisible.value = false;
    }

    function selectMonth(month) {
      selectedMonth.value = month;
      monthBoxVisible.value = false;
    }

    function changeUseActive() {
      useActive.value = true;
      detectActive.value = false;
    }

    function changeDetectActive() {
      useActive.value = false;
      detectActive.value = true;
    }

    const goPre = () => {
      router.push("/usageHistoryInfo");
    };

    const goNext = () => {
        router.push("/usageHistory");
    };
    return {
      selectedYear,
      selectedMonth,
      yearBoxVisible,
      monthBoxVisible,
      months,
      displayYears,
      toggleYearBox,
      toggleMonthBox,
      selectYear,
      selectMonth,
      useActive,
      detectActive,
      changeUseActive,
      changeDetectActive,
      goPre,
      goNext
    };
  },
};
</script>

<style lang="scss">
.usageWrap {
  background-color: rgba(246, 246, 246, 1);
  min-height: 100vh;
  width: 100%;
  padding-bottom: 7rem;
  overflow-x: hidden;
  padding: 0 5%;
  position: relative;
  padding-bottom: 6rem;
  .usageInfoGroup {
    display: flex;

    gap: 5%;
    overflow-x: auto;
    width: max-content;
    width: 100%;
    margin-top: 1rem;



    .usageInfoCard {
      background-color: #fff;
      padding: 12px;
      border-radius: 12px;
      width: 90%;
      flex-shrink: 0;
      color: #666;
      font-size: 18px;
      font-weight: 400;
      letter-spacing: 0.09px;
      &:nth-child(1) {
        border-left: 2px solid #74bc1f;
      }
      &:nth-child(2) {
        border-left: 2px solid #1fbcb3;
      }
      h4 {
        margin-top: 0.35rem;
      }
      .greenLight {
        color: $raphael-green-400;
      }
      .redLight {
        color: $raphael-red-300;
      }
      .orangeLight {
        color: $raphael-orange-400;
      }
    }
  }
  .usageRecord {
    background-color: #fff;
    margin-top: 1rem;
    .usageRecordTitleGroup {
      display: flex;
      justify-content: space-around;
      h3 {
        color: #ddd;
        font-size: 24px;
        letter-spacing: 0.5px;
        margin-top: 1rem;
        transition: 0.3s ease all;
      }
      .active {
        color: #1e1e1e;
      }
    }

    .useGroup {
      padding: 0 1.25rem;
      .useList {
        opacity: 0;
        animation: fadeIn2 1s ease forwards;
        animation-delay: 0s;
        margin-bottom: 1.25rem;
        .dateList {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;

          .timeGroup {
            display: flex;
            align-items: center;
            gap: 4px;
            padding-bottom: 1rem;
            .timeIcon {
              border-radius: 7px;
              padding: 6px;
              border: 1px solid var(--brand-green-400, #74bc1f);
            }
            .time {
              font-size: 20px;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.15px;
            }
          }
        }
        @for $i from 1 through 10 {
          &:nth-child(#{$i}) {
            animation-delay: $i * 0.07s;
          }
        }
      }
      .actionGroup {
        .startGroup,
        .pauseGroup,
        .stopGroup {
          display: flex;
          border-radius: 12px;
          background: var(--shade-white, #fff);
          box-shadow: 0px -2px 3px 0px rgba(0, 0, 0, 0.25) inset;
          padding: 6px 12px;
          gap: 8px;
          line-height: 1.3;
          margin-bottom: 0.5rem;
        }
      }
    }

    .detectGroup {
      overflow-y: auto;
      height: calc(100% - 54px);
      position: relative;
      padding: 0 1.25rem;
      .detectItem {
        width: 100%;
        margin: 0 auto;
        opacity: 0;
        transition: 0.24s ease all;
        animation: fadeIn2 1s ease forwards;
        animation-delay: 0s;
        .timeTextGroup {
          display: flex;
          flex-direction: column;
          line-height: 1.35;
          .timeInfoText {
            color: #666;
            font-size: 16px;
            letter-spacing: 0.5px;
          }
        }
        @for $i from 1 through 10 {
          &:nth-child(#{$i}) {
            animation-delay: $i * 0.07s;
          }
        }
        a {
          text-decoration: none;
          color: #1e1e1e;
          display: flex;
          justify-content: space-between;
          .timeGroup {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 1.25rem 0;
            .timeIcon {
              border-radius: 7px;
              padding: 6px;
              border: 1px solid var(--brand-green-400, #74bc1f);
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
              color: #666;
              font-size: 1rem;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.5px;
            }

            .detectAgeGroup {
              color: #666;
            }
            .detectHRVGroup {
              color: #666;
            }
            h5 {
              color: #b3b3b3;
              font-size: 1rem;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.5px;
              margin-top: 0.25rem;
              span {
                color: #1e1e1e;
                font-size: 1.5rem;
                font-style: normal;
                font-weight: 700;
                letter-spacing: 0.12px;
                margin-right: 0.25rem;
              }
            }
            .redValue {
              color: #ec4f4f;
            }
            svg {
              width: 18px;
            }
          }
          &:hover {
            background-color: #f4f4f4;
          }
        }
      }
    }

    .detectSelectGroup {
      display: flex;
      align-items: center;
      justify-content: end;
      padding: 0.75rem 0;
      color: #666;
      margin-top: 0.25rem;
    }

    .yearSelectGroup {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-right: 0.75rem;
      position: relative;
      .yearBox {
        position: absolute;
        top: 100%;
        right: 0;
        background: rgba(255, 255, 255, 0.85);
        width: 200%;
        border-radius: 8px;
        text-align: center;
        padding: 0.75rem;
        font-size: 18px;
        max-height: 200px;
        backdrop-filter: blur(6px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        overflow-y: auto;
        transform: 0.25s all ease;
        animation: 0.3s fadeIn forwards;
        z-index: 10;
        .month {
          margin-bottom: 1rem;
        }
      }
    }
    .monthSelectGroup {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-right: 0.75rem;
      position: relative;

      .monthBox {
        position: absolute;
        top: 100%;
        right: 0;
        background: rgba(255, 255, 255, 0.85);
        width: 200%;
        border-radius: 8px;
        text-align: center;
        padding: 0.75rem;
        font-size: 18px;
        max-height: 200px;
        backdrop-filter: blur(6px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        overflow-y: auto;
        transform: 0.25s all ease;
        opacity: 0;
        animation: 0.3s fadeIn forwards;
        z-index: 10;
        .month {
          margin-bottom: 1rem;
        }
      }
    }
  }
  .usageBtnGroup {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #f6f6f6;
    z-index: 99;
    display: flex;
    justify-content: center;
    padding: 24px 5%;
    gap: 16px;
    button {
      width: 50%;
      background-color: $raphael-green-400;
      color: #fff;
      border: none;
      padding: 8px;
      border-radius: 8px;
      color: #fff;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
    }
    .preBtn {
      background-color: #eee;
      color: #666;
    }
    .nextBtn {
      background-color: $raphael-green-400;
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
</style>
