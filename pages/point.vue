<template>
  <div class="point">
    <TitleMenu Text="獎勵積分" link="/user"></TitleMenu>
    <div class="helperGroup">
      <div class="helper">
        <div class="helperTitle">
          <img src="../assets/imgs/helperIcon.svg" alt="" />
          小幫手
        </div>
        <p>
          每消費100元獲得1點積分，1點積分等於1元。會員等級越高，積分越多！
          快來累積積分，享受更多回饋！
        </p>
        <h6>查看完整積分規則</h6>
      </div>
      <div class="shadowGroup">
        <div class="shadow1"></div>
      </div>

      <div class="memberGroup">
        <div class="memberTitleGroup">
          <div class="memberImage">
            <img src="/assets/imgs/gold.svg" alt="" />
          </div>
          <div class="memberTitleTextGroup">
            <h3>黃金會員</h3>
            <p>
              將於 2026.06.06 重新計算再消費
              50,000元，即可繼續維持目前等級，享受更多專屬優惠！
            </p>
          </div>
        </div>
        <div class="consumingRecords">
          <div class="consumingRecordsItem consumingRecordsItem1">
            <h5>再消費</h5>
            <div class="consumingRecordsItemContent">
              <div class="consumingRecordsNumber">248,000</div>
              <h6>可升級黃金</h6>
            </div>
            <div class="progressGroup">
              <div class="progressBar">
                <div class="progress" :style="{ width: progress + '%' }"></div>
              </div>
              <span class="progressPercentage">{{ progress }}</span>
            </div>
          </div>
          <div class="consumingRecordsLine"></div>
          <div class="consumingRecordsItem consumingRecordsItem2">
            <h5>累積積分</h5>
            <div class="consumingRecordsItemContent">
              <div class="consumingRecordsNumber">300</div>
            </div>
            <div class="progressGroup">
              <div class="progressBar">
                <div
                  class="progress blue"
                  :style="{ width: progressPoints + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div class="privilege">
          <div class="privilegeTitleGroup">
            <h4>當前等級特權</h4>
            <img src="/assets/imgs/arrowDown.svg" alt="" />
          </div>
          <div class="privilegeContent">
            <ul>
              <li>任務積分 * 1.2倍</li>
              <li>消費100元換1.2倍的積分</li>
            </ul>
          </div>
          <div class="privilegeHR"></div>
        </div>
        <div class="exchangeGroup">
          <h5>可兌換獎品</h5>
          <div class="exchangeText">
            2項
            <img src="/assets/imgs/arrowDown.svg" alt="" />
          </div>
        </div>
      </div>

      <div class="pointContentGroup">
        <div class="pointContentList">
          <div class="pointContentListItem pointContentListItemActive">
            今日任務
          </div>
          <div class="pointContentListItem">積分紀錄</div>
          <div class="pointContentListItem">兌換紀錄</div>
          <div class="pointContentListItem">積分規則</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// 定義進度條的進度百分比
const progressConsume = ref(0);
const progressPoints = ref(0);

// 更新進度條的函式
function updateProgressBar(type, percentage) {
  // 確保百分比值在 0 到 100 之間
  const value = Math.max(0, Math.min(percentage, 100));

  if (type === "consume") {
    progressConsume.value = value;
  } else if (type === "points") {
    progressPoints.value = value;
  }
}

// 測試更新進度條
updateProgressBar("consume", 50);
updateProgressBar("points", 75);
</script>

<style lang="scss">
.point {
  background-color: #f6f6f6;
  height: 100vh;
  padding: 0 5%;

  .helperGroup {
    .helper {
      border-radius: 8px;
      background: linear-gradient(
          0deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0) 100%
        ),
        rgba(116, 188, 31, 0.6);
      background-blend-mode: soft-light, normal;
      backdrop-filter: blur(45px);
      padding: 10px 12px;
      color: #fff;
      color: var(--shade-white, #fff);
      font-family: "Noto Sans";
      letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      .helperTitle {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--shade-white, #fff);
        font-family: "Noto Sans";
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 20px */
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
      p {
        color: var(--shade-white, #fff);
        font-family: "Noto Sans";
        font-size: 20px;
        font-style: normal;
        font-weight: 700;
        line-height: 32.36px;
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }
      h6 {
        text-align: center;
        margin-top: 0.5rem;
        color: var(--shade-white, #fff);
        text-align: center;
        font-family: "Noto Sans";
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.1px;
      }
    }
    .shadowGroup {
      .shadow1 {
        fill: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.4) 100%
          ),
          rgba(116, 188, 31, 0.44);
        background-blend-mode: soft-light, normal;
        backdrop-filter: blur(20.5px);
        background-color: rgba($color: #74bc1f70, $alpha: 1);
        transform: translateY(-4px);
        border-radius: 8px;
        opacity: 0.44;
      }
    }
  }
  .memberGroup {
    background-color: #fff;
    border-radius: 8px;
    margin-top: 32px;
    padding: 12px;
    .memberTitleGroup {
      display: flex;
      gap: 12px;
      .memberTitleTextGroup {
        h3 {
          color: #1e1e1e;
          font-family: "Noto Sans";
          font-size: 20px;
          font-style: normal;
          font-weight: 700;
          letter-spacing: 0.15px;
        }
        p {
          color: #666;
          margin-top: 0.25rem;
          font-family: "Noto Sans";
          font-size: 16px;
          font-style: normal;
          font-weight: 400;
          line-height: 25.888px;
          letter-spacing: 0.5px;
        }
      }
    }
    .consumingRecords {
      margin-top: 0.5rem;
      display: flex;
      justify-content: space-between;
      width: 100%;

      .consumingRecordsItem {
        width: 48%;

        color: #ccc;
        font-family: "Noto Sans";
        font-size: 12px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.048px;

        .consumingRecordsNumber {
          font-family: "Noto Sans";
          font-size: 20px;
          font-style: normal;
          font-weight: 700;
          line-height: 100%;
          letter-spacing: var(--Title-Medium-Tracking, 0.15px);
        }
        .consumingRecordsItemContent {
          display: flex;
          align-items: center;
        }

        .progressGroup {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;

          .progressBar {
            flex: 1;
            height: 8px;
            background-color: #e0e0e0;
            border-radius: 4px;
            overflow: hidden;

            .progress {
              height: 100%;
              background-color: #74bc1f;
              transition: width 0.3s ease;

              &.blue {
                background-color: #1fbcb3;
              }
            }
          }

          .progressPercentage {
            font-size: 12px;
            color: #666;
          }
        }
      }

      .consumingRecordsItem1 {
        .consumingRecordsNumber {
          color: #74bc1f;
        }
      }
      .consumingRecordsItem2 {
        .consumingRecordsNumber {
          color: #1fbcb3;
        }
      }

      .consumingRecordsLine {
        height: 57px;
        width: 1px;
        background-color: #eee;
      }
    }
    .privilege {
      .privilegeTitleGroup {
        display: flex;
        justify-content: space-between;
        h4 {
        }
      }
      .privilegeContent {
        background-color: #fff;
        border-radius: 8px;
        background: #f6f6f6;
        padding: 6px 12px;
        margin-top: 0.7rem;
        ul {
          list-style: inside;

          color: #666;
          font-family: "Noto Sans";
          font-size: 16px;
          font-style: normal;
          font-weight: 400;

          letter-spacing: 0.5px;
          li {
            line-height: 1.5;
          }
        }
      }
      .privilegeHR {
        height: 1px;
        width: 100%;
        background-color: #eee;
        margin: 0.75rem 0;
      }
    }
    .exchangeGroup {
      display: flex;
      justify-content: space-between;

      .exchangeText {
        display: flex;
        gap: 4px;
        align-items: center;
        color: #74bc1f;
        cursor: pointer;
        img {
          transform: rotate(-90deg);
          width: 1rem;
        }
      }
    }
  }
  .pointContentGroup {
    background-color: #fff;
    margin-top: 1rem;
    padding: 1rem;

    border-radius: 12px;
    .pointContentList {
      display: flex;
      justify-content: space-between;
      .pointContentListItem {
        cursor: pointer;
        color: #eee;
        font-family: "Noto Sans";
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%;
        letter-spacing: 0.09px;
      }
      .pointContentListItemActive {
        color: #74bc1f;
      }
    }
  }
}
</style>
