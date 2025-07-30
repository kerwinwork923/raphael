<template>
  <div class="HRVUserAlert">
    <div class="HRVUserAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>Steven Yeh</h3>
      <h4>Contract History</h4>
    </div>
    <div class="HRVUserAlertHR"></div>

    <div class="HRVUserAlertContent1">
      <div class="HRVUserAlertContent1Card">
        <h3>生理年齡</h3>
        <div class="value">{{ age }}</div>
        <div class="info">years old</div>
      </div>
      <div class="HRVUserAlertContent1Card">
        <h3>HRV</h3>
        <div class="value">{{ hrv }}</div>
        <div class="info">ms</div>
      </div>
      <div class="HRVUserAlertContent1Card">
        <h3>心律變異性</h3>
        <div class="value">{{ hr }}</div>
        <div class="info">bpm</div>
      </div>
      <div class="HRVUserAlertContent1Card">
        <h3>血壓</h3>
        <div class="value">{{ bp }}</div>
        <div class="info">mmHg</div>
      </div>
      <div class="HRVUserAlertContent1Card">
        <h3>血氧</h3>
        <div class="value">{{ spo2 }}</div>
        <div class="info">SpO₂%</div>
      </div>
      <div class="HRVUserAlertContent1Card">
        <h3>呼吸</h3>
        <div class="value">{{ rr }}</div>
        <div class="info">bpm</div>
      </div>
      <div class="HRVUserAlertContent1Card">
        <h3>壓力</h3>
        <div class="value">{{ stressLvl }}</div>
        <div class="info">{{ getPressureLevel(stressLvl) }}</div>
      </div>
    </div>
    <div class="HRVUserAlertContent2">
      <div class="title">
        <h3>交感/副交感比例</h3>
      </div>
      <div class="percent-group">
        <span class="sym">{{ plfPercent }}%</span>
        <span class="parasym">{{ phfPercent }}%</span>
      </div>

      <div class="bar">
        <div class="sym-fill" :style="{ width: plfPercent + '%' }"></div>
        <div class="parasym-fill" :style="{ width: phfPercent + '%' }"></div>
      </div>

      <div class="legend">
        <span class="dot sym-dot"></span> 交感神經
        <span class="dot parasym-dot"></span> 副交感神經
      </div>
    </div>
    <div class="HRVUserAlertContent3">
      <h3>其他健康數據分析</h3>
      <div class="HRVUserAlertContent3Group">
        <div class="HRVUserAlertContent3Content">
          <div class="HRVUserAlertContent3ContentTitle">
            <img src="/assets/imgs/backend/target.svg" alt="" />
            健康力
          </div>
          <div class="HRVUserAlertContent3ContentValue">{{ Health }}</div>
          <div class="HRVUserAlertContent3ContentTag good">
            {{ getTagText(Health) }}
          </div>
        </div>
        <div class="HRVUserAlertContent3Content">
          <div class="HRVUserAlertContent3ContentTitle">
            <img src="/assets/imgs/backend/target.svg" alt="" />
            睡眠力
          </div>
          <div class="HRVUserAlertContent3ContentValue">{{ Sleep }}</div>
          <div class="HRVUserAlertContent3ContentTag good">
            {{ getTagText(Sleep) }}
          </div>
        </div>
        <div class="HRVUserAlertContent3Content">
          <div class="HRVUserAlertContent3ContentTitle">
            <img src="/assets/imgs/backend/target.svg" alt="" />
            代謝力
          </div>
          <div class="HRVUserAlertContent3ContentValue">{{ Metabolism }}</div>
          <div class="HRVUserAlertContent3ContentTag Normal">
            {{ getTagText(Metabolism) }}
          </div>
        </div>
        <div class="HRVUserAlertContent3Content">
          <div class="HRVUserAlertContent3ContentTitle">
            <img src="/assets/imgs/backend/target.svg" alt="" />
            平衡力
          </div>
          <div class="HRVUserAlertContent3ContentValue">{{ Equilibrium }}</div>
          <div class="HRVUserAlertContent3ContentTag Normal">
            {{ getTagText(Equilibrium) }}
          </div>
        </div>
        <div class="HRVUserAlertContent3Content">
          <div class="HRVUserAlertContent3ContentTitle">
            <img src="/assets/imgs/backend/target.svg" alt="" />
            活動力
          </div>
          <div class="HRVUserAlertContent3ContentValue">{{ Activity }}</div>
          <div class="HRVUserAlertContent3ContentTag Poor">
            {{ getTagText(Activity) }}
          </div>
        </div>
        <div class="HRVUserAlertContent3Content">
          <div class="HRVUserAlertContent3ContentTitle">
            <img src="/assets/imgs/backend/target.svg" alt="" />
            放鬆力
          </div>
          <div class="HRVUserAlertContent3ContentValue">{{ Relaxation }}</div>
          <div class="HRVUserAlertContent3ContentTag Poor">
            {{ getTagText(Relaxatio) }}
          </div>
        </div>
      </div>
    </div>
    <div class="HRVUserAlertContent4">
      <h3>根據您的神經系統數據分析</h3>
      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo incidunt
        dicta quos consequuntur expedita quibusdam placeat voluptatibus
        consequatur quod nesciunt? Dolorem tempore illum laudantium aperiam
        facere inventore! Pariatur, quam illum?
      </p>
    </div>
    <div class="HRVUserAlertClose" @click="$emit('close')">
      <img src="/assets/imgs/backend/close.svg" alt="關閉" />
    </div>
  </div>
</template>
<script setup lang="ts">
/* ---------- props ---------- */
const props = defineProps<{
  record: any; // 直接整筆 HRV 紀錄
}>();
defineEmits(["close"]);

/* ---------- 小工具 ---------- */
const toInt = (v: any) => (v === "" ? "—" : parseInt(v, 10));

// 壓力等級轉換
const getPressureLevel = (stress: string | undefined) => {
  if (stress === "低") return "low";
  if (stress === "平") return "middle";
  if (stress === "高") return "high";
  return "—";
};

/* ---------- 映射 ---------- */
const age = computed(() => toInt(props.record?.bioage));
const hrv = computed(() => toInt(props.record?.HRV));

const hr = computed(() => toInt(props.record?.HR));
const Activity = computed(() => toInt(props.record?.Activity));
const Equilibrium = computed(() => toInt(props.record?.Equilibrium));
const Health = computed(() => toInt(props.record?.Health));
const Metabolism = computed(() => toInt(props.record?.Metabolism));
const Relaxation = computed(() => toInt(props.record?.Relaxation));
const Sleep = computed(() => toInt(props.record?.Sleep));

const bp = computed(() =>
  props.record?.SBP && props.record?.DBP
    ? `${props.record.SBP}/${props.record.DBP}`
    : "—"
);
const spo2 = computed(() => toInt(props.record?.SPO2));
const rr = computed(() => toInt(props.record?.rr));
const stressLvl = computed(() => props.record?.stress ?? "—");

const plf = computed(() => Number(props.record?.PLF ?? 0));
const phf = computed(() => Number(props.record?.PHF ?? 0));

// 避免總和為 0（會 NaN）
const totalPower = computed(() => plf.value + phf.value || 1);

// 百分比（比例條 + 百分比文字）
const plfPercent = computed(() =>
  ((plf.value / totalPower.value) * 100).toFixed(0)
);
const phfPercent = computed(() =>
  ((phf.value / totalPower.value) * 100).toFixed(0)
);

const getTagClass = (value: number) => {
  if (value >= 5) return "good";
  if (value >= 3) return "Normal";
  return "Poor";
};

const getTagText = (value: number) => {
  if (value >= 5) return "Good";
  if (value >= 3) return "Normal";
  return "Poor";
};

const snsRatio = computed(() => Math.abs(props.record?.SNS ?? 0) * 100); // 0~1 → 0 % – 100 %
</script>

<style scoped lang="scss">
.HRVUserAlert {
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
  padding: 1rem;
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
  .HRVUserAlertTitleGroup {
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
      font-size: 1.125rem
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
    }
  }
  .HRVUserAlertHR {
    background: $primary-200;
    width: 100%;
    height: 1px;
  }
  .HRVUserAlertContent1 {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 0.75rem;
    @include respond-to("md") {
      flex-wrap: wrap;
    }
    .HRVUserAlertContent1Card {
      border-radius: var(--Radius-r-20, 20px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
      padding: 0.75rem;
      width: 100%;
      @include respond-to("md") {
        width: 48%;
      }
      @include respond-to("sm") {
        width: 100%;
      }
      h3 {
        color: var(--Primary-600, #2d3047);
        font-size: var(--Text-font-size-20, 20px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
        @include respond-to("md") {
          font-size: 1rem;
        }
      }
      .value {
        color: var(--Primary-600, #2d3047);
        margin-top: 0.5rem;
        font-size: var(--Text-font-size-24, 24px);
        font-style: normal;
        font-weight: 700;

        letter-spacing: 0.12px;
      }
      .info {
        color: $primary-200

        font-size: var(--Text-font-size-14, 14px);
        font-style: normal;
        font-weight: 400;

        letter-spacing: 0.07px;
        margin-top: 0.25rem;
      }
    }
  }
  .HRVUserAlertContent2 {
    border-radius: 20px;
    background: #fff;
    padding: 1rem;
    margin-top: 1rem;
    box-shadow: 0px 2px 20px rgba(177, 192, 216, 0.25);

    .title {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.5rem;

      h3 {
        color: #2d3047;
        font-size: 18px;
      }
    }
    .percent-group {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
      .sym {
        color: #e57373; // 紅
        font-weight: bold;
      }
      .parasym {
        color: #1ba39b; // 綠
        font-weight: bold;
      }
    }
    .bar {
      position: relative;
      display: flex;
      height: 14px;
      border-radius: 10px;
      overflow: hidden;
      background: #e0e0e0; // 背景底色（也可移除）

      .sym-fill {
        background: #ec4f4f;
        height: 100%;
        transition: width 0.3s ease;
      }

      .parasym-fill {
        background: #1ba39b;
        height: 100%;
        transition: width 0.3s ease;
      }
    }

    .legend {
      margin-top: 0.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2px;
      font-size: 14px;
      color: #666;
      .dot {
        width: 8px;
        height: 8px;
        display: inline-block;
        border-radius: 50%;
        margin: 0;
        margin-left: 4px;
      }
      .sym-dot {
        background: #e57373;
      }
      .parasym-dot {
        background: #1ba39b;
      }
    }
  }
  .HRVUserAlertContent3 {
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    padding: 1rem;
    margin-top: 1rem;
    h3 {
      color: var(--Primary-600, #2d3047);

      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 20px */
      letter-spacing: 0.1px;
    }
    .HRVUserAlertContent3Group {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      .HRVUserAlertContent3Content {
        flex: 1;
        @include respond-to("lg") {
          flex: unset;
          width: 48%;
        }
        @include respond-to("md") {
          width: 100%;
        }
      }
      .HRVUserAlertContent3ContentTitle {
        display: flex;
        gap: 2px;
        color: $primary-200
        text-align: center;
        font-size: var(--Text-font-size-20, 18px);
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
        margin-top: 0.5rem;
      }
      .HRVUserAlertContent3ContentValue {
        color: var(--Primary-600, #2d3047);
        font-size: var(--Text-font-size-24, 24px);
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.12px;
        margin-top: 0.5rem;
      }
      .HRVUserAlertContent3ContentTag {
        border-radius: var(--Radius-r-50, 50px);
        border: 1px solid var(--Secondary-default, #74bc1f);
        background: var(--secondary-400-opacity-10, rgba(116, 188, 31, 0.1));
        color: var(--Secondary-default, #74bc1f);
        font-size: 1rem;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.08px;
        text-align: center;
        padding: 4px;
        margin-top: 0.35rem;
      }
      .Normal {
        color: var(--Primary-default, #1ba39b);
        border: 1px solid var(--Primary-default, #1ba39b);
        background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
      }
      .Poor {
        color: var(--Primary-default, #ec4f4f);
        border: 1px solid var(--Primary-default, #ec4f4f);
        background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
      }
    }
  }
  .HRVUserAlertContent4 {
    padding: 1rem;
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    margin-top: 1rem;
    h3 {
      color: var(--Primary-600, #2d3047);
      font-family: "Noto Sans";
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.1px;
    }
    p {
      color: var(--Primary-300, #6d8ab6);
      font-family: "Noto Sans";
      font-size: 1rem;
      font-style: normal;
      font-weight: 400;
      line-height: var(--lineHeight-line-height-16, 25.888px); /* 161.8% */
      letter-spacing: 2.4px;
      margin-top: 0.5rem;
    }
  }
  .HRVUserAlertClose {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 101;
    img {
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
      padding: 0.25rem;
      cursor: pointer;
      &:hover {
        box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
      }
    }
  }
}
</style>
