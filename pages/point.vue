<template>
  <RaphaelLoading v-if="loading" />
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
        <h6 @click="goToPointRules">查看完整積分規則</h6>
        <div class="shadowGroup">
          <div class="shadow1"></div>
          <div class="shadow2"></div>
        </div>
      </div>

      <MemberGroup :showExchangeGroup="true"></MemberGroup>

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
        <transition name="fade" mode="out-in">
          <div :key="activeTab">
            <div class="todayTask" v-if="activeTab === 'todayTask'">
              <div class="todayTaskSubTitle">
                完成度 <span>{{ completedCount }}/{{ totalTaskCount }}</span>
              </div>

              <div class="todayTaskItemGroup">
                <div
                  class="todayTaskItem"
                  v-for="(task, index) in taskList"
                  :key="index"
                >
                  <div class="todayTaskText">
                    <img src="/assets/imgs/todayTaskIcon.svg" alt="" />
                    {{ task.Name }}
                  </div>
                  <div class="todayTaskOption">
                    <div class="todayTaskItemNumber">
                      <div
                        v-if="task.Info == '去完成' || task.Info == '已經完成'"
                      >
                        +{{ task.Points }}
                      </div>

                      <!-- 假設 "已經完成" 顯示一個打勾圖示 -->
                      <img
                        v-if="task.Info === '已經完成'"
                        src="../assets/imgs/todayTaskCheck.svg"
                        alt="打勾"
                      />
                    </div>

                    <!-- 如果任務是 "去完成" 就顯示按鈕 -->
                    <div
                      v-if="task.Info === '去完成'"
                      class="todayTaskItemButton"
                    >
                      <button @click="handleTaskClick(task)">去完成</button>
                    </div>

                    <!-- 其他情況(比如 "還有10天才可以做" 之類) 顯示文字 -->
                    <small
                      v-else-if="task.Info && task.Info !== '已經完成'"
                      style="color: #ec7d7d"
                    >
                      {{ task.Info }}
                    </small>
                  </div>
                </div>
              </div>
              <div class="todayTaskHR"></div>
              <h6>今日可獲得總積分：{{ dailyAvailablePoints }}</h6>
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
                <!-- v-for 顯示 bonusRecList -->
                <div
                  class="pointRecordDiv"
                  v-for="(item, index) in bonusRecList"
                  :key="index"
                >
                  <div class="pointRecordList">
                    <div class="imgGroup">
                      <img
                        class="Time"
                        src="../assets/imgs/detectTime2.svg"
                        alt=""
                      />
                    </div>
                    <div class="pointRecordText">
                      <!-- CreateTime, Name, Info -->
                      <h4>{{ item.CreateTime }}</h4>
                      <h5>{{ item.Name }}</h5>
                      <!-- Info 例如 "到期日:2026/01/20" -->
                      <h6 v-if="item.Info">
                        <img src="../assets/imgs/detectTime3.svg" alt="" />
                        {{ item.Info }}
                      </h6>
                    </div>
                  </div>
                  <!-- Points -->
                  <div class="pointRecordNumber">+{{ item.Points }}</div>
            
                </div>

                <div class="notDetectData" v-if="bonusRecList.length === 0">
                  尚無積分紀錄
                </div>
              </div>
            </div>
            <div v-else-if="activeTab === 'exchangeRecord'">
              <div class="exchangeRecordSelectGroup">
                <!-- 選擇年份與月份的下拉選單 -->
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
                <div
                  class="exchangeRecordDiv"
                  v-for="(rec, index) in exchangeRecordList"
                  :key="index"
                >
                  <div class="exchangeRecordList">
                    <div class="imageGroup">
                      <img
                        src="/assets/imgs/pointExchangeGift.svg"
                        alt="券圖示"
                      />
                    </div>
                    <div class="exchangeRecordText">
                      <h4>{{ rec.CreateTime }}</h4>
                      <h5>{{ rec.Name.replace("#", " ") }} 兌換完成</h5>
                      <h6
                        :class="{
                          canUse: rec.Info.includes('可立即使用'),
                          canUseLimit: rec.Info.includes('可使用日'),
                        }"
                      >
                        <!-- 根據 Info 內容決定顯示哪個圖示 -->
                        <img
                          v-if="rec.Info.includes('可立即使用')"
                          src="/assets/imgs/canUse.svg"
                          alt=""
                        />
                        <img
                          v-else-if="rec.Info.includes('可使用日')"
                          src="/assets/imgs/canUseLimit.svg"
                          alt=""
                        />
                        {{ rec.Info }}
                      </h6>
                    </div>
                  </div>
                  <div class="exchangeRecordListOption">
                    <button @click="handleCheck(rec)">查看</button>
                  </div>
                </div>

                <div
                  class="notDetectData"
                  v-if="exchangeRecordList.length === 0"
                >
                  尚無兌換紀錄
                </div>
              </div>
            </div>
            <div v-else-if="activeTab === 'pointRules'">
              <div class="pointRulesInfo">
                <ul>
                  <li>雲端會員：每消費100元獲得1點積分</li>
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
        </transition>
      </div>
    </div>
  </div>
  <!-- 可立即使用 => verificationBox -->
  <div class="verificationBox" v-show="verificationBoxVisible">
    <div class="verificationNumberGroup">
      <div class="verificationNumber">
        {{ currentCoupon.DigitalCode || "12345678" }}
      </div>
    </div>
    <h4>{{ currentCoupon.Name.replace("#", " ") }}</h4>
    <h5>可用於療程商品折抵</h5>
    <div @click="closeAllModals" class="verificationClose">
      <img src="/assets/imgs/pointClose.svg" alt="" />
    </div>
  </div>

  <!-- 有可使用日 => couponBox -->
  <div class="couponBox" v-show="couponBoxVisible">
    <div class="couponBoxImgGroup">
      <img src="/assets/imgs/gift.png" alt="" />
    </div>
    <h4>{{ currentCoupon.Name.replace("#", " ") }}</h4>
    <h5>可用於療程商品折抵</h5>
    <ul>
      <li>
        兌換日期 <span>{{ currentCoupon.CreateTime }}</span>
      </li>
      <li>
        兌換積分 <span>{{ currentCoupon.AvaPoints }}</span>
      </li>
      <li>
        可使用日 <span>{{ currentCoupon.Info }}</span>
      </li>
    </ul>
    <div class="couponBoxClose" @click="closeAllModals">
      <img src="/assets/imgs/pointClose.svg" alt="" />
    </div>
  </div>

  <!-- 已兌換完成 => couponBoxCompleted -->
  <div class="couponBoxCompleted" v-show="couponBoxCompletedVisible">
    <div class="couponBoxImgGroup">
      <img src="/assets/imgs/gift.png" alt="" />
    </div>
    <h4>{{ currentCoupon.Name.replace("#", " ") }}</h4>
    <h5>可用於療程商品折抵</h5>
    <ul>
      <li>
        兌換日期 <span>{{ currentCoupon.CreateTime }}</span>
      </li>
      <li>
        兌換積分 <span>{{ currentCoupon.AvaPoints }}</span>
      </li>
      <li>
        已使用日 <span>{{ formatUseTime(currentCoupon.UseTime) }}</span>
      </li>
    </ul>
    <div class="couponBoxClose" @click="closeAllModals">
      <img src="/assets/imgs/pointClose.svg" alt="" />
    </div>
  </div>

  <!-- 遮罩 -->
  <div
    class="pointCover"
    v-show="pointCoverVisible"
    @click="closeAllModals"
  ></div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { usePoint } from "@/stores/point";
import { nextTick } from "vue";
/** ---------------------
  其餘 template, style 已存在，此處只改動 script 區
---------------------- **/

const pointStore = usePoint();
const router = useRouter();
const loading = ref(false); // 新增 loading 狀態
// 切換標籤
const activeTab = ref("todayTask");

// 當前年份和月份 (for 積分紀錄)
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);

// 當前年份和月份 (for 兌換紀錄)
const selectedExchangeYear = ref(new Date().getFullYear());
const selectedExchangeMonth = ref(new Date().getMonth() + 1);

// 控制年份和月份下拉框可視
const yearBoxVisible = ref(false);
const monthBoxVisible = ref(false);
const exchangeYearBoxVisible = ref(false);
const exchangeMonthBoxVisible = ref(false);

// 用於「積分紀錄」(API_BonusRec.jsp) 的資料
const bonusRecList = ref([]);
const bonusExchangeList = ref([]); // 如果你用在 "pointRecord" 頁也需要 BonusPaperList

// 用於「兌換紀錄」(API_ExchangeRec.jsp) 的資料
const exchangeRecordList = ref([]); // 這才是 兌換紀錄
const bonusPaperList = ref([]); // 可兌換商品 (看需求是否要顯示)

const verificationBoxVisible = ref(false); // 可立即使用 => 顯示 "verificationBox"
const couponBoxVisible = ref(false); // 有可使用日 => 顯示 "couponBox"
const couponBoxCompletedVisible = ref(false); // 兌換完畢 => 顯示 "couponBoxCompleted"
const pointCoverVisible = ref(false); // 灰色半透明罩層

const localData = localStorage.getItem("userData");
const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
if (!MID || !Token || !MAID || !Mobile) {
  router.push("/");
}

const currentCoupon = ref({
  DigitalCode: "",
  AvaPoints: "",
  Name: "",
  CreateTime: "",
  UseTime: "",
  // ... 你需要的欄位
});
// 統一關閉所有視窗
function closeAllModals() {
  verificationBoxVisible.value = false;
  couponBoxVisible.value = false;
  couponBoxCompletedVisible.value = false;
  pointCoverVisible.value = false;
}

/**
 * 將 20250205152318 => 2025/02/05 15:23
 */
function formatUseTime(str) {
  if (!str) return "";
  // 先移除所有非數字，假設後端可能會帶其他符號
  const digits = str.replace(/\D/g, ""); // 將非數字都去掉

  // 確認長度是否正好 14 碼
  if (digits.length === 14) {
    const year = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    const day = digits.slice(6, 8);
    const hour = digits.slice(8, 10);
    const minute = digits.slice(10, 12);
    // const second = digits.slice(12, 14);

    return `${year}/${month}/${day} ${hour}:${minute}`;
  } else {
    // 如果不是 14 碼，就直接回傳原始內容
    return str;
  }
}

// 「查看」按鈕的點擊事件
function handleCheck(rec) {
  closeAllModals();

  currentCoupon.value = {
    DigitalCode: rec.DigitalCode,
    AvaPoints: rec.AvaPoints,
    Name: rec.Name,
    CreateTime: rec.CreateTime,
    Info: rec.Info,
    // 轉換 UseTime
    UseTime: formatUseTime(rec.UseTime),
  };

  // 根據 Info 顯示對應視窗...
  if (rec.Info.includes("可立即使用")) {
    verificationBoxVisible.value = true;
  } else if (rec.Info.includes("可使用日")) {
    couponBoxVisible.value = true;
    const matched = rec.Info.split(":")[1] || "";
    currentCoupon.value.Info = matched.trim();
  } else {
    couponBoxCompletedVisible.value = true;
  }

  pointCoverVisible.value = true;
}

// ------- tab 切換
function setActiveTab(tabName) {
  activeTab.value = tabName;
  if (tabName === "exchangeRecord") {
    // 切到「兌換紀錄」時，呼叫 fetchExchangeRec
    fetchExchangeRec();
  } else if (tabName === "pointRecord") {
    fetchBonusRec();
  }
}

// ------- 下拉相關
const startYear = 2024;
// 生成年份 (for 積分紀錄)
const displayYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
});

// 生成年份 (for 兌換紀錄)
const exchangeDisplayYears = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
});

// 生成月份
const allAvailableMonths = computed(() => {
  return displayYears.value.reduce((acc, year) => {
    acc[year] = Array.from({ length: 12 }, (_, i) => i + 1);
    return acc;
  }, {});
});

// 該年份對應可用月份 (for 積分紀錄)
const availableMonths = computed(() => {
  return allAvailableMonths.value[selectedYear.value] || [];
});
// 該年份對應可用月份 (for 兌換紀錄)
const exchangeAvailableMonths = computed(() => {
  return allAvailableMonths.value[selectedExchangeYear.value] || [];
});

// 切換年份下拉
function toggleYearBox(scope) {
  if (scope === "point") {
    yearBoxVisible.value = !yearBoxVisible.value;
    monthBoxVisible.value = false;
  } else if (scope === "exchange") {
    exchangeYearBoxVisible.value = !exchangeYearBoxVisible.value;
    exchangeMonthBoxVisible.value = false;
  }
}
// 切換月份下拉
function toggleMonthBox(scope = "point") {
  if (scope === "exchange") {
    exchangeMonthBoxVisible.value = !exchangeMonthBoxVisible.value;
    exchangeYearBoxVisible.value = false;
  } else {
    monthBoxVisible.value = !monthBoxVisible.value;
    yearBoxVisible.value = false;
  }
}

// 選擇年份
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
  console.log("Selected " + scope + " year:", year);
}

// 選擇月份
function selectMonth(month, scope) {
  if (scope === "exchange") {
    selectedExchangeMonth.value = month;
    exchangeMonthBoxVisible.value = false;
  } else {
    selectedMonth.value = month;
    monthBoxVisible.value = false;
  }
  console.log("Selected " + scope + " month:", month);
}

function selectExchangeYear(year) {
  selectedExchangeYear.value = year;
  selectedExchangeMonth.value = exchangeAvailableMonths.value[0] || 1;
  exchangeYearBoxVisible.value = false;
  console.log("Selected exchange year:", year);
}

// 點擊外部關閉下拉
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

// ------------- 「積分紀錄」API_BonusRec
async function fetchBonusRec() {
  const yrParam = selectedYear.value ? String(selectedYear.value) : "";
  const mnParam = selectedMonth.value
    ? String(selectedMonth.value).padStart(2, "0")
    : "";

  try {
    const resp = await axios.post(
      "https://23700999.com:8081/HMA/API_BonusRec.jsp",
      {
        MID,
        Token,
        MAID,
        Mobile,
        Yr: yrParam,
        Mn: mnParam,
      }
    );
    if (resp.status === 200 && resp.data.Result === "OK") {
      const bonusRec = resp.data.BonusRec || {};
      bonusRecList.value = bonusRec.BonusRecList || [];
      bonusExchangeList.value = bonusRec.BonusPaperList || [];
      console.log("[fetchBonusRec] => ", resp.data);
    } else {
      console.error("[fetchBonusRec] error =>", resp);
    }
  } catch (err) {
    console.error("[fetchBonusRec] catch =>", err);
  }
}

// ------------- 「兌換紀錄」API_ExchangeRec (重點)
// 用 axios 呼叫 API_ExchangeRec.jsp
async function fetchExchangeRec() {
  const mnParam = selectedExchangeMonth.value
    ? String(selectedExchangeMonth.value).padStart(2, "0")
    : "";
  try {
    const resp = await axios.post(
      "https://23700999.com:8081/HMA/API_ExchangeRec.jsp",
      {
        MID,
        Token,
        MAID,
        Mobile,
        Yr: String(selectedExchangeYear.value),
        Mn: mnParam,
      }
    );
    if (resp.status === 200 && resp.data.Result === "OK") {
      const exchRec = resp.data.ExchangeRec || {};
      // exchRec.BonusExchangeList => 兌換紀錄
      exchangeRecordList.value = exchRec.BonusExchangeList || [];

      // exchRec.BonusPaperList => 可兌換商品清單(視需求再用)
      console.log("exchangeRecordList => ", exchangeRecordList.value);
    }
  } catch (err) {
    console.error(err);
  }
}

/** 在 mounted 時，若有需要預設去撈 */
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  // 也許預設先撈一次
  fetchBonusRec();
  fetchExchangeRec();
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

// ------------- 監聽: 變換「pointRecord」日期 => fetchBonusRec
watch([selectedYear, selectedMonth], () => {
  if (activeTab.value === "pointRecord") {
    fetchBonusRec();
  }
});

// ------------- 監聽: 變換「exchangeRecord」日期 => fetchExchangeRec
watch([selectedExchangeYear, selectedExchangeMonth], () => {
  if (activeTab.value === "exchangeRecord") {
    fetchExchangeRec();
  }
});

// ------------- 讀取 store 裡的任務 (今日任務)
const taskList = computed(() => pointStore.taskList);
function handleTaskClick(task) {
  if (task.Info !== "去完成") return;
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
      return;
  }
  window.open(path, "_blank");
}

// ------------- 今日任務計算
const completedCount = computed(() => {
  return taskList.value.filter((t) => t.Info === "已經完成").length;
});
const totalTaskCount = computed(() => taskList.value.length);
const todayProgress = computed(() => {
  if (!totalTaskCount.value) return 0;
  return (completedCount.value / totalTaskCount.value) * 100;
});
const dailyAvailablePoints = computed(() => {
  return pointStore.nowBonusState?.Cando || 0;
});

// 讓 activeTab 切換後滾動到積分規則區域
const goToPointRules = async () => {
  activeTab.value = "pointRules"; // 切換 tab

  await nextTick(); // 等待 DOM 更新

  // 滾動到積分規則區塊
  const pointRulesSection = document.querySelector(".pointRulesInfo");
  if (pointRulesSection) {
    pointRulesSection.scrollIntoView({ behavior: "smooth" });
  }
};
</script>

<style lang="scss">
.point {
  background-color: #f6f6f6;
  padding: 0 5% 60px;
  min-height: 100vh;
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.1s ease; /* 淡入淡出的速度、動畫曲線 */
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0; /* 進場前或離場後，元素透明度設為 0 */
  }

  .helperGroup {
    .helper {
      border-radius: 8px;
      margin-bottom: 1.75rem;
      margin-top: 0.25rem;
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
      
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      position: relative;
      .helperTitle {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--shade-white, #fff);
        
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
        margin-bottom: 1rem;
      }
      p {
        color: var(--shade-white, #fff);
        
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 32.36px;
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
      h6 {
        text-align: center;
        margin-top: 0.75rem;
        color: var(--shade-white, #fff);
        text-align: center;
        
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
        cursor: pointer;
      }
      .shadowGroup {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        height: 20px;

        .shadow1 {
          position: absolute;
          top: -3%;
          left: 3%;
          width: 94%;
          height: 8px;
          background: linear-gradient(
              0deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0) 100%
            ),
            rgba(116, 188, 31, 0.6);
          background-blend-mode: soft-light, normal;
          backdrop-filter: blur(45px);
          opacity: 0.5;
          border-radius: 0 0 8px 8px;
          z-index: -1; /* 讓陰影跑到 .helper 背後 */
        }
        .shadow2 {
          position: absolute;
          top: 30%;
          left: 6%;
          width: 88%;
          height: 8px;
          background: linear-gradient(
              0deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0) 100%
            ),
            rgba(116, 188, 31, 0.6);
          background-blend-mode: soft-light, normal;
          backdrop-filter: blur(45px);
          opacity: 0.25;
          border-radius: 0 0 8px 8px;
          z-index: -1; /* 讓陰影跑到 .helper 背後 */
        }
      }
    }
  }

  .pointContentGroup {
    background-color: #fff;
    margin-top: 1rem;
    padding: 0.75rem;
    position: relative;
    border-radius: 12px;
    .pointRecordGroup{
      position: relative;
      min-height: 20vh;
    }
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
        
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%;
        letter-spacing: 0.09px;
        transition: all .2s ease;
        &:hover{
          color: #74bc1f;
        }
      }
      .pointContentListItemActive {
        color: #74bc1f;
        border-bottom: 2px solid #74bc1f;
        padding-bottom: 0.15rem;
      }
    }
    .pointRecordNumber {
      color: #74bc1f;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    .pointRecordNumberNot {
      color: #feac4a;
    }
    .todayTask {
      .todayTaskSubTitle {
        text-align: right;
        padding: 0.5rem 0;
        span {
          color: #1fbcb3;
          margin-left: 0.2rem;
          letter-spacing: 6px;
        }
      }
      .todayTaskTitle {
        text-align: right;
        span {
          color: #1fbcb3;
          text-align: center;
          
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
        padding: 0.5rem 0;
        .todayTaskText {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 1.125rem;
          color: #666;
        }
        .todayTaskOption {
          display: flex;
          align-items: center;
          gap: 4px;
          img {
            transform: translateY(22%);
          }
          .todayTaskItemNumber {
            color: #74bc1f;
            
            font-size: 18px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.09px;
            margin-right: 0.25rem;
            display: flex;
            gap: 4px;
            img {
              transform: translateY(2%);
            }
          }
        }
        .todayTaskItemButton {
          button {
            color: #1fbcb3;
            background-color: transparent;
            border-radius: 8px;
            border: 1px solid;
            
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.5px;
            cursor: pointer;
            padding: 7px 5px;
            transition: all .2s ease;

            &:hover{
              background-color: $raphael-cyan-400;
              color: $raphael-white;
            }
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
        
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.5px;
        margin: 1rem 0;
        margin-bottom: 0.5rem;
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
            font-size: 20px;
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.15px;
            margin-bottom: 0.5rem;
          }
          h5 {
            color: #666;
            
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.5px;
            margin-bottom: 0.5rem;
          }
          h6 {
            color: var(--primary-orange-400, #feac4a);
            
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
      position: relative;
      min-height: 20vh;
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
              
              font-size: 20px;
              font-style: normal;
              font-weight: 400;
              line-height: 100%;
              letter-spacing: 0.15px;
            }
            h5 {
              color: #666;
              
              font-size: 16px;
              font-style: normal;
              font-weight: 400;
              line-height: 100%;
              letter-spacing: 0.5px;
              margin-top: 0.5rem;
            }
            h6 {
              
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
              letter-spacing: 0.1px;
              margin-top: 0.5rem;
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
            font-size: 18px;
            letter-spacing: 0.09px;
          }
        }
        .pointRulesNumber {
          color: #74bc1f;
          
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

.verificationBox {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  background-color: #fff;
  z-index: 999;
  padding: 0 0 0.75rem;
  border-radius: 12px;
  background: var(--shade-white, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  max-width: 768px;

  .verificationNumberGroup {
    border-radius: 12px;
    width: 90%;
    background: #fef1e2;
    margin: 0 auto;
    padding: 1rem;
    margin-top: 0.75rem;
    text-align: center;
    .verificationNumber {
      color: #bc581f;
      
      font-size: 2rem;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 20px;
      margin-left: 10px;
    }
  }
  h4 {
    color: #1e1e1e;
    
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.12px;
    text-align: center;
    margin-top: 0.5rem;
  }
  h5 {
    color: #666;
    
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
    text-align: center;
    margin-top: 0.35rem;
  }
}
.verificationClose,
.couponBoxClose {
  border-radius: 50px;
  background: var(--brand-green-400, #74bc1f);
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.25);
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  margin-top: 1rem;
  cursor: pointer;
}
.pointCover {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0%;
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
  z-index: 99;
}
.couponBox,
.couponBoxCompleted {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  border-radius: 12px;
  background: var(--shade-white, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 1rem;
  width: 90%;
  min-height: 510px;
  max-height: 600px;
  .couponBoxImgGroup {
    text-align: center;
    margin: 0 autos;
    img {
      width: 275px;
      transform: translateX(3%);
    }
  }
  h4 {
    color: #1e1e1e;
    text-align: center;
    
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.12px;
    margin-top: 0.25rem;
  }
  h5 {
    color: #666;
    
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.5px;
    text-align: center;
    margin-top: 0.35rem;
  }
  ul {
    margin-top: 1rem;
    display: flex;
    flex-flow: column;
    margin-left: 12.5%;

    li {
      line-height: 1.4;
      color: #666;
      
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
      &:nth-child(1) {
        span {
          color: #74bc1f;
        }
      }
      &:nth-child(2) {
        span {
          color: #ec7d7d;
        }
      }
      &:nth-child(3) {
        span {
          color: #1fbcb3;
        }
      }
    }
  }
}
.couponBoxCompleted {
  img {
    filter: grayscale(0.98);
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
  color: $raphael-gray-300;
}
</style>
