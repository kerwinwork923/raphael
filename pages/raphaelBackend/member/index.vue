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
        <button class="btn-add" @click="handleExportExcel">匯出成excel</button>
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
            v-for="(p, idx) in visiblePageItems"
            :key="`${p}-${idx}`"
            class="btn-page btn-page-number"
            :class="{ active: typeof p === 'number' && store.page === p }"
            :disabled="p === '...'"
            @click="typeof p === 'number' && store.gotoPage(p)"
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
import { computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import FilterToolbar from "/components/raphaelBackend/FilterToolbar.vue";
import DataUpdateHeader from "/components/raphaelBackend/DataUpdateHeader.vue";
import { useRouter } from "vue-router";
import {
  useMemberListStore,
  type Member,
  type MemberRaw,
} from "~/stores/useMemberListStore";
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

const router = useRouter();
const store = useMemberListStore();
type PageItem = number | "...";

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

const visiblePageItems = computed<PageItem[]>(() => {
  const total = store.totalPages;
  const current = store.page;
  const maxItems = 10; // 最多顯示 10 格（含 ...）

  if (total <= maxItems) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: PageItem[] = [];
  const leftBoundary = 3;
  const rightBoundary = total - 2;

  if (current <= leftBoundary) {
    items.push(1, 2, 3, 4, 5, 6, 7, "...", total);
    return items;
  }

  if (current >= rightBoundary) {
    items.push(
      1,
      "...",
      total - 6,
      total - 5,
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total
    );
    return items;
  }

  items.push(1, "...");
  items.push(current - 2, current - 1, current, current + 1, current + 2);
  items.push("...", total);
  return items;
});

function handleGoInfo(m: any) {
  localStorage.setItem(
    "selectedMember",
    JSON.stringify({ MID: m.id, Mobile: m.phone })
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
      return `${y.padStart(3, "0")}/${m.padStart(2, "0")}/${d.padStart(
        2,
        "0"
      )}`;
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

function sexLabel(sex: string | undefined) {
  if (sex === "1") return "男";
  if (sex === "2") return "女";
  if (sex === "0" || !sex) return "未填";
  return sex;
}

function homeOrderText(orders: MemberRaw["HomeOrder"] | undefined) {
  if (!Array.isArray(orders) || orders.length === 0) return "";
  return orders
    .map((o) => {
      const name = o.ProductName ?? "";
      const rs = o.RentStart ?? "";
      const re = o.RentEnd ?? "";
      const used = o.Used ?? "";
      const period = o.Period ?? "";
      const still = o.Still ?? "";
      return `${name}｜起租${rs}～${re}｜已用${used}天｜期間${period}天｜剩${still}天`;
    })
    .join("\n");
}

function handleExportExcel() {
  const list = store.filteredMembers;
  if (!list.length) {
    alert("目前沒有符合條件的會員可匯出");
    return;
  }

  const rows = list.map((m: Member) => {
    const raw = store.rawByMid.get(m.id) as MemberRaw | undefined;
    return {
      MID: raw?.MID ?? m.id,
      MAID: raw?.MAID ?? "",
      姓名: raw?.Name ?? m.name,
      性別: sexLabel(raw?.Sex),
      生日: raw?.Birthday ?? m.birthday,
      手機: raw?.Mobile ?? m.phone,
      信箱: raw?.Mail ?? "",
      會員等級: raw?.GradeName ?? m.level,
      等級代碼: raw?.Grade ?? "",
      用戶分類: raw?.memType ?? m.memType,
      城市: raw?.City ?? "",
      區域: raw?.Zone ?? "",
      地址: raw?.Address ?? "",
      身高: raw?.Height ?? "",
      體重: raw?.Weight ?? "",
      HRV: raw?.HRV ?? m.hrv,
      HRV開關: raw?.HRVONOFF ?? "",
      HRV計算時間: raw?.HRVCalTime ?? "",
      自律神經總分: raw?.TotalScore ?? raw?.totalScore ?? "",
      生活自律分數: raw?.Score ?? raw?.score ?? "",
      DSPR: raw?.DSPR ?? m.ans,
      是否認證: raw?.IsAuth ?? "",
      帳號狀態: raw?.Status ?? "",
      註冊日: raw?.TDate ?? "",
      最後登入時間: raw?.CheckTime ?? "",
      修改時間: raw?.ModifyTime ?? "",
      Garmin信箱: raw?.GarminMail ?? "",
      Asus信箱: raw?.AsusMail ?? "",
      Acer信箱: raw?.AcerMail ?? "",
      租賃訂單摘要: homeOrderText(raw?.HomeOrder),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "會員清單");
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(
    2,
    "0"
  )}${String(now.getMinutes()).padStart(2, "0")}`;
  XLSX.writeFile(wb, `會員清單_${dateStr}.xlsx`);
}
</script>

<style scoped lang="scss">
// you can replace colors with variables / mixins defined in your project
.btn-add {
  background: $primary-200;
  color: $primary-100;
  font-size: 1rem;
  font-style: normal;
  font-weight: 400;
  margin-left: auto;
  padding: 0.2rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  position: absolute;
  right: 1rem;
  top: 0.5rem;
  z-index: 30;
  &:hover {
    background: $primary-300;
  }
  cursor: pointer;
}
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
    position: relative;
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
        opacity: 0.8;
        cursor: not-allowed;
      }
    }

    .btn-page-number {
      background: white;
    }
  }
}
</style>
