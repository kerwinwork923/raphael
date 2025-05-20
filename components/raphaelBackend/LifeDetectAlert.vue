<template>
  <div class="lifeDetectAlert">
    <div class="lifeDetectAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>Steven Yeh</h3>
      <h4>Contract History</h4>
    </div>
    <div class="lifeDetectAlertTitleHR"></div>
        <div class="lifeDetectAlertTitleContent1Group">
      <div class="lifeDetectAlertTitleContent1TitleGroup">
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
  </div>
</template>

<script setup></script>

<style scoped lang="scss">
.lifeDetectAlert {
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
  .lifeDetectAlertTitleGroup {
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
  .lifeDetectAlertTitleHR {
    background: var(--Primary-200, #b1c0d8);
    width: 100%;
    height: 1px;
  }
}
</style>
