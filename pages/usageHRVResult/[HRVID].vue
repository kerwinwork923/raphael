<template>
  <div class="usageHRVResultWrap">
    <h1>結果分析</h1>
    <div class="resultChartGroup">
      <h2>生理年齡</h2>
      <ResultChart></ResultChart>
    </div>
    <div class="BAGroup">
      <div class="BACard">
        <div class="titleGroup">
          <img src="/assets/imgs/HRVFaceSmall.svg" alt="" />
          <h3>生理年齡</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">35~40</div>
            <div class="unit">years old</div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">40~50</div>
            <div class="unit">years old</div>
          </div>
        </div>
      </div>

      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/heartRateSmall.svg" alt="" />
          <h3>心律變異性</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">35</div>
            <div class="unit">ms</div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">50</div>
            <div class="unit">ms</div>
          </div>
        </div>
      </div>

      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/heartBeatSmall.svg" alt="" />
          <h3>心率</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">30</div>
            <div class="unit">bpm</div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">50</div>
            <div class="unit">bpm</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ResultChart from "~/components/ResultChart.vue"; // 不需要花括号
export default {
  components: { ResultChart },
};
</script>

<style lang="scss">
.usageHRVResultWrap {
  background-color: #f6f6f6;
  padding: 1rem 5% 7rem;
  font-family: "Noto Sans";
  h1 {
    color: #000;
    text-align: center;
    font-size: 24px;
    font-weight: 400;
    letter-spacing: 0.5px;
    padding-bottom: 1rem;
  }
  .resultChartGroup {
    background-color: #fff;
    padding: 0.5rem 0 0;
    h2 {
      padding-left: 0.5rem;
      color: #1e1e1e;
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.15px;
    }
  }
  .BAGroup {
    display: flex;
    gap: 5%;
    overflow-x: auto;
    width: auto;
    .BACard {
      background-color: #fff;
      width: 70%;
      border-left: 2px solid var(--brand-green-400, #74bc1f);
      border-radius: 8px;
      padding: 12px;
      .titleGroup {
        display: flex;
        gap: 2px;
        color: #1e1e1e;
        font-size: 20px;
        font-style: normal;
        font-weight: 400;

        letter-spacing: 0.15px;

        img {
          width: 20px;
        }
      }
      .BAContent {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .BA {
          .subTitle {
            color: #666;

            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.5px;
          }
          .value {
            color: #74bc1f;
            text-align: center;
            font-family: "Noto Sans";
            font-size: 36px;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.09px;
          }
          .afterValue {
            color: #1fbcb3;
          }

          .unit {
            color: #ccc;
            font-family: "Noto Sans";
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.5px;
          }
        }
      }
    }
    .BACardS {
        width: 40%;
    }
  }
}
</style>
