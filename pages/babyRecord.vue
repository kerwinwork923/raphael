<template>
  <div class="babyRecord">
    <TitleMenu Text="健康紀錄" link="/user" />
    <div class="babyRecordGroup">
      <TagList />
      <!--v-if="store.nowState == 'first'"  -->
      <div class="ANSGroup" v-if="false">
        <h4>寶貝紀錄量表</h4>
        <div class="desCard">
          <div class="slogan">
            寶貝紀錄幫助醫師了解孩子的成長以利做最有效率的調整，涵蓋專注力、情緒、動作與語言發展等指標
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

      <div class="babyInfoGroup" v-for="index in 3" :key="index">
        <h4>新增寶貝基本資料</h4>
        <div class="babyInfo">
          <div class="babyInfoOption">
            <small>#1</small>
            <img src="/assets/imgs/trash.svg" alt="" />
          </div>

          <div class="babyRecordInfoInput">
            <img
              class="icon1"
              src="../assets/imgs/babyRecordMember.svg"
              alt=""
            />
            <input type="text" placeholder="請輸入寶貝姓名" />
          </div>
          <h6 v-if="a">此欄位沒有填寫到喔</h6>
          <div class="babyRecordInfoInput">
            <img class="icon1" src="../assets/imgs/babyRecordS.svg" alt="" />
            <div class="ageGroup">
              <select
                v-model="age"
                :class="['custom-select', { 'has-value': age !== '' }]"
              >
                <option value="" disabled hidden>請選擇生理年齡</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
              <img class="icon2" src="../assets/imgs/arrowDown.svg" />
            </div>
          </div>
          <h6 v-if="a">此欄位沒有填寫到喔</h6>
          <div class="babyRecordInfoInput">
            <img class="icon1" src="../assets/imgs/babyRecordFace.png" alt="" />
            <input type="text" placeholder="請輸入寶貝姓名" />
          </div>
          <h6 v-if="a">此欄位沒有填寫到喔</h6>
        </div>
      </div>
      <div class="babyInfoAdd">
        繼續新增寶貝基本資料
        <span><img src="/assets/imgs/babyInfoAdd.svg" alt="" /></span>
      </div>

      <div
        class="weeklyBtnGroup"
        v-if="
          store.nowState === 'score' ||
          store.nowState === 'times' ||
          store.nowState === 'choose'
        "
      >
        <button
          class="weeklyBtn preBtn"
          @click="store.handlePrevStep"
          :disabled="preDisabled"
          v-if="
            !(store.nowState === 'score' && store.currentStep === 1) &&
            !(store.nowState === 'times' && store.timesStep === 1) &&
            !(store.nowState === 'choose' && store.timesStep === 1)
          "
        >
          {{ store.preText }}
        </button>
        <button class="weeklyBtn" @click="store.handleNextStep">
          {{ store.nextText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import TitleMenu from "~/components/TitleMenu.vue";
import { useCommon } from "@/stores/common";
import { ref } from "vue";
import axios from "axios";
export default {
  setup() {
    const localData = localStorage.getItem("userData");
    let MID, Token, MAID, Mobile;
    try {
      if (localData) {
        // Parse localStorage data
        ({ MID, Token, MAID, Mobile, ChildInfo = [] } = JSON.parse(localData));
      }
    } catch (e) {
      console.error("Error parsing localStorage data", e);
    }

    // Redirect to home page if critical data is missing
    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
      return;
    }

    const store = useWeeklyRecord();
    const common = useCommon();
    const age = ref("");
    const h1Text = computed(() => {
      switch (store.nowState) {
        case "score":
        case "times":
        case "choose":
          return "寶貝紀錄";
        case "result":
          return "結果分析";
        default:
          return "健康紀錄";
      }
    });
    //檢查有無小孩 檢查 AID 及 CID response "ChildAnsFirstInfo":[{"AID":"","CID":""}]
    const API_PreGrowth = async () => {
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_Growth.jsp",
          {
            MID,
            Token,
            MAID,
            Mobile,
          }
        );

        if (response.status === 200) {
          console.log(response.data);
        } else {
        }
      } catch (err) {
      } finally {
      }
    };
    //新增小孩
    const API_Growth = async () => {
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_Growth.jsp",
          {
            MID,
            Token,
            MAID,
            Mobile,
          }
        );

        if (response.status === 200) {
          console.log(response.data);
        } else {
        }
      } catch (err) {
      } finally {
      }
    };

    API_PreGrowth();
    return { h1Text, age, store, common };
  },
};
</script>

<style lang="scss">
.babyRecord {
  background-color: $raphael-gray-100;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;
}
.ANSGroup {
  height: calc(100vh - 207px);
  margin-top: 1rem;
  padding-bottom: 0.75rem;
  overflow-y: scroll;
  @include scrollbarStyle();

  h4 {
    color: $raphael-black;
    font-size: 20px;
    font-style: normal;
    font-weight: bold;
    line-height: 100%;
    letter-spacing: var(--Title-Medium-Tracking, 0.15px);
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
    line-height: 29.1px;
    letter-spacing: 0.05em;

    .time {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      .text {
        & > span {
          color: $raphael-red-300;
          margin-left: 0.25rem;
        }
      }
    }
    .hint {
      @extend .time;
    }
  }
  .stepCard {
    position: relative;
    display: grid;
    gap: 0.75rem;
    font-size: 1.125rem;
    color: $raphael-gray-500;
    line-height: 29.1px;
    letter-spacing: 0.05em;

    &::after {
      content: "";
      position: absolute;
      background: $raphael-white;
      width: 4px;
      height: 100%;
      border-radius: 0.5rem;
      box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.25) inset;
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
        z-index: 1;

        & > img {
          min-width: 24px;
        }
      }
      .content {
        display: grid;
        background: $raphael-white;
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
  ul {
    list-style: outside;
    margin-left: 1.75rem;
    li {
    }
  }
}

.babyInfoGroup {
  h4 {
    color: #666666;
    font-size: 1rem;
    letter-spacing: 0.5px;
    font-weight: 400;
    margin-bottom: 0.6rem;
    margin-top: 0.25rem;
  }
  .babyInfo {
    padding: 12px;
    border-radius: 12px;
    background-color: #fff;
    margin-bottom: 0.75rem;
  }
  .babyInfoOption {
    display: flex;
    justify-content: space-between;
    small {
      color: #b3b3b3;
    }
    img {
      cursor: pointer;
    }
  }
  h6 {
    color: #ff0000;
    font-size: 12px;
  }
}
.babyInfoAdd {
  display: flex;
  align-items: center;
  color: #ec4f4f;
  gap: 2px;

  img {
    width: 0.85rem;
  }
}
.babyRecordInfoInput {
  position: relative;
  margin-bottom: 0.5rem;

  .icon1 {
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);
    z-index: 2;
  }

  .icon2 {
    position: absolute;
    top: 50%;
    right: 2px;
    transform: translateY(-50%);
    width: 18px;
    z-index: 1;
  }

  img {
    width: 24px;
    height: 24px;
  }

  input[type="text"],
  input[type="password"],
  input[type="number"],
  input[type="email"] {
    outline: none;
    border: none;
    border-bottom: 1px solid $raphael-gray-300;
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 12px;
    padding-top: 16px;
    color: $raphael-black;
    &::placeholder {
      color: $raphael-gray-300;
      font-family: Inter;
      font-size: 1.2rem;
      font-weight: 400;
    }
  }
  .custom-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: url("../assets/imgs/arrow-down.svg") no-repeat right 10px center;
    background-size: 12px;
    font-size: 1.2rem;
    padding-left: 36px;
    padding-bottom: 12px;
    padding-top: 16px;
    width: 100%;
    border: none;
    outline: none;
    border-bottom: 1px solid $raphael-gray-300;
    color: $raphael-gray-300; // 預設顏色為灰色

    &.has-value {
      color: $raphael-black !important; // 選擇後變為黑色
    }
  }

  .custom-select.selected {
    color: $raphael-black;
  }
}
</style>
