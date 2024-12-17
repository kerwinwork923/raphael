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

<style lang="scss" scoped>
.cover {
 @include coverbg();
}
.HRVAlert {
  @include alertStyle();

  article {
    border-top: 1px solid $raphael-black;
    color: $raphael-gray-500;
    height: 45vh;
    font-size: 18px;
    letter-spacing: 2px;
    line-height: 1.5;
    padding-top: 0.75rem;
    overflow-y: scroll;

    .point {
      color: $raphael-red-300;
    }
  }

  .HRVAlertBtn {
    @include btnStyle($raphael-green-400,$raphael-white);
  }
}
</style>
