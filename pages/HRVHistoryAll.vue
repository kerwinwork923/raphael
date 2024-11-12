<template>
  <div class="HRVHistoryAll">
    <div class="titleGroup">
      <img src="/assets/imgs/backArrow.png" alt="" @click="goBack" />
      <h2>HRV檢測歷史紀錄</h2>
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
          <a :href="`detail.html?AID=${item.AID}`">
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
          <<
        </button>
        <button
          class="prevPageBtn"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          <
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
          >
        </button>
        <button
          class="lastPageBtn"
          @click="lastPage"
          :disabled="currentPage === totalPages"
        >
          >>
        </button>
      </div>
    </div>

    <div class="itemsGroup">
      <div class="item item2" @click="convertAndSaveUserData">
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
export default {
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
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const API_HRV2 = async () => {
      try {
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
    };
  },
};
</script>

<style lang="scss">
.HRVHistoryAll {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  padding: 0 5% 5%;
}
.titleGroup {
  padding-top: 1.5rem;

  img {
    position: absolute;
    width: 14px;
    left: 3.5%;
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
  background-color: #fff;

  max-width: 768px;
  margin: 1.5rem auto 0;
  border-radius: 12px;

  h3 {
    text-align: center;
    color: #1e1e1e;
    text-align: center;
    font-family: "Noto Sans";
    font-size: 24px;
    font-weight: 400;
    letter-spacing: 0.5px;
    padding-top: 0.75rem;
  }
  .detectSelectGroup {
    display: flex;
    align-items: center;
    justify-content: end;
    padding: 0.75rem 0 0.25rem;
    color: #666;
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
      background: #f4f4f4;
      width: 200%;
      border-radius: 8px;
      text-align: center;
      padding: 0.75rem 0 0;
      min-height: 45px;
      max-height: 200px;
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
      background: #f4f4f4;
      width: 200%;
      border-radius: 8px;
      text-align: center;
      padding: 0.75rem 0 0;
      height: 200px;
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
  .detectList {
    overflow-y: auto;
    height: 60vh;
    margin-top: 0.5rem;
  }

  .detectItem {
    width: 100%;
    margin: 0 auto;
    opacity: 0;
    transition: 0.24s ease all;
    animation: fadeIn2 1s ease forwards; // 設置動畫效果
    animation-delay: 0s;

    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: $i * 0.07s;
      }
    }
    a {
      text-decoration: none;
      color: #1e1e1e;
      display: flex;
      padding: 0 5%;
      .timeGroup {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 50%;
        padding: 1.25rem 0;
        .timeIcon {
          border-radius: 7px;
          padding: 6px;
          border: 1px solid var(--brand-green-400, #74bc1f);
        }
        .time {
          font-family: "Noto Sans";
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.15px;
          margin-left: 0.5rem;
        }
      }
      .infoGroup {
        width: 60%;
        display: flex;

        align-items: center;
        white-space: nowrap;
        gap: 0.75rem;

        justify-content: end;

        h4 {
          color: #666;
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
        }
        h5 {
          color: #b3b3b3;
          font-family: "Noto Sans";
          font-size: 1rem;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
          margin-top: 0.25rem;
          span {
            color: #1e1e1e;
            font-family: "Noto Sans";
            font-size: 1.5rem;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.12px;
            margin-right: 0.5rem;
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

.paginationWrap {
  text-align: center;
  display: flex;
  justify-content: center;
  justify-content: space-between;
  color: #666;
  font-size: 18px;
  max-width: 768px;
  margin: 0.85rem auto 0;
  .preBtnGroup,
  .nextBtnGroup {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  button {
    width: 36px;
    height: 36px;
    padding: 5px 13px;
    background: #eee;
    border: none;
    border-radius: var(--Radius-200, 8px);
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
      background: var(--brand-green-400, #74bc1f);
      color: #fff;
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
  margin-top: 1.5rem;

  .item {
    background-color: #999;
    position: relative;
    border-radius: 0.75rem;
    padding: 0.75rem;
    opacity: 0.15;
    color: #fff;
    line-height: 1.2;
    overflow: hidden;

    a {
      color: #fff;
    }
    transition: 0.15s all ease;

    .topTitle {
      font-weight: 400;
      font-size: 1.25rem;
      color: #fefefe;
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

    img {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .item2 {
    background-color: $raphael-purple-200;
    opacity: 1;
    cursor: pointer;
    &:hover {
      filter: brightness(0.95);
    }
  }
}
</style>
