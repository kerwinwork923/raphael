<template>
  <div class="lifeDetectAlert">
    <div class="lifeDetectAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>{{ props.record?.CheckTime ?? "—" }}</h3>
      <!-- <h4>{{ props.record?.SleepProperty ?? "—" }}</h4> -->
      <h4>生活檢測紀錄</h4>      
    </div>
    <div class="lifeDetectAlertTitleHR"></div>
    <div class="lifeDetectAlertContent1Group">
      <div class="lifeDetectAlertContent1TitleGroup">
        <h5>總分</h5>
        <h6>
          <img src="/assets/imgs/backend/down.svg" alt="" />
          {{ props.record?.HMindexRatio ?? "—" }}%
        </h6>
      </div>
      <h3>{{ props.record?.Score ?? "—" }}</h3>
      <h4>{{ props.record?.HMindexDesc ?? "—" }}</h4>
      <ProgressBar3 :score="parseInt(props.record?.HMindexRatio ?? '0')" />
    </div>
    <div class="lifeDetectAlertContent2Group">
      <h3>睡眠周期</h3>
      <div class="lifeDetectAlertContent2">
        <div>
          <h4>
            入睡時間
            <span class="down">
              <img src="/assets/imgs/backend/down.svg" alt="" />
              {{ props.record?.LayTimeToSleep ?? "—" }}
            </span>
          </h4>
          <div class="time">{{ props.record?.bedTime ?? "—" }}</div>
        </div>
        <div>
          <h4>
            睡眠時長
            <span class="up">
              <img src="/assets/imgs/backend/up.svg" alt="" />
              {{ props.record?.ccSleepExact ?? "—" }}
            </span>
          </h4>
          <div class="time">{{ props.record?.ccSleepTime ?? "—" }}</div>
        </div>
        <div>
          <h4>
            離床時間
            <span class="down">
              <img src="/assets/imgs/backend/down.svg" alt="" />
              {{ props.record?.SleepBreak ?? "—" }}min
            </span>
          </h4>
          <div class="time">{{ props.record?.leaveTime ?? "—" }}</div>
        </div>
      </div>
    </div>
    <div class="lifeDetectAlertContent3Group">
      <div class="lifeDetectAlertContent3">
        <div class="lifeDetectAlertContentTitle">
          <h3>身心指數</h3>
          <div class="scoreGroup">
            <h6>{{ props.record?.HMindexRatio ?? "—" }}%</h6>
            <img src="/assets/imgs/backend/up.svg" alt="" />
          </div>
        </div>
        <div class="value">{{ props.record?.HMindex ?? "—" }}</div>
        <small>{{ props.record?.HMindexDesc ?? "—" }}</small>
      </div>
      <div class="lifeDetectAlertContent3">
        <div class="lifeDetectAlertContentTitle">
          <h3>壓力指數</h3>
          <div class="scoreGroup down">
            <h6>{{ props.record?.PressureindexRatio ?? "—" }}%</h6>
            <img src="/assets/imgs/backend/down.svg" alt="" />
          </div>
        </div>
        <div class="value">{{ props.record?.Pressureindex ?? "—" }}</div>
        <small>{{ props.record?.PressureindexDesc ?? "—" }}</small>
      </div>
    </div>
    <div class="lifeDetectAlertClose" @click="$emit('close')">
      <img src="/assets/imgs/backend/close.svg" alt="" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ record: any }>();
defineEmits(["close"]);
</script>

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
  .lifeDetectAlertContent1Group {
    margin-top: 0.5rem;
    border-radius: 20px;
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
    padding: 1rem;
    .lifeDetectAlertContent1TitleGroup {
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
  .lifeDetectAlertContent2Group {
    margin-top: 0.5rem;
    border-radius: 20px;
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
    padding: 1rem;
    h3 {
      color: var(--Primary-600, #2d3047);
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
    }
    .lifeDetectAlertContent2 {
      display: flex;
      justify-content: space-between;
      @include respond-to("md") {
        flex-wrap: wrap;
      }
      div {
        margin-top: 0.5rem;
        h4 {
          color: var(--Primary-200, #b1c0d8);
          text-align: center;
          @include respond-to("md") {
            text-align: left;
          }
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.5px;
          span {
            color: var(--Secondary-default, #74bc1f);
            text-align: center;
            font-family: "Noto Sans";
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%; /* 12px */
            letter-spacing: 0.048px;
          }
          .up {
            color: var(--Warning-default, #ec4f4f);
          }
        }
      }
      .time {
        margin-top: 0.15rem;
        color: var(--Primary-600, #2d3047);

        font-size: 24px;
        font-style: normal;
        font-weight: 700;
        line-height: 100%; /* 24px */
        letter-spacing: 0.12px;
        span {
          color: var(--Primary-200, #b1c0d8);
          text-align: center;

          /* Typography/small-r-14 */
          font-family: "Noto Sans";
          font-size: 14px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%; /* 14px */
          letter-spacing: 0.1px;
        }
      }
    }
  }
  .lifeDetectAlertContent3Group {
    display: flex;
    justify-content: space-between;
    @include respond-to("md") {
      flex-direction: column;
    }
    .lifeDetectAlertContent3 {
      background-color: #fff;
      margin-top: 0.5rem;
      border-radius: 20px;
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
      padding: 1rem;
      width: 49%;
      @include respond-to("md") {
        width: 100%;
      }
    }
    .lifeDetectAlertContentTitle {
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
  .lifeDetectAlertClose {
    text-align: center;
    margin-top: 0.5rem;
    cursor: pointer;
    img {
      padding: 4px;
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));

      &:hover {
        box-shadow: inset 0px 2px 6px rgba(177, 192, 216, 0.75);
      }
    }
  }
}
</style>

<LifeDetectAlert v-if="showLife" :record="selectedLife" @close="closeLife" />
