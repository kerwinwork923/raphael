<template>
  <div class="category-management">
    <Sidebar :current-page="'categoryManagement'" />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <DataUpdateHeader
        title="分類管理"
        :count="totalCount"
        count-unit="筆"
        :last-updated="lastUpdated"
        @refresh="refreshData"
      />

      <!-- toolbar / filters -->
      <div class="toolbar-section">
        <FilterToolbar
          v-model:search-value="searchKeyword"
          :show-date-picker="false"
          :show-product-filter="false"
          :show-status-filter="false"
          search-placeholder="請輸入關鍵字"
          @search="handleSearch"
        />
        <button class="btn-add" @click="handleAddNew">
          <span>+ 新增</span>
        </button>
      </div>

      <div class="tabsGroup">
        <!-- tabs -->
        <div class="tabs-container">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'category' }"
            @click="activeTab = 'category'"
          >
            類別管理
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'tag' }"
            @click="activeTab = 'tag'"
          >
            標籤管理
          </button>
        </div>
        <!-- content grid -->
        <section class="category-grid">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="category-card"
          >
            <div class="card-content">
              <h3 class="card-title">{{ item.name }}</h3>
              <div class="card-meta">
                <span class="apply-count">套用數 {{ item.applyCount }}</span>
              </div>
            </div>
            <div class="card-actions">
              <button
                class="btn-action btn-edit"
                @click="handleEdit(item)"
                title="編輯"
              >
                <img src="/assets/imgs/backend/edit.svg" alt="編輯" />
              </button>
              <button
                class="btn-action btn-delete"
                @click="handleDelete(item)"
                title="刪除"
              >
                <img src="/assets/imgs/backend/delete2.svg" alt="刪除" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>

    <CategoryConfirmModal
      :show="activeDialog === 'delete'"
      message="確定要刪除嗎？"
      @close="closeDeleteDialog"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import FilterToolbar from "/components/raphaelBackend/FilterToolbar.vue";
import DataUpdateHeader from "/components/raphaelBackend/DataUpdateHeader.vue";
import CategoryConfirmModal from "/components/raphaelBackend/CategoryConfirmModal.vue";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

// 介面定義
interface CategoryItem {
  id: string;
  name: string;
  applyCount: number;
  type: "category" | "tag";
}

// 狀態管理
const router = useRouter();
const activeTab = ref<"category" | "tag">("category");
const searchKeyword = ref("");
const lastUpdated = ref(new Date().toLocaleString("zh-TW"));
const activeDialog = ref<"delete" | null>(null);
const pendingDeleteId = ref<string | null>(null);
const loading = ref(false);

const API_BASE = "https://23700999.com:8081/HMA/api/bk";

interface ApiTypeItem {
  Type?: string;
  VideoType?: string;
  VideoBigType?: string;
  Name?: string;
}

// 資料
const categories = ref<CategoryItem[]>([]);
const tags = ref<CategoryItem[]>([]);

// 計算屬性
const currentItems = computed(() => {
  return activeTab.value === "category" ? categories.value : tags.value;
});

const filteredItems = computed(() => {
  if (!searchKeyword.value.trim()) {
    return currentItems.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return currentItems.value.filter((item: CategoryItem) =>
    item.name.toLowerCase().includes(keyword)
  );
});

const totalCount = computed(() => {
  return filteredItems.value.length;
});

// 方法
function handleSearch(value: string) {
  searchKeyword.value = value;
}

function handleAddNew() {
  router.push({
    path: "/raphaelBackend/categoryManagement/add",
    query: { kind: activeTab.value },
  });
}

function handleEdit(item: CategoryItem) {
  router.push({
    path: `/raphaelBackend/categoryManagement/${item.id}`,
    query: { name: item.name, kind: activeTab.value },
  });
}

function handleDelete(item: CategoryItem) {
  pendingDeleteId.value = item.id;
  activeDialog.value = "delete";
}

function closeDeleteDialog() {
  activeDialog.value = null;
  pendingDeleteId.value = null;
}

function confirmDelete() {
  if (!pendingDeleteId.value) return;

  const targetId = pendingDeleteId.value;
  if (activeTab.value === "category") {
    categories.value = categories.value.filter(
      (c: CategoryItem) => c.id !== targetId
    );
  } else {
    tags.value = tags.value.filter((t: CategoryItem) => t.id !== targetId);
  }

  closeDeleteDialog();
}

function mapTypeItemToCard(
  item: ApiTypeItem,
  fallbackId: string,
  targetType: "category" | "tag"
): CategoryItem {
  const id = item.Type || item.VideoType || item.VideoBigType || fallbackId;
  return {
    id: String(id),
    name: String(item.Name || ""),
    applyCount: 0,
    type: targetType,
  };
}

function getAuth() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("backendToken") ||
        sessionStorage.getItem("backendToken")
      : "";
  const adminID =
    typeof window !== "undefined"
      ? localStorage.getItem("adminID") || sessionStorage.getItem("adminID")
      : "";

  if (!token || !adminID) {
    alert("請先登入後台再操作");
    return null;
  }

  return { token, adminID };
}

async function fetchCategoryItems() {
  const auth = getAuth();
  if (!auth) return;

  const response = await axios.post(`${API_BASE}/getVideoBigTypeList`, {
    AdminID: auth.adminID,
    Token: auth.token,
  });

  if (response.data?.Result !== "OK") {
    throw new Error(response.data?.Message || "取得類別資料失敗");
  }

  const list = Array.isArray(response.data?.VideoBigTypeList)
    ? response.data.VideoBigTypeList
    : [];

  categories.value = list.map((item: ApiTypeItem, index: number) =>
    mapTypeItemToCard(item, String(index + 1), "category")
  );
}

async function fetchTagItems() {
  const auth = getAuth();
  if (!auth) return;

  const response = await axios.post(`${API_BASE}/getVideoTypeList`, {
    AdminID: auth.adminID,
    Token: auth.token,
  });

  if (response.data?.Result !== "OK") {
    throw new Error(response.data?.Message || "取得標籤資料失敗");
  }

  const list = Array.isArray(response.data?.VideoTypeList)
    ? response.data.VideoTypeList
    : [];

  tags.value = list.map((item: ApiTypeItem, index: number) =>
    mapTypeItemToCard(item, String(index + 1), "tag")
  );
}

async function refreshData() {
  if (loading.value) return;
  loading.value = true;

  try {
    await Promise.all([fetchCategoryItems(), fetchTagItems()]);
  } catch (error) {
    console.error("重新載入分類資料失敗:", error);
    alert("重新載入資料失敗");
  } finally {
    loading.value = false;
  }

  lastUpdated.value = new Date().toLocaleString("zh-TW");
}

onMounted(() => {
  refreshData();
});
</script>

<style scoped lang="scss">
.category-management {
  display: flex;
  height: 100vh;
  background: $primary-100;
}

/* ─────────────── Main Content ─────────────── */
.content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  padding: 1rem;
  overflow-y: auto;

  @include respond-to("xl") {
    padding: 16px 16px;
  }
}

.tabsGroup {
  background-color: #fff;
  border-radius: 20px;
  background: var(--Neutral-white, #fff);
  box-shadow: 0 2px 20px 0
    var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
  padding: 16px;
}

.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  @include respond-to("md") {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    border-radius: 6px;
    background: $primary-200;
    color: $raphael-white;
    border: none;
    padding: 8px 16px;
    font-size: 1rem;
    font-weight: 400;
    letter-spacing: 2.7px;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s ease;

    &:hover {
      background-color: $primary-300;
    }

    @include respond-to("md") {
      width: 100%;
    }
  }
}

.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  border-bottom: 2px solid $border;

  .tab-btn {
    padding: 9px 12px;
    background: transparent;
    border: none;

    color: $raphael-gray-500;
    font-size: 16px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    top: 2px;
    border-radius: 6px;
    &:hover {
      background: var(--Primary-default, #1BA39B);
      color: var(--Primary-100, #F5F7FA);

    }

    &.active {
      background: var(--Primary-default, #1BA39B);
      color: var(--Primary-100, #F5F7FA);
    }
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  align-items: flex-start;
  align-content: flex-start;
  padding: 1rem 0;

  @include respond-to("md") {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  @include respond-to("sm") {
    grid-template-columns: 1fr;
  }

  .category-card {
    background: $raphael-white;
    border: 1px solid $border;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 120px;
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    transition: all 0.2s ease;

    &:hover {
      box-shadow: 0px 4px 24px 0px
        var(--primary-200-opacity-35, rgba(177, 192, 216, 0.35));
      transform: translateY(-2px);
    }

    .card-content {
      flex: 1;
      margin-bottom: 12px;

      .card-title {
        color: $primary-600;
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
        line-height: 1.4;
        word-break: break-word;
      }

      .card-meta {
        .apply-count {
          color: $raphael-gray-500;
          font-size: 14px;
          font-weight: 400;
        }
      }
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 8px;

      .btn-action {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        border-radius: 4px;

        img {
          width: 20px;
          height: 20px;
        }

        &:hover {
          background-color: rgba($primary-200, 0.1);
          opacity: 0.8;
        }

        &.btn-delete:hover {
          background-color: rgba($red-500, 0.1);
        }
      }
    }
  }
}
</style>
