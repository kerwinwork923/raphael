<template>
  <div class="addSerial">
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
          新增序號
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

      <!-- form section -->
      <section class="form-section">
        <div class="form-card">
          <h3 class="form-label">華碩序號 [A1B2C3D4E5F6]</h3>
          <div class="input-wrapper">

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

/* ---------- 響應式資料 ---------- */
const serialNumber = ref("");
const memberMID = ref("");
const isModified = ref(false);
const isSaving = ref(false);
const showSaveModal = ref(false);
const showLeaveModal = ref(false);

/* ---------- 方法 ---------- */
const handleBack = () => {
  if (isModified.value && serialNumber.value.trim()) {
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

const confirmSave = async () => {
  showSaveModal.value = false;

  if (!memberMID.value) {
    alert("無法取得會員資訊，請重新操作");
    return;
  }

  isSaving.value = true;
  try {
    const res = await fetch("https://23700999.com:8081/HMA/TTEsaveVivoWatchID.jsp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Key: "qrt897hpmd",
        MID: memberMID.value,
        Deviceid: serialNumber.value.trim(),
      }),
    });

    const data = await res.json();
    if (data.Result === "OK") {
      alert("新增序號成功");
      router.back();
    } else {
      alert(data.Message || data.Result || "新增失敗，請稍後再試");
    }
  } catch (error) {
    console.error("新增序號失敗:", error);
    alert("新增失敗，請稍後再試");
  } finally {
    isSaving.value = false;
  }
};

const confirmLeave = () => {
  showLeaveModal.value = false;
  router.back();
};

/* ---------- 生命週期 ---------- */
onMounted(() => {
  // 從 localStorage 取得會員 MID
  const selectedMember = localStorage.getItem("selectedMember");
  if (selectedMember) {
    try {
      const member = JSON.parse(selectedMember);
      memberMID.value = member.MID || "";
    } catch {
      memberMID.value = "";
    }
  }
});
</script>

<style scoped lang="scss">
.addSerial {
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
            background: $primary-200;
            color: #fff;

            &:hover {
              background: $primary-300;
            }
          }
        }
      }
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
