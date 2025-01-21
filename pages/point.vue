<template>
  <div class="point">
    <TitleMenu Text="獎勵積分" link="/user"></TitleMenu>
    <div class="helperGroup">
      <div class="helper">
        <div class="helperTitle">
          <img src="../assets/imgs/helperIcon.svg" alt="" />
          小幫手
        </div>
        <p>
          每消費100元獲得1點積分，1點積分等於1元。會員等級越高，積分越多！
          快來累積積分，享受更多回饋！
        </p>
        <h6>查看完整積分規則</h6>
      </div>
      <div class="shadowGroup">
        <div class="shadow1"></div>
      </div>

      <MemberGroup></MemberGroup>

      <div class="pointContentGroup">
        <div class="pointContentList">
          <div
            class="pointContentListItem"
            :class="{ pointContentListItemActive: activeTab === 'todayTask' }"
            @click="setActiveTab('todayTask')"
          >
            今日任務
          </div>
          <div
            class="pointContentListItem"
            :class="{ pointContentListItemActive: activeTab === 'pointRecord' }"
            @click="setActiveTab('pointRecord')"
          >
            積分紀錄
          </div>
          <div
            class="pointContentListItem"
            :class="{
              pointContentListItemActive: activeTab === 'exchangeRecord',
            }"
            @click="setActiveTab('exchangeRecord')"
          >
            兌換紀錄
          </div>
          <div
            class="pointContentListItem"
            :class="{ pointContentListItemActive: activeTab === 'pointRules' }"
            @click="setActiveTab('pointRules')"
          >
            積分規則
          </div>
        </div>
        <div class="todayTask" v-if="activeTab === 'todayTask'">
          <div class="todayTaskTitle">完成度 <span>4/7</span></div>
          <div class="todayTaskItemGroup">
            <div class="todayTaskItem">
              <div class="todayTaskText">
                <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                使用紀錄
              </div>
              <div class="todayTaskOption">
                <div class="todayTaskItemNumber">
                  +5
                  <img src="../assets/imgs/todayTaskCheck.svg" alt="" />
                </div>
              </div>
            </div>
            <div class="todayTaskItem">
              <div class="todayTaskText">
                <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                生活紀錄檢測
              </div>
              <div class="todayTaskOption">
                <div class="todayTaskItemNumber">+10</div>
                <div class="todayTaskItemButton">
                  <button>去完成</button>
                </div>
              </div>
            </div>
          </div>
          <div class="todayTaskHR"></div>
          <h6>今日可獲得總積分：470</h6>
          <div class="todayProgressBar">
            <div
              class="todayProgress"
              :style="{ width: todayProgress + '%' }"
            ></div>
          </div>
        </div>

        <div v-else-if="activeTab === 'pointRecord'">
          <div class="pointRecordSelectGroup">
            <div class="yearSelectGroup">
              <img src="/assets/imgs/filter.svg" alt="年份篩選" />
              <div class="monthText" @click="toggleYearBox('point')">
                {{ selectedYear }}年
              </div>
              <div class="yearBox" v-show="yearBoxVisible">
                <div
                  class="year"
                  v-for="year in displayYears"
                  :key="year"
                  @click="selectYear(year, 'point')"
                >
                  {{ year }}
                </div>
              </div>
            </div>
            <div class="monthSelectGroup">
              <img src="/assets/imgs/filter.svg" alt="月份篩選" />
              <div class="monthText" @click="toggleMonthBox('point')">
                {{ selectedMonth }} 月
              </div>
              <div class="monthBox" v-show="monthBoxVisible">
                <div
                  class="month"
                  v-for="month in availableMonths"
                  :key="month"
                  @click="selectMonth(month)"
                >
                  {{ month }} 月
                </div>
              </div>
            </div>
          </div>

          <div class="pointRecordGroup">
            <div class="pointRecordDiv">
              <div class="pointRecordList">
                <div class="imgGroup">
                  <img
                    class="Time"
                    src="../assets/imgs/detectTime2.svg"
                    alt=""
                  />
                </div>
                <div class="pointRecordText">
                  <h4>2025/01/01</h4>
                  <h5>自律神經檢測完成</h5>
                  <h6>
                    <img src="../assets/imgs/detectTime3.svg" alt="" />
                    到期日：2026/01/01
                  </h6>
                </div>
              </div>
              <div class="pointRecordNumber">+10</div>
            </div>
            <div class="pointRecordDiv">
              <div class="pointRecordList">
                <div class="imgGroup">
                  <img src="../assets/imgs/detectTime2.svg" alt="" />
                </div>
                <div class="pointRecordText">
                  <h4>2024/12/01</h4>
                  <h5>自律神經檢測完成</h5>
                  <h6 class="pointRecordTextNot">
                    <img src="../assets/imgs/pointWarning.svg" alt="" />
                    已過期
                  </h6>
                </div>
              </div>
              <div class="pointRecordNumber pointRecordNumberNot">+5</div>
            </div>
          </div>
        </div>
        <div v-else-if="activeTab === 'exchangeRecord'">
          <div class="exchangeRecordSelectGroup">
            <div class="yearSelectGroup">
              <img src="/assets/imgs/filter.svg" alt="年份篩選" />
              <div class="monthText" @click="toggleYearBox('exchange')">
                {{ selectedExchangeYear }}年
              </div>
              <div class="yearBox" v-show="exchangeYearBoxVisible">
                <div
                  class="year"
                  v-for="year in exchangeDisplayYears"
                  :key="year"
                  @click="selectExchangeYear(year)"
                >
                  {{ year }}
                </div>
              </div>
            </div>
            <div class="monthSelectGroup">
              <img src="/assets/imgs/filter.svg" alt="月份篩選" />
              <div class="monthText" @click="toggleMonthBox('exchange')">
                {{ selectedExchangeMonth }} 月
              </div>
              <div class="monthBox" v-show="exchangeMonthBoxVisible">
                <div
                  class="month"
                  v-for="month in exchangeAvailableMonths"
                  :key="month"
                  @click="selectMonth(month, 'exchange')"
                >
                  {{ month }} 月
                </div>
              </div>
            </div>
          </div>

          <div class="exchangeRecordGroup">
            <div class="exchangeRecordDiv">
              <div class="exchangeRecordList">
                <div class="imageGroup">
                  <img src="/assets/imgs/pointExchangeGift.svg" alt="" />
                </div>
                <div class="exchangeRecordText">
                  <h4>2025/02/01</h4>
                  <h5>$1,000 元抵用券兌換完成</h5>
                  <h6 class="canUse">
                    <img src="/assets/imgs/canUse.svg" alt="" />
                    可立即使用
                  </h6>
                </div>
              </div>
              <div class="exchangeRecordListOption">
                <button>查看</button>
              </div>
            </div>
            <div class="exchangeRecordDiv">
              <div class="exchangeRecordList">
                <div class="imageGroup">
                  <img src="/assets/imgs/pointExchangeGift.svg" alt="" />
                </div>
                <div class="exchangeRecordText">
                  <h4>2025/01/22</h4>
                  <h5>$1,600 元抵用券兌換完成</h5>
                  <h6 class="canUseLimit">
                    <img src="/assets/imgs/canUseLimit.svg" alt="" />
                    可使用日: 2025/01/23
                  </h6>
                </div>
              </div>
              <div class="exchangeRecordListOption">
                <button>查看</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="activeTab === 'pointRules'">
          <div class="pointRulesInfo">
            <ul>
              <li>碎石會員：每消費100元獲得1點積分</li>
              <li>青銅會員：每消費100元獲得1點積分</li>
              <li>白銀會員：每消費100元獲得1.2點積分</li>
              <li>黃金會員：每消費100元獲得1.5點積分</li>
              <li>積分價值：1點 = 台幣1元</li>
              <li>使用範圍：積分僅限於此平台使用</li>
              <li>
                有效期限：積分自獲得日起<span>12個月</span>內有效，請及時使用
              </li>
            </ul>
          </div>
          <div class="pointRulesListGroup">
            <div class="pointRulesList">
              <div class="pointRulesText">
                <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                <h4>使用紀錄</h4>
              </div>
              <div class="pointRulesNumber">+5</div>
            </div>
          </div>
          <div class="pointRulesListGroup">
            <div class="pointRulesList">
              <div class="pointRulesText">
                <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                <h4>自律神經檢測</h4>
              </div>
              <div class="pointRulesNumber">+10</div>
            </div>
          </div>
          <div class="pointRulesListGroup">
            <div class="pointRulesList">
              <div class="pointRulesText">
                <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                <h4>生活紀錄檢測</h4>
              </div>
              <div class="pointRulesNumber">+10</div>
            </div>
          </div>
          <div class="pointRulesListGroup">
            <div class="pointRulesList">
              <div class="pointRulesText">
                <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                <h4>寶貝記錄檢測</h4>
              </div>
              <div class="pointRulesNumber">+10</div>
            </div>
          </div>
          <div class="pointRulesListGroup">
            <div class="pointRulesList">
              <div class="pointRulesText">
                <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                <h4>點擊分享連結並完成註冊</h4>
              </div>
              <div class="pointRulesNumber">+100</div>
            </div>
          </div>
          <div class="pointRulesListGroup">
            <div class="pointRulesList">
              <div class="pointRulesText">
                <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                <h4>完成分享後進行產品購買</h4>
              </div>
              <div class="pointRulesNumber">+200</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

// 當前年份和月份
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedExchangeYear = ref(new Date().getFullYear());
const selectedExchangeMonth = ref(new Date().getMonth() + 1);

// 控制年份和月份下拉框
const yearBoxVisible = ref(false);
const monthBoxVisible = ref(false);
const exchangeYearBoxVisible = ref(false);
const exchangeMonthBoxVisible = ref(false);

// 活動選項控制
const activeTab = ref("todayTask");

// 切換 Tab 函數
function setActiveTab(tabName) {
  activeTab.value = tabName;
}

// 定義年份範圍
const startYear = 2024;
const displayYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
});

// 兌換紀錄年份範圍
const exchangeDisplayYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
});

// 根據年份動態生成可用月份（全月1-12）
const allAvailableMonths = computed(() => {
  return displayYears.value.reduce((acc, year) => {
    acc[year] = Array.from({ length: 12 }, (_, i) => i + 1);
    return acc;
  }, {});
});

// 動態計算當前年份和兌換紀錄年份的可用月份
const availableMonths = computed(() => {
  return allAvailableMonths.value[selectedYear.value] || [];
});
const exchangeAvailableMonths = computed(() => {
  return allAvailableMonths.value[selectedExchangeYear.value] || [];
});

// 切換年份下拉框（通用）
function toggleYearBox(scope) {
  if (scope === "point") {
    yearBoxVisible.value = !yearBoxVisible.value;
    monthBoxVisible.value = false;
  } else if (scope === "exchange") {
    exchangeYearBoxVisible.value = !exchangeYearBoxVisible.value;
    exchangeMonthBoxVisible.value = false;
  }
}

// 選擇年份（通用）
function selectYear(year, scope) {
  if (scope === "point") {
    selectedYear.value = year;
    selectedMonth.value = availableMonths.value[0] || 1;
    yearBoxVisible.value = false;
  } else if (scope === "exchange") {
    selectedExchangeYear.value = year;
    selectedExchangeMonth.value = exchangeAvailableMonths.value[0] || 1;
    exchangeYearBoxVisible.value = false;
  }
  console.log(`Selected ${scope} year:`, year);
}

// 切換月份下拉框（通用）
function toggleMonthBox(scope = "point") {
  if (scope === "exchange") {
    exchangeMonthBoxVisible.value = !exchangeMonthBoxVisible.value;
    exchangeYearBoxVisible.value = false;
  } else {
    monthBoxVisible.value = !monthBoxVisible.value;
    yearBoxVisible.value = false;
  }
}

// 選擇月份（通用）
function selectMonth(month, scope) {
  if (scope === "exchange") {
    selectedExchangeMonth.value = month;
    exchangeMonthBoxVisible.value = false;
  } else {
    selectedMonth.value = month;
    monthBoxVisible.value = false;
  }
  console.log(`Selected ${scope} month:`, month);
}

// 點擊外部關閉下拉框
function handleClickOutside(event) {
  const yearBox = document.querySelector(".yearBox");
  const monthBox = document.querySelector(".monthBox");

  if (
    yearBox &&
    !yearBox.contains(event.target) &&
    !event.target.closest(".yearSelectGroup")
  ) {
    yearBoxVisible.value = false;
    exchangeYearBoxVisible.value = false;
  }
  if (
    monthBox &&
    !monthBox.contains(event.target) &&
    !event.target.closest(".monthSelectGroup")
  ) {
    monthBoxVisible.value = false;
    exchangeMonthBoxVisible.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss">
.point {
  background-color: #f6f6f6;
  padding: 0 5% 60px;
  min-height: 100vh;
  .helperGroup {
    .helper {
      border-radius: 8px;
      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0) 100%
        ),
        rgba(116, 188, 31, 0.6);
      background-blend-mode: soft-light, normal;
      backdrop-filter: blur(45px);
      padding: 10px 12px;
      color: #fff;
      color: var(--shade-white, #fff);
      font-family: "Noto Sans";
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      .helperTitle {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--shade-white, #fff);
        font-family: "Noto Sans";
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
      p {
        color: var(--shade-white, #fff);
        font-family: "Noto Sans";
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 32.36px;
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
      h6 {
        text-align: center;
        margin-top: 0.5rem;
        color: var(--shade-white, #fff);
        text-align: center;
        font-family: "Noto Sans";
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
      }
    }
    .shadowGroup {
      .shadow1 {
        fill: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.4) 100%
          ),
          rgba(116, 188, 31, 0.44);
        background-blend-mode: soft-light, normal;
        backdrop-filter: blur(20.5px);
        background-color: rgba($color: #74bc1f70, $alpha: 1);
        transform: translateY(-4px);
        border-radius: 8px;
        opacity: 0.44;
      }
    }
  }

  .pointContentGroup {
    background-color: #fff;
    margin-top: 1rem;
    padding: 1rem;

    border-radius: 12px;
    .pointRecordDiv {
      display: flex;
      align-items: center;
    }
    .pointContentList {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      .pointContentListItem {
        cursor: pointer;
        color: #eee;
        font-family: "Noto Sans";
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%;
        letter-spacing: 0.09px;
      }
      .pointContentListItemActive {
        color: #74bc1f;
        border-bottom: 2px solid #74bc1f;
        padding-bottom: 0.15rem;
      }
    }
    .pointRecordNumber {
      color: #74bc1f;
      font-family: "Noto Sans";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    .pointRecordNumberNot {
      color: #feac4a;
    }
    .todayTask {
      .todayTaskTitle {
        text-align: right;
        span {
          color: #1fbcb3;
          text-align: center;
          font-family: "Noto Sans";
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: 0.5px;
        }
      }
      .todayTaskItem {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        .todayTaskText {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .todayTaskOption {
          display: flex;
          align-items: center;
          gap: 4px;
          img {
            transform: translateY(22%);
          }
        }
        .todayTaskItemButton {
          button {
            color: #1fbcb3;
            background-color: transparent;
            border-radius: 8px;
            border: 1px solid;
            font-family: "Noto Sans";
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.5px;
            cursor: pointer;
            padding: 8px 4px;
          }
        }
      }
      .todayTaskHR {
        width: 100%;
        height: 1px;
        margin-top: 0.35rem;
        background-color: #eee;
      }
      .todayProgressBar {
        position: relative;
        width: 100%;
        height: 10px;
        background-color: #e0e0e0;
        border-radius: 5px;
        margin-top: 10px;
        overflow: hidden;

        .todayProgress {
          height: 100%;
          background-color: #1fbcb3;
          border-radius: 5px;
          transition: width 0.3s ease;
        }
      }
      h6 {
        color: #1fbcb3;
        font-family: "Noto Sans";
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
        margin: 1rem 0;
      }
    }

    .pointRecordSelectGroup,
    .exchangeRecordSelectGroup {
      display: flex;
      align-items: center;
      justify-content: end;
      gap: 0.75rem;
      padding: 0.75rem 0;
      color: $raphael-gray-500;
      margin-top: 0.25rem;
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
          &:hover {
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
          &:hover {
            color: $raphael-green-400;
          }
        }
      }
    }

    .pointRecordDiv {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.75rem;
      .pointRecordList {
        display: flex;

        gap: 8px;
        align-items: center;
        .imgGroup {
          img {
            border-radius: 7px;
            padding: 6px;
            border: 1px solid #666;
          }
        }

        .pointRecordText {
          h4 {
            color: #1e1e1e;
            font-family: "Noto Sans";
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.15px;
            margin-bottom: 0.15rem;
          }
          h5 {
            color: #666;
            font-family: "Noto Sans";
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.5px;
            margin-bottom: 0.25rem;
          }
          h6 {
            color: var(--primary-orange-400, #feac4a);
            font-family: "Noto Sans";
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.1px;
            display: flex;
            align-items: center;
            gap: 2px;
            img {
              width: 12px;
            }
          }
          .pointRecordTextNot {
            color: #ec7d7d;
          }
        }
      }
    }

    .exchangeRecordGroup {
      .exchangeRecordDiv {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        .exchangeRecordList {
          display: flex;
          align-items: center;
          gap: 8px;
          .exchangeRecordText {
            h4 {
              color: #1e1e1e;
              font-family: "Noto Sans";
              font-size: 20px;
              font-style: normal;
              font-weight: 400;
              line-height: 100%;
              letter-spacing: 0.15px;
            }
            h5 {
              color: #666;
              font-family: "Noto Sans";
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 100%;
              letter-spacing: 0.5px;
              margin-top: 0.2rem;
            }
            h6 {
              font-family: "Noto Sans";
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.1px;
              margin-top: 0.2rem;
            }
            .canUse {
              color: #1fbcb3;
            }
            .canUseLimit {
              color: #feac4a;
            }
          }
        }
        .exchangeRecordListOption {
          display: flex;
          align-items: center;
          button {
            border: none;
            background-color: transparent;
            color: $raphael-green-400;
            font-family: "Noto Sans";
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.5px;
            cursor: pointer;
          }
        }
      }
    }

    .pointRulesInfo {
      background-color: #fef1e2;
      padding: 8px;
      border-radius: 8px;
      color: #666;
      font-family: "Noto Sans";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      line-height: 25.888px;
      letter-spacing: 0.5px;
      margin-top: 0.75rem;
      ul {
        list-style: outside;
        margin-left: 1.5rem;
        span {
          color: #ec4f4f;
        }
      }
    }

    .pointRulesListGroup {
      margin-top: 0.75rem;
      .pointRulesList {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .pointRulesText {
          display: flex;
          align-items: center;
          gap: 2px;
          h4 {
            color: #666;
            font-family: "Noto Sans";
            font-size: 18px;
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.09px;
            padding-top: 0.3rem;
          }
        }
        .pointRulesNumber {
          color: #74bc1f;
          font-family: "Noto Sans";
          font-size: 18px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%;
          letter-spacing: 0.09px;
        }
      }
    }
  }
}
</style>
