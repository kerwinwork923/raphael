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

      <div class="BACard">
        <div class="titleGroup">
          <img src="/assets/imgs/bloodPressure.svg" alt="" />
          <h3>血壓</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">130/85</div>
            <div class="unit">mmHg</div>
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
            <div class="value afterValue">134/85</div>
            <div class="unit">mmHg</div>
          </div>
        </div>
      </div>

      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/spo2Small.svg" alt="" />
          <h3>血氧</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">95</div>
            <div class="unit">SpO2%</div>
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
            <div class="value afterValue">92</div>
            <div class="unit">SpO2%</div>
          </div>
        </div>
      </div>

      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/breathSmall.svg" alt="" />
          <h3>呼吸</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">95</div>
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
            <div class="value afterValue">92</div>
            <div class="unit">bpm</div>
          </div>
        </div>
      </div>

      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/pressureSmall.svg" alt="" />
          <h3>壓力</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">低</div>
            <div class="unit">low</div>
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
            <div class="value afterValue">高</div>
            <div class="unit">height</div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="boxGroup">
        <div class="titleGroup">
          <h3>交感/副交感比例</h3>
        </div>
        <div class="boxText">
          <div class="text-container-PLF">
            <h4>交感神經</h4>
            <div class="value">60</div>
          </div>
          <div class="text-container-PHF">
            <h4>副交感神經</h4>
            <div class="value">40</div>
          </div>
        </div>
        <div class="box">
          <div class="circle-PLF"></div>
          <div class="circle-PHF"></div>
        </div>
      </div>
      <svg style="display: none">
        <defs>
          <filter id="blob">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            ></feGaussianBlur>
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="
                     1 0 0 0 0
                     0 1 0 0 0
                     0 0 1 0 0
                     0 0 0 20 -10"
            ></feColorMatrix>
          </filter>
        </defs>
      </svg>
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
    gap: 3%;
    overflow-x: auto;
    width: max-content;
    width: 100%;
    margin-top: 1rem;
    white-space: nowrap;
    .BACard {
      background-color: #fff;
      width: 80%;
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
        gap: 10px;
        .BA {
          .subTitle {
            color: #666;
            margin-top: 0.25rem;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 1.25;
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
      width: 160px;
    }
  }

  .boxGroup {
    display: grid;
    place-items: center;
    gap: 0.75rem;
    background-color: #fff;
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.5rem;
  }

  .boxGroup h3 {
    color: #1e1e1e;
  }

  .box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    grid-column: 1/2;
    grid-row: 2;
    filter: url(#blob);
    width: 100%;
    height: 200px;
  }

  .circle-PHF,
  .circle-PLF {
    position: relative;
    border-radius: 50%;
    width: 100px;
    height: 100px;
    filter: drop-shadow(0px 3px 5px #fff) brightness(1.06);
  }

  .boxGroup {
    position: relative;
    height: 100%;
  }

  .boxText {
    display: flex;
    align-items: center;
    justify-content: center;
    grid-column: 1/2;
    grid-row: 2;
    width: 100%;
    height: 200px;
    z-index: 2;
  }

  .text-container-PLF {
    text-align: center;
    color: #fff;
    animation: 1.5s moveRight forwards ease-out;
  }

  .text-container-PHF {
    text-align: center;
    color: #fff;
    animation: 1.75s moveLeft forwards ease-out;
  }

  .boxText h4 {
    margin: 0;
  }

  .circle-PLF {
    background-color: rgba(236, 79, 79, 0.75);
    animation: 1.5s moveRight forwards ease-out;
  }

  .circle-PHF {
    background-color: rgba(31, 188, 179, 0.75);
    animation: 1.75s moveLeft forwards ease-out;
  }

  .text-container-PLF .value,
  .text-container-PHF .value {
    font-size: 24px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.12px;
  }

  @keyframes moveLeft {
    0% {
      left: -50px;
    }

    50% {
      left: -25px;
    }

    70% {
      left: -36px;
    }

    100% {
      left: 0;
    }
  }

  @keyframes moveRight {
    0% {
      left: 50px;
    }

    50% {
      left: 25px;
    }

    70% {
      left: 36px;
    }

    100% {
      left: 0;
    }
  }
}
</style>
