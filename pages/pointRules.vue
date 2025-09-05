<template>
  <div class="pointRules">
   
    <div class="pointRulesContent">
        <TitleMenu Text="積分規則" link="/point"></TitleMenu>
      <div class="pointRulesInfo">
        <div class="pointRule">
          <h3>雲端會員</h3>
          <p>每消費100元獲得1點積分</p>
        </div>
        <div class="pointRule">
          <h3>銀卡會員</h3>
          <p>每消費100元獲得1點積分</p>
        </div>
        <div class="pointRule">
          <h3>金卡會員</h3>
          <p>每消費100元獲得1.2點積分</p>
        </div>
        <div class="pointRule">
          <h3>鈦金會員</h3>
          <p>每消費100元獲得1.5點積分</p>
        </div>
        <div class="pointRule">
          <h3>使用範圍</h3>
          <p>積分僅限於此平台使用</p>
        </div>
        <div class="pointRule">
          <h3>有效範圍</h3>
          <p>
            積分
            <span class="pointRuleSpan">自獲得日起12個月內</span>
            有效，請及時使用
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TitleMenu from "../components/TitleMenu.vue";
</script>

<style lang="scss">
.pointRules {
  @include gradientBg();
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;

  .titleMenu {
    margin-bottom: 1rem;
  }

  .pointRulesContent {
    padding: 0 1rem;

    .pointRulesInfo {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      // 基本進場動畫
      .pointRule {
        display: flex;
        flex-direction: column;
        border-radius: var(--Radius-r-20, 20px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        padding: 1rem;

        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease forwards;
        //間隔0.1秒
        &:nth-child(1) {
          animation-delay: 0.1s;
        }
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.3s;
        }
        &:nth-child(4) {
          animation-delay: 0.4s;
        }
        &:nth-child(5) {
          animation-delay: 0.5s;
        }
        &:nth-child(6) {
          animation-delay: 0.6s;
        }
      }

      h3 {
        color: var(--Neutral-black, #1e1e1e);
        font-size: var(--Text-font-size-20, 20px);
        font-weight: 400;
        letter-spacing: 0.1px;
      }

      p {
        margin-top: 0.5rem;
        color: var(--Neutral-500, #666);
        font-size: var(--Text-font-size-18, 18px);
        font-weight: 400;
        letter-spacing: 0.072px;
      }

      .pointRuleSpan {
        color: #ec4f4f;
      }
    }
  }
}

/* 把 keyframes 放在最外層 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
