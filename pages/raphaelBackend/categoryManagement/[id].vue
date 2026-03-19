<template>
  <div class="category-form-page">
    <Sidebar :current-page="'categoryManagement'" />

    <main class="content">
      <header class="page-header">
        <h2 class="title">編輯類別</h2>
        <div class="action-buttons">
          <button class="btn back-btn" @click="handleBack">
            <img src="/assets/imgs/backend/back.svg" alt="返回" />
            返回
          </button>
          <button class="btn save-btn" @click="handleSave">
            <img src="/assets/imgs/backend/save.svg" alt="儲存" />
            儲存
          </button>
        </div>
      </header>

      <section class="form-section">
        <div class="form-card">
          <label class="field-label" for="category-name-input">類別名稱</label>
          <div class="field-input-wrap">
            <img
              class="field-icon"
              src="/assets/imgs/backend/tag.svg"
              alt="類別圖示"
            />
            <input
              id="category-name-input"
              v-model="categoryName"
              type="text"
              class="field-input"
              placeholder="請輸入類別名稱"
            />
            <img
              class="dropdown-icon"
              src="/assets/imgs/backend/dropdown2.svg"
              alt="下拉"
            />
          </div>
        </div>
      </section>
    </main>

    <CategoryConfirmModal
      :show="activeDialog === 'save'"
      message="確定要儲存嗎？"
      @close="activeDialog = null"
      @confirm="confirmSave"
    />

    <CategoryConfirmModal
      :show="activeDialog === 'leave'"
      message="資料還在修改中，要離開嗎？"
      @close="activeDialog = null"
      @confirm="confirmLeave"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import CategoryConfirmModal from "/components/raphaelBackend/CategoryConfirmModal.vue";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

const route = useRoute();
const router = useRouter();

const initialName = String(route.query.name ?? "");
const categoryName = ref(initialName);
const activeDialog = ref<"save" | "leave" | null>(null);

const hasModified = computed(
  () => categoryName.value.trim() !== initialName.trim()
);

function handleBack() {
  if (hasModified.value) {
    activeDialog.value = "leave";
    return;
  }
  router.back();
}

function handleSave() {
  if (!categoryName.value.trim()) {
    alert("請輸入類別名稱");
    return;
  }
  activeDialog.value = "save";
}

function confirmSave() {
  activeDialog.value = null;
  alert(`儲存成功（ID: ${String(route.params.id)}，待串接 API）`);
  router.push("/raphaelBackend/categoryManagement");
}

function confirmLeave() {
  activeDialog.value = null;
  router.back();
}
</script>

<style scoped lang="scss">
.category-form-page {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;
}

.content {
  flex: 1;
  width: 100%;
  padding: 1rem;
  padding-left: 0;

  @include respond-to("lg") {
    padding-left: 1rem;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;

  .title {
    margin: 0;
    color: $primary-600;
    font-size: 36px;
    font-weight: 700;
    letter-spacing: 0.09px;

    @include respond-to("md") {
      font-size: 26px;
    }
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  border-radius: 6px;
  background: #b1c0d8;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  img {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: #91a6ca;
  }
}

.form-section {
  .form-card {
    background: #fff;
    border-radius: 16px;
    min-height: calc(100vh - 140px);
    padding: 14px 16px;
    box-shadow: 0 2px 20px rgba(177, 192, 216, 0.25);
  }
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: $primary-600;
  font-size: 14px;
  font-weight: 500;
}

.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e9f2;
  border-radius: 4px;
  min-height: 40px;
  padding: 0 10px;
}

.field-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.field-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #6d8ab6;
  background: transparent;

  &::placeholder {
    color: #b1c0d8;
  }
}

.dropdown-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}
</style>
