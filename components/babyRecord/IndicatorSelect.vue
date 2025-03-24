<template>
  <div class="babyAnsTypeGroup">
    <p>請挑選幾個指標，讓我們更了解您的需求。</p>

    <div v-if="ansTypes && Object.keys(ansTypes).length > 0" class="babyAnsTypeInfoGroup">
      <div
        v-for="(description, key) in ansTypes"
        :key="key"
        class="babyAnsTypeCard"
        :class="{ babyAnsTypeCardSelected: isTypeSelected(key) }"
        @click="toggleSelect(key)"
      >
        <img :src="isTypeSelected(key) ? babyTypeCheck : babyTypePlus" alt="icon"/>
        <h3>{{ key }}</h3>
        <p>{{ description }}</p>
      </div>
    </div>
    <p v-else></p>
  </div>
</template>

<script>
import babyTypeCheck from "@/assets/imgs/babyRecord/babyTypeCheck.svg";
import babyTypePlus from "@/assets/imgs/babyRecord/babyTypePlus.svg";

export default {
  name: "IndicatorSelect",
  props: {
    ansTypes: { type: Object, default: () => ({}) },
    curChildData: { type: Object, default: null },
  },
  setup(props) {
    function isTypeSelected(key) {
      return props.curChildData?.selectedAnsTypes.has(key);
    }
    function toggleSelect(key) {
      const set = props.curChildData?.selectedAnsTypes;
      if (!set) return;
      if (set.has(key)) set.delete(key);
      else set.add(key);
    }
    return {
      isTypeSelected,
      toggleSelect,
      babyTypeCheck,
      babyTypePlus,
    };
  },
};
</script>

<style lang="scss">
/* 指標選擇區 */
.babyAnsTypeGroup {
  margin-bottom: 1rem;
  p {
    color: #666666; /* 原 var(--shade-gray-500) */
    font-size: 16px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.5px;
    margin: 0;
    margin-top: 1rem;

  }
  .babyAnsTypeInfoGroup {
    display: flex;
    flex-wrap: wrap;
    gap: 2%;
    justify-content: space-between;
    margin-top: 0.5rem;

    .babyAnsTypeCard {
      width: 48%;
      background-color: #ffffff;
      border-radius: 0.5rem;
      padding: 8px 12px;
      border: 1px solid #cccccc;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      margin-bottom: 0.75rem;
      cursor: pointer;
      h3 {
        font-weight: bold;
        font-size: 1.25rem;
        margin: 0.25rem 0 0 0;
      }
      p {
        margin-top: 0.5rem;
        margin-bottom: 0;
        line-height: 1.3;
      }
    }
    .babyAnsTypeCardSelected {
      color: #74bc1f;
      p {
        color: #74bc1f;
      }
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }
  }
}
</style>
