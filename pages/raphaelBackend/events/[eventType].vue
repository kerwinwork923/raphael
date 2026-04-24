<template>
  <div class="seminarRegister">
    <Sidebar />

    <main class="content">
      <header class="page-header">
        <h2 class="title">
          講座報名管理
          <span class="count">({{ totalRegistrations }})</span>
        </h2>

        <div class="header-actions">
          <button class="back-btn" @click="goBack">返回</button>
          <button class="export-btn" @click="exportCSV">匯出CSV</button>
        </div>
      </header>

      <section class="stats single">
        <div class="stat-card total">
          <span>總報名數</span>
          <strong>{{ registrations.length }}</strong>
        </div>
      </section>

      <section class="toolbar">
        <div class="search-wrapper">
          <input
            v-model="searchKeyword"
            class="search"
            type="text"
            placeholder="搜尋姓名、手機、VIP、備註"
            @input="resetPage"
          />
          <img src="/assets/imgs/backend/search.svg" alt="" />
        </div>

        <div class="toolbarTime-wrapper">
          <VueDatePicker
            v-model="dateRange"
            range
            :enable-time-picker="false"
            format="yyyy/MM/dd"
            placeholder="日期查詢"
            teleport="body"
          />
          <img src="/assets/imgs/backend/search.svg" alt="" />
        </div>
      </section>

      <section class="register-table">
        <div class="table-row table-header">
          <div class="name">姓名</div>
          <div class="mobile">手機</div>
          <div class="vip">VIP</div>
          <div class="created">報名時間</div>
          <div class="note">備註</div>
          <div class="action">操作</div>
        </div>

        <div v-if="loading" class="loading-row">載入中...</div>

        <div v-else class="table-list">
          <div
            v-for="item in paginatedRegistrations"
            :key="item.id"
            class="table-row"
          >
            <div class="cell name" data-label="姓名">
              <span class="avatar">{{ getInitial(item.name) }}</span>
              <span>{{ item.name || "-" }}</span>
            </div>

            <div class="cell mobile" data-label="手機">
              {{ item.mobile || "-" }}
            </div>

            <div class="cell vip" data-label="VIP">
              {{ item.vip || "-" }}
            </div>

            <div class="cell created" data-label="報名時間">
              {{ item.createdAt || "-" }}
            </div>

            <div class="cell note" data-label="備註">
              {{ item.note || "-" }}
            </div>

            <div class="cell action" data-label="操作">
              <div class="action-buttons">
                <button class="text-btn" @click="openDetail(item)">查看</button>
                <a
                  v-if="item.mobile"
                  class="text-btn call"
                  :href="`tel:${item.mobile}`"
                >
                  撥打
                </a>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!loading && filteredRegistrations.length === 0" class="no-data">
          <p>尚無資料</p>
        </div>

        <nav class="pagination" v-if="totalPages > 1">
          <button class="btn-page" :disabled="currentPage === 1" @click="gotoPage(1)">
            &lt;&lt;
          </button>

          <button class="btn-page" :disabled="currentPage === 1" @click="prevPage">
            &lt;
          </button>

          <button
            v-for="p in pageNumberList"
            :key="p"
            class="btn-page btn-page-number"
            :class="{ active: currentPage === p }"
            :disabled="p === '...'"
            @click="typeof p === 'number' && gotoPage(p)"
          >
            {{ p }}
          </button>

          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            &gt;
          </button>

          <button
            class="btn-page"
            :disabled="currentPage === totalPages"
            @click="gotoPage(totalPages)"
          >
            &gt;&gt;
          </button>
        </nav>
      </section>

      <div
        v-if="detailVisible && selectedItem"
        class="modal-mask"
        @click.self="closeDetail"
      >
        <div class="modal">
          <header class="modal-head">
            <div>
              <h3>{{ selectedItem.name }} 的報名資料</h3>
              <p>活動代碼：{{ selectedItem.eventType }}</p>
            </div>

            <button class="close-btn" @click="closeDetail">×</button>
          </header>

          <section class="modal-body">
            <div class="info-grid">
              <span>姓名</span>
              <strong>{{ selectedItem.name || "-" }}</strong>

              <span>手機</span>
              <strong>{{ selectedItem.mobile || "-" }}</strong>

              <span>VIP</span>
              <strong>{{ selectedItem.vip || "-" }}</strong>

              <span>AID</span>
              <strong>{{ selectedItem.aid || "-" }}</strong>

              <span>Email</span>
              <strong class="break">{{ selectedItem.email || "-" }}</strong>

              <span>報名時間</span>
              <strong>{{ selectedItem.createdAt || "-" }}</strong>

              <span>備註</span>
              <strong>{{ selectedItem.note || "-" }}</strong>
            </div>
          </section>

          <footer class="modal-foot">
            <button class="cancel-btn" @click="closeDetail">關閉</button>
          </footer>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { useSeo } from "~/composables/useSeo";

const router = useRouter();

useSeo({
  title: "講座報名管理",
  description: "拉菲爾健康講座報名後台管理",
  url: "https://neuroplus.com.tw",
});

interface Registration {
  id: string;
  vip: string;
  name: string;
  email: string;
  mobile: string;
  checkTimeRaw: string;
  createdAt: string;
  aid: string;
  note: string;
  eventType: string;
}

interface ApiRegistration {
  VIP?: string;
  Name?: string;
  Email?: string;
  Mobile?: string;
  CheckTime?: string;
  AID?: string;
  Note?: string;
  EventType?: string;
}

const REGISTER_QUERY_API =
  "https://23700999.com:8081/HMA/api/bk/His_Register_query";

const API_PAYLOAD = {
  AdminID: "kerwin",
  Token: "byurf8BWSba2AIAhC7ffFtjmvzzlqELG",
  EventType: "vip1",
};

const loading = ref(false);
const registrations = ref<Registration[]>([]);
const searchKeyword = ref("");
const dateRange = ref<Date[] | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);

const detailVisible = ref(false);
const selectedItem = ref<Registration | null>(null);

function goBack() {
  router.push("/raphaelBackend/events");
}

function getInitial(name: string) {
  return name?.trim()?.charAt(0) || "?";
}

function resetPage() {
  currentPage.value = 1;
}

function gotoPage(page: number) {
  currentPage.value = page;
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

function formatCheckTime(value = "") {
  if (!/^\d{14}$/.test(value)) return value || "";

  const y = value.slice(0, 4);
  const m = value.slice(4, 6);
  const d = value.slice(6, 8);
  const hh = value.slice(8, 10);
  const mm = value.slice(10, 12);
  const ss = value.slice(12, 14);

  return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
}

function getDateKeyFromCheckTime(value = "") {
  if (!/^\d{8}/.test(value)) return "";
  return value.slice(0, 8);
}

function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

async function fetchRegisterList() {
  loading.value = true;

  try {
    const response = await axios.post(REGISTER_QUERY_API, API_PAYLOAD, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const list = response.data?.regList || [];

    if (response.data?.Result === "OK" && Array.isArray(list)) {
      registrations.value = list.map((item: ApiRegistration) => ({
        id: item.AID || crypto.randomUUID(),
        vip: item.VIP || "",
        name: item.Name?.trim() || "",
        email: item.Email || "",
        mobile: item.Mobile || "",
        checkTimeRaw: item.CheckTime || "",
        createdAt: formatCheckTime(item.CheckTime),
        aid: item.AID || "",
        note: item.Note || "",
        eventType: item.EventType || "",
      }));
    } else {
      registrations.value = [];
      console.warn("API 回傳格式不符合預期:", response.data);
    }
  } catch (err) {
    console.error("取得講座報名列表失敗:", err);
    registrations.value = [];
    alert("取得報名資料失敗，請稍後再試");
  } finally {
    loading.value = false;
  }
}

const filteredRegistrations = computed(() => {
  let result = registrations.value;

  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase();

    result = result.filter((item) => {
      const text = [
        item.vip,
        item.name,
        item.email,
        item.mobile,
        item.createdAt,
        item.aid,
        item.note,
        item.eventType,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    });
  }

  if (dateRange.value && dateRange.value.length >= 2) {
    const start = formatDateToYYYYMMDD(dateRange.value[0]);
    const end = formatDateToYYYYMMDD(dateRange.value[1]);

    result = result.filter((item) => {
      const dateKey = getDateKeyFromCheckTime(item.checkTimeRaw);
      return dateKey >= start && dateKey <= end;
    });
  }

  return result;
});

const totalRegistrations = computed(() => filteredRegistrations.value.length);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalRegistrations.value / pageSize.value))
);

const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRegistrations.value.slice(start, start + pageSize.value);
});

const pageNumberList = computed(() => {
  const pages: (number | string)[] = [];
  const maxButtons = 5;
  const total = totalPages.value;

  if (total <= maxButtons) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    let start = Math.max(1, currentPage.value - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;

    if (end > total) {
      end = total;
      start = total - maxButtons + 1;
    }

    for (let i = start; i <= end; i++) pages.push(i);
  }

  return pages;
});

function openDetail(item: Registration) {
  selectedItem.value = item;
  detailVisible.value = true;
}

function closeDetail() {
  detailVisible.value = false;
  selectedItem.value = null;
}

function exportCSV() {
  const rows = [
    ["姓名", "手機", "VIP", "AID", "Email", "報名時間", "備註", "EventType"],
    ...filteredRegistrations.value.map((item) => [
      item.name,
      item.mobile,
      item.vip,
      item.aid,
      item.email,
      item.createdAt,
      item.note,
      item.eventType,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `his-register-${API_PAYLOAD.EventType}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

onMounted(() => {
  fetchRegisterList();
});

watch(dateRange, () => {
  currentPage.value = 1;
});
</script>

<style scoped lang="scss">
.seminarRegister {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;

  .content {
    flex: 1;
    padding: 1rem;
    padding-left: 0;
    width: 100%;
    margin: 0 auto;

    @include respond-to("lg") {
      padding-left: 1rem;
    }
  }

  .page-header {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    @include respond-to("md") {
      flex-direction: column;
      align-items: flex-start;
    }

    .title {
      display: flex;
      align-items: center;
      white-space: nowrap;
      gap: 8px;
      color: $primary-600;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 0.09px;

      @include respond-to("lg") {
        padding-left: 36px;
      }

      @include respond-to("md") {
        font-size: 24px;
      }

      .count {
        color: $primary-200;
        font-size: 20px;
        font-weight: 700;
      }
    }

    .export-btn {
      border-radius: 6px;
      background: #b1c0d8;
      padding: 5px 12px;
      border: none;
      color: var(--Primary-100, #f5f7fa);
      cursor: pointer;
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: 2.7px;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      white-space: nowrap;
    }
  }

  .stats {
    display: grid;
    gap: 1rem;
    margin-bottom: 1.5rem;

    &.single {
      grid-template-columns: minmax(220px, 320px);
    }

    @include respond-to("md") {
      &.single {
        grid-template-columns: 1fr;
      }
    }

    .stat-card {
      background: #fff;
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);
      border-left: 5px solid $chip-success;

      span {
        display: block;
        color: $raphael-gray-500;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      strong {
        color: $primary-600;
        font-size: 32px;
        font-weight: 800;
      }
    }
  }

  .toolbar {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    width: 100%;
    margin-bottom: 1.5rem;

    @include respond-to("md") {
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .search-wrapper {
      position: relative;
      min-width: 18dvw;

      @include respond-to("md") {
        width: 100%;
      }

      img {
        width: 19px;
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .search {
      padding: 8px 12px;
      padding-left: 36px;
      border: none;
      width: 100%;
      border-radius: 50px;
      background: #fff;
      box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);
      transition: all ease 0.2s;

      &:hover {
        box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
      }
    }

    .toolbarTime-wrapper {
      position: relative;
      min-width: 12dvw;

      @include respond-to("md") {
        width: 100%;
      }

      :deep(.dp__input) {
        padding: 3.5px 12px;
        padding-left: 36px;
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
        width: 19px;
        pointer-events: none;
      }
    }
  }

  .register-table {
    background: #fff;
    border-radius: 20px;
    padding: 1rem;
    box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);

    .table-row {
      display: grid;
      grid-template-columns: 1.1fr 1fr 0.7fr 1.3fr 1.8fr 1fr;
      gap: 1rem;
      padding: 1rem 0;
      align-items: center;

      @include respond-to("md") {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      &.table-header {
        font-weight: 600;
        color: $primary-600;
        border-bottom: 1px solid #b1c0d8;
        padding-bottom: 0.75rem;

        @include respond-to("md") {
          display: none;
        }
      }

      .cell {
        color: #666;
        word-break: break-word;

        @include respond-to("md") {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;

          &::before {
            content: attr(data-label);
            font-weight: 600;
            color: $primary-600;
            margin-right: 1rem;
          }
        }
      }

      .name {
        display: flex;
        align-items: center;
        gap: 8px;

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(27, 163, 155, 0.12);
          color: $chip-success;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          font-weight: 800;
          flex: 0 0 auto;
        }
      }

      .note {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        @include respond-to("md") {
          white-space: normal;
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        align-items: center;

        .text-btn {
          border: none;
          border-radius: 50px;
          padding: 6px 12px;
          background: rgba(27, 163, 155, 0.1);
          color: $chip-success;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;

          &.call {
            background: rgba(200, 146, 60, 0.1);
            color: #a36d18;
          }
        }
      }
    }

    .loading-row,
    .no-data {
      text-align: center;
      padding: 3rem 0;
      color: $raphael-gray-500;
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 1.5rem;
    padding-top: 1rem;

    .btn-page {
      padding: 6px 10px;
      min-width: 32px;
      border-radius: 4px;
      background-color: transparent;
      cursor: pointer;
      border: none;
      color: #2d3047;
      transition: all 0.2s;

      &.active {
        background: $chip-success;
        color: white;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background: rgba($chip-success, 0.1);
      }
    }

    .btn-page-number {
      background: white;
    }
  }

  .modal-mask {
    position: fixed;
    inset: 0;
    background: rgba(18, 31, 45, 0.45);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal {
    width: min(640px, 100%);
    background: #fff;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.24);

    .modal-head {
      padding: 1.5rem;
      background: $primary-600;
      color: #fff;
      display: flex;
      justify-content: space-between;
      gap: 1rem;

      h3 {
        margin: 0;
        font-size: 24px;
      }

      p {
        margin: 4px 0 0;
        opacity: 0.8;
      }

      .close-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
        font-size: 24px;
        cursor: pointer;
      }
    }

    .modal-body {
      padding: 1.5rem;

      .info-grid {
        display: grid;
        grid-template-columns: 110px 1fr;
        gap: 10px 16px;
        padding: 1rem;
        border-radius: 16px;
        background: $primary-100;

        span {
          color: $raphael-gray-500;
          font-weight: 700;
        }

        strong {
          color: #444;
          font-weight: 700;
        }

        .break {
          word-break: break-all;
        }
      }
    }

    .modal-foot {
      padding: 1rem 1.5rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;

      button {
        border: none;
        border-radius: 50px;
        padding: 10px 20px;
        font-weight: 700;
        cursor: pointer;
      }

      .cancel-btn {
        background: #f2f4f8;
        color: #666;
      }
    }
  }
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  @include respond-to("md") {
    width: 100%;
    justify-content: flex-end;
  }
}

.back-btn {
  border-radius: 6px;
  background: #b1c0d8;
  padding: 5px 12px;
  border: none;
  color: var(--Primary-100, #f5f7fa);
  cursor: pointer;
  font-size: 1.125rem;
  font-weight: 400;
  letter-spacing: 2.7px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    background: $primary-200;
  }
}

.text-btn.call {
  @media (min-width: 1024px) {
    display: none;
  }
}
</style>