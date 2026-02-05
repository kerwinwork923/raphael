<template>
  <div class="editSerial">
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
          編輯序號
        </h2>
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

      <!-- loading -->
      <div v-if="loading" class="loading">載入中...</div>

      <!-- form section -->
      <section v-else class="form-section">
        <div class="form-card">
          <h3 class="form-label" @click="goAcerNumber()">華碩序號 [{{ originalSerial }}]</h3>
          <div class="input-wrapper">
            <span class="input-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <circle cx="10" cy="10" r="8" stroke="#1BA39B" stroke-width="2" fill="none" />
                <circle cx="10" cy="10" r="4" fill="#1BA39B" />
              </svg>
            </span>
            <input
              v-model="serialNumber"
              type="text"
              class="serial-input"
              placeholder="請輸入序號"
              @input="isModified = true"
            />
          </div>
        </div>
      </section>
    </main>

    <!-- 儲存確認彈窗 -->
    <ConfirmModal
      :show="showSaveModal"
      message="確定要儲存嗎？"
      @close="showSaveModal = false"
      @confirm="confirmSave"
    />

    <!-- 離開確認彈窗 -->
    <ConfirmModal
      :show="showLeaveModal"
      message="資料還在修改中，要離開嗎？"
      @close="showLeaveModal = false"
      @confirm="confirmLeave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
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
const route = useRoute();

/* ---------- 響應式資料 ---------- */
const serialNumber = ref("");
const originalSerial = ref("");
const isModified = ref(false);
const loading = ref(true);
const showSaveModal = ref(false);
const showLeaveModal = ref(false);

/* ---------- 方法 ---------- */
const handleBack = () => {
  if (isModified.value && serialNumber.value !== originalSerial.value) {
    showLeaveModal.value = true;
  } else {
    router.back();
  }
};

const handleSave = () => {
  if (!serialNumber.value.trim()) {
    alert("請輸入序號");
    return;
  }
  showSaveModal.value = true;
};

const confirmSave = () => {
  showSaveModal.value = false;
  // TODO: 呼叫 API 更新序號
  console.log("更新序號:", {
    id: route.params.id,
    serialNumber: serialNumber.value,
  });

  // 模擬儲存成功後返回
  alert("儲存成功");
  router.back();
};

const confirmLeave = () => {
  showLeaveModal.value = false;
  router.back();
};

const fetchSerialData = async () => {
  const id = route.params.id as string;
  loading.value = true;

  try {
    // TODO: 呼叫 API 取得序號資料
    // 目前使用假資料模擬
    const mockData: Record<string, string> = {
      "1": "A1B2C3D4E5F6",
      "2": "G7H8I9J0K1L2",
      "3": "M3N4O5P6Q7R8",
      "4": "S9T0U1V2W3X4",
      "5": "Y5Z6A7B8C9D0",
    };

    // 模擬 API 延遲
    await new Promise((resolve) => setTimeout(resolve, 300));

    const serial = mockData[id] || "未知序號";
    serialNumber.value = serial;
    originalSerial.value = serial;
  } catch (error) {
    console.error("取得序號資料失敗:", error);
    serialNumber.value = "";
    originalSerial.value = "";
  } finally {
    loading.value = false;
  }
};

const goAcerNumber = () => {
  router.push("/raphaelBackend/member/acerNumber");
};

/* ---------- 生命週期 ---------- */
onMounted(() => {
  fetchSerialData();
});
</script>

<style scoped lang="scss">
.editSerial {
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

          &.save-btn {
            background: $chip-success;
            color: #fff;

            &:hover {
              background: #0d8a82;
            }
          }
        }
      }
    }

    /* ─────────── 載入中 ─────────── */
    .loading {
      text-align: center;
      padding: 3rem;
      color: $raphael-gray-500;
    }

    /* ─────────── 表單區塊 ─────────── */
    .form-section {
      .form-card {
        background: #fff;
        border-radius: 20px;
        padding: 1.5rem;
        box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);

        .form-label {
          color: $primary-600;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e9f2;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .input-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .serial-input {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 1px solid #e5e9f2;
            border-radius: 8px;
            font-size: 14px;
            color: #333;
            transition: all 0.2s;

            &:focus {
              outline: none;
              border-color: $chip-success;
              box-shadow: 0 0 0 3px rgba(27, 163, 155, 0.1);
            }

            &::placeholder {
              color: #999;
            }
          }
        }
      }
    }
  }
}
</style>
