<template>
  <div class="babyProgressGroup">
    <div
      v-for="child in babyList"
      :key="child.CID"
      :class="{ active: child.CID === selectedChildID }"
      class="babyProgressCard"
      @click="select(child.CID)"
    >
      <div class="babyProgressTitle">
        <div class="babyProgressTitleLeft">
          <div
            class="babyProgressState"
            :class="{ babyProgressStateActive: child.CID === selectedChildID }"
          ></div>
          <h4>{{ child.Name }}</h4>
        </div>
        <!-- 編輯按鈕：點擊後，透過 emit 通知父層 -->
        <img
          src="../../assets/imgs/babyRecord/babaCreated.svg"
          alt="編輯"
          style="cursor: pointer"
          @click.stop="onEditChild(child)"
        />
      </div>

      <!-- 若 diffDaysFromToday > 0，顯示「xx天 後再檢測」 -->
      <div
        class="babyProgressDiffDay"
        v-if="child.diffDaysFromToday && child.diffDaysFromToday > 0"
      >
        {{ child.diffDaysFromToday }}天 後再檢測
      </div>
      <div v-else>
        <div class="babyProgressText">
          <h5>問卷進度</h5>
          <h6>{{ child.ratioComplete }}%</h6>
        </div>
        <div class="babyProgress"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BabyProgress",
  props: {
    /** 
     * babyList: 從父層傳進來的寶貝清單
     * each child = { CID, Name, diffDaysFromToday, ratioComplete, ... }
     */
    babyList: { type: Array, default: () => [] },
    /** 父層記錄目前被選取的寶貝CID */
    selectedChildID: { type: String, default: "" },
  },
  emits: ["selectChild", "editChild"],

  setup(props, { emit }) {
    // 點擊寶貝卡片 => emit('selectChild', cid)
    function select(cid) {
      emit("selectChild", cid);
    }
    // 點擊「編輯」icon => emit('editChild', child)
    function onEditChild(child) {
      emit("editChild", child);
    }

    return { select, onEditChild };
  },
};
</script>

<style lang="scss">
/* 寶貝進度清單 (水平捲) */
.babyProgressGroup {
  display: flex;
  gap: 12px;
  width: 100%;
  overflow-x: auto;
  padding-bottom: 2px;
  scroll-snap-type: x mandatory;
  margin-top: 0.5rem;
  max-width: 400px;

  .babyProgressDiffDay {
    color: var(--brand-green-400, #74bc1f);
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.09px;
    margin-top: 0.75rem;
  }

  .babyProgressTitle {
    display: flex;
    justify-content: space-between;
    .babyProgressTitleLeft {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .babyProgressCard {
    background-color: $raphael-white;
    border-radius: 8px;
    min-width: 160px;
    width: 100%;
    padding: 12px;
    cursor: pointer;
    scroll-snap-align: start;

    &:hover:not(.active) {
      .babyProgressTitle {
        .babyProgressState {
          background-color: $raphael-gray-400;
        }
      }
    }

    .babyProgressTitle {
      display: flex;
      align-items: center;
      gap: 4px;

      h4 {
        color: #1e1e1e; /* var(--shade-black) */
        font-size: 20px;
        letter-spacing: 0.15px;
        margin: 0;
      }
      .babyProgressState {
        width: 12px;
        height: 12px;
        background-color: #eeeeee;
        border-radius: 999px;
        transition: all 0.2s ease;
      }
      .babyProgressStateActive {
        background-color: #74bc1f;
      }
    }

    .babyProgressText {
      margin-top: 0.5rem;
      display: flex;
      justify-content: space-between;

      h5,
      h6 {
        margin: 0;
      }
      h5 {
        color: var(--shade-gray-500, #666);
      }
      h6 {
        color: var(--secondary-purple-200, #65558f);
      }
    }

    .babyProgress {
      width: 100%;
      height: 4px;
      background-color: #e0e0e0;
      border-radius: 4px;
      margin-top: 8px;
      position: relative;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: #65558f;
        border-radius: 4px;
      }
    }
  }
}
</style>
