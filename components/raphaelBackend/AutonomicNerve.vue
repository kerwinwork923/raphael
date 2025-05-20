<template>
  <div class="AutonomicNerveAlert">
    <div class="AutonomicNerveAlertTitleGroup">
      <img src="/assets/imgs/backend/Subtract.svg" alt="" />
      <h3>Steven Yeh</h3>
      <h4>Contract History</h4>
    </div>
    <div class="AutonomicNerveAlertTitleHR"></div>
    <div class="AutonomicNerveAlertContent1Group">
      <div class="AutonomicNerveAlertContent1TitleGroup">
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
    <div class="AutonomicNerveAlertContent2Group">
      <h3>想解決的症狀</h3>
      <div class="AutonomicNerveAlertContent">
        <div class="AutonomicNerveAlertItem">
          <h5>今次選擇了</h5>
          <div class="AutonomicNerveAlertTags">
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
          </div>
        </div>

        <div class="AutonomicNerveAlertItem">
          <h5>與前次相比減少了</h5>
          <div class="AutonomicNerveAlertTags">
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
          </div>
        </div>

        <div class="AutonomicNerveAlertItem">
          <h5>與前次相比新增了</h5>
          <div class="AutonomicNerveAlertTags">
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
            <div class="AutonomicNerveAlertTag">想解決的症狀</div>
          </div>
        </div>
      </div>
    </div>
    <div class="AutonomicNerveAlertContent3Group">
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>精神系統</h3>
          <small class="up">
            <img src="/assets/imgs/backend/up.svg" alt="" />
            10.5%
          </small>
        </div>

        <div class="value">92.4%</div>
        <h4>重度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>神經系統</h3>
          <small class="up">
            <img src="/assets/imgs/backend/up.svg" alt="" />
            10.5%
          </small>
        </div>

        <div class="value">9.4%</div>
        <h4>輕度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>血液循環系統</h3>
          <small class="down">
            <img src="/assets/imgs/backend/down.svg" alt="" />
            65.2%
          </small>
        </div>

        <div class="value">92.4%</div>
        <h4>中度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>感官系統</h3>
          <small class="down">
            <img src="/assets/imgs/backend/down.svg" alt="" />
            10.5%
          </small>
        </div>

        <div class="value">50.3%</div>
        <h4>中度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>心肺系統</h3>
          <small class="up">
            <img src="/assets/imgs/backend/up.svg" alt="" />
            10.5%
          </small>
        </div>

        <div class="value">92.4%</div>
        <h4>重度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>過敏免疫系統</h3>
          <small class="up">
            <img src="/assets/imgs/backend/up.svg" alt="" />
            10.5%
          </small>
        </div>

        <div class="value">9.4%</div>
        <h4>輕度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>腸胃系統</h3>
          <small class="down">
            <img src="/assets/imgs/backend/down.svg" alt="" />
            65.2%
          </small>
        </div>

        <div class="value">92.4%</div>
        <h4>中度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>泌尿生殖系統</h3>
          <small class="down">
            <img src="/assets/imgs/backend/down.svg" alt="" />
            10.5%
          </small>
        </div>

        <div class="value">50.3%</div>
        <h4>中度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
      <div class="AutonomicNerveAlertContent3Card">
        <div class="AutonomicNerveAlertContent3Title">
          <h3>泌尿生殖系統</h3>
          <small class="down">
            <img src="/assets/imgs/backend/down.svg" alt="" />
            10.5%
          </small>
        </div>

        <div class="value">50.3%</div>
        <h4>中度失調</h4>
        <div class="tagsGroup">
          <div class="tag">想解決的症狀</div>
          <div class="tag">想解決的症狀</div>
        </div>
      </div>
    </div>
  </div>
  <div class="HRVUserAlertClose">
    <img src="/assets/imgs/backend/close.svg" alt="" />
  </div>
</template>
<script setup></script>

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
    .AutonomicNerveAlertContent3Card {
      width: 49%;
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
        margin-top: 0.25rem;
        .tag {
          width: 49%;
          color: var(--Primary-default, #1ba39b);
          border-radius: 50px;
          border: 1px solid var(--Primary-default, #1ba39b);
          background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
          padding: 0.25rem;
          font-size: 14px;
          text-align: center;
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
