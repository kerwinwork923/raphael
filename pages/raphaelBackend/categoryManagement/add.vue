<template>
  <div class="category-form-page">
    <Sidebar :current-page="'categoryManagement'" />

    <main class="content">
      <header class="page-header">
        <h2 class="title">新增{{ kindLabel }}</h2>
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
import axios from "axios";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import CategoryConfirmModal from "/components/raphaelBackend/CategoryConfirmModal.vue";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

type KindType = "category" | "tag";

const route = useRoute();
const router = useRouter();
const categoryName = ref("");
const activeDialog = ref<"save" | "leave" | null>(null);
const saving = ref(false);

const API_BASE = "https://23700999.com:8081/HMA/api/bk";

const hasModified = computed(() => categoryName.value.trim().length > 0);
const kind = computed<KindType>(() =>
  route.query.kind === "tag" ? "tag" : "category"
);
const kindLabel = computed(() => (kind.value === "category" ? "類別" : "標籤"));

interface ApiTypeItem {
  Type?: string;
  VideoType?: string;
  VideoBigType?: string;
  Name?: string;
}

function handleBack() {
  if (hasModified.value) {
    activeDialog.value = "leave";
    return;
  }
  router.back();
}

function handleSave() {
  if (saving.value) return;
  if (!categoryName.value.trim()) {
    alert(`請輸入${kindLabel.value}名稱`);
    return;
  }
  activeDialog.value = "save";
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

function normalizeList(rawList: unknown): Array<{ Type: string; Name: string }> {
  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((item: ApiTypeItem) => {
      const type = item.Type || item.VideoType || item.VideoBigType || "";
      const name = item.Name || "";
      return { Type: String(type), Name: String(name) };
    })
    .filter((item) => item.Type && item.Name);
}

function makeNextTypeCode(list: Array<{ Type: string }>) {
  const numericCodes = list
    .map((item) => Number(item.Type))
    .filter((num) => Number.isFinite(num));
  const maxCode = numericCodes.length ? Math.max(...numericCodes) : 0;
  return String(maxCode + 1).padStart(2, "0");
}

async function getCurrentTypeList(auth: { token: string; adminID: string }) {
  if (kind.value === "category") {
    const response = await axios.post(`${API_BASE}/getVideoBigTypeList`, {
      AdminID: auth.adminID,
      Token: auth.token,
    });
    if (response.data?.Result !== "OK") {
      throw new Error(response.data?.Message || "取得類別清單失敗");
    }
    return normalizeList(response.data?.VideoBigTypeList);
  }

  const response = await axios.post(`${API_BASE}/getVideoTypeList`, {
    AdminID: auth.adminID,
    Token: auth.token,
  });
  if (response.data?.Result !== "OK") {
    throw new Error(response.data?.Message || "取得標籤清單失敗");
  }
  return normalizeList(response.data?.VideoTypeList);
}

async function submitModifyApi(
  auth: { token: string; adminID: string },
  payloadList: Array<{ Type: string; Name: string }>
) {
  if (kind.value === "category") {
    return axios.post(`${API_BASE}/VideoBigTypeModify`, {
      AdminID: auth.adminID,
      Token: auth.token,
      VideoBigTypeList: payloadList,
    });
  }

  return axios.post(`${API_BASE}/VideoTypeModify`, {
    AdminID: auth.adminID,
    Token: auth.token,
    VideoTypeList: payloadList,
  });
}

async function confirmSave() {
  if (saving.value) return;
  activeDialog.value = null;

  const auth = getAuth();
  if (!auth) return;

  saving.value = true;
  try {
    const currentList = await getCurrentTypeList(auth);
    const nextType = makeNextTypeCode(currentList);
    const newName = categoryName.value.trim();

    const duplicateName = currentList.some(
      (item) => item.Name.trim().toLowerCase() === newName.toLowerCase()
    );
    if (duplicateName) {
      alert(`${kindLabel.value}名稱已存在，請換一個名稱`);
      return;
    }

    const payloadList = [
      ...currentList,
      {
        Type: nextType,
        Name: newName,
      },
    ];

    const response = await submitModifyApi(auth, payloadList);

    if (response.data?.Result === "OK") {
      alert(`新增${kindLabel.value}成功`);
      router.push("/raphaelBackend/categoryManagement");
      return;
    }

    throw new Error(response.data?.Message || `新增${kindLabel.value}失敗`);
  } catch (error: any) {
    console.error(`新增${kindLabel.value}失敗:`, error);
    alert(error?.message || `新增${kindLabel.value}失敗`);
  } finally {
    saving.value = false;
  }
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
