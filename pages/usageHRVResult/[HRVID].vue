<template>
  <div class="usageHRVResultWrap">
    <h1>結果分析</h1>
    <div class="thxGroup">
      <div class="textGroup">
        <h3 class="nameText">感謝您的使用</h3>
      </div>
      <div class="imgGroup">
        <img
          src="/assets/imgs/doctor_nocomment.png"
          class="doctorImg"
          alt=""
        />
      </div>
    </div>

    <!-- 生理年齡圖表(如需要) -->
    <div class="resultChartGroup">
      <h2>生理年齡</h2>
      <ResultChart v-if="listBioage.length > 0" :bioageData="listBioage" />
    </div>

    <!-- 整體結果卡片區 -->
    <div class="BAGroup">
      <!-- 生理年齡 -->
      <div class="BACard">
        <div class="titleGroup">
          <img src="/assets/imgs/HRVFaceSmall.svg" alt="" />
          <h3>生理年齡</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              <!-- 若 bioage 存在才顯示區間，否則顯示 '-' -->
              {{ HRVBeforeData?.bioage != null 
                ? `${HRVBeforeData.bioage - 5}~${HRVBeforeData.bioage}` 
                : '-' 
              }}
            </div>
            <div class="unit">years old</div>
          </div>
          <!-- 中間箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.bioage != null
                ? `${HRVAfterData.bioage - 5}~${HRVAfterData.bioage}`
                : '-'
              }}
            </div>
            <div class="unit">years old</div>
          </div>
        </div>
      </div>

      <!-- 心律變異性 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/heartRateSmall.svg" alt="" />
          <h3>心律變異性</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.HRV != null 
                ? (Math.round(HRVBeforeData.HRV * 10) / 10) 
                : '-' 
              }}
            </div>
            <div class="unit">ms</div>
          </div>
          <!-- 中間箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.HRV != null
                ? (Math.round(HRVAfterData.HRV * 10) / 10)
                : '-'
              }}
            </div>
            <div class="unit">ms</div>
          </div>
        </div>
      </div>

      <!-- 心率 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/heartBeatSmall.svg" alt="" />
          <h3>心率</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.HR ?? '-' }}
            </div>
            <div class="unit">bpm</div>
          </div>
          <!-- 中間箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.HR ?? '-' }}
            </div>
            <div class="unit">bpm</div>
          </div>
        </div>
      </div>

      <!-- 血壓 -->
      <div class="BACard">
        <div class="titleGroup">
          <img src="/assets/imgs/bloodPressure.svg" alt="" />
          <h3>血壓</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ 
                (HRVBeforeData?.SBP != null && HRVBeforeData?.DBP != null)
                  ? `${HRVBeforeData.SBP}/${HRVBeforeData.DBP}`
                  : '-'
              }}
            </div>
            <div class="unit">mmHg</div>
          </div>
          <!-- 中間箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ 
                (HRVAfterData?.SBP != null && HRVAfterData?.DBP != null)
                  ? `${HRVAfterData.SBP}/${HRVAfterData.DBP}`
                  : '-'
              }}
            </div>
            <div class="unit">mmHg</div>
          </div>
        </div>
        <span class="waiting">血壓值為演算法估計值，個人效正模式優化中...</span>
      </div>

      <!-- 血氧 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/spo2Small.svg" alt="" />
          <h3>血氧</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.SPO2 ?? '-' }}
            </div>
            <div class="unit">SpO2%</div>
          </div>
          <!-- 中間箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.SPO2 ?? '-' }}
            </div>
            <div class="unit">SpO2%</div>
          </div>
        </div>
      </div>

      <!-- 呼吸 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/breathSmall.svg" alt="" />
          <h3>呼吸</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.rr ?? '-' }}
            </div>
            <div class="unit">bpm</div>
          </div>
          <!-- 中間箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.rr ?? '-' }}
            </div>
            <div class="unit">bpm</div>
          </div>
        </div>
      </div>

      <!-- 壓力 -->
      <div class="BACard BACardS">
        <div class="titleGroup">
          <img src="/assets/imgs/pressureSmall.svg" alt="" />
          <h3>壓力</h3>
        </div>
        <div class="BAContent">
          <div class="BA">
            <div class="subTitle">使用前</div>
            <div class="value">
              {{ HRVBeforeData?.stress ?? '-' }}
            </div>
            <div class="unit"></div>
          </div>
          <!-- 中間箭頭 -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="8"
            viewBox="0 0 17 8"
            fill="none"
          >
            <path
              d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464466C12.9763 0.269204 12.6597 0.269204 12.4645 0.464466C12.2692 0.659728 12.2692 0.976311 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.7308 12.9763 7.7308 13.1716 7.53553L16.3536 4.35355ZM0 4.5H16V3.5H0V4.5Z"
              fill="#666666"
            />
          </svg>
          <div class="BA">
            <div class="subTitle">使用後</div>
            <div class="value afterValue">
              {{ HRVAfterData?.stress ?? '-' }}
            </div>
            <div class="unit"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 交感/副交感比例 (若未使用可刪除) -->
    <!--
    <div class="SympatheticRatioGroup">
      <h3>交感/副交感比例</h3>
      <h4>使用前</h4>
      <SympatheticRatio :sympathetic="90" :parasympathetic="10" />
      <h4>使用後</h4>
      <SympatheticRatio :sympathetic="30" :parasympathetic="70" />
    </div>
    -->

    <div class="healthAnalyse"></div>
    <div class="usageBtnGroup">
      <button class="nextBtn" @click="goNext">返回</button>
    </div>
  </div>
</template>


<script>
import ResultChart from "~/components/ResultChart.vue";
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

export default {
  components: { ResultChart },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const listBioage = ref([]);

    const HRVBeforeData = ref(null);
    const HRVAfterData = ref(null);

    const productName = ref("");

    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile, Name } = localData
      ? JSON.parse(localData)
      : {};

    // 檢查必要參數是否存在
    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
      return;
    } else if (!Name) {
      router.push("/changeMember");
      return;
    }

    // 從路由參數中獲取 UID
    const UID = route.params.HRVID;

    const API_HRV2UseAf_Compare = async () => {
      try {
        const response = await fetch(
          "https://23700999.com:8081/HMA/API_HRV2UseAf_Compare.jsp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              MID,
              Token,
              MAID,
              Mobile,
              UID,
            }),
          }
        );
        const data = await response.json();
        HRVBeforeData.value = data.HRV2.BcUse;
        HRVAfterData.value = data.HRV2.AfUse;
        if (data.Result === "OK") {
          listBioage.value = (data.HRV2 && data.HRV2.listBioage) || [];
        } else {
          console.error("API Response Error", data);
        }
      } catch (error) {
        console.error("API Error", error);
      }
    };

    const getProductName = async () => {
      try {
        const response = await fetch(
          "https://23700999.com:8081/HMA/API_UIDInfo.jsp",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              MID,
              Token,
              MAID,
              Mobile,
              UID,
            }),
          }
        );

        if (response.status === 200) {
          const data = await response.json();
          productName.value = data?.ProductName || "";
        } else {
          console.error("API Response Error", data);
        }
      } catch (error) {
        console.error("API Error", error);
      }
    };

    const goNext = () => {
      router.push(`/usage/${productName.value}`);
    };
    onMounted(async () => {
      try {
        await Promise.all([API_HRV2UseAf_Compare(), getProductName()]);
      } catch (error) {
        console.error("Error during API calls:", error);
      }
    });


    return {
      listBioage,

      HRVBeforeData,
      HRVAfterData,
      goNext,
    };
  },
};
</script>

<style lang="scss" scoped>
.usageHRVResultWrap {
  background-color: $raphael-gray-100;
  min-height: 100vh;
  padding: 0 1rem;
  padding-bottom: 116px;
  h1 {
    position: sticky;
    background: $raphael-gray-100;
    color: $raphael-black;
    text-align: center;
    font-size: 24px;
    font-weight: 400;
    letter-spacing: 0.5px;
    padding: 0.75rem 0;
    top: 0;
    z-index: 1;
  }
  .thxGroup {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    width: 100%;
    .textGroup {
      flex:1;
      padding:0.75rem;
      &>h3 {
        font-size: 1.5rem;
        font-weight: 400;
        margin: 0;
      }
    }
    .imgGroup{
      position: relative;
      .doctorImg {
        height: 150px;
      }
    }
  }
  .resultChartGroup {
    display: none;
    background-color: $raphael-white;
    border-radius: 0.5rem;
    padding: 12px;
    h2 {
      margin-bottom: 0.75rem;
      color: $raphael-black;
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.15px;
    }
  }
  .BAGroup {
    display: grid;
    grid-template-columns: repeat(2,1fr);
    gap: 0.75rem;
    width: max-content;
    width: 100%;
    margin-top: -0.75rem;
    .BACard {
      position: relative;
      background-color: $raphael-white;
      border-left: 2px solid $raphael-green-400;
      border-radius: 8px;
      padding: 12px;
      overflow: hidden;

      &:nth-child(1),
      &:nth-child(2){
        display: none;
      }

      .titleGroup {
        display: flex;
        gap: 2px;
        color: $raphael-black;
        font-size: 20px;
        font-style: normal;
        font-weight: 400;
        margin-bottom: 0.75rem;
        letter-spacing: 0.15px;

        img {
          position: absolute;
          width: 144px;
          right: -24px;
          bottom: -24px;
          opacity: 0.2;
          filter: grayscale(1) contrast(3);
          mix-blend-mode: darken;
        }
      }
      .BAContent {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        .BA {
          .subTitle {
            color: $raphael-gray-500;
            margin-bottom: 0.25rem;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 1.25;
            letter-spacing: 0.5px;
          }
          .value {
            color: $raphael-green-400;
            text-align: left;
            font-size: 36px;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.09px;
            margin-bottom: 0.25rem;
          }
          .afterValue {
            color: $raphael-cyan-400;
          }

          .unit {
            color: $raphael-gray-300;
            font-size: 16px;
            font-style: normal;
            font-weight: 400;
            line-height: 100%;
            letter-spacing: 0.5px;
          }
        }
        &>svg{
          transform: scale(2);
        }
      }

      .waiting {
        font-size: 12px;
        color: #74bc1f;
        margin-top: 0.5rem;
        letter-spacing: .5px;
      }

      @for $i from 1 through 4 {
        &:nth-child(#{$i}) {
          grid-column: 1/3;
        }
      }
    }
    .BACardS {
      // width: 160px;
    }
  }

  .SympatheticRatioGroup {
    background-color: $raphael-white;
    border-radius: 12px;
    margin-top: 1rem;
    padding: 0.75rem 12px 0;
    h3 {
      color: $raphael-black;
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.15px;
      margin-bottom: 0.5rem;
    }
  }
  .usageBtnGroup {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: $raphael-gray-100;
    z-index: 99;
    padding: 1rem;
    padding-bottom: 3.125rem;

    button {
      @include btnStyle($raphael-green-400,$raphael-white);
    }
    .preBtn {
      background-color: $raphael-gray-200;
      color: $raphael-gray-500;
    }
    .nextBtn {
      background-color: $raphael-green-400;
    }
  }
}
</style>
