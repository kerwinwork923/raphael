<template>
  <div class="ContractUserAlert">
    <div class="ContractUserAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>Steven Yeh</h3>
      <h4>Contract History</h4>
    </div>
    <div class="ContractUserAlertHR"></div>
    <div class="ContractUserAlertSubTitleGroup">
      <div class="ContractUserAlertSubTitle">
        <h6>總消費金額 100,000,000 <span> 共 3 個合約</span></h6>
      </div>
      <VueDatePicker
        range
        class="ContractUserAlertSubDate"
        :enable-time-picker="false"
        :format="'yyyy/MM/dd'"
        placeholder="註冊日期區間"
        prepend-icon="i-calendar"
      />
    </div>
    <div class="ContractUserAlertProgressGroup">
      <div class="ContractUserAlertProgressTitle">
        <h5>2024</h5>
        <h6>7個合約</h6>
      </div>
      <!-- 加入進度條 -->
      <div class="progress-bar">
        <div class="progress-bar-inner" :style="{ width: '30%' }"></div>
      </div>
      <div class="more">
        查看更多
        <img src="/assets/imgs/backend/dropdown2.svg" alt="" />
      </div>
    </div>
    <div class="ContractUserAlertContent" v-for="i in 3" :key="i">
      <h3>居家治療儀</h3>
      <div class="ContractUserAlertContentList">
        <h4><img src="/assets/imgs/backend/money.svg" alt="" />消費金額</h4>
        <h5>90,000</h5>
      </div>
      <div class="ContractUserAlertContentList">
        <h4><img src="/assets/imgs/backend/time.svg" alt="" />開始時間</h4>
        <h5>2024/10/10 12:00</h5>
      </div>
      <div class="ContractUserAlertContentList">
        <h4><img src="/assets/imgs/backend/time.svg" alt="" />結束時間</h4>
        <h5>2025/10/10 12:00</h5>
      </div>
    </div>
    <div class="closeBtnGroup">
      <img class="closeBtn" src="/assets/imgs/backend/close.svg" alt="" />
    </div>
  </div>
</template>

<style scope lang="scss">
.ContractUserAlert {
  position: fixed;
  width: 80%;
  max-width: 1000px;
  left: 50%;
  top: 50%;
  max-height: 90%;
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

  .ContractUserAlertHR {
    background: var(--Primary-200, #b1c0d8);
    width: 100%;
    height: 1px;
  }
  .ContractUserAlertTitleGroup {
    text-align: center;

    margin-bottom: 0.75rem;
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
  .ContractUserAlertSubTitleGroup {
    display: flex;
    margin-top: 0.5rem;
    justify-content: space-between;
    align-items: center;
    .ContractUserAlertSubTitle {
      display: flex;
    }
    .ContractUserAlertSubDate {
      width: 40%;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
    }
  }
  .ContractUserAlertProgressGroup {
    margin-top: 12px;
    padding: 12px 16px;
    border-radius: 20px;
    background: #fff;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);

    .ContractUserAlertProgressTitle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      h5 {
        color: var(--Primary-600, #2d3047);
        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 18px */
        letter-spacing: 2.7px;
      }
      h6 {
        color: var(--Primary-default, #1ba39b);
        text-align: center;

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;

        letter-spacing: 2.7px;
      }
    }

    .progress-bar {
      width: 100%;
      height: 6px;
      background: #fff;

      overflow: hidden;
      margin-bottom: 10px;
      border-radius: 50px;
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.25) inset;
    }

    .progress-bar-inner {
      height: 100%;
      background: #1ba39b;
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .more {
      color: var(--Primary-300, #6d8ab6);

      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.09px;
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
      text-align: center;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 24px;
      }
    }
  }
  .ContractUserAlertContent {
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    padding: 0.5rem 1rem;
    margin-top: 0.75rem;
    h3 {
      color: var(--Primary-600, #2d3047);

      font-size: var(--Text-font-size-24, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 24px */
      letter-spacing: 0.12px;
    }
    .ContractUserAlertContentList {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.5rem;
      h4 {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--Primary-200, #b1c0d8);

        font-size: var(--Text-font-size-18, 18px);
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 18px */
        letter-spacing: 0.09px;
      }
    }
  }
  .closeBtnGroup {
    text-align: center;
    margin-top: 0.5rem;
    .closeBtn {
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
      padding: 0.25rem;
      cursor: pointer;
    }
  }
}
</style>
