<template>
  <!-- 載入中 -->
  <RaphaelLoading v-if="loading" />

  <!-- 主要容器：loading 結束後才顯示 -->
  <div v-else class="contractWrap">
    <div
      class="contractCover"
      v-if="
        leaveApplicationAlertShow || leaveRecordAlertShow || overLimitAlertShow
      "
    ></div>
    <TitleMenu Text="合約|請假" link="/user" />

    <!-- Tabs 切換 -->
    <div class="typeChangeTag">
      <h2
        :class="{ typeChangeTagActive: activeTab === 'contractList' }"
        @click="activeTab = 'contractList'"
      >
        合約列表
      </h2>
      <h2
        :class="{ typeChangeTagActive: activeTab === 'leaveHistoryRecord' }"
        @click="activeTab = 'leaveHistoryRecord'"
      >
        請假歷史紀錄
      </h2>
    </div>

    <!-- 顯示「已超過請假天數」提示彈窗 -->
    <div class="leaveLimitAlert" v-if="overLimitAlertShow">
      <p>
        您已超過請假天數<br />
        請立即聯絡諮詢師0800 000 760
      </p>
      <div class="leaveLimitAlertBtnGroup">
        <div
          class="leaveLimitAlertCloseBtn"
          @click="overLimitAlertShow = false"
        >
          關閉
        </div>
        <a class="leaveLimitAlertContactBtn" href="tel:0800000760">立即聯絡</a>
      </div>
    </div>

    <!-- 單筆請假紀錄彈窗 -->
    <div class="leaveRecordAlert" v-if="leaveRecordAlertShow">
      <h3>請假紀錄</h3>

      <!-- 單筆合約的請假紀錄 -->
      <div class="leaveListWrap">
        <div
          class="leaveListGroup"
          v-for="(record, idx) in singleHolidayRecord"
          :key="idx"
        >
          <div class="leaveListTag">#{{ idx + 1 }}</div>

          <div class="leaveList1">
            <h6>請假日期</h6>
            <div class="leaveList1Content">
              <!-- record.Dates = ["20250410","20250502", ...] -->
              <div v-for="(d, dIndex) in record.Dates" :key="dIndex">
                {{ d }}
              </div>
            </div>
          </div>

          <div class="leaveList2">
            <h6>請假天數</h6>
            <div class="leaveList1Content">{{ record.HolidayDays }}</div>
          </div>

          <div class="leaveList3">
            <h6>請假原因</h6>
            <div class="leaveList1Content">{{ record.HolidayNote }}</div>
          </div>
          <hr />
        </div>

        <div class="notDetectData" v-if="singleHolidayRecord.length === 0">
          無請假資料
        </div>
      </div>

      <div class="leaveRecordAlertOptionGroup">
        <div class="optionCloseBtn" @click="leaveRecordAlertShow = false">
          關閉
        </div>
      </div>
    </div>

    <!-- 請假申請視窗 -->
    <div class="leaveApplicationAlert" v-if="leaveApplicationAlertShow">
      <h3>請假申請</h3>
      <div class="leaveApplicationAlertHR"></div>

      <h4>請假日期</h4>
      <VueDatePicker
        ref="myHiddenPicker"
        v-model="selectedDates"
        :min-date="today"
        :max-date="endOfNextMonth"
        multi-dates
        teleport="body"
        cancel-text="取消"
        select-text="確定"
        :locale="'zh-TW'"
        no-today
        :enable-time-picker="false"
        @update:modelValue="handleDateChange"
        class="invisibleDatePicker"
      />

      <div class="leaveDates" @click="openMyDatePicker">
        <img src="../assets/imgs/date.svg" alt="" />
        <div class="leaveDateGroup">
          <div
            class="leaveDate"
            v-for="(dateVal, idx) in selectedDates"
            :key="idx"
          >
            {{ formatDate(dateVal) }}
          </div>
        </div>
      </div>
      <hr />

      <div class="limitError" v-if="selectedDates.length > 10">
        超過請假天數
      </div>
      <h4>請假原因</h4>
      <textarea
        v-model="leaveReason"
        class="noResizeTextarea"
        placeholder="請簡短說明..."
      ></textarea>

      <p>
        合約起迄日：<span class="contractStartToEnd"
          >{{ contractStart }} ~ {{ contractEnd }}</span
        >
      </p>
      <p>合約到期日：{{ contractExpire }}</p>

      <p>請假申請天數：{{ selectedDates.length }} 天</p>
      <!-- 顯示從 /api/fr/CanHolidayInfo 回來的剩餘天數(當月+次月) -->

      <p>
        剩餘請假天數 :
        <span
          v-for="(mItem, idx) in canHolidayMonthList"
          :key="idx"
          class="monthRemainItem"
        >
          {{ mItem.canDays }}天({{ mItem.monthLabel }})
        </span>
      </p>

      <div class="leaveApplicationAlertBtnGroup">
        <div
          class="leaveApplicationAlertBackBtn"
          @click="closeLeaveApplicationAlert"
        >
          返回
        </div>
        <div
          class="leaveApplicationAlertSumbitBtn"
          @click="submitLeaveApplication"
        >
          送出
        </div>
      </div>
    </div>

    <!-- 合約列表 (tab: contractList) -->
    <div class="contractListWrap" v-if="activeTab === 'contractList'">
      <div class="contractTopMenu">
        <!-- 產品篩選 -->
        <div class="contractTopMenuItem" style="border-radius: 12px 0 0 12px">
          <div class="contractTopMenuTextBox" @click="toggleProductBox">
            <img src="/assets/imgs/filter.svg" alt="" />
            <h4>{{ selectedProduct ? selectedProduct : "所有產品" }}</h4>
          </div>
          <div v-if="productBoxVisible" class="productBox">
            <div
              class="contractTopProduct"
              @click="selectContractProduct(null)"
            >
              所有產品
            </div>
            <div
              class="contractTopProduct"
              v-for="(prod, idx) in productOptions"
              :key="idx"
              @click="selectContractProduct(prod)"
            >
              {{ prod }}
            </div>
          </div>
        </div>

        <!-- 狀態篩選 -->
        <div class="contractTopMenuItem" style="border-radius: 0 12px 12px 0">
          <div class="contractTopMenuTextBox" @click="toggleStateBox">
            <img src="/assets/imgs/filter.svg" alt="" />
            <h4>{{ selectedState ? selectedState : "所有狀態" }}</h4>
          </div>
          <div v-if="stateBoxVisible" class="stateBox">
            <div class="contractTopState" @click="selectContractState(null)">
              所有狀態
            </div>
            <div
              class="contractTopState"
              v-for="(st, idx) in stateOptions"
              :key="idx"
              @click="selectContractState(st)"
            >
              {{ st }}
            </div>
          </div>
        </div>
      </div>

      <!-- 合約內容區塊 -->
      <div class="contractContentGroup">
        <div
          class="contractContent"
          v-for="(item, index) in filteredContracts"
          :key="index"
        >
          <div class="contractContentTitleGroup">
            <h3>{{ item.ProductName }}</h3>
            <div class="contractContentTitleTag">
              <img src="../assets/imgs/contractTag.svg" alt="" />
              <div class="contractPrice">
                {{ toThousands(item.TotalFee) }}
              </div>
            </div>
          </div>

          <div class="linkGroup">
            <a
              v-if="item.PdfFileName"
              :href="item.PdfFileName"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看合約
              <span><!-- svg icon... --></span>
            </a>
          </div>
          <main :class="{ contractEndMain: item.Still <= 0 }">
            <div class="contractDayGroup">
              <div class="startTimeGroup">
                <h6>合約開始</h6>
                <h5>{{ item.RentStart }}</h5>
              </div>
              <div class="endTimeGroup">
                <h6>合約結束</h6>
                <h5>{{ item.RentEnd }}</h5>
              </div>
              <div class="rentFinishGroup" v-if="item.RentFinish">
                <h6>合約到期</h6>
                <h5>{{ item.RentFinish }}</h5>
              </div>
            </div>

            <div class="progressGroup">
              <div class="contractProgress">
                <div class="contractProgressTextGroup">
                  <div
                    v-if="
                      item.Still > 0 &&
                      item.UsedRatio > 0 &&
                      item.UsedRatio < 100
                    "
                    class="todayIcon"
                    :style="{ left: item.UsedRatio + '%' }"
                  >
                    今天
                  </div>
                </div>
                <div class="contractProgressBarGroup">
                  <div
                    class="contractProgressBar"
                    :style="{
                      width: item.UsedRatio + '%',
                      backgroundColor: item.Still > 0 ? '#1FBCB3' : '#EC4F4F',
                    }"
                  ></div>
                </div>
              </div>
            </div>

            <div
              class="contractDayWarn"
              :class="{ contractDayWarn2: item.Still <= 0 }"
            >
              <img
                v-if="item.Still > 0"
                src="@/assets/imgs/contractTime.svg"
                alt="contract time"
              />
              <img
                v-else
                src="@/assets/imgs/contractWarning.svg"
                alt="contract warning"
              />
              <h5>{{ item.Info }}</h5>
            </div>
          </main>
          <div class="leaveGroup">
            <!-- 點請假紀錄 -> call API /api/fr/HolidayRec -->
            <div class="leaveRecordBtn" @click="getSingleHolidayRecord(item)">
              <img src="../assets/imgs/leaveRecord.svg" alt="" />
              請假紀錄
            </div>

            <!-- 請假申請 -->
            <div
              v-if="item.Still > 0"
              class="leaveApplication"
              @click="openLeaveApplicationAlert(item)"
            >
              <img src="../assets/imgs/leaveApplication.svg" alt="" />
              請假申請
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 請假歷史紀錄 (tab: leaveHistoryRecord) -->

    <div
      class="leaveHistoryRecordWrap"
      v-if="activeTab === 'leaveHistoryRecord'"
    >
      <!-- 篩選區 -->
      <div class="leaveHistoryRecordFilterGroup">
        <!-- 產品篩選 -->
        <div class="leaveHistoryRecordFilter">
          <img src="/assets/imgs/filter.svg" alt="" />
          <h4 @click="leaveProductBoxVisible = !leaveProductBoxVisible">
            {{ selectedHistoryProduct || "所有產品" }}
          </h4>
          <div
            v-if="leaveProductBoxVisible"
            class="leaveHistoryRecordTopProduct"
          >
            <div @click="selectHistoryProduct('')">所有產品</div>
            <div
              v-for="(prod, idx) in productOptions"
              :key="idx"
              @click="selectHistoryProduct(prod)"
            >
              {{ prod }}
            </div>
          </div>
        </div>

        <!-- 點擊後打開日期區間選擇器 -->
        <div class="leaveHistoryRecordFilter" @click="openHistoryRangePicker">
          <img src="/assets/imgs/filter.svg" alt="" />
          <h4>查詢請假日期或區間</h4>
        </div>
      </div>

      <!-- 實際的 <VueDatePicker> (range) 隱藏在這裡 -->
      <div v-if="showHistoryDateRangePicker" class="historyDateRangePicker">
        <VueDatePicker
          ref="historyRangePicker"
          v-model="historyDateRange"
          :range="true"
          no-today
          :locale="'zh-TW'"
          :enable-time-picker="false"
          teleport="body"
          :close-on-auto-apply="false"
          :close-on-scroll="false"
          :format="(date) => formatDate(date)"
          class="invisibleDatePicker"
        />
      </div>

      <!-- 篩選結果 -->
      <div class="leaveHistoryRecordSubTitle">
        總共 <span>{{ filteredHistoryRecords.length }}</span> 筆紀錄
      </div>

      <div class="leaveHistoryRecordContentGroup">
        <div
          class="leaveHistoryRecordContent"
          v-for="(rec, i) in filteredHistoryRecords"
          :key="i"
        >
          <h3>{{ rec.ProductName }} 第{{ rec.TT }}期</h3>
          <div class="leaveHistoryRecordRow">
            <h4>請假日期</h4>
            <ul>
              <li v-for="(day, dayIdx) in rec.HDays" :key="dayIdx">
                {{ day }}
              </li>
            </ul>
          </div>
          <div class="leaveHistoryRecordRow">
            <h4>請假天數</h4>
            <p>{{ rec.HolidayDays }}</p>
          </div>
          <div class="leaveHistoryRecordRow">
            <h4>請假原因</h4>
            <p>{{ rec.HolidayNote }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, computed, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import RaphaelLoading from "@/components/RaphaelLoading.vue";
import TitleMenu from "@/components/TitleMenu.vue";

/** 單筆請假紀錄處理 */
function unifySingleHoliday(retHoliday) {
  const results = [];
  if (!retHoliday || !Array.isArray(retHoliday)) return results;
  for (const item of retHoliday) {
    if (item.ProductNameTT && Array.isArray(item.ProductNameTT)) {
      for (const sub of item.ProductNameTT) {
        results.push({
          Dates: sub.HolidayDate || [],
          HolidayDays: sub.Period || "",
          HolidayNote: sub.HolidayNote || "",
        });
      }
    } else {
      results.push({
        Dates: item.HolidayDate || [],
        HolidayDays: item.Period || "",
        HolidayNote: item.HolidayNote || "",
      });
    }
  }
  return results;
}

/** 請假歷史紀錄處理 */
function unifyAllHoliday(retHoliday) {
  const results = [];
  if (!retHoliday || !Array.isArray(retHoliday)) return results;
  for (const item of retHoliday) {
    if (item.ProductNameTT && Array.isArray(item.ProductNameTT)) {
      for (const sub of item.ProductNameTT) {
        results.push({
          ProductName: item.ProductName || "",
          TT: item.TT || "",
          HDays: sub.HolidayDate || [],
          HolidayDays: sub.Period || "",
          HolidayNote: sub.HolidayNote || "",
        });
      }
    } else {
      results.push({
        ProductName: item.ProductName || "",
        TT: item.TT || "",
        HDays: item.HolidayDate || [],
        HolidayDays: item.Period || "",
        HolidayNote: item.HolidayNote || "",
      });
    }
  }
  return results;
}

export default {
  components: {
    RaphaelLoading,
    TitleMenu,
  },
  setup() {
    const router = useRouter();
    const loading = ref(false);

    // 驗證 localStorage
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};
    if (!MID || !Token || !MAID || !Mobile) {
      localStorage.removeItem("userData");
      router.push("/");
      return;
    }

    // Tabs 切換
    const activeTab = ref("contractList");

    // 合約列表
    const contractList = ref([]);
    const productBoxVisible = ref(false);
    const stateBoxVisible = ref(false);
    const selectedProduct = ref(null);
    const selectedState = ref(null);

    const productOptions = [
      "雙效紅光活力衣",
      "三效深眠衣",
      "全效調節衣",
      "居家治療儀",
    ];
    const stateOptions = ["進行中", "已到期"];

    function toggleProductBox() {
      productBoxVisible.value = !productBoxVisible.value;
      stateBoxVisible.value = false;
    }
    function toggleStateBox() {
      stateBoxVisible.value = !stateBoxVisible.value;
      productBoxVisible.value = false;
    }
    function selectContractProduct(prod) {
      selectedProduct.value = prod;
      productBoxVisible.value = false;
    }
    function selectContractState(st) {
      selectedState.value = st;
      stateBoxVisible.value = false;
    }

    /** 撈合約列表 */
    async function API_Contract() {
      try {
        loading.value = true;
        const resp = await axios.post(
          "https://23700999.com:8081/HMA/API_Contract.jsp",
          { MID, Token, MAID, Mobile }
        );
        if (resp.status === 200) {
          contractList.value = resp.data.ContractList || [];
        }
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    }
    API_Contract();

    const filteredContracts = computed(() => {
      return contractList.value.filter((item) => {
        const passProduct =
          !selectedProduct.value || item.ProductName === selectedProduct.value;
        let passState = true;
        if (selectedState.value === "進行中") {
          passState = item.Still > 0;
        } else if (selectedState.value === "已到期") {
          passState = item.Still <= 0;
        }
        return passProduct && passState;
      });
    });

    // --- 單筆請假紀錄 ---
    const leaveRecordAlertShow = ref(false);
    const singleHolidayRecord = ref([]);

    async function getSingleHolidayRecord(contractItem) {
      try {
        loading.value = true;
        const resp = await axios.post(
          "https://23700999.com:8081/HMA/api/fr/HolidayRec",
          {
            MID,
            Token,
            MAID,
            Mobile,
            HID: contractItem.HID,
            TT: contractItem.TT,
            ProductName: contractItem.ProductName,
          }
        );
        if (resp.data.Result === "OK") {
          singleHolidayRecord.value = unifySingleHoliday(resp.data.RetHoliday);
          leaveRecordAlertShow.value = true;
        } else {
          alert("後端回傳錯誤：" + JSON.stringify(resp.data.Result));
        }
      } catch (err) {
        console.error(err);
        alert("取得請假紀錄失敗");
      } finally {
        loading.value = false;
      }
    }

    // --- 請假歷史紀錄 ---
    const allHolidayRecords = ref([]);
    watch(
      () => activeTab.value,
      (newVal) => {
        if (newVal === "leaveHistoryRecord") {
          getAllHolidayRecords();
        }
      }
    );

    async function getAllHolidayRecords() {
      try {
        loading.value = true;
        const resp = await axios.post(
          "https://23700999.com:8081/HMA/api/fr/ALLHolidayRec",
          { MID, Token, MAID, Mobile }
        );
        if (resp.data.Result === "OK") {
          allHolidayRecords.value = unifyAllHoliday(resp.data.RetHoliday);
        } else {
          alert("後端回傳錯誤：" + JSON.stringify(resp.data.Result));
        }
      } catch (err) {
        console.error(err);
        alert("取得歷史紀錄失敗");
      } finally {
        loading.value = false;
      }
    }

    // 產品下拉 (歷史紀錄篩選)
    const leaveProductBoxVisible = ref(false);
    const selectedHistoryProduct = ref("");
    function selectHistoryProduct(prod) {
      selectedHistoryProduct.value = prod || "";
      leaveProductBoxVisible.value = false;
    }

    // --- 請假申請視窗 ---
    const leaveApplicationAlertShow = ref(false);
    const selectedContract = ref(null);
    const contractStart = ref("");
    const contractEnd = ref("");
    const contractExpire = ref("");

    const myHiddenPicker = ref(null);
    const selectedDates = ref([]);
    const leaveReason = ref("");

    const today = new Date();
    const endOfNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 2,
      0
    );

    // 用於「查詢請假日期或區間」的 RangePicker
    const historyRangePicker = ref(null);

    function openHistoryRangePicker() {
      // 顯示 RangePicker
      showHistoryDateRangePicker.value = true;

      // 等 DOM 出現後，手動觸發 input click
      nextTick(() => {
        const inputEl = historyRangePicker.value?.$el?.querySelector("input");
        if (inputEl) inputEl.click();
      });
    }

    // 新增：日期區間
    const showHistoryDateRangePicker = ref(false);
    const historyDateRange = ref([]); // 用於存 [startDate, endDate]

    function toggleHistoryDateFilter() {
      showHistoryDateRangePicker.value = !showHistoryDateRangePicker.value;
    }

    // 核心：依「產品 & 日期區間」一起過濾
    const filteredHistoryRecords = computed(() => {
      let arr = allHolidayRecords.value;

      // 1) 產品篩選
      if (selectedHistoryProduct.value) {
        arr = arr.filter((r) => r.ProductName === selectedHistoryProduct.value);
      }

      // 2) 日期區間篩選
      if (historyDateRange.value.length === 2) {
        const [start, end] = historyDateRange.value; // Date物件
        arr = arr.filter((rec) => {
          // rec.HDays = ["20250410","20250411",...]
          return rec.HDays.some((dayStr) => {
            const y = +dayStr.slice(0, 4);
            const m = +dayStr.slice(4, 6) - 1; // 0-based
            const d = +dayStr.slice(6, 8);
            const dayDate = new Date(y, m, d);
            return dayDate >= start && dayDate <= end;
          });
        });
      }
      return arr;
    });

    function formatDate(dateObj) {
      if (!dateObj) return "";

      // 若是字串（像 "20250410"）就轉換成 Date 物件
      if (typeof dateObj === "string" && /^\d{8}$/.test(dateObj)) {
        const y = +dateObj.slice(0, 4);
        const m = +dateObj.slice(4, 6) - 1; // 注意月份從 0 開始
        const d = +dateObj.slice(6, 8);
        dateObj = new Date(y, m, d);
      }

      // 檢查是否為有效 Date
      if (
        Object.prototype.toString.call(dateObj) !== "[object Date]" ||
        isNaN(dateObj)
      ) {
        return "";
      }

      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}/${m}/${d}`;
    }

    function openMyDatePicker() {
      const inputEl = myHiddenPicker.value?.$el?.querySelector("input");
      if (inputEl) inputEl.click();
    }

    function handleDateChange(newDates) {
      // 一個月(含下個月)加起來最多10天 (範例)
      if (newDates.length > 10) {
        selectedDates.value = newDates.slice(0, 10);
        alert("已超過可請假天數");
      } else {
        selectedDates.value = newDates;
      }
    }

    const overLimitAlertShow = ref(false);

    // 這裡存「(4月) 3天」、「(5月) 5天」等資訊
    const canHolidayMonthList = ref([]);

    /**
     * 點「請假申請」 => 同時撈取「當月」與「次月」剩餘天數 => 組合成可顯示格式
     */
    async function openLeaveApplicationAlert(contractItem) {
      try {
        loading.value = true;

        // 取得「當月」與「次月」的年月
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const currentYrMn = `${yyyy}${mm}`;

        const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const nextY = nextDate.getFullYear();
        const nextM = String(nextDate.getMonth() + 1).padStart(2, "0");
        const nextYrMn = `${nextY}${nextM}`;

        // 呼叫兩次 API（當月與次月）
        const [respCurrent, respNext] = await Promise.all([
          axios.post("https://23700999.com:8081/HMA/api/fr/CanHolidayInfo", {
            MID,
            Token,
            MAID,
            Mobile,
            HID: contractItem.HID,
            TT: contractItem.TT,
            ProductName: contractItem.ProductName,
            YrMn: currentYrMn,
          }),
          axios.post("https://23700999.com:8081/HMA/api/fr/CanHolidayInfo", {
            MID,
            Token,
            MAID,
            Mobile,
            HID: contractItem.HID,
            TT: contractItem.TT,
            ProductName: contractItem.ProductName,
            YrMn: nextYrMn,
          }),
        ]);

        const retCurrent = respCurrent.data;
        const retNext = respNext.data;

        if (retCurrent.Result !== "OK" && retNext.Result !== "OK") {
          alert("後端回傳錯誤：" + JSON.stringify(retCurrent));
          return;
        }

        // 取得月份
        const curM = Number((retCurrent.YrMn || currentYrMn).slice(4));
        const nxtM = Number((retNext.YrMn || nextYrMn).slice(4));

        // 取得剩餘天數
        const curDays = Number(retCurrent.CanHolidays) || 0;
        const nxtDays = Number(retNext.CanHolidays) || 0;

        // 顯示在畫面上
        canHolidayMonthList.value = [
          {
            monthLabel: `${curM}月`,
            canDays: curDays,
          },
          {
            monthLabel: `${nxtM}月`,
            canDays: nxtDays,
          },
        ];

        // 若皆為 0，跳提示
        if (curDays < 1 && nxtDays < 1) {
          overLimitAlertShow.value = true;
          return;
        }

        // 打開彈窗
        selectedContract.value = contractItem;
        contractStart.value = contractItem.RentStart || "";
        contractEnd.value = contractItem.RentEnd || "";
        contractExpire.value = contractItem.RentFinish || "";
        leaveApplicationAlertShow.value = true;
        selectedDates.value = [];
        leaveReason.value = "";
      } catch (err) {
        console.error(err);
        alert("取得可請假資訊失敗，請稍後再試");
      } finally {
        loading.value = false;
      }
    }

    function closeLeaveApplicationAlert() {
      leaveApplicationAlertShow.value = false;
      selectedDates.value = [];
      leaveReason.value = "";
    }

    async function submitLeaveApplication() {
      if (!selectedContract.value) {
        alert("尚未指定要請假的合約");
        return;
      }
      if (selectedDates.value.length === 0) {
        alert("尚未選擇請假日期！");
        return;
      }
      if (!leaveReason.value.trim()) {
        alert("請填寫請假原因！");
        return;
      }

      // 若後端需要以「月份」為單位傳假期，就拆分；否則可以一次傳
      const dateMap = {};
      for (const d of selectedDates.value) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const key = `${y}${m}`; // ex: 202504
        if (!dateMap[key]) dateMap[key] = [];
        const day = String(d.getDate()).padStart(2, "0");
        dateMap[key].push(`${y}${m}${day}`); // ex: 20250417
      }
      const months = Object.keys(dateMap);
      if (months.length === 0) {
        alert("日期格式錯誤");
        return;
      }

      try {
        loading.value = true;
        for (const ym of months) {
          const holidayArr = dateMap[ym];
          const resp = await axios.post(
            "https://23700999.com:8081/HMA/api/fr/AddContratctHoliday",
            {
              MID,
              Token,
              MAID,
              Mobile,
              HID: selectedContract.value.HID,
              TT: selectedContract.value.TT,
              ProductName: selectedContract.value.ProductName,
              Holiday: holidayArr,
              HolidayNote: leaveReason.value,
            }
          );
          if (resp.data.Result !== "OK") {
            alert("後端回傳錯誤：" + JSON.stringify(resp.data.Result));
            return;
          }
        }
        alert("已送出請假申請！");
      } catch (err) {
        console.error(err);
        alert("請假申請失敗");
      } finally {
        loading.value = false;
        closeLeaveApplicationAlert();
      }
    }

    function toThousands(num) {
      if (!num) return "0";
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return {
      loading,
      activeTab,

      contractList,
      productBoxVisible,
      stateBoxVisible,
      selectedProduct,
      selectedState,
      productOptions,
      stateOptions,
      toggleProductBox,
      toggleStateBox,
      selectContractProduct,
      selectContractState,
      filteredContracts,

      // 單筆請假紀錄
      leaveRecordAlertShow,
      singleHolidayRecord,
      getSingleHolidayRecord,

      // 請假歷史紀錄
      allHolidayRecords,
      getAllHolidayRecords,
      leaveProductBoxVisible,
      selectedHistoryProduct,
      selectHistoryProduct,

      // 請假申請
      leaveApplicationAlertShow,
      selectedContract,
      contractStart,
      contractEnd,
      contractExpire,
      myHiddenPicker,
      selectedDates,
      leaveReason,
      today,
      endOfNextMonth,
      openMyDatePicker,
      handleDateChange,
      openLeaveApplicationAlert,
      closeLeaveApplicationAlert,
      submitLeaveApplication,

      // 剩餘天數 (當月+次月)
      canHolidayMonthList,
      overLimitAlertShow,

      // 日期區間
      showHistoryDateRangePicker,
      historyDateRange,
      toggleHistoryDateFilter,

      // 全部請假紀錄 + 過濾後
      filteredHistoryRecords,
      historyRangePicker,
      openHistoryRangePicker,

      // 格式化
      formatDate,
      toThousands,
    };
  },
};
</script>

<style lang="scss">
.contractWrap {
  background-color: $raphael-gray-100;
  min-height: 100vh;
  padding: 0 1rem 2.5rem;
  position: relative;

  .historyDateRangePicker {
  }
  .contractCover {
    position: fixed;
    width: 100%;
    height: 100%;
    background: rgba(217, 217, 217, 0.5);
    backdrop-filter: blur(2.5px);
    top: 0;
    left: 0;
    z-index: 99;
  }

  .contractTopMenu {
    display: flex;
    color: #666;
    justify-content: end;
    position: sticky;
    z-index: 10;
    top: 48px;
    padding: 6px;
    border-radius: 8px;
    backdrop-filter: blur(4px);
    h4 {
      color: #666;
    }
    .contractTopMenuItem {
      position: relative;

      &:last-child {
        margin-left: 1rem;
      }

      .contractTopMenuTextBox {
        display: flex;
        gap: 2px;

        color: $raphael-black;
        cursor: pointer;
      }

      .productBox,
      .stateBox {
        display: flex;
        flex-direction: column;

        cursor: pointer;
        gap: 1rem;
        position: absolute;
        top: 140%;
        right: 0%;
        background: rgba(255, 255, 255, 0.85);
        width: 200%;
        border-radius: 8px;
        text-align: left;
        padding: 0.75rem;
        font-size: 18px;
        max-height: 200px;
        backdrop-filter: blur(6px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
        overflow-y: auto;
        transform: 0.25s all ease;
        animation: 0.3s fadeIn forwards;
        z-index: 10;
      }
    }
  }

  .contractContentGroup {
    .contractContent {
      background: #fff;
      padding: 12px;
      margin-top: 0.75rem;
      border-radius: 8px;

      .contractContentTitleGroup {
        display: flex;
        justify-content: space-between;

        h3 {
          color: #1e1e1e;

          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.15px;
        }
        .contractContentTitleTag {
          display: flex;
          background: var(--primary-orange-100, #fef1e2);
          padding: 2px 6px;
          gap: 4px;
          color: #a34c1b;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.09px;
          border-radius: 50px;
        }
      }

      & > main {
        border-radius: 0.5rem;
        padding: 0.5rem;
        border: 1px solid #1fbcb3;
        .progressGroup {
          margin-top: 0.25rem;
          .contractProgress {
            width: 100%;
            position: relative;

            .contractProgressTextGroup {
              position: absolute;
              top: -24px;
              width: 100%;
              height: 0;
              pointer-events: none;

              .todayIcon {
                display: flex;
                align-items: center;
                justify-content: center;
                position: absolute;
                background: $raphael-white;
                border-radius: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
                color: $raphael-cyan-400;
                padding: 4px;
                letter-spacing: 0.04px;
                font-size: 12px;
                box-shadow: 0px 2px 3px 0px rgba(223, 236, 197, 0.5);

                &::after {
                  content: "";
                  position: absolute;
                  background: $raphael-white;
                  width: 7px;
                  height: 6px;
                  bottom: -6px;
                  clip-path: polygon(50% 100%, 0 0, 100% 0);
                  box-shadow: 0px 2px 3px 0px rgba(223, 236, 197, 0.5);
                }
              }
            }

            .contractProgressBarGroup {
              margin-top: 0.5rem;
              border-radius: 50px;
              background: #fff;
              overflow: hidden;
            }

            .contractProgressBarGroup {
              width: 100%;
              height: 12px;
              margin-top: 1.5rem;
              border-radius: 50px;
              background: #fff;
              box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.25);
              overflow: hidden;

              .contractProgressBar {
                height: 100%;
              }
            }
          }
        }

        .contractDayGroup {
          display: flex;
          justify-content: space-between;
          margin-top: 0.75rem;

          .startTimeGroup,
          .endTimeGroup {
            h6 {
              color: #ccc;
              font-size: 14px;
              font-weight: 400;
              margin-bottom: 2px;
              letter-spacing: 0.048px;
            }
            h5 {
              color: #1e1e1e;
              font-size: 16px;
              font-weight: 400;
              letter-spacing: 0.5px;
            }
          }
          .rentFinishGroup {
            h6 {
              color: #ec4f4f;
              font-size: 14px;
              font-weight: 400;
              margin-bottom: 2px;
              letter-spacing: 0.048px;
            }
            h5 {
              color: #1e1e1e;
              font-size: 16px;
              font-weight: 400;
              letter-spacing: 0.5px;
            }
          }
        }
        .contractDayWarn {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.5rem;
          gap: 4px;
          border-radius: 4px;
          border: 1px solid #1fbcb3;
          background: rgba(31, 188, 179, 0.1);
          color: #1fbcb3;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: 0.5px;
          padding: 8px;
        }

        .contractDayWarn2 {
          border-color: #ec4f4f;
          background: rgba(236, 79, 79, 0.1);
          color: #ec4f4f;
        }
      }

      .contractEndMain {
        border: 1px solid #ec4f4f;
        .progressGroup {
          .contractProgress {
            .contractProgressBarGroup {
              margin-top: 0.5rem;
            }
          }
        }
      }
      .linkGroup {
        margin-top: 0.3rem;
        margin-bottom: 1rem;
        a {
          display: inline;
          color: #74bc1f;
          font-size: 18px;
          font-weight: 400;
          letter-spacing: 0.09px;
          text-decoration: none;
        }
      }
      .leaveGroup {
        display: flex;
        justify-content: center;
        gap: 0.75rem;
        margin-top: 1rem;
        .leaveRecordBtn {
          padding: 8px 12px;
          border-radius: var(--sds-size-radius-200);
          background: var(--Neutral-200, #eee);
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          img {
            transform: translate(0, 10%);
          }
          color: var(--Neutral-500, #544b4b);

          font-size: 18px;

          font-weight: 400;

          letter-spacing: 0.09px;
        }
        .leaveApplication {
          padding: 8px 12px;
          border-radius: var(--sds-size-radius-200);

          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 4px;

          background: var(--Primary-default, #74bc1f);
          cursor: pointer;
          img {
            transform: translate(0, 10%);
          }

          font-size: 18px;

          font-weight: 400;
          color: #fff;
          letter-spacing: 0.09px;
        }
      }
    }
  }
  .leaveRecordAlert {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    height: 74%;
    width: 90%;
    z-index: 99;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    .leaveListWrap {
      flex: 1;
      height: 0;
      overflow-y: auto;
      .notDetectData {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        letter-spacing: 10px;
        font-size: 1.25rem;
        white-space: nowrap;
        color: $raphael-gray-500;
      }
    }
    h5 {
      color: var(--Color-Shade-500, #666);
      text-align: right;
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
      margin-top: 0.5rem;
      span {
        color: var(--Color-Blue-400, #1fbcb3);
      }
    }
    h3 {
      color: #74bc1f;
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.12px;
      text-align: center;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid $raphael-gray-500;
    }
  }

  .leaveRecordAlertOptionGroup {
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 8px;

    .optionCloseBtn {
      text-align: center;
      background: $raphael-gray-200;
      color: $raphael-gray-500;
      width: 100%;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
    }
  }
  .searchGroup {
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 2px;
    margin-top: 1.5rem;
  }
  .leaveListGroup {
    margin-top: 0.75rem;
  }
  .leaveListTag {
    color: var(--Neutral-black, #1e1e1e);
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    margin-bottom: 0.5rem;
  }
  .leaveList1 {
    display: flex;
    margin-bottom: 0.5rem;
    h6 {
      width: 50%;
    }
    .leaveList1Content {
      color: #74bc1f;
      line-height: 1.2;
    }
  }
  .leaveList2 {
    display: flex;
    margin-bottom: 0.5rem;
    h6 {
      width: 50%;
    }
    .leaveList1Content {
      color: #74bc1f;
      line-height: 1.2;
    }
  }
  .leaveList3 {
    display: flex;
    h6 {
      width: 50%;
    }
    .leaveList1Content {
      color: #74bc1f;
      line-height: 1.2;
      width: 50%;
    }
  }
  .leaveListHR {
    height: 1px;
    color: #1e1e1e;
    width: 100%;
  }
  .leaveLimitAlert {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 112;
    background-color: #fff;
    border-radius: 12px;
    width: 60%;
    min-height: 140px;
    border-radius: 14px;
    background: #fbfbfb;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

    p {
      margin-top: 2rem;
      text-align: center;
      line-height: 1.35;
    }
    .leaveLimitAlertBtnGroup {
      position: fixed;
      bottom: 0;
      width: 100%;
      display: flex;
      justify-content: center;
      border-top: 1px solid #ccc;

      .leaveLimitAlertCloseBtn {
        width: 50%;
        text-align: center;
        padding: 0.5rem;
        border-right: 1px solid #ccc;
        color: #ccc;
      }
      .leaveLimitAlertContactBtn {
        width: 50%;
        text-align: center;
        padding: 0.5rem;
        color: var(--Primary-default, #74bc1f);
      }
    }
  }
  .leaveApplicationAlert {
    width: 90%;
    position: fixed;
    height: 74%;
    background-color: #fff;
    z-index: 99;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

    h3 {
      text-align: center;
      color: #74bc1f;
      font-family: "Noto Sans";
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.12px;
    }
    .leaveApplicationAlertHR {
      width: 100%;
      height: 1px;
      background-color: #666;
      margin-top: 0.5rem;
    }
    .leaveDates {
      display: flex;
      align-items: start;
      gap: 8px;
      margin-top: 0.5rem;

      cursor: pointer;
      max-height: 100px;
      overflow: auto;
    }
    h4 {
      color: var(--Color-Green-400, #74bc1f);
      margin-top: 1rem;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 18px */
      letter-spacing: 2.7px;
    }
    .limitError {
      color: #f00;
      text-align: justify;

      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      margin-top: 0.5rem;
      letter-spacing: 0.048px;
    }
    p {
      color: var(--Neutral-500, #666);
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 18px */
      letter-spacing: 2.7px;
      line-height: 1.75;

      .contractStartToEnd {
        display: flex;
        line-height: normal;
      }

      .monthRemainItem {
        position: relative;
        &:last-child {
          margin-left: 6px;
          &::before {
            content: "、";
            position: absolute;
            left: -16px;
          }
        }
      }
    }
  }
  .leaveApplicationAlertBtnGroup {
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 2.25%;
    left: 0;
    width: 100%;
    gap: 0.75rem;
    .leaveApplicationAlertBackBtn {
      width: 45%;
      text-align: center;
      background-color: #8e6363;
      border-radius: var(--sds-size-radius-200);
      background: $raphael-gray-200;
      color: $raphael-gray-500;
      padding: 8px 12px;
      border-radius: 8px;
      letter-spacing: 0.09px;
    }
    .leaveApplicationAlertSumbitBtn {
      width: 45%;
      text-align: center;
      background-color: #8e6363;
      border-radius: var(--sds-size-radius-200);
      background: var(--Primary-default, #74bc1f);
      padding: 8px 12px;
      border-radius: 8px;
      color: #fff;
      letter-spacing: 0.09px;
    }
  }
  .typeChangeTag {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    h2 {
      width: 50%;
      text-align: center;
      color: var(--Neutral-500, #666);
      font-size: 16px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.5px;
      padding: 0.35rem;
      cursor: pointer;
      display: block;
    }
    .typeChangeTagActive {
      color: var(--Primary-default, #74bc1f);
      border-bottom: 1px solid #74bc1f;
    }
  }

  .leaveHistoryRecordWrap {
    .leaveHistoryRecordFilterGroup {
      display: flex;
      justify-content: end;
      align-items: center;
      gap: 8px;
      padding: 6px;
      .leaveHistoryRecordFilter {
        display: flex;
        align-items: center;
        gap: 2px;
        cursor: pointer;
        position: relative;
        .leaveHistoryRecordTopProduct {
          display: flex;
          flex-direction: column;

          cursor: pointer;
          gap: 1rem;
          position: absolute;
          top: 140%;
          right: 0%;
          background: rgba(255, 255, 255, 0.85);
          width: 200%;
          border-radius: 8px;
          text-align: left;
          padding: 0.75rem;
          font-size: 18px;
          max-height: 200px;
          backdrop-filter: blur(6px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16),
            0 3px 6px rgba(0, 0, 0, 0.23);
          overflow-y: auto;
          transform: 0.25s all ease;
          animation: 0.3s fadeIn forwards;
          z-index: 10;
        }
        h4 {
          color: var(--Neutral-500, #666);
          text-align: center;
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
        }
      }
    }
    .leaveHistoryRecordSubTitle {
      text-align: right;
      margin-top: 0.5rem;
      color: $raphael-gray-500;
      span {
        color: $raphael-cyan-400;
      }
    }
    .leaveHistoryRecordContentGroup {
      margin-top: 0.75rem;
    }
    .leaveHistoryRecordContent {
      background-color: #fff;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 0.75rem;
      h3 {
        color: #1e1e1e;
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
        margin-bottom: 0.35rem;
      }
    }
    .leaveHistoryRecordRow {
      display: flex;
      justify-content: space-between;
      margin-top: 0.75rem;
      h4 {
        width: 50%;
      }
      p,
      ul {
        width: 50%;
        color: var(--Primary-default, #74bc1f);
      }
    }
  }
  .invisibleDatePicker {
    /* 讓整個 input 都看不到，但元件仍在 DOM 中 */
    opacity: 0;
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 0;
  }
  .noResizeTextarea {
    resize: none;
    width: 100%;
    height: 120px;
    margin-top: 0.5rem;
    border: none;
    border-radius: 4px;
    border: 1px solid var(--Neutral-400, #b3b3b3);
    padding: 0.5rem;
    font-size: 18px;
    resize: none;
  }
}
</style>
