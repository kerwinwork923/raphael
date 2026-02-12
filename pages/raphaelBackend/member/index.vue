<template>
  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <DataUpdateHeader
        title="會員清單"
        :count="store.total"
        count-unit="人"
        :last-updated="store.lastUpdated"
        @refresh="refreshData"
      />
      
      <!-- toolbar / filters -->
      <FilterToolbar
        v-model:search-value="store.keyword"
        v-model:date-value="store.dateRange"
        v-model:product-value="store.productFilter"
        v-model:grade-value="store.gradeFilter"
        v-model:status-value="store.statusFilter"
        :product-options="productOptions"
        :grade-options="gradeOptions"
        :status-options="statusOptions"
        :show-grade-filter="true"
        date-placeholder="註冊日期區間"
        @search="store.setKeyword"
        @date-change="store.setDateRange"
        @product-change="store.setProductFilter"
        @grade-change="store.setGradeFilter"
        @status-change="store.setStatusFilter"
      />

      <!-- data table -->
      <section class="member-table">
        <!-- header row -->
        <div class="table-row table-header">
          <div class="name">會員名稱</div>
          <div class="level">等級</div>
          <div class="birth">生日</div>
          <div class="phone">電話</div>
          <div class="product">產品資訊</div>
          <div class="health">健康指標</div>
          <div class="reg-date">註冊時間</div>
        </div>

        <!-- data rows -->
        <div class="table-list">
          <div
            v-for="member in store.paginatedMembers"
            :key="member.id"
            class="table-row"
            @click="handleGoInfo(member)"
          >
            <div class="cell name" data-label="會員名稱">{{ member.name }}</div>
            <div class="cell level" data-label="等級">{{ member.level }}</div>
            <div class="cell birth" data-label="生日">
              {{ formatBirthday(member.birthday) }}
            </div>

            <div class="cell phone" data-label="電話">{{ member.phone }}</div>

            <!-- 產品欄位 ― 永遠保留格子，不讓 grid 塌掉 -->
            <div
              class="cell product"
              :class="{
                'no-data': !(member.usageDays || member.remainingDays),
              }"
              data-label="產品資訊"
            >
              <!-- 產品名稱 -->
              <p class="sub">{{ member.product }}</p>
              <!-- 有天數才顯示 chip -->
              <div
                class="cellProduct"
                v-show="member.usageDays || member.remainingDays"
              >
                <p class="chip chip--success" v-if="member.usageDays">
                  已使用 {{ member.usageDays }} 天
                </p>
                <p class="chip chip--danger" v-if="member.remainingDays">
                  剩餘 {{ member.remainingDays }} 天
                </p>
              </div>
            </div>

            <!-- 健康指標欄：分數只有有值才顯示 -->
            <div class="cell health" data-label="健康指數">
              <p v-if="member.hrv">HRV {{ member.hrv }} ms</p>
              <p v-if="member.totalScore !== null">
                自律神經 {{ member.totalScore }} 分
              </p>
              <p v-if="member.score !== null">生活自律 {{ member.score }} 分</p>

              <div class="chipWrap">
                <p class="chip chip--warning" v-if="member.isAbnormal">
                  已超時,請盡快提醒
                </p>
                <button class="healthBtn">
                  <img src="/assets/imgs/backend/send.svg" alt="" /> 立即推播
                </button>
              </div>
            </div>

            <div class="cell reg-date" data-label="註冊時間">
              <p>{{ member.registerDate }}</p>
            </div>

            <div class="cell action">
              <div class="tagsGroup">
                <div
                  v-if="member.memType && member.product"
                  class="cellTag cellTagSuccess"
                >
                  {{ member.memType }}
                </div>
              </div>
            </div>

            <div class="goInfo" role="button" tabindex="0">
              <img src="/assets/imgs/backend/goNext.svg" alt="詳細" />
            </div>
          </div>
        </div>

        <!-- pagination -->
        <nav class="pagination">
          <button
            class="btn-page"
            :disabled="store.page === 1"
            @click="store.gotoPage(1)"
          >
            &lt;&lt;
          </button>
          <button
            class="btn-page"
            :disabled="store.page === 1"
            @click="store.prevPage"
          >
            &lt;
          </button>
          <button
            v-for="p in store.totalPages"
            :key="p"
            class="btn-page btn-page-number"
            :class="{ active: store.page === p }"
            @click="store.gotoPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="btn-page"
            :disabled="store.page === store.totalPages"
            @click="store.nextPage"
          >
            &gt;
          </button>
          <button
            class="btn-page"
            :disabled="store.page === store.totalPages"
            @click="store.gotoPage(store.totalPages)"
          >
            &gt;&gt;
          </button>
        </nav>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import FilterToolbar from "/components/raphaelBackend/FilterToolbar.vue";
import DataUpdateHeader from "/components/raphaelBackend/DataUpdateHeader.vue";
import { useRouter } from "vue-router";
import { useMemberListStore } from "~/stores/useMemberListStore";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

const router = useRouter();
const store = useMemberListStore();

/* ---------- 產品 / 狀態選項 ---------- */
const productOptions = [
  { label: "雙效紅光活力衣", value: "雙效紅光活力衣" },
  { label: "三效深眠衣", value: "三效深眠衣" },
  { label: "全效調節衣", value: "全效調節衣" },
  { label: "居家治療儀", value: "居家治療儀" },
  { label: "第五代穿戴調節衣紅光加強版", value: "第五代穿戴調節衣紅光加強版" },
  { label: "第六代紅光極智衣", value: "第六代紅光極智衣" },
];
const gradeOptions = [
  { label: "鈦金會員", value: "鈦金會員" },
  { label: "金卡會員", value: "金卡會員" },
  { label: "銀卡會員", value: "銀卡會員" },
  { label: "雲端會員", value: "雲端會員" },
];
const statusOptions = [
  "忠誠用戶",
  "當前活躍",
  "經常使用",
  "正常使用",
  "偶爾使用",
  "待關注",
  "解約",
  "高風險",
  "未歸還",
  "退費",
  "奧客",
].map((v) => ({ label: v, value: v }));

/* ---------- 取會員資料 ---------- */
onMounted(() => {
  store.fetchMembers();
});

function handleGoInfo(m: any) {
  localStorage.setItem(
    "selectedMember",
    JSON.stringify({ MID: m.id, Mobile: m.phone }),
  );
  router.push(`/raphaelBackend/member/memberContent`);
}

/* ---------- 手動刷新 ---------- */
function refreshData() {
  store.clear();
  store.fetchMembers();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function formatBirthday(birthday: string) {
  if (!birthday) return "";

  // 已經是 xx/xx/xx 或 xxx/xx/xx 就直接回傳
  if (birthday.includes("/")) {
    const parts = birthday.split("/");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${y.padStart(3, "0")}/${m.padStart(2, "0")}/${d.padStart(2, "0")}`;
    }
    return birthday;
  }

  // 純數字處理
  const digits = birthday.replace(/\D/g, "");

  // 民國 7 碼：0840113
  if (digits.length === 7) {
    const y = digits.slice(0, 3);
    const m = digits.slice(3, 5);
    const d = digits.slice(5, 7);
    return `${y}/${m}/${d}`;
  }

  // 西元 8 碼：19930917 → 轉民國
  if (digits.length === 8) {
    const year = Number(digits.slice(0, 4)) - 1911;
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    return `${String(year).padStart(3, "0")}/${m}/${d}`;
  }

  return birthday;
}
</script>

<style scoped lang="scss">
// you can replace colors with variables / mixins defined in your project

.dashboard {
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

  .healthBtn {
    border-radius: 6px;
    border: none;
    background: $primary-200;
    color: $primary-100;
    font-size: 1rem;
    font-style: normal;
    font-weight: 400;
    margin: 0 auto;
    cursor: pointer;
    letter-spacing: 2px;
    padding: 0.25rem 0.5rem;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 0.25rem;
    transition: all 0.2s ease;
    &:hover {
      background-color: $primary-300;
    }
    @include respond-to("lg") {
      margin: 0;
      margin-top: 0.25rem;
    }
    img {
      width: 14px;
    }
  }

  .member-table {
    display: flex;
    flex-direction: column;
    flex: 1;
    border: 1px solid $border;
    border-radius: 8px;
    overflow: hidden;
    border-radius: 20px;
    background: $raphael-white;
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    .table-list {
      display: grid;
      grid-template-rows: repeat(auto-fill, minmax(min-content, 91px));
      flex: 1;
      height: 0;
      overflow: hidden;
      overflow-y: scroll;
      @include scrollbarStyle();

      & > .table-row {
        cursor: pointer;
        transition: all ease 0.2s;

        &:hover {
          color: $chip-success;

          & > .goInfo {
            border-radius: 50%;
            box-shadow: inset 0px 2px 6px -1px $primary-200;
          }
        }

        .goInfo {
          position: absolute;
          top: 50%;
          right: 12px;
          transform: translateY(-50%);
          cursor: pointer;
          transition: all 0.25s ease;
          @include respond-to("lg") {
            top: 29px;
          }
        }
      }
    }
    .table-row {
      display: grid;
      grid-template-columns: 0.75fr 0.75fr 0.75fr 0.75fr 1.5fr 1fr 1fr 1fr;
      position: relative;
      gap: 2px;
      align-items: center;
      padding: 13px 16px;
      color: $raphael-gray-500;

      @include respond-to("lg") {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 16px;
        gap: 0.75rem;
        border-bottom: 1px solid $border;
        position: relative;
      }

      @include respond-to("xl") {
        grid-template-columns: 0.75fr 1fr 0.75fr 0.75fr 1.5fr 1.5fr 1fr;
      }

      .reg-date {
        @include respond-to("xl") {
          display: none;
        }
      }

      & + .table-row {
        border-top: 1px solid $border;
      }
      &.table-header {
        font-weight: 600;
        white-space: nowrap;
        color: $primary-600;
        @include respond-to("lg") {
          display: none;
        }
      }
      .cell {
        width: auto;
        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);

        @include respond-to("lg") {
          display: flex;
          justify-content: space-between;
          flex-direction: column;
          gap: 0.25rem;
          width: 100%;
          text-align: left;
          font-weight: 600;
          font-size: 1.5rem;
          color: #2d3047;

          &::before {
            content: attr(data-label);
            font-size: 1rem;
            font-weight: normal;
            color: $raphael-gray-500;
          }
        }

        &.name {
          @include respond-to("lg") {
            &::before {
              display: none;
            }
          }
        }
        .tagsGroup {
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          .cellTag {
            white-space: nowrap;
            color: var(--Primary-default, #1ba39b);

            font-size: 1rem;
            font-style: normal;
            font-weight: 400;

            letter-spacing: var(--Title-Medium-Tracking, 0.15px);

            border-radius: 4px;
            border: 1px solid var(--Primary-default, #1ba39b);
            background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
            padding: 0.5rem;
          }

          .cellTagWarning {
            border: 1px solid $raphael-red-300;
            background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
            color: $raphael-red-300;
          }
          .cellTag2 {
            border: 1px solid var(--Neutral-300, #ccc);
            background: var(--Neutral-200, #eee);
            color: var(--Neutral-300, #ccc);
            display: flex;
            align-items: center;
            gap: 2px;
            img {
              width: 1rem;
            }
          }
        }
        &.product {
          width: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          @include respond-to("lg") {
            text-align: left;
            margin: 0;
          }
        }
        &.no-data {
          padding: 0;
        }
        &.health {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          @include respond-to("lg") {
            display: flex;
            flex-direction: column;
            text-align: left;
            p {
              line-height: 1.25;
            }
          }
        }
        &.product,
        &.health {
          //  font-size: 12px;
          //  line-height: 18px;
          font-size: 16px;
        }
        .cellProduct {
          display: flex;
          align-items: center;
          gap: 8px;
          @include respond-to("xl") {
            flex-wrap: wrap;
            justify-content: flex-start;
            margin: 0;
          }
          @include respond-to("lg") {
            padding: 0;
            margin: 0;
          }
        }
        &.action {
          display: flex;
          align-items: center;
          width: auto;
        }
        &.reg-date {
          @include respond-to("xl") {
            display: none;
          }
        }
        .chip--success,
        .chip--danger {
          padding: 4px;
        }
      }
    }
    .chip {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 1rem;
      line-height: 16px;
      &--success {
        background: rgba($chip-success, 0.1);
        color: $chip-success;
        border: 1px solid $chip-success;
      }
      &--danger {
        background: rgba($chip-danger, 0.1);
        color: $chip-danger;
        border: 1px solid $chip-danger;
      }
    }
    .chipWrap {
      display: none;
    }
    .chip--warning {
      overflow: hidden;
      color: $raphael-red-300;
      font-style: normal;
      font-weight: 400;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      @include respond-to("lg") {
        margin: 0;
        margin-top: 0.25rem;
        padding: 0;
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 12px;
    margin-bottom: 24px;
    .btn-page {
      padding: 6px 10px;
      min-width: 32px;

      border-radius: 4px;

      background-color: transparent;
      cursor: pointer;
      border: none;
      &.active {
        background: $chip-success;
        color: white;
        border-color: $chip-success;
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .btn-page-number {
      background: white;
    }
  }
}
</style>
