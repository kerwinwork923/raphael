<template>
  <div class="dashboard">
    <Sidebar />

    <!-- ─────────────── Main Content ─────────────── -->
    <main class="content">
      <!-- page header -->
      <header class="page-header">
        <h2 class="title">
          會員清單 <span class="count">({{ store.total }}人)</span>
        </h2>
        <div class="meta">
          <button class="btn refresh" @click="refreshData">
            <i class="i-refresh"></i>
            資料更新
          </button>
          <span class="updated-time">最後更新: {{ store.lastUpdated }}</span>
        </div>
      </header>
      <!-- toolbar / filters -->
      <section class="toolbar">
        <div class="toolbar-inner">
          <div class="search-wrapper">
            <input
              v-model="store.keyword"
              class="search"
              type="text"
              placeholder="請輸入關鍵字"
              @input="store.setKeyword($event.target.value)"
            />
            <img src="/assets/imgs/backend/search.svg" alt="" />
          </div>

          <div class="toolbarTime-wrapper">
            <VueDatePicker
              v-model="store.dateRange"
              range
              :enable-time-picker="false"
              :format="'yyyy/MM/dd'"
              :min-date="new Date(2024, 0, 1)"
              placeholder="註冊日期區間"
              prepend-icon="i-calendar"
              @update:model-value="store.setDateRange"
            />
          </div>
          <div class="selectWrapper">
            <img
              class="selectWrapperIcon1"
              src="/assets/imgs/backend/filter.svg"
              alt=""
            />
            <select 
              v-model="store.productFilter"
              @change="store.setProductFilter($event.target.value)"
            >
              <option value="">產品篩選</option>
              <option
                v-for="product in productOptions"
                :key="product.value"
                :value="product.value"
              >
                {{ product.label }}
              </option>
            </select>
            <img
              class="selectWrapperIcon2"
              src="/assets/imgs/backend/dropdown.svg"
              alt=""
            />
          </div>

          <div class="selectWrapper">
            <img
              class="selectWrapperIcon1"
              src="/assets/imgs/backend/filter.svg"
              alt=""
            />
            <select 
              v-model="store.statusFilter"
              @change="store.setStatusFilter($event.target.value)"
            >
              <option value="">用戶狀態</option>
              <option
                v-for="status in statusOptions"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
            <img
              class="selectWrapperIcon2"
              src="/assets/imgs/backend/dropdown.svg"
              alt=""
            />
          </div>
        </div>
      </section>

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
          >
            <div class="cell name" data-label="會員名稱">{{ member.name }}</div>
            <div class="cell level" data-label="等級">{{ member.level }}</div>
            <div class="cell birth" data-label="生日">
              {{ member.birthday }}
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

            <div
              class="goInfo"
              @click="handleGoInfo(member)"
              role="button"
              tabindex="0"
            >
              <img src="/assets/imgs/backend/goNext.svg" alt="詳細" />
            </div>
          </div>
        </div>

        <!-- pagination -->
        <nav class="pagination">
          <button class="btn-page" :disabled="store.page === 1" @click="store.gotoPage(1)">
            &lt;&lt;
          </button>
          <button class="btn-page" :disabled="store.page === 1" @click="store.prevPage">
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
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import { useRouter } from "vue-router";
import { useMemberListStore } from "~/stores/useMemberListStore";

const router = useRouter();
const store = useMemberListStore();

/* ---------- 產品 / 狀態選項 ---------- */
const productOptions = [
  { label: "雙效紅光活力衣", value: "雙效紅光活力衣" },
  { label: "三效深眠衣", value: "三效深眠衣" },
  { label: "全效調節衣", value: "全效調節衣" },
  { label: "居家治療儀", value: "居家治療儀" },
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

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    @include respond-to("sm") {
      flex-wrap: wrap;
    }
    .title {
      font-size: 24px;
      font-weight: 700;
      white-space: nowrap;
      word-break: keep-all;

      .count {
        color: var(--Primary-200, #b1c0d8);
        text-align: center;
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 16px;
      @include respond-to("lg") {
        gap: 6px;
        margin-top: 0.5rem;
        width: 100%;
      }
      .btn.refresh {
        // @include button;
        background-color: $primary-200;
        border: none;
        color: var(--Primary-100, #f5f7fa);
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        padding: 0.25rem 0.5rem;
        letter-spacing: 0.25px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        &:hover {
          background-color: $primary-300;
        }
        @include respond-to("lg") {
          font-size: 1rem;
          padding: 0.25rem 0.5rem;
        }
      }
      .updated-time {
        font-size: 12px;
        color: $Neutral-500;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 140%;
      }
    }
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

  .toolbar {
    display: flex;
    justify-content: flex-end;
    width: 100%;

    .toolbar-inner {
      display: flex;
      justify-content: flex-end;
      gap: 16px;

      width: 100%;
      flex-wrap: wrap;
      @include respond-to("xl") {
        gap: 8px;
        flex-wrap: nowrap;
      }
      @include respond-to("sm") {
        flex-wrap: wrap;
        justify-content: space-between;
      }
    }

    .search-wrapper {
      position: relative;
      @include respond-to("lg") {
        width: 25%;
      }
      @include respond-to("sm") {
        width: 48%;
      }
      img {
        width: 1.25rem;
        position: absolute;
        right: 5%;
        top: 50%;
        transform: translateY(-50%);
        width: 19px;
      }
    }

    .search {
      padding: 8px 12px;
      border: none;
      width: 100%;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    }

    .toolbarTime-wrapper {
      position: relative;
      @include respond-to("lg") {
        width: 25%;
      }
      @include respond-to("sm") {
        width: 48%;
      }
      /* 重點: 用 :deep() 才能選到 VueDatePicker 的內部元素 */
      :deep(.dp__pointer) {
        padding: 0; // 例如你想把 pointer 的 padding 清掉
      }

      :deep(.dp__input_icon) {
        color: $chip-success;

        right: auto; /* 關掉右邊 */
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2;
      }

      :deep(.dp__input) {
        padding: 4px 32px; // 改 input padding
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
      }
    }

    select {
      padding: 0.5rem 1.75rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      background-color: #fff;
      background-size: 12px;
      appearance: none; // ✅ 移除預設樣式
      -webkit-appearance: none; // ✅ Safari
      -moz-appearance: none; // ✅ Firefox
      background-image: none;
      color: var(--Neutral-500, #666);
      cursor: pointer;
      width: 100%;
      border: none;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    }

    .selectWrapper {
      position: relative;
      min-width: 12%;
      @include respond-to("lg") {
        width: 25%;
      }
      @include respond-to("sm") {
        width: 48%;
      }
      img {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
      }
      .selectWrapperIcon1 {
        left: 8px;
      }
      .selectWrapperIcon2 {
        right: 8px;
      }
    }

    .toolbarTime {
      flex: 1 1 240px; // ✅ 可縮放、設定基準
      min-width: 200px;
      max-width: 100%;
    }
  }

  .toolbarTime {
  }

  .member-table {
    display: flex;
    flex-direction: column;
    flex: 1;
    border: 1px solid $border;
    border-radius: 8px;
    overflow: hidden;
    border-radius: 20px;
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    .table-list {
      display: grid;
      flex: 1;
      height: 0;
      overflow: hidden;
      overflow-y: scroll;
      @include scrollbarStyle();
    }
    .table-row {
      display: grid;

      grid-template-columns: 0.75fr 0.75fr 0.75fr 0.75fr 1.5fr 1fr 1fr 1fr;

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
      position: relative;
      gap: 2px;
      align-items: center;
      padding: 13px 16px;
      & + .table-row {
        border-top: 1px solid $border;
      }
      &.table-header {
        font-weight: 600;
        white-space: nowrap;
        color: var(--Primary-600, #2d3047);
        @include respond-to("lg") {
          display: none;
        }
      }
      .cell {
        color: $Neutral-500;
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
            color: $Neutral-500;
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
            border: 1px solid var(--Warning-default, #ec4f4f);
            background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
            color: var(--Warning-default, #ec4f4f);
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
      .goInfo {
        position: absolute;
        top: 50%;
        right: 12px;
        transform: translateY(-50%);
        cursor: pointer;
        @include respond-to("lg") {
          top: 29px;
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
      color: var(--Warning-default, #ec4f4f);
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
