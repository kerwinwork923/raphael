<template>
  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <header class="page-header">
        <h2 class="title">
          會員清單 <span class="count">({{ total }}人)</span>
        </h2>
        <div class="meta">
          <button class="btn refresh" @click="refreshData">
            <i class="i-refresh"></i>
            資料更新
          </button>
          <span class="updated-time">最後更新: {{ lastUpdated }}</span>
        </div>
      </header>
      <!-- toolbar / filters -->
      <section class="toolbar">
        <div class="toolbar-inner">
          <div class="search-wrapper">
            <input
              v-model="keyword"
              class="search"
              type="text"
              placeholder="請輸入關鍵字"
            />
            <img src="/assets/imgs/backend/search.svg" alt="" />
          </div>

          <div class="toolbarTime-wrapper">
            <VueDatePicker
              class="toolbarTime"
              v-model="dateRange"
              range
              prepend-icon="i-calendar"
              placeholder="註冊時間查詢"
            />
          </div>
          <div class="selectWrapper">
            <img
              class="selectWrapperIcon1"
              src="/assets/imgs/backend/filter.svg"
              alt=""
            />
            <select v-model="productFilter">
              <option value="">產品篩選</option>
              <option
                v-for="product in productOptions"
                :key="product.value"
                :value="product.value"
              >
                {{ product.label }}
              </option>
            </select>
            <img
              class="selectWrapperIcon2"
              src="/assets/imgs/backend/dropdown.svg"
              alt=""
            />
          </div>

          <div class="selectWrapper">
            <img
              class="selectWrapperIcon1"
              src="/assets/imgs/backend/filter.svg"
              alt=""
            />
            <select v-model="statusFilter">
              <option value="">用戶狀態</option>
              <option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
            <img
              class="selectWrapperIcon2"
              src="/assets/imgs/backend/dropdown.svg"
              alt=""
            />
          </div>
        </div>
      </section>

      <!-- data table -->
      <section class="member-table">
        <!-- header row -->
        <div class="table-row table-header">
          <div class="name">會員名稱</div>
          <div class="level">等級</div>
          <div class="birth">生日</div>
          <div class="phone">電話</div>
          <div class="product">產品資訊</div>
          <div class="health">健康指標</div>
          <div class="reg-date">註冊時間</div>
          <!-- <div class="cell action"></div> -->
        </div>

        <!-- data rows -->
        <div
          v-for="member in paginatedMembers"
          :key="member.id"
          class="table-row"
        >
          <div class="cell name">{{ member.name }}</div>
          <div class="cell level">{{ member.level }}</div>
          <div class="cell birth">{{ member.birthday }}</div>
          <div class="cell phone">{{ member.phone }}</div>

          <div class="cell product">
            <div class="cellProduct">
              <p class="chip chip--success">已使用 {{ member.usageDays }} 天</p>
              <p class="chip chip--danger">
                剩餘 {{ member.remainingDays }} 天
              </p>
            </div>

            <p class="sub">{{ member.product }}</p>
          </div>

          <div class="cell health">
            <p>HRV {{ member.hrv }} ms</p>
            <p>{{ member.ans }}</p>
            <p>生活自律 79分</p>
            <p class="chip chip--warning" v-if="member.isAbnormal">
              已超時,請盡快提醒
            </p>
            <button class="healthBtn">
              <img src="/assets/imgs/backend/send.svg" alt="" /> 立即推播
            </button>
          </div>

          <div class="cell reg-date">
            <p>{{ member.registerDate }}</p>
          </div>

          <div class="cell action">
            <div class="tagsGroup">
              <div class="cellTag cellTagSuccess">忠誠用戶</div>
              <!-- <div class="cellTag cellTagWarning">偶爾使用</div> -->
              <div class="cellTag cellTag2">
                <img src="/assets/imgs/backend/heartCrack.svg" alt="" />解約
              </div>
              <!-- <div class="cellTag cellTag2"><img src="/assets/imgs/backend/highRisk.svg" alt="">高風險</div> -->
              <!-- <div class="cellTag cellTag2"><img src="/assets/imgs/backend/archive.svg" alt="">未歸還</div> -->
              <!-- <div class="cellTag cellTag2"><img src="/assets/imgs/backend/aoke.svg" alt="">奧客</div> -->
            </div>
          </div>

          <div class="goInfo">
            <img src="/assets/imgs/backend/goNext.svg" alt="" />
          </div>
        </div>


              <!-- pagination -->
      <nav class="pagination">
        <button class="btn-page " :disabled="page === 1" @click="gotoPage(1)">
          &lt;&lt;
        </button>
        <button class="btn-page" :disabled="page === 1" @click="prevPage">
          &lt;
        </button>
        <button
          v-for="p in totalPages"
          :key="p"
          class="btn-page btn-page-number"
          :class="{ active: page === p }"
          @click="gotoPage(p)"
        >
          {{ p }}
        </button>
        <button
          class="btn-page"
          :disabled="page === totalPages"
          @click="nextPage"
        >
          &gt;
        </button>
        <button
          class="btn-page"
          :disabled="page === totalPages"
          @click="gotoPage(totalPages)"
        >
          &gt;&gt;
        </button>
      </nav>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
// ─────────────── State ───────────────
const activeMenu = ref<"member" | "push" | "points" | "account">("member");
const keyword = ref("");
const dateRange = ref<[Date | null, Date | null]>([null, null]);
const productFilter = ref("");
const statusFilter = ref("");
const page = ref(1);
const pageSize = 10;
const members = ref<Member[]>([]);
const lastUpdated = ref("2024/11/7 上午10:48");

// demo types
type Member = {
  id: number;
  name: string;
  level: string;
  birthday: string;
  phone: string;
  product: string;
  usageDays: number;
  remainingDays: number;
  hrv: number;
  ans: string;
  isAbnormal: boolean;
  registerDate: string;
};

// sample data – replace with API fetch
function loadMembers() {
  members.value = Array.from({ length: 25 }).map((_, i) => ({
    id: i + 1,
    name: "Steven Yeh",
    level: "黃金",
    birthday: "880101",
    phone: "0912345678",
    product: "第四代穿戴式調節衣 (保健版)",
    usageDays: 7,
    remainingDays: 20,
    hrv: 75,
    ans: "自律神經 85 分",
    isAbnormal: i % 3 === 0,
    registerDate: "2024/10/10 10:00",
  }));
}

onMounted(loadMembers);

// ─────────────── Computed ───────────────
const total = computed(() => members.value.length);
const totalPages = computed(() => Math.ceil(total.value / pageSize));
const filteredMembers = computed(() => {
  let data = [...members.value];
  if (keyword.value) {
    data = data.filter((m) => m.name.includes(keyword.value));
  }
  // TODO: add more filters here
  return data;
});
const paginatedMembers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredMembers.value.slice(start, start + pageSize);
});

// ─────────────── Methods ───────────────
function refreshData() {
  // TODO: fetch new data
  lastUpdated.value = new Date().toLocaleString("zh-TW");
}
function gotoPage(p: number) {
  page.value = p;
}
function prevPage() {
  if (page.value > 1) page.value--;
}
function nextPage() {
  if (page.value < totalPages.value) page.value++;
}
function viewDetail(id: number) {
  // TODO: navigate to detail page
  console.log("view detail of", id);
}

// options for filters (could come from API)
const productOptions = [
  { label: "保健版", value: "health" },
  { label: "紅光版", value: "red" },
  { label: "虹光版", value: "optical" },
];
const statusOptions = [
  { label: "正常使用", value: "normal" },
  { label: "待關注", value: "warning" },
  { label: "偶爾使用", value: "occasion" },
];
</script>

<style scoped lang="scss">
// you can replace colors with variables / mixins defined in your project

.dashboard {
  display: flex;
  height: 100vh;
  background: $primary-100;
}

/* ─────────────── Main Content ─────────────── */
.content {
  flex: 1;
  padding: 32px 28px;
  overflow-y: auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .title {
      font-size: 24px;
      font-weight: 700;
      .count {
        color: var(--Primary-200, #b1c0d8);
        text-align: center;

        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 16px;

      .btn.refresh {
        // @include button;
        background-color: $primary-200;
        border: none;
        color: var(--Primary-100, #f5f7fa);
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        padding: 0.25rem 0.5rem;
        letter-spacing: 0.25px;
        border-radius: 6px;
        cursor: pointer;
      }
      .updated-time {
        font-size: 12px;
        color: $Neutral-500;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 140%;
      }
    }
  }
  .healthBtn {
    border-radius: 6px;
    border: none;
    background: var(--Primary-200, #b1c0d8);
    color: var(--Primary-100, #f5f7fa);
    font-family: "Noto Sans";
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    margin: 0 auto;
    cursor: pointer;
    letter-spacing: 2px;
    padding: 0.25rem 0.5rem;
    display: flex;
    align-items: center;

    gap: 4px;
    margin-top: 0.25rem;
    img {
      width: 14px;
    }
  }
  .toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
    width: 100%;

    .toolbar-inner {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      width: 100%;
      flex-wrap: wrap;
    }

    .search-wrapper {
      position: relative;
      img {
        width: 1.25rem;
        position: absolute;
        right: 5%;
        top: 50%;
        transform: translateY(-50%);
        width: 19px;
      }
    }

    .search {
      padding: 8px 12px;
      border: none;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    }

    .toolbarTime-wrapper {
      position: relative;

      /* 重點: 用 :deep() 才能選到 VueDatePicker 的內部元素 */
      :deep(.dp__pointer) {
        padding: 0; // 例如你想把 pointer 的 padding 清掉
      }

      :deep(.dp__input_icon) {
        color: $chip-success;

        right: auto; /* 關掉右邊 */
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
      }

      :deep(.dp__input) {
        padding: 4px 32px; // 改 input padding
        border-radius: 50px;
        background: #fff;
        box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);
        border: none;
        font-size: 14px;
      }

      img {
        position: absolute;
        right: 10%;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    select {
      padding: 0.5rem 1.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      background-color: #fff;
      background-size: 12px;
      appearance: none; // ✅ 移除預設樣式
      -webkit-appearance: none; // ✅ Safari
      -moz-appearance: none; // ✅ Firefox
      background-image: none;
      color: var(--Neutral-500, #666);
      cursor: pointer;
      width: 100%;
      border: none;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    }

    .selectWrapper {
      position: relative;
      min-width: 12%;
      img {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
      }
      .selectWrapperIcon1 {
        left: 7%;
      }
      .selectWrapperIcon2 {
        right: 7%;
      }
    }

    .toolbarTime {
      flex: 1 1 240px; // ✅ 可縮放、設定基準
      min-width: 200px;
      max-width: 100%;
    }
  }

  .toolbarTime {
  }

  .member-table {
    border: 1px solid $border;
    border-radius: 8px;
    overflow: hidden;
    border-radius: 20px;
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    .table-row {
      display: grid;

      grid-template-columns: 100px 60px 60px 100px 160px 120px 200px 1fr;
      position: relative;
      gap: 2px;
      align-items: center;
      padding: 16px 16px;
      & + .table-row {
        border-top: 1px solid $border;
      }
      &.table-header {
        font-weight: 600;
        white-space: nowrap;
        color: var(--Primary-600, #2d3047);
        text-align: center;
      }
      .cell {
        color: var(--Neutral-500, #666);
        text-align: center;
        width: auto;
        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);

        .tagsGroup {
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          .cellTag {
            white-space: nowrap;
            color: var(--Primary-default, #1ba39b);

            font-size: 1rem;
            font-style: normal;
            font-weight: 400;

            letter-spacing: var(--Title-Medium-Tracking, 0.15px);

            border-radius: 4px;
            border: 1px solid var(--Primary-default, #1ba39b);
            background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
            padding: 0.5rem;
          }
          .cellTagWarning {
            border: 1px solid var(--Warning-default, #ec4f4f);
            background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
            color: var(--Warning-default, #ec4f4f);
          }
          .cellTag2 {
            border: 1px solid var(--Neutral-300, #ccc);
            background: var(--Neutral-200, #eee);
            color: var(--Neutral-300, #ccc);
            display: flex;
            align-items: center;
            gap: 2px;
            img {
              width: 1rem;
            }
          }
        }

        &.product,
        &.health {
          //  font-size: 12px;
          //  line-height: 18px;
          font-size: 16px;
        }
        .cellProduct {
          display: flex;
          align-items: center;
          gap: 8px;

          margin-bottom: 0.25rem;
        }
        &.action {
          display: flex;
          align-items: center;
        }
        &.action {
          text-align: right;
        }
      }
      .goInfo {
        position: absolute;
        top: 50%;

        right: 12px;
        transform: translateY(-50%);
        cursor: pointer;
      }
    }
    .chip {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      line-height: 16px;
      &--success {
        background: rgba($chip-success, 0.1);
        color: $chip-success;
        border: 1px solid $chip-success;
      }
      &--danger {
        background: rgba($chip-danger, 0.1);
        color: $chip-danger;
        border: 1px solid $chip-danger;
      }
    }
    .chip--warning {
      overflow: hidden;
      color: var(--Warning-default, #ec4f4f);
      font-style: normal;
      font-weight: 400;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 12px;
    margin-bottom: 24px;
    .btn-page {
      padding: 6px 10px;
      min-width: 32px;
    
      border-radius: 4px;

      background-color: transparent;
      cursor: pointer;
      border: none;
      &.active {
        background: $chip-success;
        color: white;
        border-color: $chip-success;
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .btn-page-number{
   
      background: white;
    }
   
  }
}
</style>
