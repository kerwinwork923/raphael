<template>
  <div class="AutonomicNerveAlert">
    <div class="AutonomicNerveAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>{{ formatDateTime(props.record?.CheckTime) }}</h3>
      <h4>自律神經檢測紀錄</h4>
    </div>
    <div class="AutonomicNerveAlertTitleHR"></div>
    <div class="AutonomicNerveAlertContent1Group">
      <div class="AutonomicNerveAlertContent1TitleGroup">
        <h5>總分</h5>
        <h6>
          <img
            :src="
              props.record?.DiffRatio?.startsWith('-')
                ? '/assets/imgs/backend/down.svg'
                : '/assets/imgs/backend/up.svg'
            "
            alt=""
          />
          {{ props.record?.DiffRatio ?? "—" }}
        </h6>
      </div>
      <h3>{{ props.record?.TotalScore ?? "—" }}</h3>
      <h4>{{ props.record?.TotalDesc ?? "—" }}</h4>
      <ProgressBar3 :score="parseInt(props.record?.TotalRatio ?? '0')" />
    </div>
    <div class="AutonomicNerveAlertContent2Group">
      <h3>想解決的症狀</h3>
      <div class="AutonomicNerveAlertContent">
        <div class="AutonomicNerveAlertItem">
          <h5>今次選擇了</h5>
          <div class="AutonomicNerveAlertTags">
            <div
              v-for="(symptom, index) in props.record?.SolveTheSameList"
              :key="index"
              class="AutonomicNerveAlertTag"
            >
              {{ symptom }}
            </div>
          </div>
        </div>

        <div class="AutonomicNerveAlertItem">
          <h5>與前次相比減少了</h5>
          <div class="AutonomicNerveAlertTags">
            <div
              v-for="(symptom, index) in props.record?.SolveSubtractList"
              :key="index"
              class="AutonomicNerveAlertTag"
            >
              {{ symptom }}
            </div>
          </div>
        </div>

        <div class="AutonomicNerveAlertItem">
          <h5>與前次相比新增了</h5>
          <div class="AutonomicNerveAlertTags">
            <div
              v-for="(symptom, index) in props.record?.SolveAddList"
              :key="index"
              class="AutonomicNerveAlertTag"
            >
              {{ symptom }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="AutonomicNerveAlertContent3Group">
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>精神系統</h3>
          <small
            :class="props.record?.C1Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C1Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C1Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C1Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C1Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C1Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>神經系統</h3>
          <small
            :class="props.record?.C2Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C2Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C2Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C2Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C2Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C2Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>血液循環系統</h3>
          <small
            :class="props.record?.C3Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C3Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C3Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C3Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C3Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C3Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>感官系統</h3>
          <small
            :class="props.record?.C4Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C4Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C4Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C4Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C4Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C4Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>心肺系統</h3>
          <small
            :class="props.record?.C5Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C5Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C5Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C5Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C5Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C5Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>過敏免疫系統</h3>
          <small
            :class="props.record?.C6Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C6Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C6Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C6Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C6Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C6Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>腸胃系統</h3>
          <small
            :class="props.record?.C7Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C7Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C7Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C7Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C7Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C7Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>泌尿生殖系統</h3>
          <small
            :class="props.record?.C8Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C8Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C8Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C8Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C8Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C8Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>血液循環系統</h3>
          <small
            :class="props.record?.C9Difference?.startsWith('-') ? 'down' : 'up'"
          >
            <img
              :src="
                props.record?.C9Difference?.startsWith('-')
                  ? '/assets/imgs/backend/down.svg'
                  : '/assets/imgs/backend/up.svg'
              "
              alt=""
            />
            {{ props.record?.C9Difference ?? "—" }}
          </small>
        </div>

        <div class="value">{{ props.record?.C9Ratio ?? "—" }}</div>
        <h4>{{ props.record?.C9Desc ?? "—" }}</h4>
        <div class="tagsGroup">
          <div
            v-for="(symptom, index) in props.record?.C9Solve"
            :key="index"
            class="tag"
          >
            {{ symptom }}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="HRVUserAlertClose" @click="$emit('close')">
    <img src="/assets/imgs/backend/close.svg" alt="" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import ProgressBar3 from "../ProgressBar3.vue";

const formatDateTime = (str: string) => {
  if (!str || str.length !== 14) return str;
  const year = str.slice(0, 4);
  const month = str.slice(4, 6);
  const day = str.slice(6, 8);
  const hour = str.slice(8, 10);
  const min = str.slice(10, 12);
  return `${year}/${month}/${day} ${hour}:${min}`;
};

const props = defineProps<{
  record: {
    TotalScore?: string;
    TotalDesc?: string;
    TotalRatio?: string;
    DiffScore?: string;
    DiffRatio?: string;
    CheckTime?: string;
    preTotalScore?: string;
    preTotalDesc?: string;
    preTotalRatio?: string;
    preCheckTime?: string;
    SolveTheSameList?: string[];
    SolveAddList?: string[];
    SolveSubtractList?: string[];
    C1Score?: string;
    C1Desc?: string;
    C1Ratio?: string;
    C1Solve?: string[];
    preC1Score?: string;
    preC1Desc?: string;
    preC1Ratio?: string;
    C1Difference?: string;
    C2Score?: string;
    C2Desc?: string;
    C2Ratio?: string;
    C2Solve?: string[];
    preC2Score?: string;
    preC2Desc?: string;
    preC2Ratio?: string;
    C2Difference?: string;
    C3Score?: string;
    C3Desc?: string;
    C3Ratio?: string;
    C3Solve?: string[];
    preC3Score?: string;
    preC3Desc?: string;
    preC3Ratio?: string;
    C3Difference?: string;
    C4Score?: string;
    C4Desc?: string;
    C4Ratio?: string;
    C4Solve?: string[];
    preC4Score?: string;
    preC4Desc?: string;
    preC4Ratio?: string;
    C4Difference?: string;
    C5Score?: string;
    C5Desc?: string;
    C5Ratio?: string;
    C5Solve?: string[];
    preC5Score?: string;
    preC5Desc?: string;
    preC5Ratio?: string;
    C5Difference?: string;
    C6Score?: string;
    C6Desc?: string;
    C6Ratio?: string;
    C6Solve?: string[];
    preC6Score?: string;
    preC6Desc?: string;
    preC6Ratio?: string;
    C6Difference?: string;
    C7Score?: string;
    C7Desc?: string;
    C7Ratio?: string;
    C7Solve?: string[];
    preC7Score?: string;
    preC7Desc?: string;
    preC7Ratio?: string;
    C7Difference?: string;
    C8Score?: string;
    C8Desc?: string;
    C8Ratio?: string;
    C8Solve?: string[];
    preC8Score?: string;
    preC8Desc?: string;
    preC8Ratio?: string;
    C8Difference?: string;
    C9Score?: string;
    C9Desc?: string;
    C9Ratio?: string;
    C9Solve?: string[];
    preC9Score?: string;
    preC9Desc?: string;
    preC9Ratio?: string;
    C9Difference?: string;
  };
}>();

defineEmits(["close"]);
</script>

<style scoped lang="scss">
.AutonomicNerveAlert {
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
  .AutonomicNerveAlertTitleGroup {
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
  .AutonomicNerveAlertTitleHR {
    background: var(--Primary-200, #b1c0d8);
    width: 100%;
    height: 1px;
  }
  .AutonomicNerveAlertContent1Group {
    margin-top: 0.5rem;
    border-radius: 20px;
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
    padding: 1rem;
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
    }
    h4 {
      color: var(--Primary-200, #b1c0d8);

      font-size: 14px;
      font-style: normal;
      font-weight: 400;

      letter-spacing: 0.1px;
    }
  }
  .AutonomicNerveAlertContent2Group {
    margin-top: 0.5rem;
    border-radius: 20px;
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
    padding: 1rem;

    .AutonomicNerveAlertContent {
      display: flex;
      justify-content: space-between;
      margin-top: 0.75rem;
      margin-bottom: 0.5rem;
      @include respond-to("md") {
        flex-wrap: wrap;
      }
      h5 {
        color: var(--Primary-200, #b1c0d8);
        font-family: "Noto Sans";
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
        margin-bottom: 0.25rem;
      }
      .AutonomicNerveAlertItem {
        width: 31.333%;
        @include respond-to("md") {
          width: 100%;
        }

        .AutonomicNerveAlertTags {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          .AutonomicNerveAlertTag {
            color: var(--Primary-default, #1ba39b);
            text-align: center;

            /* Typography/small-r-14 */
            font-family: "Noto Sans";
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            letter-spacing: 0.1px;
            width: 48%;
            border-radius: 50px;
            border: 1px solid var(--Primary-default, #1ba39b);
            background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
            margin-bottom: 0.35rem;
            padding: 6px 8px;
          }
          .AutonomicNerveAlertTag:nth-child(odd):last-child {
            width: 100%;
          }
        }
        &:nth-child(2) {
          .AutonomicNerveAlertTag {
            border: 1px solid var(--Secondary-default, #74bc1f);
            color: var(--Secondary-default, #74bc1f);
            background: var(
              --secondary-400-opacity-10,
              rgba(116, 188, 31, 0.1)
            );
          }
        }
        &:nth-child(3) {
          .AutonomicNerveAlertTag {
            border: 1px solid var(--Secondary-default, #ec4f4f);
            color: var(--Secondary-default, #ec4f4f);
            background: var(--warning-300-opacity-10, rgba(236, 79, 79, 0.1));
          }
        }
      }
    }
  }
  .AutonomicNerveAlertContent3Group {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    @include respond-to("md") {
      flex-direction: column;
    }
    .AutonomicNerveAlertContent3Card {
      width: 49%;
      @include respond-to("md") {
        width: 100%;
      }
      border-radius: 20px;
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px rgba(177, 192, 216, 0.25);
      padding: 1rem;
      margin-top: 0.5rem;
      .AutonomicNerveAlertContent3Title {
        display: flex;
        justify-content: space-between;
        h3 {
          color: var(--Primary-600, #2d3047);

          /* Typography/medium-r-20 */
          font-family: "Noto Sans";
          font-size: 20px;
          font-style: normal;
          font-weight: 400;
          line-height: 100%; /* 20px */
          letter-spacing: var(--Title-Medium-Tracking, 0.15px);
        }

        small {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: 16px;
          font-style: normal;
          font-weight: 400;

          letter-spacing: 0.5px;
        }
        .up {
          color: var(--Warning-default, #ec4f4f);
        }
        .down {
          color: var(--Warning-default, #74bc1f);
        }
      }
      h4 {
        color: var(--Primary-200, #b1c0d8);

        /* Typography/small-r-14 */
        font-family: "Noto Sans";
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
        margin-top: 0.25rem;
      }
      .value {
        color: var(--Primary-600, #2d3047);
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.12px;
        margin-top: 0.5rem;
      }
      .tagsGroup {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-top: 0.5rem;
        .tag {
          width: 49%;
          color: var(--Primary-default, #1ba39b);
          border-radius: 50px;
          border: 1px solid var(--Primary-default, #1ba39b);
          background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
          padding: 0.25rem;
          font-size: 14px;
          text-align: center;
          margin-bottom: 0.5rem;
        }
      }
    }
    .AutonomicNerveAlertContent3Card:nth-last-child(1):nth-child(odd) {
      width: 100%;
    }
  }
  .HRVUserAlertClose {
    position: fixed;
    bottom: 2.5%;
    left: 50%;
    transform: translate(-50%);
    z-index: 101;

    img {
      border-radius: var(--Radius-r-50, 50px);
      background: var(--Neutral-white, #fff);
      box-shadow: 0px 2px 20px 0px
        var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
      padding: 0.25rem;
      cursor: pointer;
    }
  }
}
.HRVUserAlertClose {
  position: fixed;
  bottom: 2.5%;
  left: 50%;
  transform: translate(-50%);
  z-index: 101;

  img {
    border-radius: var(--Radius-r-50, 50px);
    background: var(--Neutral-white, #fff);
    box-shadow: 0px 2px 20px 0px
      var(--primary-200-opacity-25, rgba(177, 192, 216, 0.25));
    padding: 0.25rem;
    cursor: pointer;
  }
}
</style>
