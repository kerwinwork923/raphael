<template>
  <HRVAlert />
  <RaphaelLoading v-if="loading" />
  <DSPRSelect />
  <div class="HRVHistoryAll">
    <div class="titleGroup">
      <img src="/assets/imgs/backArrow.svg" alt="" @click="goBack" />
      <h2>HRV 檢測歷史紀錄</h2>
    </div>

    <div class="detectWrap">
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

      <div class="detectList">
        <div class="detectItem" v-for="item in paginatedData" :key="item.AID">
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
        <div class="notDetectData" v-if="filteredHRVData.length === 0">
          無檢測資料
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="paginationWrap">
      <div class="preBtnGroup">
        <button
          class="firstPageBtn"
          @click="firstPage"
          :disabled="currentPage === 1"
        >
          &lt;&lt;
        </button>
        <button
          class="prevPageBtn"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          &lt;
        </button>
      </div>

      <div class="paginationCenter">
        <button
          v-for="page in displayedPages"
          :key="page"
          @click="changePage(page)"
          :class="{ activePage: page === currentPage }"
        >
          {{ page }}
        </button>
      </div>

      <div class="nextBtnGroup">
        <button
          class="nextPageBtn"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          &gt;
        </button>
        <button
          class="lastPageBtn"
          @click="lastPage"
          :disabled="currentPage === totalPages"
        >
          &gt;&gt;
        </button>
      </div>
    </div>

    <div class="itemsGroup">
      <div class="item" @click="openHRVAlert">
        <div class="topTitle">檢測</div>
        <div class="bottomTitle">HRV</div>
        <img src="../assets/imgs/faceIcon.svg" alt="" />
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted } from "vue";
import { formatTimestampMDH } from "~/fn/utils";
import { useRouter } from "vue-router";
import HRVAlert from "~/components/HRVAlert.vue";
import RaphaelLoading from "../components/RaphaelLoading";
import DSPRSelect from "../components/DSPRSelect.vue";
import { useCommon } from "../stores/common";
import { useUserData } from "~/fn/api";
export default {
  components: { RaphaelLoading, HRVAlert, DSPRSelect },
  setup() {
    const HRVData = ref([]);
    const router = useRouter();
    const userData = JSON.parse(localStorage.getItem("userData"));
    const selectedYear = ref(new Date().getFullYear());
    const selectedMonth = ref(new Date().getMonth() + 1);
    const yearBoxVisible = ref(false);
    const monthBoxVisible = ref(false);
    const currentPage = ref(1);
    const itemsPerPage = 10;
    const store = useCommon();
    const months = Array.from({ length: 12 }, (_, i) => i + 1).reverse();
    const loading = ref(false);

    useUserData();

    const API_HRV2 = async () => {
      try {
        loading.value = true;
        const response = await fetch(
          "https://23700999.com:8081/HMA/API_HRV2.jsp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

    onMounted(API_HRV2);

    const filteredHRVData = computed(() => {
      return HRVData.value.filter((item) => {
        const itemDate = new Date(item.CheckTime);
        return (
          itemDate.getFullYear() === selectedYear.value &&
          itemDate.getMonth() + 1 === selectedMonth.value
        );
      });
    });

    const displayYears = computed(() => {
      const currentYear = new Date().getFullYear();
      const startYear = 2024;
      const years = [];
      for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
      }
      return years;
    });

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

    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredHRVData.value.slice(start, end);
    });

    const totalPages = computed(() =>
      Math.ceil(filteredHRVData.value.length / itemsPerPage)
    );

    const displayedPages = computed(() => {
      const range = [];
      const start = Math.max(currentPage.value - 1, 1);
      const end = Math.min(currentPage.value + 1, totalPages.value);

      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      return range;
    });

    function firstPage() {
      currentPage.value = 1;
    }

    function lastPage() {
      currentPage.value = totalPages.value;
    }

    function changePage(page) {
      currentPage.value = page;
    }

    function nextPage() {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    }

    function prevPage() {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    }

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

    const goBack = () => {
      router.push("/HRVHistory");
    };

    const openHRVAlert = async () => {
      localStorage.removeItem("form");
      store.showHRVAlert = true;
    };

    return {
      filteredHRVData,
      selectedYear,
      selectedMonth,
      displayYears,
      months,
      formatTimestampMDH,
      isHRVBelowAverage,
      toggleYearBox,
      toggleMonthBox,
      selectYear,
      selectMonth,
      yearBoxVisible,
      monthBoxVisible,
      currentPage,
      totalPages,
      displayedPages,
      nextPage,
      prevPage,
      firstPage,
      lastPage,
      changePage,
      paginatedData,
      goBack,
      openHRVAlert,
      loading,
    };
  },
};
</script>

<style lang="scss" scoped>
.HRVHistoryAll {
  background-color: $raphael-gray-100;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 66px;
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

.detectWrap {
  background-color: $raphael-white;
  border-radius: 12px;
  margin-top: 0.75rem;
  padding: 0.75rem;
  width: 100%;
  max-width: 768px;

  .detectSelectGroup {
    display: flex;
    align-items: center;
    justify-content: end;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    color:  $raphael-gray-500;
  }
  .yearSelectGroup {
    display: flex;
    align-items: center;
    gap: 2px;
    position: relative;
    cursor: pointer;
    .yearBox {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
      .year {
          transform: 0.25s all ease;
          &:hover{
            color: $raphael-green-400;
          }
        }
    }
  }
  .monthSelectGroup {
    display: flex;
    align-items: center;
    gap: 2px;
    position: relative;
    cursor: pointer;

    .monthBox {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
          transform: 0.25s all ease;
          &:hover{
            color: $raphael-green-400;
          }
        }
    }
  }
  .detectList { 
    @include recordList(transparent,calc(100vh - 368px),0,0);
    @include scrollbarStyle();
    @include respond-to("phone-landscape"){
      height: calc(100vh - 100px);
    }
  }

  .notDetectData {
    position: absolute;
    z-index: 11;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    letter-spacing: 10px;
    font-size: 1.25rem;
    white-space: nowrap;
    color:  $raphael-gray-300;
  }
  .detectItem {
    width: 100%;
    margin: 0 auto;
    opacity: 0;
    transition: 0.2s ease all;
    animation: fadeIn2 1s ease forwards; // 設置動畫效果
    animation-delay: 0s;

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
      color:  $raphael-black;
      display: flex;
      justify-content: space-between;
      transition: all .2s ease;
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
          color:  $raphael-gray-500;
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
        }

        .detectAgeGroup {
          display: none;
          color:  $raphael-gray-500;
        }
        .detectHRVGroup {
          color:  $raphael-gray-500;
          h5 {
            span {
              display: inline-flex;
              min-width: 50px;    
            }
          }
        }
        h5 {
          color: #b3b3b3;
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
          margin-top: 0.25rem;
          span {
            color:  $raphael-black;
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

.paginationWrap {
  display: flex;
  justify-content: space-between;
  color:  $raphael-gray-500;
  font-size: 18px;
  text-align: center;
  max-width: 768px;
  width: 100%;
  margin-top: 1.5rem;

  .preBtnGroup,
  .nextBtnGroup {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  button {
    width: 36px;
    height: 36px;
    cursor: pointer;
    padding: 5px 13px;
    background: $raphael-white;
    border: none;
    border-radius: var(--Radius-200, 8px);
    color:  $raphael-gray-500;
    transition: all .2s ease;
    &:hover{
      filter: brightness(.95);
    }
  }
  .paginationCenter {
    width: 50%;
    display: flex;
    justify-content: center;
    gap: 10px;

    button {
      align-items: center;
    }
    .activePage {
      background: $raphael-green-400;
      color: $raphael-white;
    }
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
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

.itemsGroup {
  display: grid;
  width: 100%;
  max-width: 768px;
  margin-top: 32px;

  .item {
    background-color: $raphael-purple-200;
    position: relative;
    cursor: pointer;
    border-radius: 0.75rem;
    padding: 0.75rem;
    opacity: 1;
    color: $raphael-white;
    line-height: 1.2;
    overflow: hidden;
    transition: 0.15s all ease;

    .topTitle {
      font-weight: 400;
      font-size: 1.25rem;
      color: $raphael-gray-100;
      letter-spacing: 0.09px;
      margin-bottom: 4px;
    }

    .bottomTitle {
      font-size: 2.25rem;
      font-weight: bold;
      letter-spacing: 0.09px;

      @include respond-to("tablet") {
        font-size: 3rem;
      }
    }

    & > img {
      position: absolute;
      top: 1rem;
      right: 1rem;
    }
    &:hover {
      filter: brightness(0.95);
    }
  }
}
</style>
