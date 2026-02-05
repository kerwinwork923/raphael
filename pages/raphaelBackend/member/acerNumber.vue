<template>
  <div class="acerNumber">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <header class="page-header">
        <h2 class="title">
          <img
            src="/assets/imgs/backend/watch.svg"
            alt=""
            class="title-icon"
          />
          {{ memberName }}
        </h2>
        <div class="action-buttons">
          <button class="btn back-btn" @click="goBack">
            <img src="/assets/imgs/backend/back.svg" alt="返回" />
            返回
          </button>
          <button class="btn add-btn" @click="handleAdd">
            <span class="plus-icon">+</span>
            新增
          </button>
        </div>
      </header>

      <!-- data table -->
      <section class="serial-table">
        <!-- header row -->
        <div class="table-row table-header">
          <div class="serial">序號</div>
          <div class="date">建立日期</div>
          <div class="action">操作</div>
        </div>

        <!-- loading -->
        <div v-if="loading" class="loading-row">載入中...</div>

        <!-- data rows -->
        <div class="table-list" v-else>
          <div
            v-for="item in paginatedSerials"
            :key="item.id"
            class="table-row"
          >
            <div class="cell serial" data-label="序號">
              {{ item.serialNumber }}
            </div>
            <div class="cell date" data-label="建立日期">
              {{ item.createDate }}
            </div>
            <div class="cell action" data-label="操作">
              <div class="action-buttons">
                <!-- <img
                  src="/assets/imgs/backend/edit.svg"
                  alt="編輯"
                  class="action-icon"
                  @click="handleEdit(item)"
                /> -->
                <img
                  src="/assets/imgs/backend/deleteGray.svg"
                  alt="刪除"
                  class="action-icon"
                  @click="handleDelete(item)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 無資料提示 -->
        <div v-if="!loading && serialList.length === 0" class="no-data">
          <p>尚無資料</p>
        </div>

        <!-- pagination -->
        <nav class="pagination" v-if="totalPages > 1">

          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="gotoPage(1)"
          >
            &lt;&lt;
          </button>

          <button
            class="btn-page"
            :disabled="currentPage === 1"
            @click="prevPage"
          >
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
    </main>

    <!-- 刪除確認彈窗 -->
    <ConfirmModal
      :show="showDeleteModal"
      message="確定要刪除嗎？"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Sidebar from "@/components/raphaelBackend/Sidebar.vue";
import ConfirmModal from "@/components/raphaelBackend/ConfirmModal.vue";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

const router = useRouter();

/* ---------- 型別定義 ---------- */
interface SerialItem {
  id: string;
  serialNumber: string;
  createDate: string;
  AID?: string;
  MID?: string;
  Status?: string;
}

/* ---------- 響應式資料 ---------- */
const memberName = ref("會員名稱");
const memberMID = ref("");
const serialList = ref<SerialItem[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const showDeleteModal = ref(false);
const pendingDeleteItem = ref<SerialItem | null>(null);

/* ---------- 計算屬性 ---------- */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(serialList.value.length / pageSize.value))
);

const paginatedSerials = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return serialList.value.slice(start, start + pageSize.value);
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

/* ---------- 方法 ---------- */
const goBack = () => {
  router.back();
};

const handleAdd = () => {
  router.push("/raphaelBackend/member/addSerial");
};

const handleEdit = (item: SerialItem) => {
  router.push(`/raphaelBackend/member/editSerial/${item.id}`);
};

const handleDelete = (item: SerialItem) => {
  pendingDeleteItem.value = item;
  showDeleteModal.value = true;
};

const confirmDelete = async () => {
  if (!pendingDeleteItem.value) {
    showDeleteModal.value = false;
    return;
  }

  const aid = pendingDeleteItem.value.AID || pendingDeleteItem.value.id;
  
  try {
    const res = await fetch("https://23700999.com:8081/HMA/TTEdeleteVivoWatchID.jsp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Key: "qrt897hpmd",
        AID: aid,
      }),
    });

    const data = await res.json();
    if (data.Result === "OK") {
      // 刪除成功，重新取得列表
      await fetchVivoWatchList();

    } else {
      alert(data.Message || data.Result || "刪除失敗，請稍後再試");
    }
  } catch (error) {
    console.error("刪除序號失敗:", error);
    alert("刪除失敗，請稍後再試");
  } finally {
    showDeleteModal.value = false;
    pendingDeleteItem.value = null;
  }
};

const gotoPage = (page: number) => {
  currentPage.value = page;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

/* ---------- API 呼叫 ---------- */
// 格式化 CreateTime: 20260204165001 -> 2026/02/04 16:50
function formatCreateTime(timeStr: string): string {
  if (!timeStr || timeStr.length < 12) return timeStr || "—";
  const y = timeStr.substring(0, 4);
  const m = timeStr.substring(4, 6);
  const d = timeStr.substring(6, 8);
  const hh = timeStr.substring(8, 10);
  const mm = timeStr.substring(10, 12);
  return `${y}/${m}/${d} ${hh}:${mm}`;
}

// 取得華碩序號列表
async function fetchVivoWatchList() {
  if (!memberMID.value) {
    serialList.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = await fetch("https://23700999.com:8081/HMA/TTEloadVivoWatchIDList.jsp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Key: "qrt897hpmd",
        MID: memberMID.value,
      }),
    });

    const data = await res.json();
    if (data.Result === "OK" && Array.isArray(data.Data)) {
      // 按 CreateTime 降序排序，轉換為前端格式
      serialList.value = data.Data
        .sort((a: any, b: any) => (b.CreateTime || "").localeCompare(a.CreateTime || ""))
        .map((item: any) => ({
          id: item.AID || item.Deviceid,
          serialNumber: item.Deviceid || "",
          createDate: formatCreateTime(item.CreateTime),
          AID: item.AID,
          MID: item.MID,
          Status: item.Status,
        }));
    } else {
      serialList.value = [];
    }
  } catch (error) {
    console.error("取得華碩序號列表失敗:", error);
    serialList.value = [];
  } finally {
    loading.value = false;
  }
}

/* ---------- 生命週期 ---------- */
onMounted(() => {
  // 從 localStorage 取得會員資訊
  const selectedMember = localStorage.getItem("selectedMember");
  if (selectedMember) {
    try {
      const member = JSON.parse(selectedMember);
      memberName.value = member.Name || member.name || "會員名稱";
      memberMID.value = member.MID || "";
    } catch {
      memberName.value = "會員名稱";
      memberMID.value = "";
    }
  }

  // 呼叫 API 取得序號列表
  fetchVivoWatchList();
});
</script>

<style scoped lang="scss">
.acerNumber {
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

    @include respond-to("md") {
      width: 100%;
    }

    /* ─────────── 頁面標題 ─────────── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;

      .title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: $primary-600;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.09px;

        @include respond-to("md") {
          font-size: 22px;
        }

        .title-icon {
          width: 28px;
          height: 28px;

          @include respond-to("md") {
            width: 22px;
            height: 22px;
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;

        .btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;

          img {
            width: 16px;
            height: 16px;
          }

          &.back-btn {
            background: $primary-200;
            color: #fff;

            &:hover {
              background: $primary-300;
            }
          }

          &.add-btn {
            background: $primary-200;
            color: #fff;

            &:hover {
              background: $primary-300;
            }

            .plus-icon {
              font-size: 18px;
              font-weight: 600;
            }
          }
        }
      }
    }

    /* ─────────── 表格 ─────────── */
    .serial-table {
      background: #fff;
      border-radius: 20px;
      padding: 1rem;
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);

      .table-row {
        display: grid;
        grid-template-columns: 2fr 2fr 1fr;
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

        .action-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          justify-content: flex-end;

          @include respond-to("md") {
            justify-content: flex-start;
          }

          .action-icon {
            width: 20px;
            height: 20px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        }
      }

      .table-list {
        .table-row {
          border-bottom: 1px solid #e5e9f2;

          &:last-child {
            border-bottom: none;
          }
        }
      }

      .loading-row {
        text-align: center;
        padding: 3rem 0;
        color: $raphael-gray-500;
      }

      .no-data {
        text-align: center;
        padding: 3rem 0;
        color: $raphael-gray-500;
      }
    }

    /* ─────────── 分頁 ─────────── */
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
          border-color: $chip-success;
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
  }
}
</style>