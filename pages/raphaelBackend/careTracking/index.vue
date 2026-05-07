<template>
  <div class="careTrackingPage">
    <Sidebar />

    <main class="content">
      <header class="page-header">
        <div>
          <h2 class="title">會員照護追蹤總控台</h2>
          <p class="subtitle">最後更新：{{ latestUpdateText }}</p>
        </div>
        <div class="head-meta">
          <span class="online-dot" />
          <strong>{{ onlineCount }}</strong>
          <span>位出診紀錄名單</span>
        </div>
      </header>

      <section class="overview-cards">
        <article
          v-for="card in overviewCards"
          :key="card.key"
          class="overview-card"
          :class="card.tone"
        >
          <p>{{ card.label }}</p>
          <strong>{{ card.value }}</strong>
        </article>
      </section>

      <section class="dashboard-grid">
        <aside class="priority-panel">
          <h3>今日優先關懷</h3>
          <div class="priority-tabs">
            <button
              v-for="tab in priorityTabs"
              :key="tab"
              type="button"
              :class="{ active: activePriorityTab === tab }"
              @click="activePriorityTab = tab"
            >
              {{ tab }}
            </button>
          </div>

          <div class="priority-list">
            <article
              v-for="item in filteredPriorityList"
              :key="item.id"
              class="priority-item"
            >
              <div class="top">
                <strong>{{ item.name }}</strong>
                <span class="risk-tag">{{ item.risk }}</span>
              </div>
              <p>{{ item.note }}</p>
              <button type="button" @click="focusMember(item.id)">關懷</button>
            </article>
          </div>
        </aside>

        <section class="table-panel">
          <div class="table-toolbar">
            <div class="search-wrapper">
              <input
                v-model="keyword"
                type="text"
                placeholder="搜尋姓名 / 電話 / 會員編號"
              />
              <img src="/assets/imgs/backend/search.svg" alt="" />
            </div>
            <div class="filter-list">
              <button type="button">狀態篩選</button>
              <button type="button">數據異常事件</button>
              <button type="button">會員等級</button>
              <button type="button">產品別</button>
            </div>
          </div>

          <div class="care-table">
            <div class="table-head">
              <span>關懷狀態</span>
              <span>會員資料</span>
              <span>風險</span>
              <span>最新觸發事件</span>
              <span>最後主動回報事件</span>
              <span>聯繫及使用</span>
              <span>下次追訪</span>
              <span>操作</span>
            </div>

            <div
              v-for="row in pagedRows"
              :key="row.id"
              class="table-row"
              :class="{ focused: focusedMemberId === row.id }"
            >
              <div class="cell status">
                <span class="dot" :class="row.statusTone" />
                <strong>{{ row.status }}</strong>
                <small>{{ row.statusDetail }}</small>
              </div>
              <div class="cell member">
                <strong>{{ row.name }}</strong>
                <small>{{ row.memberCode }}</small>
              </div>
              <div class="cell risk">
                <span class="chip" :class="row.riskTone">{{ row.riskLabel }}</span>
              </div>
              <div class="cell">{{ row.latestEvent }}</div>
              <div class="cell">{{ row.lastReport }}</div>
              <div class="cell">{{ row.contactSummary }}</div>
              <div class="cell">{{ row.nextFollowUp }}</div>
              <div class="cell action">
                <button type="button">關懷</button>
              </div>
            </div>
          </div>

          <nav class="pagination">
            <button
              type="button"
              :disabled="currentPage === 1"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              &lt;
            </button>
            <button
              v-for="p in totalPages"
              :key="p"
              type="button"
              :class="{ active: currentPage === p }"
              @click="currentPage = p"
            >
              {{ p }}
            </button>
            <button
              type="button"
              :disabled="currentPage === totalPages"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              &gt;
            </button>
          </nav>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "會員照護追蹤總控台",
  description: "拉菲爾會員照護追蹤總控台",
  url: "https://neuroplus.com.tw",
});

interface PriorityItem {
  id: string;
  name: string;
  risk: "高" | "中";
  note: string;
  tab: "全部關懷對象" | "高風險組" | "7天未登入";
}

interface CareRow {
  id: string;
  status: string;
  statusDetail: string;
  statusTone: "danger" | "warning" | "normal";
  name: string;
  memberCode: string;
  riskLabel: string;
  riskTone: "danger" | "warning" | "normal";
  latestEvent: string;
  lastReport: string;
  contactSummary: string;
  nextFollowUp: string;
}

const latestUpdateText = "2026/05/14 19:00";
const onlineCount = 361;
const keyword = ref("");
const currentPage = ref(1);
const pageSize = 5;
const focusedMemberId = ref("");

const overviewCards = [
  { key: "pending", label: "今日待關懷", value: 28, tone: "danger" },
  { key: "high", label: "高風險會員", value: 9, tone: "warning" },
  { key: "missing", label: "APP未登入", value: 46, tone: "notice" },
  { key: "mute", label: "穿戴資料中斷", value: 31, tone: "violet" },
  { key: "normal", label: "正常追蹤", value: 287, tone: "success" },
];

const priorityTabs: Array<PriorityItem["tab"]> = [
  "全部關懷對象",
  "高風險組",
  "7天未登入",
];
const activePriorityTab = ref<PriorityItem["tab"]>("全部關懷對象");

const priorityList = ref<PriorityItem[]>([
  {
    id: "M001",
    name: "陳美根",
    risk: "高",
    note: "APP 12 天未登入、曾觸發心悸異常",
    tab: "高風險組",
  },
  {
    id: "M002",
    name: "莊亭馨",
    risk: "中",
    note: "連續 7 天未使用，且最後回報壓力偏高",
    tab: "7天未登入",
  },
  {
    id: "M003",
    name: "林佩生",
    risk: "中",
    note: "睡眠品質連續 3 天未達標，需追蹤",
    tab: "全部關懷對象",
  },
]);

const careRows = ref<CareRow[]>([
  {
    id: "M001",
    status: "高風險",
    statusDetail: "12 天未上傳資料",
    statusTone: "danger",
    name: "陳美根",
    memberCode: "APP 12 天未用",
    riskLabel: "APP 12 天未登入",
    riskTone: "danger",
    latestEvent: "第六代紅光塑衡衣",
    lastReport: "2026/05/29 10:30",
    contactSummary: "已關懷 5 次",
    nextFollowUp: "2026/05/30",
  },
  {
    id: "M002",
    status: "需關懷",
    statusDetail: "7 天無回報",
    statusTone: "warning",
    name: "莊亭馨",
    memberCode: "APP 7 天未用",
    riskLabel: "裝置 7 天未使用",
    riskTone: "warning",
    latestEvent: "第六代紅光塑衡衣",
    lastReport: "2026/05/29 10:30",
    contactSummary: "已關懷 4 次",
    nextFollowUp: "2026/05/30",
  },
  {
    id: "M003",
    status: "需觀察",
    statusDetail: "APP 5 天未登入",
    statusTone: "warning",
    name: "王若貞",
    memberCode: "APP 5 天未登入",
    riskLabel: "APP 5 天未登入",
    riskTone: "warning",
    latestEvent: "第六代紅光塑衡衣",
    lastReport: "2026/05/29 10:30",
    contactSummary: "已關懷 4 次",
    nextFollowUp: "2026/05/31",
  },
  {
    id: "M004",
    status: "正常",
    statusDetail: "今日有資料",
    statusTone: "normal",
    name: "林翊彤",
    memberCode: "APP 正常回報",
    riskLabel: "核心數據正常",
    riskTone: "normal",
    latestEvent: "第六代紅光塑衡衣",
    lastReport: "2026/05/29 10:30",
    contactSummary: "已關懷 3 次",
    nextFollowUp: "2026/06/01",
  },
  {
    id: "M005",
    status: "正常",
    statusDetail: "今日有資料",
    statusTone: "normal",
    name: "林梅彤",
    memberCode: "APP 正常回報",
    riskLabel: "核心數據正常",
    riskTone: "normal",
    latestEvent: "第六代紅光塑衡衣",
    lastReport: "2026/05/29 10:30",
    contactSummary: "已關懷 3 次",
    nextFollowUp: "2026/06/01",
  },
]);

const filteredPriorityList = computed(() => {
  if (activePriorityTab.value === "全部關懷對象") return priorityList.value;
  return priorityList.value.filter(
    (item: PriorityItem) => item.tab === activePriorityTab.value,
  );
});

const filteredRows = computed(() => {
  const searchText = keyword.value.trim().toLowerCase();
  if (!searchText) return careRows.value;
  return careRows.value.filter((row: CareRow) =>
    [row.name, row.memberCode, row.riskLabel].join(" ").toLowerCase().includes(searchText),
  );
});

const totalPages = computed(() => {
  const pages = Math.ceil(filteredRows.value.length / pageSize);
  return Math.max(1, pages);
});

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});

function focusMember(memberId: string) {
  focusedMemberId.value = memberId;
}
</script>

<style scoped lang="scss">
.careTrackingPage {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;

  .content {
    flex: 1;
    padding: 1rem;
    display: grid;
    gap: 1rem;
  }

  .page-header {
    background: #fff;
    border-radius: 14px;
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #e5e9f2;
  }

  .title {
    margin: 0;
    color: $primary-600;
    font-size: 2rem;
    font-weight: 700;
  }

  .subtitle {
    margin: 0.25rem 0 0;
    color: #7f8a9a;
    font-size: 0.875rem;
  }

  .head-meta {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    color: #2d3047;

    strong {
      font-size: 1.5rem;
      color: $chip-success;
    }
  }

  .online-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: $chip-success;
    box-shadow: 0 0 0 4px rgba(27, 163, 155, 0.12);
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .overview-card {
    background: #fff;
    border-radius: 12px;
    padding: 0.875rem 1rem;
    border: 1px solid #e8edf5;

    p {
      margin: 0;
      color: #7f8a9a;
      font-size: 0.875rem;
    }

    strong {
      display: block;
      margin-top: 0.35rem;
      font-size: 1.75rem;
      line-height: 1;
    }

    &.danger strong {
      color: #ea5455;
    }
    &.warning strong {
      color: #f39c12;
    }
    &.notice strong {
      color: #e6b800;
    }
    &.violet strong {
      color: #5d6bf3;
    }
    &.success strong {
      color: $chip-success;
    }
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 1rem;
    min-height: 0;
  }

  .priority-panel {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e5e9f2;
    padding: 1rem;
    display: grid;
    gap: 0.75rem;
    align-content: start;

    h3 {
      margin: 0;
      font-size: 1.125rem;
      color: #2d3047;
    }
  }

  .priority-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;

    button {
      border: none;
      border-radius: 999px;
      background: #edf1f7;
      color: #5f6b7c;
      font-size: 0.75rem;
      padding: 0.3rem 0.7rem;
      cursor: pointer;

      &.active {
        background: rgba(27, 163, 155, 0.14);
        color: $chip-success;
        font-weight: 700;
      }
    }
  }

  .priority-list {
    display: grid;
    gap: 0.75rem;
  }

  .priority-item {
    border: 1px solid #e8edf5;
    border-radius: 10px;
    padding: 0.75rem;
    display: grid;
    gap: 0.4rem;

    .top {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }

    strong {
      color: #2d3047;
    }

    p {
      margin: 0;
      color: #6f7a8d;
      font-size: 0.82rem;
      line-height: 1.45;
    }

    .risk-tag {
      color: #f39c12;
      font-size: 0.75rem;
      font-weight: 700;
    }

    button {
      margin-top: 0.2rem;
      width: 100%;
      border: none;
      border-radius: 8px;
      background: $chip-success;
      color: #fff;
      height: 34px;
      cursor: pointer;
      font-weight: 700;
    }
  }

  .table-panel {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e5e9f2;
    padding: 1rem;
    display: grid;
    gap: 0.8rem;
  }

  .table-toolbar {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .search-wrapper {
    position: relative;
    width: min(340px, 100%);

    input {
      width: 100%;
      border: 1px solid #dbe3f0;
      border-radius: 999px;
      height: 36px;
      padding: 0 1rem 0 2.2rem;
      color: #2d3047;
    }

    img {
      width: 16px;
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .filter-list {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;

    button {
      height: 34px;
      border: 1px solid #d8dfec;
      background: #fff;
      border-radius: 8px;
      padding: 0 0.8rem;
      color: #5d6a7e;
      cursor: pointer;
    }
  }

  .care-table {
    border: 1px solid #edf1f6;
    border-radius: 10px;
    overflow: hidden;
  }

  .table-head,
  .table-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1.2fr 1.2fr 1fr 1fr 90px;
    gap: 0.5rem;
    align-items: center;
    padding: 0.75rem;
  }

  .table-head {
    background: #f6f8fc;
    color: #5f6b7c;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .table-row {
    border-top: 1px solid #f0f3f9;
    font-size: 0.82rem;
    color: #2d3047;

    &.focused {
      background: rgba(27, 163, 155, 0.06);
    }
  }

  .cell {
    min-width: 0;
  }

  .status {
    display: grid;
    gap: 0.15rem;

    strong {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    small {
      color: #7b8798;
    }
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;

    &.danger {
      background: #ea5455;
    }
    &.warning {
      background: #f39c12;
    }
    &.normal {
      background: #1ba39b;
    }
  }

  .member {
    display: grid;
    gap: 0.15rem;

    small {
      color: #7b8798;
    }
  }

  .chip {
    display: inline-block;
    border-radius: 999px;
    padding: 0.2rem 0.55rem;
    font-size: 0.75rem;
    font-weight: 700;

    &.danger {
      color: #ea5455;
      background: rgba(234, 84, 85, 0.1);
    }
    &.warning {
      color: #c88800;
      background: rgba(243, 156, 18, 0.14);
    }
    &.normal {
      color: #1ba39b;
      background: rgba(27, 163, 155, 0.1);
    }
  }

  .action button {
    width: 100%;
    height: 34px;
    border: none;
    border-radius: 999px;
    background: $chip-success;
    color: #fff;
    font-weight: 700;
    cursor: pointer;
  }

  .pagination {
    justify-self: center;
    display: flex;
    gap: 0.4rem;

    button {
      min-width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid #d8dfec;
      background: #fff;
      color: #5f6b7c;
      cursor: pointer;

      &.active {
        background: $chip-success;
        color: #fff;
        border-color: $chip-success;
      }

      &:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
    }
  }

  @include respond-to("xl") {
    .overview-cards {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
    }
  }

  @include respond-to("md") {
    .title {
      font-size: 1.5rem;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.65rem;
    }

    .overview-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .table-head {
      display: none;
    }

    .table-row {
      grid-template-columns: 1fr;
      border: 1px solid #edf1f6;
      border-radius: 10px;
      margin: 0.6rem;
    }

    .care-table {
      border: none;
    }
  }
}
</style>
