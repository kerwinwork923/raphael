<template>
  <div class="ContractUserAlert">
    <div class="ContractUserAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>{{ memberName }}</h3>
      <h4>Contract History</h4>
    </div>

    <div class="ContractUserAlertHR" />

    <!-- 小計 + 篩選 -->
    <div class="ContractUserAlertSubTitleGroup">
      <div class="ContractUserAlertSubTitle">
        <h6>
          總消費金額 {{ totalAmount.toLocaleString() }}
          <span>　共 {{ totalCount }} 個合約</span>
        </h6>
      </div>
      <VueDatePicker
        v-model="range"
        range
        :enable-time-picker="false"
        format="yyyy/MM/dd"
        placeholder="合約日期區間"
        prepend-icon="i-calendar"
        class="ContractUserAlertSubDate"
      />
    </div>

    <!-- 年度進度條 (範例) -->
    <div
      v-for="(grp, idx) in yearlyGroup"
      :key="idx"
      class="ContractUserAlertProgressGroup"
    >
      <div class="ContractUserAlertProgressTitle">
        <h5>{{ grp.year }}</h5>
        <h6>{{ grp.list.length }} 個合約</h6>
      </div>

      <div class="progress-bar">
        <div class="progress-bar-inner" :style="{ width: grp.percent + '%' }" />
      </div>
    </div>

    <!-- 每筆合約 -->
    <div
      v-for="c in filtered"
      :key="c.RentStart + c.ProductName"
      class="ContractUserAlertContent"
    >
      <h3>{{ c.ProductName }}</h3>

      <div class="ContractUserAlertContentList">
        <h4><img src="/assets/imgs/backend/money.svg" alt="" />消費金額</h4>
        <h5>{{ (c.TotalFee ?? 0).toLocaleString() }}</h5>
      </div>

      <div class="ContractUserAlertContentList">
        <h4><img src="/assets/imgs/backend/time.svg" alt="" />開始時間</h4>
        <h5>{{ c.RentStart }}</h5>
      </div>

      <div class="ContractUserAlertContentList">
        <h4><img src="/assets/imgs/backend/time.svg" alt="" />結束時間</h4>
        <h5>{{ c.RentEnd }}</h5>
      </div>
    </div>

    <!-- 關閉 -->
    <div class="closeBtnGroup">
      <img
        class="closeBtn"
        src="/assets/imgs/backend/close.svg"
        alt=""
        @click="$emit('close')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const props = defineProps<{
  contracts: {
    ProductName: string;
    RentStart: string;
    RentEnd: string;
    TotalFee?: string;
    Used?: string;
    Still?: string;
  }[];
  memberName: string;
}>();
defineEmits(["close"]);

const range = ref<Date[] | null>(null);

/* 依日期範圍過濾 */
const filtered = computed(() => {
  if (!range.value || range.value.length < 2) return props.contracts;
  const [from, to] = range.value;
  const start = from.getTime(),
    end = to.getTime();
  return props.contracts.filter((c) => {
    const ms = Date.parse(c.RentStart.replace(/\//g, "-"));
    return ms >= start && ms <= end;
  });
});

/* 小計 */
const totalAmount = computed(() =>
  filtered.value.reduce((s, c) => s + (Number(c.TotalFee) ?? 0), 0)
);
const totalCount = computed(() => filtered.value.length);

/* 年度統計 (做個進度條示範) */
const yearlyGroup = computed(() => {
  const map: Record<string, number> = {};
  filtered.value.forEach((c) => {
    const year = c.RentStart.slice(0, 4);
    map[year] = (map[year] ?? 0) + 1;
  });
  return Object.entries(map).map(([y, cnt]) => ({
    year: y,
    list: new Array(cnt),
    percent: (cnt / filtered.value.length) * 100,
  }));
});
</script>

<style scope lang="scss">
.ContractUserAlert {
  position: fixed;
  width: 80%;
  max-width: 1000px;
  left: 50%;
  top: 50%;
  height: 90%;

  transform: translate(-50%, -50%);

  border-radius: var(--Radius-r-20, 20px);
  border: 3px solid var(--Primary-default, #1ba39b);
  background: var(--neutral-white-opacity-30, rgba(255, 255, 255, 0.3));
  box-shadow: 0px 2px 20px 0px
    var(--primary-400-opacity-25, rgba(27, 163, 155, 0.25));
  backdrop-filter: blur(25px);
  z-index: 100;
  padding: 1rem 2.5%;
  overflow-y: auto;
  scrollbar-gutter: stable;
  box-sizing: border-box;
  // 自訂 scrollbar 樣式（Webkit）
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #878787;
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #848484;
  }

  .ContractUserAlertHR {
    background: var(--Primary-200, #b1c0d8);
    width: 100%;
    height: 1px;
  }
  .ContractUserAlertTitleGroup {
    text-align: center;

    margin-bottom: 0.75rem;
    img {
      width: 2rem;
      height: 2rem;
      border-radius: 9.8px;
      border: 1px solid var(--Primary-default, #1ba39b);
      padding: 2px 4px;
    }
    h3 {
      color: var(--Primary-600, #2d3047);
      font-size: var(--Text-font-size-24, 20px);
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.12px;
    }
    h4 {
      margin-top: 0.15rem;
      color: var(--Primary-default, #1ba39b);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
    }
  }
  .ContractUserAlertSubTitleGroup {
    display: flex;
    margin-top: 0.5rem;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    @include respond-to("md") {
      width: 100%;
    }

    .ContractUserAlertSubTitle {
      display: flex;
      flex: 1;
      @include respond-to("md") {
        h6{
          display: flex;
 justify-content: space-between;
          width: 100%;
      }
       
       
      }
   
    }
    .ContractUserAlertSubDate {
      width: 40%;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
      @include respond-to("md") {
        width: 100%;
      }
    }
  }
  .ContractUserAlertProgressGroup {
    margin-top: 12px;
    padding: 12px 16px;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);

    .ContractUserAlertProgressTitle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      h5 {
        color: var(--Primary-600, #2d3047);
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 18px */
        letter-spacing: 2.7px;
      }
      h6 {
        color: var(--Primary-default, #1ba39b);
        text-align: center;

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;

        letter-spacing: 2.7px;
      }
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #fff;

      overflow: hidden;
      margin-bottom: 10px;
      border-radius: 50px;
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.25) inset;
    }

    .progress-bar-inner {
      height: 100%;
      background: #1ba39b;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .more {
      color: var(--Primary-300, #6d8ab6);

      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.09px;
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
      text-align: center;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 24px;
      }
    }
  }
  .ContractUserAlertContent {
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    padding: 0.5rem 1rem;
    margin-top: 0.75rem;
    h3 {
      color: var(--Primary-600, #2d3047);

      font-size: var(--Text-font-size-24, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 24px */
      letter-spacing: 0.12px;
    }
    .ContractUserAlertContentList {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.5rem;
      h4 {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--Primary-200, #b1c0d8);

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 18px */
        letter-spacing: 0.09px;
      }
    }
  }
  .closeBtnGroup {
    text-align: center;
    margin-top: 0.5rem;
    position: absolute;
    bottom: 2%;
    left: 50%;
    .closeBtn {
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
      padding: 0.25rem;
      cursor: pointer;
    }
  }
}
</style>
