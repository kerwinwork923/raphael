<template>
  <div class="cover"></div>
  <div class="HRVAlert">
    <img
      class="HRVAlertClose"
      @click="closeHealthRecordAlert"
      src="/assets/imgs/selectClose.svg"
      alt=""
    />

    <h3>智平衡健康集團提醒事項</h3>
    <article>
      了解自己的健康狀態，是邁向改善病情的重要一步。透過每兩週填寫自律神經症狀、生活紀錄或寶貝紀錄，您可以系統性地追蹤自身的變化，發現改善的契機，並及早調整生活習慣。這些紀錄不僅是幫助您清楚掌握健康數據的有效工具，也能協助醫師更深入地了解您的日常生活、疾病狀態與治療效果，從而提供更精準的建議與方案。同時，透過持續的健康紀錄，您能親身見證每一小步的進展，感受到改善健康的成就感與幸福感。每一次的紀錄，都是為未來更健康、更有活力的生活奠定基礎。現在就開始，為更好的自己創造高峰體驗吧！
    </article>
    <button class="HRVAlertBtn" @click="handleConfirm">確定</button>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
export default {
  props: {
    HealthRecordAlertActive: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:HealthRecordAlertActive"],
  setup(props, { emit }) {
    const router = useRouter();
    const closeHealthRecordAlert = () => {
      emit("update:HealthRecordAlertActive", false);
    };

    const handleConfirm = () => {
      closeHealthRecordAlert();
      router.push("/weekly");
    };

    return {
      closeHealthRecordAlert,
      handleConfirm,
    };
  },
};
</script>

<style lang="scss">
.cover {
  position: fixed;
  left: 0;
  top: 0;

  width: 100%;
  height: 100vh;
  z-index: 99;
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
}
.HRVAlert {
  display: grid;
  gap: 1rem;
  width: 90%;

  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  z-index: 1000;
  border-radius: 12px;
  background: var(--Grays-White, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  max-width: 648px;
  padding: 0.75rem;
  .HRVAlertClose {
    width: 24px;
    height: 24px;
    cursor: pointer;
    place-self: end;
  }
  h3 {
    text-align: center;
    color: $raphael-green-400;
    font-weight: bold;
    letter-spacing: 0.12px;
    font-size: 1.5rem;
  }

  article {
    padding-top: 0.75rem;
    border-top: 1px solid #1e1e1e;
    color: #666;
    font-size: 18px;
    letter-spacing: 2px;
    line-height: 1.5;
    height: 45vh;
    overflow-y: scroll;

    .point {
      color: #ec4f4f;
    }
  }

  .HRVAlertBtn {
    background-color: $raphael-green-400;
    border: none;
    color: #fff;
    cursor: pointer;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 1.125rem;
    font-weight: 400;
    letter-spacing: 0.09px;
    transition: all 0.3s ease;
    &:hover {
      background-color: $raphael-green-500;
    }
  }
}
</style>
