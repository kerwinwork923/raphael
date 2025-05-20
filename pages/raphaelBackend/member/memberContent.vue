<template>
  <div class="memberInfo">
    <Sidebar />
    <ContractUserAlert v-if="false" />
    <HRVUserAlertAlert v-if="false" />
    <AutonomicNerveAlert v-if="false" />
    <LifeDetectAlert />
    <div class="memberInfoContent">
      <div class="memberInfoTitle">
        <h3>Steven Yeh</h3>
        <div class="optionGroup">
          <button>
            <img src="/assets/imgs/backend/back.svg" alt="" />返回
          </button>
          <button class="btn refresh">資料更新</button>
          <span class="updated-time">最後更新: xxxxxxxxxxx</span>
        </div>
      </div>
      <div class="memberInfoCardWrap">
        <div class="memberInfoRow">
          <div class="memberInfoCardGroup">
            <div class="memberInfoCard2">
              <h3>基本資料</h3>
              <h5>黃金會員</h5>
              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/birthday.svg" alt="" />
                  生日
                </div>
                <div class="memberInfoListContent">770101</div>
              </div>
              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/phone.svg" alt="" />
                  電話
                </div>
                <div class="memberInfoListContent">0912-345-678</div>
              </div>
              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/time.svg" alt="" />
                  註冊時間
                </div>
                <div class="memberInfoListContent">2024/10/10 12:00</div>
              </div>
              <div class="memberInfoTagsGroup">
                <div class="memberInfoTag">忠誠用戶</div>
                <div class="memberInfoTag">
                  <img src="/assets/imgs/backend/heartCrack.svg" alt="" />解約
                </div>
              </div>
            </div>
            <div class="memberInfoCard2">
              <h3>第四代穿戴式調節衣(紅光版)</h3>
              <h5>目前合約</h5>
              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/time.svg" alt="" />
                  開始時間
                </div>
                <div class="memberInfoListContent">2024/10/10</div>
              </div>
              <div class="memberInfoList">
                <div class="memberInfoListTitle">
                  <img src="/assets/imgs/backend/time.svg" alt="" />
                  結束時間
                </div>
                <div class="memberInfoListContent">2034/10/10</div>
              </div>
              <div class="memberInfoWarning">合約已於</div>
              <h6>2024/11/01 到期</h6>
              <div class="memberInfoWarning">
                目前尚未續約，請確認是否續約以恢復服務。
              </div>
              <div class="memberInfoTagsGroup">
                <div class="memberInfoTag">忠誠用戶</div>
                <div class="memberInfoTag">
                  <img src="/assets/imgs/backend/heartCrack.svg" alt="" />解約
                </div>
              </div>
              <button class="consumptionBtn">
                <img src="/assets/imgs/backend/time2.svg" alt="" />消費紀錄
              </button>
            </div>
          </div>
          <div class="memberInfoCard">
            <h3>使用紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>已使用 100 次</small>
              <VueDatePicker
                range
                class="memberInfoDate1"
                :enable-time-picker="false"
                :format="'yyyy/MM/dd'"
                placeholder="註冊日期區間"
                prepend-icon="i-calendar"
              />
            </div>
            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">APP 使用日期</div>
                <div class="memberInfoTableTitleItem">APP 結束日期</div>
                <div class="memberInfoTableTitleItem">間隔天數</div>
              </div>
              <div class="memberInfoTableHR"></div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">2024/10/11 12:00</div>
                <div class="memberInfoTableRowItem">1天</div>
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">2024/10/11 12:00</div>
                <div class="memberInfoTableRowItem">1天</div>
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">2024/10/11 12:00</div>
                <div class="memberInfoTableRowItem">1天</div>
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">2024/10/11 12:00</div>
                <div class="memberInfoTableRowItem">1天</div>
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">2024/10/11 12:00</div>
                <div class="memberInfoTableRowItem">1天</div>
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">2024/10/11 12:00</div>
                <div class="memberInfoTableRowItem">1天</div>
              </div>
            </div>
            <nav class="pagination">
              <button
                class="btn-page"
                :disabled="page === 1"
                @click="gotoPage(1)"
              >
                &lt;&lt;
              </button>
              <button class="btn-page" :disabled="page === 1" @click="prevPage">
                &lt;
              </button>
              <button
                v-for="p in totalPages"
                :key="p"
                class="btn-page btn-page-number"
                :class="{ active: page === p }"
                @click="gotoPage(p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="nextPage"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="gotoPage(totalPages)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>
          <div class="memberInfoCard">
            <h3>使用紀錄分析</h3>
            <UsageAnalysisChart :usage-data="usageRecords" />
          </div>
        </div>
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <h3>HRV檢測紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>已使用 100 次</small>
              <VueDatePicker
                range
                :enable-time-picker="false"
                :format="'yyyy/MM/dd'"
                placeholder="註冊日期區間"
                prepend-icon="i-calendar"
              />
            </div>
            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">檢測時間</div>
                <div class="memberInfoTableTitleItem">生理年齡</div>
                <div class="memberInfoTableTitleItem">HRV</div>
                <div class="memberInfoTableTitleItem">間隔天數</div>
              </div>
              <div class="memberInfoTableHR"></div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">85</div>
                <div class="memberInfoTableRowItem">嚴重失調</div>
                <div class="memberInfoTableRowItem">1天</div>
                <img src="/assets/imgs/backend/goNext.svg" alt="" />
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">85</div>
                <div class="memberInfoTableRowItem">嚴重失調</div>
                <div class="memberInfoTableRowItem">1天</div>
                <img src="/assets/imgs/backend/goNext.svg" alt="" />
              </div>
            </div>
            <nav class="pagination">
              <button
                class="btn-page"
                :disabled="page === 1"
                @click="gotoPage(1)"
              >
                &lt;&lt;
              </button>
              <button class="btn-page" :disabled="page === 1" @click="prevPage">
                &lt;
              </button>
              <button
                v-for="p in totalPages"
                :key="p"
                class="btn-page btn-page-number"
                :class="{ active: page === p }"
                @click="gotoPage(p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="nextPage"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="gotoPage(totalPages)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>
          <div class="memberInfoCard w-half">
            <h3>HRV檢測紀錄分析</h3>
            <AnalysisChart
              :records="dataRecords"
              primary-key="bioAge"
              secondary-key="score"
              primary-label="生理年齡"
              secondary-label="檢測分數"
            />
          </div>
        </div>
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <h3>自律神經檢測紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>已使用 100 次</small>
              <VueDatePicker
                range
                :enable-time-picker="false"
                :format="'yyyy/MM/dd'"
                placeholder="註冊日期區間"
                prepend-icon="i-calendar"
              />
            </div>
            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">檢測時間</div>
                <div class="memberInfoTableTitleItem">分數</div>
                <div class="memberInfoTableTitleItem">嚴重程度</div>
                <div class="memberInfoTableTitleItem">間隔天數</div>
              </div>
              <div class="memberInfoTableHR"></div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">85</div>
                <div class="memberInfoTableRowItem">嚴重失調</div>
                <div class="memberInfoTableRowItem">1天</div>
                <img src="/assets/imgs/backend/goNext.svg" alt="" />
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">85</div>
                <div class="memberInfoTableRowItem">嚴重失調</div>
                <div class="memberInfoTableRowItem">1天</div>
                <img src="/assets/imgs/backend/goNext.svg" alt="" />
              </div>
            </div>
            <nav class="pagination">
              <button
                class="btn-page"
                :disabled="page === 1"
                @click="gotoPage(1)"
              >
                &lt;&lt;
              </button>
              <button class="btn-page" :disabled="page === 1" @click="prevPage">
                &lt;
              </button>
              <button
                v-for="p in totalPages"
                :key="p"
                class="btn-page btn-page-number"
                :class="{ active: page === p }"
                @click="gotoPage(p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="nextPage"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="gotoPage(totalPages)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>
          <div class="memberInfoCard w-half">
            <h3>自律神經檢測錄分析</h3>
            <AnalysisChart
              :records="dataRecords"
              primary-key="bioAge"
              secondary-key="score"
              primary-label="生理年齡"
              secondary-label="檢測分數"
            />
          </div>
        </div>
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <h3>生活檢測紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>已使用 100 次</small>
              <VueDatePicker
                range
                :enable-time-picker="false"
                :format="'yyyy/MM/dd'"
                placeholder="註冊日期區間"
                prepend-icon="i-calendar"
              />
            </div>
            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">檢測時間</div>
                <div class="memberInfoTableTitleItem">分數</div>
                <div class="memberInfoTableTitleItem">生活品質</div>
                <div class="memberInfoTableTitleItem">間隔天數</div>
              </div>
              <div class="memberInfoTableHR"></div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">5</div>
                <div class="memberInfoTableRowItem">不良睡眠</div>
                <div class="memberInfoTableRowItem">1天</div>
                <img src="/assets/imgs/backend/goNext.svg" alt="" />
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">5</div>
                <div class="memberInfoTableRowItem">不良睡眠</div>
                <div class="memberInfoTableRowItem">1天</div>
                <img src="/assets/imgs/backend/goNext.svg" alt="" />
              </div>
            </div>
            <nav class="pagination">
              <button
                class="btn-page"
                :disabled="page === 1"
                @click="gotoPage(1)"
              >
                &lt;&lt;
              </button>
              <button class="btn-page" :disabled="page === 1" @click="prevPage">
                &lt;
              </button>
              <button
                v-for="p in totalPages"
                :key="p"
                class="btn-page btn-page-number"
                :class="{ active: page === p }"
                @click="gotoPage(p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="nextPage"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="gotoPage(totalPages)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>
          <div class="memberInfoCard w-half">
            <h3>生活檢測紀錄分析</h3>
            <AnalysisChart
              :records="dataRecords"
              primary-key="bioAge"
              secondary-key="score"
              primary-label="生理年齡"
              secondary-label="檢測分數"
            />
          </div>
        </div>
        <div class="memberInfoRow">
          <div class="memberInfoCard w-half">
            <h3>寶貝檢測紀錄查詢</h3>
            <div class="memberInfoTitleGroup">
              <small>已使用 100 次</small>
              <VueDatePicker
                range
                :enable-time-picker="false"
                :format="'yyyy/MM/dd'"
                placeholder="註冊日期區間"
                prepend-icon="i-calendar"
              />
            </div>
            <div class="memberInfoTable">
              <div class="memberInfoTableTitle">
                <div class="memberInfoTableTitleItem">檢測時間</div>
                <div class="memberInfoTableTitleItem">分數</div>
                <div class="memberInfoTableTitleItem">嚴重程度</div>
                <div class="memberInfoTableTitleItem">間隔天數</div>
              </div>
              <div class="memberInfoTableHR"></div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">5</div>
                <div class="memberInfoTableRowItem">嚴重失調</div>
                <div class="memberInfoTableRowItem">1天</div>
                <img src="/assets/imgs/backend/goNext.svg" alt="" />
              </div>
              <div class="memberInfoTableRow">
                <div class="memberInfoTableRowItem">2024/10/10 12:00</div>
                <div class="memberInfoTableRowItem">5</div>
                <div class="memberInfoTableRowItem">嚴重失調</div>
                <div class="memberInfoTableRowItem">1天</div>
                <img src="/assets/imgs/backend/goNext.svg" alt="" />
              </div>
            </div>
            <nav class="pagination">
              <button
                class="btn-page"
                :disabled="page === 1"
                @click="gotoPage(1)"
              >
                &lt;&lt;
              </button>
              <button class="btn-page" :disabled="page === 1" @click="prevPage">
                &lt;
              </button>
              <button
                v-for="p in totalPages"
                :key="p"
                class="btn-page btn-page-number"
                :class="{ active: page === p }"
                @click="gotoPage(p)"
              >
                {{ p }}
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="nextPage"
              >
                &gt;
              </button>
              <button
                class="btn-page"
                :disabled="page === totalPages"
                @click="gotoPage(totalPages)"
              >
                &gt;&gt;
              </button>
            </nav>
          </div>
          <div class="memberInfoCard w-half">
            <h3>寶貝檢測紀錄分析</h3>
            <AnalysisChart
              :records="dataRecords"
              primary-key="bioAge"
              secondary-key="score"
              primary-label="生理年齡"
              secondary-label="檢測分數"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineComponent } from "@vue/composition-api";
import Sidebar from "/components/raphaelBackend/Sidebar.vue";
import AnalysisChart from "/components/raphaelBackend/AnalysisChart.vue";
import UsageAnalysisChart from "/components/raphaelBackend/UsageAnalysisChart";
import ContractUserAlert from "/components/raphaelBackend/ContractUserAlert";

import HRVUserAlertAlert from "/components/raphaelBackend/HRVUserAlert";
import AutonomicNerveAlert from "/components/raphaelBackend/AutonomicNerve";
import LifeDetectAlert from "~/components/raphaelBackend/LifeDetectAlert";
const user = { name: "Steven Yeh" };

const usageRecords = ref([
  { date: "2024/10/01", start: "13:05", end: "14:00" },
  { date: "2024/10/02", start: "13:30", end: "13:50" },
  { date: "2024/10/03", start: "13:45", end: "14:20" },
  { date: "2024/10/04", start: "13:55", end: "15:00" },
  { date: "2024/10/05", start: "14:05", end: "15:10" },
  { date: "2024/10/06", start: "14:20", end: "14:45" },
]);
const dataRecords = ref([
  { date: "2024/10/01", score: 19, bioAge: 12 },
  { date: "2024/10/02", score: 18, bioAge: 14 },
  { date: "2024/10/03", score: 22, bioAge: 15 },
  { date: "2024/10/04", score: 28, bioAge: 16 },
  { date: "2024/10/05", score: 27, bioAge: 17 },
  { date: "2024/10/06", score: 23, bioAge: 18 },
]);
</script>

<style scoped lang="scss">
.memberInfo {
  display: flex;
  min-height: 100vh;
  background: $primary-100;
  gap: 1%;

  .w-half {
    width: 49% !important;
  }
  .memberInfoContent {
    padding: 24px;

    width: 84%;
    margin: 0 auto;

    .memberInfoTitle {
      width: 100%;
      display: flex;
      justify-content: space-between;
      .optionGroup {
        display: flex;
        align-items: center;
        gap: 8px;
        button {
          display: flex;
          gap: 4px;
          img {
            width: 18px;
          }
          background-color: $primary-200;
          border: none;
          color: var(--Primary-100, #f5f7fa);
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          padding: 0.25rem 0.5rem;
          letter-spacing: 0.25px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          &:hover {
            background-color: $primary-300;
          }
          @include respond-to("lg") {
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
          }
        }
      }
      h3 {
        color: var(--Primary-600, #2d3047);
        text-align: center;
        font-size: 32px;
        font-style: normal;
        font-weight: 700;
        letter-spacing: 0.09px;
      }
    }
    .memberInfoCardWrap {
      .memberInfoRow {
        width: 100%;
        display: flex;

        gap: 12px;
        margin-top: 1rem;
        h3 {
          color: var(--Primary-600, #2d3047);
          font-family: "Noto Sans";
          font-size: var(--Text-font-size-24, 20px);

          font-weight: bold;

          letter-spacing: 0.12px;
          margin-bottom: 0.75rem;
        }
        h5 {
          color: var(--Primary-300, #6d8ab6);
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          margin-bottom: 0.25rem;
        }
        .memberInfoWarning {
          color: var(--Warning-default, #ec4f4f);
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          padding: 0.25rem 0;
        }

        .memberInfoCard {
          padding: 1rem;

          background-color: #fff;
          border-radius: 20px;
        }

        .memberInfoList {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--Primary-200, #b1c0d8);
          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          letter-spacing: 0.09px;
          line-height: 1.5;

          img {
            transform: translateY(3px);
          }
          .memberInfoListContent {
            color: var(--Primary-600, #2d3047);
          }
        }
        .memberInfoTagsGroup {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 1rem;
          .memberInfoTag {
            border-radius: 50px;
            border: 1px solid var(--Primary-default, #1ba39b);
            background: var(--primary-400-opacity-10, rgba(27, 163, 155, 0.1));
            color: var(--Primary-default, #1ba39b);
            text-align: center;
            font-family: "Noto Sans";
            font-size: var(--Text-font-size-18, 18px);
            font-style: normal;
            font-weight: 400;
            line-height: 100%; /* 18px */
            letter-spacing: 0.09px;
            padding: 8px;

            img {
              width: 1rem;
            }
          }
        }
        .consumptionBtn {
          width: 100%;
          padding: 6px 8px;
          color: var(--Primary-default, #1ba39b);

          font-size: var(--Text-font-size-18, 18px);
          font-style: normal;
          font-weight: 400;
          line-height: 100%; /* 18px */
          letter-spacing: 0.09px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
          border: none;
          border: 1px solid #1ba39b;
          border-radius: 6px;
          margin-top: 0.75rem;
          cursor: pointer;
        }
        .memberInfoTitleGroup {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 0.75rem;
          small {
            white-space: nowrap;
          }
          .memberInfoDate1 {
            width: 60%;
          }
        }
      }
      .memberInfoCardGroup {
        display: flex;
        flex-direction: column;

        width: 29%;
        gap: 12px;
        justify-content: space-between;
        .memberInfoCard2 {
          padding: 1rem;
          width: 100%;
          border-radius: 20px;
          background-color: #fff;
        }
      }
    }
    small {
      color: var(--Primary-200, #b1c0d8);
      font-family: "Noto Sans";
      font-size: 16px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.5px;
    }
    .memberInfoTable {
      .memberInfoTableTitle {
        display: flex;
        white-space: nowrap;
        font-size: 1rem;
        .memberInfoTableTitleItem {
          width: 33.3333%;
          text-align: center;
        }
      }
      .memberInfoTableHR {
        height: 1px;
        width: 100%;
        background-color: #b1c0d8;
        margin-top: 0.5rem;
      }
      .memberInfoTableRow {
        display: flex;
        align-items: center;
        position: relative;
        img {
          position: absolute;
          right: 0;
        }
        .memberInfoTableRowItem {
          width: 33.3333%;
          text-align: center;
          padding: 0.75rem;
        }
      }
    }
  }
  .pagination {
    display: flex;
    justify-content: center;
    gap: 4px;
    margin-top: 4px;
    margin-bottom: 24px;
    .btn-page {
      padding: 6px 10px;
      min-width: 32px;

      border-radius: 4px;

      background-color: transparent;
      cursor: pointer;
      border: none;
      &.active {
        background: $chip-success;
        color: white;
        border-color: $chip-success;
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }

    .btn-page-number {
      background: white;
    }
  }
}
</style>
