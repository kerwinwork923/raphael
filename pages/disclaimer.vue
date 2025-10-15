<template>
  <div class="disclaimer">
    <div class="disclaimerWrap">
      <TitleMenu Text="免責聲明" link="/member" positionType="sticky" />
      <h3>智平衡AI穿戴紀錄系統免責聲明</h3>
      <p>
        本APP所提供的
        <span class="pointBoldRed">Face AI 非接觸式人臉HRV量測技術（rPPG）</span
        >，其所有數據僅供個人健康參考之用，<span class="pointBold"
          >非醫療診斷工具，</span
        >無法取代專業醫師的診斷、治療或醫療建議。
      </p>
      <p>
        APP內顯示的生理或心理狀態測量數據，包括<span class="pointBold"
          >自律神經平衡、生理疲勞、心情指北針、血壓氣球</span
        >等資訊，僅供使用者一般健康管理參考。這些數據或建議並非醫療用途，亦不能作為任何疾病的診斷、治療或預防依據。
      </p>
      <h4>重要提醒</h4>
      <ul>
        <li>
          本系統所有測量結果，皆依據Face AI自有演算法推估，<span
            class="pointBold"
            >不提供任何明示或暗示的醫療保證</span
          >，也無法保證其準確性、完整性、可用性或適用性
        </li>
        <li>使用本APP不會產生醫師與病患、治療師與病患或其他醫療專業關係</li>
        <li>
          如有身體不適、慢性病或疑似異常症狀，<span class="pointBold"
            >請勿僅依據本APP數據自行判斷或調整藥物</span
          >，應即時諮詢合格醫師或相關醫療專業人員
        </li>
        <li>
          本系統記錄之穿戴保健衣的時間、頻率及健康數據，僅供個人健康管理與醫師參考，不具醫療證據效力。
        </li>
        <li>
          智平衡健康集團及本APP團隊<span class="pointBold"
            >不對數據誤用或依據數據自行處置導致的任何後果負責</span
          >。
        </li>
        <li>相關測量數據亦將用於系統AI演算法優化，不涉及個資公開。</li>
      </ul>
      <h4>使用建議</h4>
      <ul>
        <li>
          單次量測僅需約20-30秒，建議於光線充足、安靜無干擾環境下，臉部正對鏡頭且保持穩定不動、不交談、不憋氣或深呼吸時進行。
        </li>
        <li>數據僅作為健康自我關懷的輔助參考，不作任何醫療用途。</li>
      </ul>
      <p class="pointBold">
        如有健康疑慮，請立即洽詢您的醫師或當地醫療機構。本APP服務不應被視為醫療設備或醫療行為之替代品。
      </p>
      <p class="pointBold">
        智平衡健康集團秉持「無藥、無害、根本調節」核心理念，致力於推動預防醫學與個人化健康管理。所有產品與服務均以促進日常健康生活為出發點，並持續強化AI技術應用與個人化照護服務，守護您的健康每一天。
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.disclaimer {
  @include gradientBg();
  min-height: 100vh;
  width: 100%;
  line-height: 29.124px;

  .disclaimerWrap {
    width: 100%;
    max-width: 768px;
    margin: auto;
    padding: 0.5rem 1rem;
    .titleMenu {
      background: transparent;
      backdrop-filter: blur(10px);
      &:deep > div {
        display: flex;
      }
    }
  }

  h3 {
    color: var(--Neutral-500, #666);
    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 0.09px;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  p {
    color: var(--Neutral-500, #666);

    font-size: 18px;
    font-style: normal;

    line-height: 29.124px;
    letter-spacing: 0.09px;
    padding-bottom: 0.75rem;
  }
  .pointBoldRed {
    color: var(--Warning-default, #ec4f4f);
    font-weight: 700;
  }
  .pointBold {
    font-weight: bold;
  }
  h4 {
    color: var(--Neutral-500, #666);

    font-size: 18px;
    font-style: normal;
    font-weight: 700;
    line-height: 29.124px;
    letter-spacing: 0.09px;
  }
  ul {
    li {
      color: var(--Neutral-500, #666);
      font-family: "Noto Sans";
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 29.124px;
      letter-spacing: 0.09px;
      list-style-type: disc;
      margin-left: 1.5rem;
    }
    margin-bottom: 0.25rem;
  }
}
</style>
