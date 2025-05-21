<template>
  <div class="cover"></div>
  <div class="HRVAlert">
    <img
      class="HRVAlertClose"
      @click="closeHealthRecordAlert"
      src="/assets/imgs/selectClose.svg"
      alt=""
    />

    <h3>智平衡健康集團溫馨提醒</h3>
    <article>
      <div>
        了解自己的健康狀態，是邁向改善病情的重要一步。透過每兩週填寫健康紀錄，您可以系統性地追蹤自身的變化，發現改善的契機，並及早調整生活習慣。這些紀錄工具設計的目的，是幫助您更清楚掌握個人健康趨勢，並作為臨床醫師進行後續照護評估的參考資料。
      </div>
      <div>
        請您於使用過程中持續與醫療團隊保持聯繫，並依照醫師專業建議調整您的生活與健康管理策略。透過持續的健康紀錄，您將能親身見證每一小步的進展，累積改善的信心與動力。現在就開始，為更健康、更有活力的自己，創造高峰體驗吧！
      </div>
      <div class="point">
        請注意：本 App
        所提供之所有紀錄、分析圖表與結果說明，僅作為健康管理與醫療輔助參考之用，不構成醫療診斷、疾病判定或治療建議。僅限經智平衡健康集團與拉菲爾人本診所的現有病患與相關人使用。
      </div>
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-top: 1px solid $raphael-black;
    color: $raphael-gray-500;
    height: 45vh;
    font-size: 18px;
    letter-spacing: 2px;
    line-height: 1.5;
    padding-top: 0.75rem;
    overflow-y: scroll;
    @include scrollbarStyle();

    .point {
      color: $raphael-red-300;
    }
  }

  .HRVAlertBtn {
    @include btnStyle($raphael-green-400, $raphael-white);
  }
}
</style>
