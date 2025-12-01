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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import FilterToolbar from "/components/raphaelBackend/FilterToolbar.vue";
import DataUpdateHeader from "/components/raphaelBackend/DataUpdateHeader.vue";
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
const activeTab = ref<"category" | "tag">("category");
const searchKeyword = ref("");
const lastUpdated = ref(new Date().toLocaleString("zh-TW"));

// 資料
const categories = ref<CategoryItem[]>([
  { id: "1", name: "醫師真心話", applyCount: 10, type: "category" },
  { id: "2", name: "腦洞大開", applyCount: 0, type: "category" },
  { id: "3", name: "我的診間故事", applyCount: 0, type: "category" },
  { id: "4", name: "類別名稱", applyCount: 0, type: "category" },
]);

const tags = ref<CategoryItem[]>([
  { id: "1", name: "自律神經失調", applyCount: 10, type: "tag" },
  { id: "2", name: "焦慮", applyCount: 0, type: "tag" },
  { id: "3", name: "憂鬱", applyCount: 0, type: "tag" },
  { id: "4", name: "失眠", applyCount: 0, type: "tag" },
  { id: "5", name: "胃食道逆流", applyCount: 0, type: "tag" },
  { id: "6", name: "過動症", applyCount: 0, type: "tag" },
  { id: "7", name: "ADHA", applyCount: 0, type: "tag" },
  { id: "8", name: "恐慌", applyCount: 0, type: "tag" },
  { id: "9", name: "耳鳴", applyCount: 0, type: "tag" },
  { id: "10", name: "思覺失調", applyCount: 0, type: "tag" },
]);

// 計算屬性
const currentItems = computed(() => {
  return activeTab.value === "category" ? categories.value : tags.value;
});

const filteredItems = computed(() => {
  if (!searchKeyword.value.trim()) {
    return currentItems.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return currentItems.value.filter((item) =>
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
  // TODO: 開啟新增對話框
  console.log("新增", activeTab.value);
}

function handleEdit(item: CategoryItem) {
  // TODO: 開啟編輯對話框
  console.log("編輯", item);
}

function handleDelete(item: CategoryItem) {
  if (!confirm(`確定要刪除「${item.name}」嗎？`)) {
    return;
  }
  // TODO: 執行刪除 API
  if (activeTab.value === "category") {
    categories.value = categories.value.filter((c: CategoryItem) => c.id !== item.id);
  } else {
    tags.value = tags.value.filter((t: CategoryItem) => t.id !== item.id);
  }
}

function refreshData() {
  // TODO: 重新載入資料
  lastUpdated.value = new Date().toLocaleString("zh-TW");
  console.log("重新載入資料");
}
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
    padding: 12px 24px;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    color: $raphael-gray-500;
    font-size: 16px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    top: 2px;

    &:hover {
      color: $chip-success;
    }

    &.active {
      color: $chip-success;
      border-bottom-color: $chip-success;
      font-weight: 600;
    }
  }
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  flex: 1;
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
      border-top: 1px solid $border;

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
