<template>
  <!-- 載入中 -->
  <RaphaelLoading v-if="loading" />

  <!-- 主要容器：當 loading 結束後才顯示 -->
  <div v-else class="contractWrap">
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

    <div class="leaveLimitAlert" v-if="false">
      <p>
        您已超過請假天數(5天)<br />
        請立即聯絡諮詢師0800 000 760
      </p>

      <div class="leaveLimitAlertBtnGroup">
        <div class="leaveLimitAlertCloseBtn">關閉</div>
        <div class="leaveLimitAlertContactBtn">立即聯絡</div>
      </div>
    </div>
    <div class="leaveRecordAlert" v-if="false">
      <h3>請假紀錄</h3>
      <div class="leaveRecordAlertHR"></div>

      <div class="leaveRecordAlertOptionGroup">
        <div class="optionCloseBtn">關閉</div>
        <div class="optionAgainBtn">再次申請</div>
      </div>
      <div class="searchGroup">
        <img src="../assets/imgs/leaveRecordSearch.svg" alt="" />
        <h4>查詢請假日期或區間</h4>
      </div>
      <h5>剩下<span>4天</span>可以請</h5>
      <div class="leaveListGroup">
        <div class="leaveListTag">#5</div>
        <div class="leaveList1">
          <h6>請假日期</h6>

          <div class="leaveList1Content">
            <div>2024/10/10</div>
            <div>2024/10/10</div>
          </div>
        </div>
        <div class="leaveList2">
          <h6>請假天數</h6>
          <div class="leaveList1Content">
            <div>2</div>
          </div>
        </div>
        <div class="leaveList3">
          <h6>請假原因</h6>
          <div class="leaveList1Content">
            <div>原因原因原因原因原因原因原因原因原因原因原因原因原因</div>
          </div>
        </div>
        <hr />
      </div>
      <div class="leaveListGroup">
        <div class="leaveListTag">#4</div>
        <div class="leaveList1">
          <h6>請假日期</h6>
          <div class="leaveList1Content">
            <div>2024/10/10</div>
            <div>2024/10/10</div>
          </div>
        </div>
        <div class="leaveList2">
          <h6>請假天數</h6>
          <div class="leaveList1Content">
            <div>2</div>
          </div>
        </div>
        <div class="leaveList3">
          <h6>請假原因</h6>
          <div class="leaveList1Content">
            <div>原因原因原因原因原因原因原因原因原因原因原因原因原因</div>
          </div>
        </div>
        <hr />
      </div>
    </div>
    <div class="leaveApplicationAlert">
      <h3>請假申請</h3>
      <div class="leaveApplicationAlertHR"></div>
      <h4>請假日期</h4>
      <VueDatePicker
        ref="myHiddenPicker"
        v-model="selectedDates"
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

      <div class="limitError" v-if="selectedDates.length > 5">
        一個月最多請五天
      </div>
      <h4>請假原因</h4>
      <textarea
        v-model="leaveReason"
        class="noResizeTextarea"
        placeholder="請簡短說明..."
      ></textarea>
      <p>合約起迄日：{{ contractStart }} ~ {{ contractEnd }}</p>
      <p>合約到期日：{{ contractExpire }}</p>

      <p>請假申請天數：{{ selectedDates.length }} 天</p>
      <p>剩餘請假天數：{{ 5 - selectedDates.length }} 天</p>


      <div class="leaveApplicationAlertBtnGroup">
        <div class="leaveApplicationAlertBackBtn">返回</div>
        <div class="leaveApplicationAlertSumbitBtn" @click="submitLeaveApplication">送出</div>
      </div>
    </div>

    <div class="contractListWrap" v-if="activeTab === 'contractList'">
      <!-- 篩選選單 -->
      <div class="contractTopMenu">
        <!-- 產品篩選 -->
        <div class="contractTopMenuItem" style="border-radius: 12px 0 0 12px">
          <div class="contractTopMenuTextBox" @click="toggleProductBox">
            <img src="/assets/imgs/filter.svg" alt="" />
            <h4>{{ selectedProduct ? selectedProduct : "所有產品" }}</h4>
          </div>
          <div v-if="productBoxVisible" class="productBox">
            <!-- 讓使用者可點擊選擇「所有產品」 -->
            <div class="contractTopProduct" @click="onSelectProduct(null)">
              所有產品
            </div>
            <!-- 動態列出四種產品 -->
            <div
              class="contractTopProduct"
              v-for="(prod, idx) in productOptions"
              :key="idx"
              @click="onSelectProduct(prod)"
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
            <!-- 讓使用者可點擊選擇「所有狀態」 -->
            <div class="contractTopState" @click="onSelectState(null)">
              所有狀態
            </div>
            <!-- 只有「進行中」「已到期」兩種 -->
            <div
              class="contractTopState"
              v-for="(st, idx) in stateOptions"
              :key="idx"
              @click="onSelectState(st)"
            >
              {{ st }}
            </div>
          </div>
        </div>
      </div>

      <!-- 合約內容區塊：這裡改用過濾後的 filteredContracts -->
      <div class="contractContentGroup">
        <div
          class="contractContent"
          v-for="(item, index) in filteredContracts"
          :key="index"
        >
          <!-- 合約標題、價格區 -->
          <div class="contractContentTitleGroup">
            <h3>{{ item.ProductName }}</h3>
            <!-- 若 PdfFileName 不為空，就顯示查看連結，並另開視窗 -->

            <div class="contractContentTitleTag">
              <img src="../assets/imgs/contractTag.svg" alt="" />
              <!-- 如果有金額，可以放這裡 -->
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
              查看內容
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 18 18"
                  fill="#74BC1F"
                >
                  <path
                    d="M6.65764 3.75271L12.7476 10.0002L6.65764 16.2477C6.54862 16.3593 6.48758 16.5092 6.48758 16.6652C6.48758 16.8212 6.54862 16.9711 6.65764 17.0827C6.7106 17.1368 6.77381 17.1797 6.84356 17.209C6.91332 17.2383 6.98823 17.2534 7.06389 17.2534C7.13956 17.2534 7.21447 17.2383 7.28422 17.209C7.35398 17.1797 7.41719 17.1368 7.47014 17.0827L13.9501 10.4365C14.0639 10.3197 14.1276 10.1632 14.1276 10.0002C14.1276 9.83722 14.0639 9.68068 13.9501 9.56396L7.47139 2.91771C7.4184 2.86328 7.35504 2.82002 7.28505 2.79048C7.21506 2.76094 7.13986 2.74572 7.06389 2.74572C6.98793 2.74572 6.91273 2.76094 6.84274 2.79048C6.77275 2.82002 6.70939 2.86328 6.65639 2.91771C6.54737 3.02933 6.48633 3.17917 6.48633 3.33521C6.48633 3.49124 6.54737 3.64109 6.65639 3.75271L6.65764 3.75271Z"
                    fill="#74BC1F"
                  />
                </svg>
              </span>
            </a>
          </div>

          <!-- 進度條區塊 -->
          <div class="progressGroup">
            <div class="contractProgress">
              <div class="contractProgressTextGroup">
                <div
                  v-if="
                    item.Still > 0 && item.UsedRatio > 0 && item.UsedRatio < 100
                  "
                  class="todayIcon"
                  :style="{
                    left: item.UsedRatio + '%',
                  }"
                >
                  今天
                </div>
              </div>
              <div class="contractProgressBarGroup">
                <!-- progress 寬度用 UsedRatio (例如 0 ~ 100)，Still > 0 為綠，<= 0 為紅 -->
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

          <!-- 合約日期區塊 -->
          <div class="contractDayGroup">
            <div class="startTimeGroup">
              <h6>開始時間</h6>
              <h5>{{ item.RentStart }}</h5>
            </div>

            <!-- 如果剩餘天數 <= 0，就表示到期，給它另一個樣式 -->
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
              <!-- API 的 Info 帶有「還有 XX 天」或「已到期」等文字 -->
              <h5>{{ item.Info }}</h5>
            </div>

            <div class="endTimeGroup">
              <h6>到期日期</h6>
              <h5>{{ item.RentEnd }}</h5>
            </div>
          </div>

          <!-- 請假區塊 -->
          <div class="leaveGroup">
            <div class="leaveRecordBtn">
              <img src="../assets/imgs/leaveRecord.svg" alt="" /> 請假紀錄
            </div>
            <div class="leaveApplication">
              <img src="../assets/imgs/leaveApplication.svg" alt="" /> 請假申請
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="leaveHistoryRecordWrap"
      v-if="activeTab === 'leaveHistoryRecord'"
    >
      <div class="leaveHistoryRecordFilterGroup">
        <div class="leaveHistoryRecordFilter">
          <img src="/assets/imgs/filter.svg" alt="" />
          <h4 @click="leaveProductBoxVisible = !leaveProductBoxVisible">
            產品類型
          </h4>
          <!-- 動態列出四種產品 -->
          <div
            class="leaveHistoryRecordTopProduct"
            v-if="leaveProductBoxVisible"
          >
            <div
              v-for="(prod, idx) in productOptions"
              :key="idx"
              @click="onSelectProduct(prod)"
            >
              {{ prod }}
            </div>
          </div>
        </div>
        <div class="leaveHistoryRecordFilter">
          <img src="/assets/imgs/filter.svg" alt="" />
          <h4>查詢請假日期或區間</h4>
        </div>
      </div>
      <div class="leaveHistoryRecordSubTitle">
        總共 <span>{{ 10 }}</span> 筆紀錄
      </div>

      <div class="leaveHistoryRecordContentGroup">
        <div class="leaveHistoryRecordContent">
          <h3>產品名稱 第N期</h3>
          <div class="leaveHistoryRecordRow">
            <h4>請假日期</h4>
            <ul>
              <li>2024/10/10</li>
              <li>2024/10/12</li>
              <li>2024/10/20</li>
            </ul>
          </div>
          <div class="leaveHistoryRecordRow">
            <h4>請假天數</h4>
            <p>3</p>
          </div>
          <div class="leaveHistoryRecordRow">
            <h4>請假原因</h4>
            <p>原因原因原因原因原因原因原因原因原因原因原因原因原因</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import RaphaelLoading from "@/components/RaphaelLoading.vue";
import TitleMenu from "@/components/TitleMenu.vue";

export default {
  components: {
    RaphaelLoading,
    TitleMenu,
  },
  setup() {
    const router = useRouter();
    const productBoxVisible = ref(false);
    const stateBoxVisible = ref(false);
    const contractList = ref([]);
    const loading = ref(false);

    const activeTab = ref("contractList");

    const myHiddenPicker = ref(null);

    // 給一個方法，在 .leaveDates 被點擊時呼叫
    function openMyDatePicker() {
      // 去找 datepicker 元件裡的 input
      const inputEl = myHiddenPicker.value?.$el?.querySelector("input");
      if (inputEl) {
        // 模擬人工點擊
        inputEl.click();
        // 或者試試 inputEl.dispatchEvent(new Event('focus'))
      }
    }

    const selectedDates = ref([]);
    // 如果需要日期格式化，可寫個小函式
    const formatDate = (dateObj) => {
      if (!dateObj) return "";
      const date = new Date(dateObj);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // 補0
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    };

    // 產品選單
    const productOptions = [
      "雙效紅光活力衣",
      "三效深眠衣",
      "全效調節衣",
      "居家治療儀",
    ];
    // 狀態選單
    const stateOptions = ["進行中", "已到期"];

    // 當前選擇的產品 / 狀態（null 代表「所有」）
    const selectedProduct = ref(null);
    const selectedState = ref(null);

    // 切換顯示下拉
    function toggleProductBox() {
      productBoxVisible.value = !productBoxVisible.value;
      stateBoxVisible.value = false;
    }
    function toggleStateBox() {
      stateBoxVisible.value = !stateBoxVisible.value;
      productBoxVisible.value = false;
    }

    // 點擊產品選項
    function onSelectProduct(prod) {
      selectedProduct.value = prod; // 若為 null => 「所有產品」
      productBoxVisible.value = false;
    }

    // 點擊狀態選項
    function onSelectState(st) {
      selectedState.value = st; // 若為 null => 「所有狀態」
      stateBoxVisible.value = false;
    }

    // 驗證 localStorage 內的使用者資訊
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile, Name } = localData
      ? JSON.parse(localData)
      : {};

    if (!MID || !Token || !MAID || !Mobile) {
      localStorage.removeItem("userData");
      router.push("/");
      return;
    } else if (Name === "") {
      router.push("/changeMember");
      return;
    }

    // 撈取合約列表 API
    const API_Contract = async () => {
      try {
        loading.value = true;
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_Contract.jsp",
          {
            MID,
            Token,
            MAID,
            Mobile,
          }
        );
        if (response.status === 200) {
          // 將回傳結果存在 contractList 中
          contractList.value = response.data.ContractList;
          console.log("contractList:", contractList.value);
        }
      } catch (err) {
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // 頁面載入時呼叫 API
    API_Contract();

    // 計算過濾後的合約列表
    const filteredContracts = computed(() => {
      return contractList.value.filter((item) => {
        // 1. 產品過濾
        const passProduct =
          !selectedProduct.value || item.ProductName === selectedProduct.value;

        // 2. 狀態過濾
        //   - "進行中": Still > 0
        //   - "已到期": Still <= 0
        //   - null 代表「所有狀態」
        let passState = true;
        if (selectedState.value === "進行中") {
          passState = item.Still > 0;
        } else if (selectedState.value === "已到期") {
          passState = item.Still <= 0;
        }

        return passProduct && passState;
      });
    });

    // 將數字轉成千分號字串
    const toThousands = (num) => {
      if (!num) return "0";
      // 也可先轉成數字再處理，例如: num = Number(num) || 0;
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const handleDateChange = (newDates) => {
      if (newDates.length > 5) {
        // 限制最多只能選五個
        selectedDates.value = newDates.slice(0, 5);
        alert("最多只能請五天假！");
      } else {
        selectedDates.value = newDates;
      }
    };
    const leaveProductBoxVisible = ref(false);
    return {
      // 變數與方法
      loading,
      productBoxVisible,
      stateBoxVisible,
      contractList,
      selectedProduct,
      selectedState,
      productOptions,
      stateOptions,

      // 方法
      toggleProductBox,
      toggleStateBox,
      onSelectProduct,
      onSelectState,

      // 計算屬性
      filteredContracts,
      toThousands,
      selectedDates,
      formatDate,
      handleDateChange,

      activeTab,
      leaveProductBoxVisible,

      myHiddenPicker,
      openMyDatePicker,
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

  .contractTopMenu {
    display: flex;
    color: #666;
    justify-content: end;
    position: sticky;
    z-index: 10;
    top: 48px;
    padding: 12px;
    border-radius: 8px;
    backdrop-filter: blur(1px);

    .contractTopMenuItem {
      position: relative;

      &:last-child {
        margin-left: 1rem;
      }

      .contractTopMenuTextBox {
        display: flex;
        gap: 4px;

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

      .progressGroup {
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

        .contractDayWarn {
          display: flex;
          align-items: center;
          gap: 4px;
          border-radius: 4px;
          border: 1px solid #1fbcb3;
          background: rgba(31, 188, 179, 0.1);
          color: #1fbcb3;
          font-size: 16px;
          font-weight: 400;
          letter-spacing: 0.5px;
          padding: 8px;

          &.contractDayWarn2 {
            border-color: #ec4f4f;
            background: rgba(236, 79, 79, 0.1);
            color: #ec4f4f;
          }
        }
      }

      .linkGroup {
        margin-top: 0.3rem;
        margin-bottom: 1.75rem;
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
    height: 90%;
    width: 90%;
    z-index: 99;
    border-radius: 12px;
    padding: 12px;
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
      margin-bottom: 0.75rem;
    }
    .leaveRecordAlertHR {
      width: 100%;
      height: 1px;
      background-color: #666;
    }
  }

  .leaveRecordAlertOptionGroup {
    position: fixed;
    width: 100%;
    display: flex;
    bottom: 5%;
    justify-content: center;
    gap: 8px;
    left: 0;
    .optionCloseBtn {
      text-align: center;
      background: var(--Neutral-200, #eee);
      width: 45%;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
    }
    .optionAgainBtn {
      text-align: center;
      border-radius: var(--sds-size-radius-200);
      background: var(--Primary-default, #74bc1f);
      width: 45%;
      padding: 8px;
      color: #fff;
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
    min-height: 70%;
    background-color: #fff;
    z-index: 99;
    padding: 12px;

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
      margin-top: .5rem;

      cursor: pointer;

    }
    h4 {
      color: var(--Color-Green-400, #74bc1f);
      margin-top: 0.75rem;
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
      background: var(--Neutral-300, #ccc);
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
      span {
        color: var(--Color-Blue-400, #1fbcb3);
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
    height: 120px !important;
    margin-top: 1rem;
    border: none;
    border-radius: 4px;
    border: 1px solid var(--Neutral-400, #b3b3b3);
    padding: 0.5rem;
    font-size: 18px;
  }
}
</style>
