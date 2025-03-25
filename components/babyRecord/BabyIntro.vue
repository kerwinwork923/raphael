<template>
  <div class="ANSGroup">
    <h4>寶貝紀錄量表</h4>
    <div class="desCard">
      <div class="slogan">
        寶貝紀錄幫助醫師了解孩子的成長以利做最有效率的調整，
        涵蓋專注力、情緒、動作與語言發展等指標
      </div>
      <ul>
        <li>掌握孩子的成長狀況</li>
        <li>早期發現問題並提供支持</li>
        <li>記錄每個階段的點滴變化</li>
      </ul>
    </div>

    <div class="stepCard">
      <div class="item">
        <div class="icon">
          <img src="/assets/imgs/brain-white.svg" />
        </div>
        <div class="content">
          <hgroup>
            <sub>Step 1</sub>
            <h3>六大指標</h3>
          </hgroup>
          <div class="text">
            請先選擇以下六個指標，以便我們更精確地了解您的需求
          </div>
        </div>
      </div>
      <div class="item">
        <div class="icon">
          <img src="/assets/imgs/heartRate-white.svg" />
        </div>
        <div class="content">
          <hgroup>
            <sub>Step 2</sub>
            <h3>症狀評估</h3>
          </hgroup>
          <div class="text">依當下感覺逐題評估，填寫每項症狀的嚴重程度</div>
        </div>
      </div>
      <div class="item">
        <div class="icon">
          <img src="/assets/imgs/choose-white.svg" />
        </div>
        <div class="content">
          <hgroup>
            <sub>Step 3</sub>
            <h3>頻率記錄</h3>
          </hgroup>
          <div class="text">針對困擾您的症狀，填寫每週發生的頻率</div>
        </div>
      </div>
      <div class="item">
        <div class="icon">
          <img src="/assets/imgs/brain-white.svg" />
        </div>
        <div class="content">
          <hgroup>
            <sub>Step 4</sub>
            <h3>重點標記</h3>
          </hgroup>
          <div class="text">挑選 3-10項 您目前最困擾的症狀</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BabyIntro",
};
</script>

<style lang="scss">
/* 量表簡介 (ANSGroup) */
.ANSGroup {
  height: calc(100vh - 207px);
  margin-top: 1rem;
  padding-bottom: 0.75rem;
  overflow-y: auto;

  h4 {
    color: $raphael-black; 
    font-size: 20px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: 0.15px;
    margin: 0;
  }
  .desCard {
    display: grid;
    gap: 0.5rem;
    background: $raphael-white;
    color: $raphael-gray-500;
    border-radius: 0.5rem;
    margin: 0.75rem 0;
    padding: 0.75rem;
    font-size: 1.125rem;
    line-height: 1.4;
    letter-spacing: 0.05em;
  }
  .stepCard {
    position: relative;
    display: grid;
    gap: 0.75rem;
    font-size: 1.125rem;
    color: $raphael-gray-500; /* $raphael-gray-500 */
    line-height: 1.4;
    letter-spacing: 0.05em;

    &::after {
      content: "";
      position: absolute;
      background: $raphael-white;
      width: 4px;
      height: 100%;
      border-radius: 0.5rem;
      box-shadow: inset 0px 0px 2px 0px rgba(0, 0, 0, 0.25);
      left: 15px;
    }
    .item {
      display: flex;
      gap: 0.5rem;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        background: $raphael-cyan-400; 
        border-radius: 50%;
        padding: 4px;
        height: 32px;
        min-width: 32px;
        z-index: 1;
        img {
          width: 24px;
          height: 24px;
        }
      }
      .content {
        display: grid;
        background: #ffffff;
        border-radius: 0.5rem;
        width: 100%;
        gap: 0.5rem;
        padding: 0.75rem;
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        & > hgroup {
          display: flex;
          flex-direction: column;
          & > sub {
            color: $raphael-cyan-400;
            font-size: 0.813rem;
            line-height: 100%;
          }
          & > h3 {
            color: $raphael-black;
            font-size: 1.25rem;
          }
        }
      }
    }
  }
}
</style>
