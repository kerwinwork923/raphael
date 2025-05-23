<template>
  <div class="babyRecordAlert">
    <div class="babyRecordAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>2024/10/10 12:00</h3>
      <h4>Detection Time</h4>
    </div>
    <div class="babyRecordAlertTitleHR"></div>
    <div class="babyRecordAlertContent1Group">
      <div class="babyRecordAlertContent1TitleGroup">
        <h5>總分</h5>
        <h6>
          <img src="/assets/imgs/backend/down.svg" alt="" />
          45.2%
        </h6>
      </div>
      <h3>85</h3>
      <h4>83.5%(嚴重失調)</h4>
      <ProgressBar3 :score="100" />
    </div>

    <div class="babyRecordAlertContent3Group">

      <div class="babyRecordAlertContent3">
        <div class="babyRecordAlertContentTitle">
          <h3>粗大動作</h3>
          <div class="scoreGroup down">
            <h6>12.3%</h6>
            <img src="/assets/imgs/backend/down.svg" alt="" />
          </div>
        </div>
        <div class="value">10.5%</div>
        <small>優秀表現</small>
      </div>
      <div class="babyRecordAlertContent3">
        <div class="babyRecordAlertContentTitle">
          <h3>精細動作</h3>
          <div class="scoreGroup up">
            <h6>4.5%</h6>
            <img src="/assets/imgs/backend/up.svg" alt="" />
          </div>
        </div>
        <div class="value">50.3%</div>
        <small>基礎能力</small>
      </div>
      <div class="babyRecordAlertContent3">
        <div class="babyRecordAlertContentTitle">
          <h3>語言認知</h3>
          <div class="scoreGroup down">
            <h6>40.3%</h6>
            <img src="/assets/imgs/backend/down.svg" alt="" />
          </div>
        </div>
        <div class="value">50.3%</div>
        <small>需要加強</small>
      </div>
      <div class="babyRecordAlertContent3">
        <div class="babyRecordAlertContentTitle">
          <h3>注意力</h3>
          <div class="scoreGroup down">
            <h6>32.5%</h6>
            <img src="/assets/imgs/backend/down.svg" alt="" />
          </div>
        </div>
        <div class="value">20.3%</div>
        <small>基礎能力</small>
      </div>
      <div class="babyRecordAlertContent3">
        <div class="babyRecordAlertContentTitle">
          <h3>好動指標</h3>
          <div class="scoreGroup up">
            <h6>10.5%</h6>
            <img src="/assets/imgs/backend/up.svg" alt="" />
          </div>
        </div>
        <div class="value">10.3%</div>
        <small>需要加強</small>
      </div>
      <div class="babyRecordAlertContent3">
        <div class="babyRecordAlertContentTitle">
          <h3>壓力指數</h3>
          <div class="scoreGroup down">
            <h6>10.5%</h6>
            <img src="/assets/imgs/backend/down.svg" alt="" />
          </div>
        </div>
        <div class="value">50.3%</div>
        <small>優秀表現</small>
      </div>
    </div>
    <div class="babyRecordAlertClose">
      <img src="/assets/imgs/backend/close.svg" alt="" />
    </div>
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
.babyRecordAlert {
  position: fixed;

  width: 80%;
  max-width: 1000px;
  left: 50%;
  top: 48.5%;
  max-height: 85%;
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
  .babyRecordAlertTitleGroup {
    text-align: center;
    margin-bottom: 0.75rem;
    .HRVUserAlertHR {
      background: var(--Primary-200, #b1c0d8);
      width: 100%;
      height: 1px;
    }
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
  .babyRecordAlertTitleHR {
    background: var(--Primary-200, #b1c0d8);
    width: 100%;
    height: 1px;
  }
  .babyRecordAlertContent1Group {
    margin-top: 0.5rem;
    border-radius: 20px;
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
    padding: 1rem;
    .babyRecordAlertContent1TitleGroup {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h5 {
      color: var(--Primary-600, #2d3047);

      font-size: 20px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    h6 {
      color: var(--Secondary-default, #74bc1f);
      text-align: center;

      font-size: 16px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .AutonomicNerveAlertContent1TitleGroup {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }
    h3 {
      color: var(--Primary-600, #2d3047);
      font-family: "Noto Sans";
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 24px */
      letter-spacing: 0.12px;
      margin-top: 0.25rem;
    }
    h4 {
      color: var(--Primary-200, #b1c0d8);

      font-size: 14px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.1px;
    }
  }

  .babyRecordAlertContent3Group {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    .babyRecordAlertContent3 {
      background-color: #fff;
      margin-top: 0.5rem;
      border-radius: 20px;
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
      padding: 1rem;
      width: 49%;
    }
    .babyRecordAlertContentTitle {
      display: flex;
      justify-content: space-between;
      color: var(--Warning-default, #ec4f4f);
      text-align: center;
      font-family: "Noto Sans";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    h3 {
      color: var(--Primary-600, #2d3047);
      font-family: "Noto Sans";
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    .scoreGroup {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .down {
      color: #74bc1f;
    }
    .value {
      color: var(--Primary-600, #2d3047);
      font-size: 24px;
      font-style: normal;
      font-weight: 700;
      letter-spacing: 0.12px;
      margin-top: 0.5rem;
    }
    small {
      color: var(--Primary-200, #b1c0d8);
      font-family: "Noto Sans";
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.1px;
    }
  }
  .babyRecordAlertContent3:nth-last-child(1):nth-child(odd) {
  width: 100%;
}

  .babyRecordAlertClose {
    text-align: center;
    margin-top: 0.5rem;
    cursor: pointer;
    img {
      padding: 4px;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    }
  }
}
</style>
