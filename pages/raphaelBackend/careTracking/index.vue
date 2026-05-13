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
          <div class="overview-card__iconWrap" aria-hidden="true">
            <svg
              v-if="card.icon === 'alert'"
              class="overview-card__svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.75" />
              <path
                d="M12 7v6M12 16h.01"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else-if="card.icon === 'triangle'"
              class="overview-card__svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5l8 14H4L12 5z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linejoin="round"
              />
              <path
                d="M12 10v4M12 17h.01"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <svg
              v-else-if="card.icon === 'phone'"
              class="overview-card__svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="7"
                y="3"
                width="10"
                height="18"
                rx="2"
                stroke="currentColor"
                stroke-width="1.75"
              />
              <path d="M10 18h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <svg
              v-else-if="card.icon === 'signal'"
              class="overview-card__svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 18h2v-4H4v4zm5 0h2V8H9v10zm5 0h2V4h-2v14zm5 0h2v-8h-2v8z"
                fill="currentColor"
              />
            </svg>
            <svg
              v-else
              class="overview-card__svg"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.75" />
              <path
                d="M8 12l2.5 2.5L16 9"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="overview-card__text">
            <p>{{ card.label }}</p>
            <strong>{{ card.value }}</strong>
          </div>
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
              <button type="button" @click="openMemberFromPriority(item.id)">
                <img src="/assets/imgs/backend/member_white.svg" alt="關懷">
                關懷</button>
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
            <div class="care-table__scroll">
              <div class="care-table__inner">
                <div class="table-head">
                  <span>照護狀態</span>
                  <span>會員資訊</span>
                  <span>最後互動</span>
                  <span>數據異常事件</span>
                  <span>最新主動回報事件</span>
                  <span>智慧衣使用</span>
                  <span>下次回診</span>
                  <span>操作</span>
                </div>

                <div
                  v-for="row in pagedRows"
                  :key="row.id"
                  class="table-row"
                  :class="{ focused: focusedMemberId === row.id }"
                  role="button"
                  tabindex="0"
                  :aria-label="`開啟 ${row.name} 會員詳細資料`"
                  @click="openMemberModal(row)"
                  @keydown.enter.prevent="openMemberModal(row)"
                  @keydown.space.prevent="openMemberModal(row)"
                >
                  <div class="cell status">
                    <span class="dot" :class="row.statusTone" />
                    <strong>{{ row.status }}</strong>
                    <small>{{ row.statusDetail }}</small>
                  </div>
                  <div class="cell member">
                    <strong class="memberName">{{ row.name }}</strong>
                    <span class="memberMeta memberLevel">{{ row.memberLevel }}</span>
                    <span class="memberMeta memberPhone">{{ row.phoneMasked }}</span>
                    <span class="memberMeta memberBirth">生日 {{ row.birthdayDisplay }}</span>
                  </div>
                  <div
                    class="cell interactions"
                    role="group"
                    :aria-label="`最後互動：${row.name}`"
                  >
                    <div
                      v-for="line in row.interactions"
                      :key="line.label"
                      class="interactionRow"
                    >
                      <span class="interactionLabel">{{ line.label }}</span>
                      <span
                        class="interactionValue"
                        :class="`interactionValue--${line.tone}`"
                      >
                        {{ line.value }}
                      </span>
                    </div>
                  </div>
                  <div class="cell risk">
                    <span class="chip" :class="row.riskTone">{{ row.dataAnomalyLabel }}</span>
                  </div>
                  <ol class="cell proactive">
                    <li v-for="(line, idx) in row.proactiveReports" :key="idx">
                      {{ line }}
                    </li>
                  </ol>
                  <div class="cell smartClothing">
                    <strong class="scTitle">{{ row.smartClothing.productName }}</strong>
                    <p class="scStats">
                      已用 {{ row.smartClothing.usedDays }} 天｜剩 {{ row.smartClothing.remainDays }} 天
                    </p>
                    <p class="scLast">{{ row.smartClothing.lastUsedSummary }}</p>
                  </div>
                  <div class="cell nextVisit">{{ row.nextFollowUp }}</div>
                  <div class="cell action">
                    <span class="careBtn" aria-hidden="true">
                        <img src="/assets/imgs/backend/member_white.svg" alt="關懷">
                        關懷</span>
                    <p class="lastCareLine">上次關懷時間：{{ row.lastCareAt }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav class="pagination">
            <button
              type="button"
              class="pagination__edge"
              :disabled="currentPage === 1"
              aria-label="第一頁"
              @click="currentPage = 1"
            >
              &lt;&lt;
            </button>
            <button
              type="button"
              :disabled="currentPage === 1"
              aria-label="上一頁"
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
              aria-label="下一頁"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              &gt;
            </button>
            <button
              type="button"
              class="pagination__edge"
              :disabled="currentPage === totalPages"
              aria-label="最末頁"
              @click="currentPage = totalPages"
            >
              &gt;&gt;
            </button>
          </nav>
        </section>
      </section>
    </main>

    <CareMemberDetailModal
      :show="memberModalOpen"
      :member="selectedMember"
      @close="closeMemberModal"
      @care="onMemberModalCare"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import CareMemberDetailModal, {
  type CareMemberModalMember,
} from "@/components/raphaelBackend/CareMemberDetailModal.vue";
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

type InteractionTone = "good" | "bad" | "muted";

interface LastInteractionRow {
  label: string;
  value: string;
  tone: InteractionTone;
}

interface SmartClothingInfo {
  productName: string;
  usedDays: number;
  remainDays: number;
  lastUsedSummary: string;
}

interface CareRow {
  id: string;
  status: string;
  statusDetail: string;
  statusTone: "danger" | "warning" | "normal";
  name: string;
  memberLevel: string;
  phoneMasked: string;
  birthdayDisplay: string;
  interactions: LastInteractionRow[];
  dataAnomalyLabel: string;
  riskTone: "danger" | "warning" | "normal";
  proactiveReports: string[];
  smartClothing: SmartClothingInfo;
  nextFollowUp: string;
  lastCareAt: string;
}

const latestUpdateText = "2026/05/14 19:00";
const onlineCount = 361;
const keyword = ref("");
const currentPage = ref(1);
const pageSize = 10;
const focusedMemberId = ref("");
const memberModalOpen = ref(false);
const selectedMember = ref<CareMemberModalMember | null>(null);

type OverviewTone = "danger" | "warning" | "notice" | "violet" | "success";
type OverviewIcon = "alert" | "triangle" | "phone" | "signal" | "check";

const overviewCards: {
  key: string;
  label: string;
  value: number;
  tone: OverviewTone;
  icon: OverviewIcon;
}[] = [
  { key: "pending", label: "今日待關懷", value: 28, tone: "danger", icon: "alert" },
  { key: "high", label: "高風險會員", value: 9, tone: "warning", icon: "triangle" },
  { key: "missing", label: "APP未登入", value: 46, tone: "notice", icon: "phone" },
  { key: "mute", label: "穿戴資料中斷", value: 31, tone: "violet", icon: "signal" },
  { key: "normal", label: "正常追蹤", value: 287, tone: "success", icon: "check" },
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
    statusDetail: "12 天無主要互動",
    statusTone: "danger",
    name: "陳美根",
    memberLevel: "鉑金會員",
    phoneMasked: "0930****007",
    birthdayDisplay: "1993/09/06",
    interactions: [
      { label: "APP", value: "12 天前", tone: "bad" },
      { label: "紅光", value: "3 天前", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "未追蹤", tone: "muted" },
      { label: "穿戴", value: "1 天前", tone: "good" },
    ],
    dataAnomalyLabel: "APP 12 天未登入",
    riskTone: "danger",
    proactiveReports: [
      "睡眠偏淺、入睡時間延後",
      "情緒略緊繃、肩頸僵硬",
      "白天易出汗、心悸感 1 次",
      "排便略乾、水分攝取不足",
    ],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 142,
      remainDays: 38,
      lastUsedSummary: "最後使用：5/20（2 天前）",
    },
    nextFollowUp: "2026/05/29 10:30",
    lastCareAt: "2026/02/12 09:22",
  },
  {
    id: "M002",
    status: "需關懷",
    statusDetail: "7 天無主要互動",
    statusTone: "warning",
    name: "莊亭馨",
    memberLevel: "黃金會員",
    phoneMasked: "0921****556",
    birthdayDisplay: "1988/03/21",
    interactions: [
      { label: "APP", value: "7 天前", tone: "bad" },
      { label: "紅光", value: "7 天前", tone: "bad" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "14 天前", tone: "good" },
      { label: "穿戴", value: "未追蹤", tone: "muted" },
    ],
    dataAnomalyLabel: "智慧衣 9 天未使用",
    riskTone: "warning",
    proactiveReports: [
      "壓力偏高、晚上較難放鬆",
      "步行量略降",
    ],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 88,
      remainDays: 92,
      lastUsedSummary: "最後使用：5/15（7 天前）",
    },
    nextFollowUp: "2026/05/30 14:00",
    lastCareAt: "2026/03/01 16:10",
  },
  {
    id: "M003",
    status: "需觀察",
    statusDetail: "APP 5 天未登入",
    statusTone: "warning",
    name: "王若貞",
    memberLevel: "黃金會員",
    phoneMasked: "0988****312",
    birthdayDisplay: "1975/11/02",
    interactions: [
      { label: "APP", value: "5 天前", tone: "bad" },
      { label: "紅光", value: "1 天前", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "未追蹤", tone: "muted" },
      { label: "穿戴", value: "2 天前", tone: "good" },
    ],
    dataAnomalyLabel: "APP 5 天未登入",
    riskTone: "warning",
    proactiveReports: [
      "睡眠時數尚可、深睡偏少",
    ],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 210,
      remainDays: 0,
      lastUsedSummary: "最後使用：5/28（1 天前）",
    },
    nextFollowUp: "2026/05/31 09:30",
    lastCareAt: "2026/04/18 11:05",
  },
  {
    id: "M004",
    status: "正常",
    statusDetail: "今日有資料",
    statusTone: "normal",
    name: "林翊彤",
    memberLevel: "白金會員",
    phoneMasked: "0912****889",
    birthdayDisplay: "1990/07/14",
    interactions: [
      { label: "APP", value: "今日", tone: "good" },
      { label: "紅光", value: "今日", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "3 天前", tone: "good" },
      { label: "穿戴", value: "今日", tone: "good" },
    ],
    dataAnomalyLabel: "核心服務正常",
    riskTone: "normal",
    proactiveReports: [
      "精神尚可、運動量達標",
      "腸胃穩定",
    ],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 300,
      remainDays: 65,
      lastUsedSummary: "最後使用：5/29（今日）",
    },
    nextFollowUp: "2026/06/01 10:00",
    lastCareAt: "2026/05/10 08:40",
  },
  {
    id: "M005",
    status: "正常",
    statusDetail: "今日有資料",
    statusTone: "normal",
    name: "林梅彤",
    memberLevel: "白金會員",
    phoneMasked: "0933****102",
    birthdayDisplay: "1982/12/30",
    interactions: [
      { label: "APP", value: "今日", tone: "good" },
      { label: "紅光", value: "2 天前", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "未追蹤", tone: "muted" },
      { label: "穿戴", value: "今日", tone: "good" },
    ],
    dataAnomalyLabel: "核心服務正常",
    riskTone: "normal",
    proactiveReports: [
      "作息規律、無特殊主訴",
    ],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 95,
      remainDays: 270,
      lastUsedSummary: "最後使用：5/29（今日）",
    },
    nextFollowUp: "2026/06/01 15:30",
    lastCareAt: "2026/04/22 13:20",
  },
  {
    id: "M006",
    status: "需觀察",
    statusDetail: "紅光 4 天未使用",
    statusTone: "warning",
    name: "張雅筑",
    memberLevel: "黃金會員",
    phoneMasked: "0911****221",
    birthdayDisplay: "1995/04/18",
    interactions: [
      { label: "APP", value: "1 天前", tone: "good" },
      { label: "紅光", value: "4 天前", tone: "bad" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "未追蹤", tone: "muted" },
      { label: "穿戴", value: "今日", tone: "good" },
    ],
    dataAnomalyLabel: "紅光 4 天未使用",
    riskTone: "warning",
    proactiveReports: ["紅光療程中斷，待電聯確認"],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 40,
      remainDays: 140,
      lastUsedSummary: "最後使用：5/25（6 天前）",
    },
    nextFollowUp: "2026/06/02 11:00",
    lastCareAt: "2026/05/01 10:00",
  },
  {
    id: "M007",
    status: "正常",
    statusDetail: "今日有資料",
    statusTone: "normal",
    name: "吳承恩",
    memberLevel: "白金會員",
    phoneMasked: "0975****663",
    birthdayDisplay: "1980/01/08",
    interactions: [
      { label: "APP", value: "今日", tone: "good" },
      { label: "紅光", value: "今日", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "5 天前", tone: "good" },
      { label: "穿戴", value: "今日", tone: "good" },
    ],
    dataAnomalyLabel: "核心服務正常",
    riskTone: "normal",
    proactiveReports: ["無主訴"],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 201,
      remainDays: 164,
      lastUsedSummary: "最後使用：5/29（今日）",
    },
    nextFollowUp: "2026/06/03 09:00",
    lastCareAt: "2026/05/08 14:30",
  },
  {
    id: "M008",
    status: "高風險",
    statusDetail: "穿戴 14 天無資料",
    statusTone: "danger",
    name: "李佳穎",
    memberLevel: "鉑金會員",
    phoneMasked: "0908****445",
    birthdayDisplay: "1992/12/25",
    interactions: [
      { label: "APP", value: "2 天前", tone: "good" },
      { label: "紅光", value: "1 天前", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "未追蹤", tone: "muted" },
      { label: "穿戴", value: "14 天前", tone: "bad" },
    ],
    dataAnomalyLabel: "穿戴資料中斷",
    riskTone: "danger",
    proactiveReports: ["手環電量低、同步失敗多次"],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 330,
      remainDays: 35,
      lastUsedSummary: "最後使用：5/15（14 天前）",
    },
    nextFollowUp: "2026/05/30 16:00",
    lastCareAt: "2026/01/20 09:15",
  },
  {
    id: "M009",
    status: "需關懷",
    statusDetail: "口述 21 天未更新",
    statusTone: "warning",
    name: "鄭家豪",
    memberLevel: "黃金會員",
    phoneMasked: "0922****901",
    birthdayDisplay: "1978/06/30",
    interactions: [
      { label: "APP", value: "3 天前", tone: "good" },
      { label: "紅光", value: "2 天前", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "21 天前", tone: "bad" },
      { label: "穿戴", value: "1 天前", tone: "good" },
    ],
    dataAnomalyLabel: "口述紀錄逾期",
    riskTone: "warning",
    proactiveReports: ["上次口述提及腸胃不適"],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 76,
      remainDays: 289,
      lastUsedSummary: "最後使用：5/28（1 天前）",
    },
    nextFollowUp: "2026/06/05 13:30",
    lastCareAt: "2026/04/10 11:40",
  },
  {
    id: "M010",
    status: "正常",
    statusDetail: "今日有資料",
    statusTone: "normal",
    name: "周品睿",
    memberLevel: "白金會員",
    phoneMasked: "0939****778",
    birthdayDisplay: "2001/02/14",
    interactions: [
      { label: "APP", value: "今日", tone: "good" },
      { label: "紅光", value: "今日", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "未追蹤", tone: "muted" },
      { label: "穿戴", value: "今日", tone: "good" },
    ],
    dataAnomalyLabel: "核心服務正常",
    riskTone: "normal",
    proactiveReports: ["運動量提升、睡眠穩定"],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 12,
      remainDays: 353,
      lastUsedSummary: "最後使用：5/29（今日）",
    },
    nextFollowUp: "2026/06/10 10:30",
    lastCareAt: "2026/05/12 08:55",
  },
  {
    id: "M011",
    status: "需觀察",
    statusDetail: "護您穩未啟用",
    statusTone: "warning",
    name: "謝旻修",
    memberLevel: "黃金會員",
    phoneMasked: "0981****334",
    birthdayDisplay: "1986/09/09",
    interactions: [
      { label: "APP", value: "今日", tone: "good" },
      { label: "紅光", value: "今日", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "7 天前", tone: "good" },
      { label: "穿戴", value: "2 天前", tone: "good" },
    ],
    dataAnomalyLabel: "護您穩未綁定",
    riskTone: "warning",
    proactiveReports: ["衛教影片觀看進度 0%"],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 55,
      remainDays: 310,
      lastUsedSummary: "最後使用：5/27（2 天前）",
    },
    nextFollowUp: "2026/06/06 15:00",
    lastCareAt: "2026/03/28 16:20",
  },
  {
    id: "M012",
    status: "正常",
    statusDetail: "今日有資料",
    statusTone: "normal",
    name: "蔡宜庭",
    memberLevel: "鉑金會員",
    phoneMasked: "0916****512",
    birthdayDisplay: "1998/11/01",
    interactions: [
      { label: "APP", value: "今日", tone: "good" },
      { label: "紅光", value: "2 天前", tone: "good" },
      { label: "護您穩", value: "未追蹤", tone: "muted" },
      { label: "口述", value: "1 天前", tone: "good" },
      { label: "穿戴", value: "今日", tone: "good" },
    ],
    dataAnomalyLabel: "核心服務正常",
    riskTone: "normal",
    proactiveReports: ["回診用藥遵從度佳"],
    smartClothing: {
      productName: "第六代紅光極智衣",
      usedDays: 178,
      remainDays: 187,
      lastUsedSummary: "最後使用：5/29（今日）",
    },
    nextFollowUp: "2026/06/08 09:45",
    lastCareAt: "2026/05/15 12:10",
  },
]);

watch(keyword, () => {
  currentPage.value = 1;
});

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
    [
      row.name,
      row.phoneMasked,
      row.memberLevel,
      row.dataAnomalyLabel,
      row.id,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchText),
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

function rowToModalMember(row: CareRow): CareMemberModalMember {
  return {
    id: row.id,
    name: row.name,
    memberCode: `${row.phoneMasked} · ${row.memberLevel}`,
    riskLabel: row.dataAnomalyLabel,
    status: row.status,
    latestEvent: row.smartClothing.productName,
    nextFollowUp: row.nextFollowUp,
    lastCareAt: row.lastCareAt,
  };
}

function openMemberModal(row: CareRow) {
  selectedMember.value = rowToModalMember(row);
  memberModalOpen.value = true;
  focusMember(row.id);
}

function openMemberFromPriority(memberId: string) {
  const row = careRows.value.find((r: CareRow) => r.id === memberId);
  if (row) openMemberModal(row);
}

function closeMemberModal() {
  memberModalOpen.value = false;
  selectedMember.value = null;
}

function onMemberModalCare(member: CareMemberModalMember) {
  focusMember(member.id);
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

    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
 
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
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;

    &__iconWrap {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    &__svg {
      width: 22px;
      height: 22px;
    }

    &__text {
      min-width: 0;
      flex: 1;
    }

    &.danger .overview-card__iconWrap {
      background: rgba(212, 28, 28, 0.12);
      color: #d41c1c;
    }
    &.warning .overview-card__iconWrap {
      background: rgba(244, 118, 59, 0.14);
      color: #f4763b;
    }
    &.notice .overview-card__iconWrap {
      background: rgba(227, 165, 0, 0.16);
      color: #e3a500;
    }
    &.violet .overview-card__iconWrap {
      background: rgba(37, 99, 235, 0.12);
      color: #2563eb;
    }
    &.success .overview-card__iconWrap {
      background: rgba(27, 163, 155, 0.14);
      color: #1ba39b;
    }

    p {
      color: #3d4948;
      font-size: 12px;
      font-style: normal;
      font-weight: 600;
      line-height: 12px;
      margin: 0 0 0.35rem;
    }

    strong {
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: 33.12px;
    }

    &.danger strong {
      color: #d41c1c;
    }
    &.warning strong {
      color: #f4763b;
    }
    &.notice strong {
      color: #e3a500;
    }
    &.violet strong {
      color: #2563eb;
    }
    &.success strong {
      color: #1ba39b;
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
      background: #f9e2d7;
      border-radius: 999px;
      padding: 4px 8px;
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
    min-height: 0;
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
    max-height: min(560px, calc(100vh - 300px));
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .care-table__scroll {
    flex: 1;
    min-height: 200px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }

  .care-table__inner {
    min-width: 1080px;
  }

  .table-head,
  .table-row {
    display: grid;
    grid-template-columns:
      minmax(100px, 0.85fr)
      minmax(128px, 1fr)
      minmax(148px, 1fr)
      minmax(120px, 0.9fr)
      minmax(168px, 1.15fr)
      minmax(150px, 1.05fr)
      minmax(118px, 0.85fr)
      88px;
    gap: 0.5rem 0.65rem;
    align-items: start;
    padding: 0.75rem;
  }

  .table-head {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #f6f8fc;
    color: #5f6b7c;
    font-size: 0.75rem;
    font-weight: 700;
    box-shadow: 0 1px 0 #e8edf5;
  }

  .table-row {
    border-top: 1px solid #f0f3f9;
    font-size: 0.82rem;
    color: #2d3047;
    cursor: pointer;
    outline: none;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(27, 163, 155, 0.04);
    }

    &:focus-visible {
      box-shadow: inset 0 0 0 2px rgba(27, 163, 155, 0.45);
      position: relative;
      z-index: 1;
    }

    &.focused {
      background: rgba(27, 163, 155, 0.08);
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
    gap: 0.2rem;
    align-content: start;
  }

  .memberName {
    font-size: 0.95rem;
    color: #2d3047;
  }

  .memberMeta {
    font-size: 0.72rem;
    line-height: 1.35;
    color: #5f6b7c;
  }

  .memberLevel {
    font-weight: 700;
    color: #2d3047;
  }

  .memberPhone {
    letter-spacing: 0.02em;
  }

  .memberBirth {
    color: #7b8798;
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

  .interactions {
    display: grid;
    gap: 0.2rem;
    font-size: 0.72rem;
    line-height: 1.35;

    border-radius: 8px;
    padding: 0.45rem 0.5rem;

  }

  .interactionRow {
    display: grid;
    grid-template-columns: 52px 1fr;
    gap: 0.35rem;
    align-items: baseline;
  }

  .interactionLabel {
    color: #7b8798;
    font-weight: 600;
  }

  .interactionValue {
    font-weight: 600;
    text-align: right;

    &--good {
      color: #1ba39b;
    }
    &--bad {
      color: #ea5455;
    }
    &--muted {
      color: #9aa5b5;
      font-weight: 500;
    }
  }

  .proactive {
    margin: 0;
    padding-left: 1.1rem;
    font-size: 0.72rem;
    line-height: 1.45;
    color: #4a5568;

    li {
      padding-left: 0.15rem;
    }

    li + li {
      margin-top: 0.2rem;
    }
  }

  .smartClothing {
    display: grid;
    gap: 0.25rem;
    font-size: 0.72rem;
    line-height: 1.4;
  }

  .scTitle {
    font-size: 0.78rem;
    font-weight: 700;
    color: #2d3047;
  }

  .scStats {
    margin: 0;
    color: #5f6b7c;
  }

  .scLast {
    margin: 0;
    color: #7b8798;
  }

  .nextVisit {
    font-size: 0.78rem;
    font-weight: 600;
    color: #2d3047;
    white-space: nowrap;
  }

  .action {
    display: grid;
    gap: 0.35rem;
    justify-items: stretch;
  }

  .careBtn {
    width: 100%;
    height: 34px;
    border: none;
    border-radius: 999px;
    background: $chip-success;
    color: #fff;
    font-weight: 700;
    font-size: 0.78rem;
    cursor: default;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
    pointer-events: none;
    user-select: none;
    box-sizing: border-box;
  }

  .lastCareLine {
    margin: 0;
    font-size: 0.62rem;
    line-height: 1.35;
    color: #7b8798;
    text-align: center;
    word-break: break-all;
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

    .care-table__inner {
      min-width: 0;
    }

    .care-table {
      max-height: none;
      border: none;
    }

    .care-table__scroll {
      overflow: visible;
    }

    .table-row {
      min-width: 0;
      grid-template-columns: 1fr;
      border: 1px solid #edf1f6;
      border-radius: 10px;
      margin: 0.6rem;
    }
  }
}
</style>
