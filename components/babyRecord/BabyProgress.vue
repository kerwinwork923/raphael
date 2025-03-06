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
        <div
          class="babyProgressState"
          :class="{ babyProgressStateActive: child.CID === selectedChildID }"
        ></div>
        <h4>{{ child.Name }}</h4>
      </div>
      <div class="babyProgressText">
        <h5>問卷進度</h5>
        <h6>{{ child.ratioComplete }}%</h6>
      </div>
      <div class="babyProgress"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BabyProgress",
  props: {
    babyList: { type: Array, default: () => [] },
    selectedChildID: { type: String, default: "" },
  },
  emits: ["selectChild"],
  setup(props, { emit }) {
    function select(cid) {
      emit("selectChild", cid);
    }
    return { select };
  },
};
</script>

<style lang="scss">
/* 寶貝進度清單 (水平捲) */
.babyProgressGroup {
  display: flex;
  gap: 12px;
  max-width: 400px;
  overflow-x: auto;
  padding-bottom: 2px;
  scroll-snap-type: x mandatory;

  .babyProgressCard {
    background-color: #ffffff;
    border-radius: 8px;
    min-width: 160px;
    padding: 12px;
    cursor: pointer;
    scroll-snap-align: start;
    &:hover {
      transform: scale(1.05);
      transition: 0.2s ease-in-out;
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
