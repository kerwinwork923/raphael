<template>
  <div class="sleepRecordWrap">
    <h5 class="pleaseWrite">請填寫以下問題</h5>
    <div class="sleepRecord">
      <h4>1.幾點上床</h4>
      <div class="sleepInputGroup">
        <div class="selectGroup1">
          <img class="timeIcon" src="../assets/imgs/time.svg" alt="" />
          <div class="dropListGroup">
            <div class="dropListText" @click="toggleDropdown('1')">
              點
              <div class="dropListHour">{{ bedTimeHour || "" }}</div>
            </div>

            <div class="dropList" v-if="showDropdown1">
              <div
                class="list"
                v-for="(hour, index) in hours"
                :key="index"
                @click="selectTime('bedTimeHour', hour)"
              >
                {{ hour }}
              </div>
            </div>
          </div>
          <div class="dropListGroup">
            <div class="dropListText" @click="toggleDropdown('1_2')">
              分
              <div class="dropListMinute">{{ bedTimeMinute || "" }}</div>
            </div>
            <div class="dropList" v-if="showDropdown1_2">
              <div
                class="list"
                v-for="(minute, index) in minutes"
                :key="index"
                @click="selectTime('bedTimeMinute', minute)"
              >
                {{ minute }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sleepRecord">
      <h4>2.需要躺多久才入睡</h4>
      <div class="sleepInputGroup">
        <TimePicker currentTimeMode="layTime" placeholder="請選擇入睡時間" />
      </div>
    </div>

    <div class="sleepRecord">
      <h4>3.幾點起床</h4>
      <div class="sleepInputGroup">
        <div class="selectGroup1">
          <img class="timeIcon" src="../assets/imgs/time.svg" alt="" />
          <div class="dropListGroup">
            <div class="dropListText" @click="toggleDropdown('2')">
              點
              <div class="dropListHour">{{ getupTimeHour || "" }}</div>
            </div>

            <div class="dropList" v-if="showDropdown2">
              <div
                class="list"
                v-for="(hour, index) in hours"
                :key="index"
                @click="selectTime('getupTimeHour', hour)"
              >
                {{ hour }}
              </div>
            </div>
          </div>
          <div class="dropListGroup">
            <div class="dropListText" @click="toggleDropdown('2_2')">
              分
              <div class="dropListMinute">{{ getupTimeMinute || "" }}</div>
            </div>
            <div class="dropList" v-if="showDropdown2_2">
              <div
                class="list"
                v-for="(minute, index) in minutes"
                :key="index"
                @click="selectTime('getupTimeMinute', minute)"
              >
                {{ minute }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sleepRecord">
      <h4>4.實際睡眠時間</h4>
      <div class="sleepInputGroup">
        <TimePicker
          currentTimeMode="sleepTime"
          placeholder="請選擇深沉睡眠時間"
        />
      </div>
    </div>

    <div class="sleepRecord">
      <h4>5.睡眠中斷次數</h4>
      <div class="sleepInputGroup">
        <div class="sleepInputGroup">
          <div class="selectGroup1" @click="toggleDropdown('5')">
            <img class="timeIcon" src="../assets/imgs/time.svg" alt="" />
            <div class="dropListGroup dropListGroupTimes">
              <div class="dropListText">
                <div
                  :class="{
                    dropListTextActive: useSleepRecordData.sleepBreak != null,
                  }"
                >
                  {{
                    useSleepRecordData.sleepBreak != null
                      ? useSleepRecordData.sleepBreak
                      : "請選擇睡眠中斷次數"
                  }}
                </div>
              </div>

              <div class="dropList" v-if="showDropdown5">
                <div
                  class="list"
                  v-for="(sleepBreak, index) in sleepBreaks"
                  :key="index"
                  @click="selectTime('sleepBreak', sleepBreak)"
                >
                  {{ sleepBreak }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sleepRecord">
      <h4>6.特殊飲食次數(應酬、聚餐 etc...)</h4>
      <div class="sleepInputGroup">
        <div class="sleepInputGroup">
          <div class="selectGroup1" @click="toggleDropdown('6')">
            <img class="timeIcon" src="../assets/imgs/time.svg" alt="" />
            <div class="dropListGroup dropListGroupTimes">
              <div class="dropListText">
                <div
                  :class="{
                    dropListTextActive: useSleepRecordData.specialDiet != null,
                  }"
                >
                  {{
                    useSleepRecordData.specialDiet != null
                      ? useSleepRecordData.specialDiet
                      : "請選擇次數"
                  }}
                </div>
              </div>

              <div class="dropList" v-if="showDropdown6">
                <div
                  class="list"
                  v-for="(specialDiet, index) in specialDiets"
                  :key="index"
                  @click="selectTime('specialDiet', specialDiet)"
                >
                  {{ specialDiet }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sleepRecord">
      <h4>7.藥物輔助情形</h4>
      <div class="sleepInputGroup">
        <div class="sleepInputGroup">
          <div class="selectGroup1" @click="toggleDropdown('7')">
            <img class="timeIcon" src="../assets/imgs/time.svg" alt="" />
            <div class="dropListGroup dropListGroupTimes">
              <div class="dropListText">
                <div
                  :class="{
                    dropListTextActive: useSleepRecordData.medhelp != null,
                  }"
                >
                  {{
                    useSleepRecordData.medhelp != null
                      ? useSleepRecordData.medhelp
                      : "請選擇每週使用藥物幫助睡眠天數"
                  }}
                </div>
              </div>

              <div class="dropList" v-if="showDropdown7">
                <div
                  class="list"
                  v-for="(medhelp, index) in medhelps"
                  :key="index"
                  @click="selectTime('medhelp', medhelp)"
                >
                  {{ medhelp }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sleepRecord">
      <h4>8.自覺睡眠品質</h4>
      <ScoreBar
        :options="useSleepRecordData.sleepQualityOptions"
        property="sleepProperty"
      />
    </div>

    <div class="sleepRecord">
      <h4>9.白天情緒狀態</h4>
      <ScoreBar
        :options="useSleepRecordData.dayEmotionOptions"
        property="emotionalState"
      />
    </div>

    <div class="sleepRecord">
      <h4>10.白天體力、專注力、記憶力</h4>
      <ScoreBar
        :options="useSleepRecordData.dayStateOptions"
        property="physicalStrength"
      />
    </div>

    <div class="sleepRecord">
      <h4>11.白天嗜睡程度</h4>
      <ScoreBar
        :options="useSleepRecordData.daySleepOptions"
        property="dayTimeSleepiness"
      />
    </div>

    <div class="sleepRecord">
      <h4>12.工作壓力、變動 (含升遷、離職、工作轉換)</h4>
      <ScoreBar
        :options="useSleepRecordData.defaultOptions"
        property="workStress"
      />
    </div>

    <div class="sleepRecord">
      <h4>13.親密關係壓力 (含結婚、爭吵、離婚等)</h4>
      <ScoreBar
        :options="useSleepRecordData.defaultOptions"
        property="relationshipStress"
      />
    </div>

    <div class="sleepRecord">
      <h4>14.自身或家人健康狀況壓力</h4>
      <ScoreBar
        :options="useSleepRecordData.defaultOptions"
        property="healthStress"
      />
    </div>

    <div class="sleepRecord">
      <h4>15.生活型態變動壓力 (含飲食習慣調整、強迫運動等)</h4>
      <ScoreBar
        :options="useSleepRecordData.defaultOptions"
        property="lifestyleChangeStress"
      />
    </div>

    <div class="sleepRecord">
      <h4>16.經濟壓力 (含常態性支出或突發性支出)</h4>
      <ScoreBar
        :options="useSleepRecordData.defaultOptions"
        property="financialStress"
      />
    </div>

    <div class="sleepRecord">
      <h4>17.壓力事件紀錄</h4>
      <div class="sleepInputGroup">
        <textarea
          name=""
          rows="5"
          placeholder="請簡短講述近期壓力事件"
          id=""
          v-model="useSleepRecordData.otherPressureEventt"
        ></textarea>
      </div>
    </div>
    <button class="submitBtn" @click="firstTest" :disabled="isSubmitting">
      完成
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useSleepRecordStore } from "../stores/sleepRecord";
import ScoreBar from "~/components/ScoreBar.vue";
import TimePicker from "../components/TimePicker.vue";
import TimePicker2 from "../components/TimePicker2.vue";
import TimesOption from "../components/TimesOption.vue";
export default {
  components: { ScoreBar, TimePicker, TimePicker2, TimesOption },
  setup() {
    const useSleepRecordData = useSleepRecordStore();

    const isSubmitting = ref(false);

    const bedTimeHour = ref();
    const bedTimeMinute = ref();
    const getupTimeHour = ref();
    const getupTimeMinute = ref();

    const showDropdown1 = ref(false);
    const showDropdown1_2 = ref(false);
    const showDropdown2 = ref(false);
    const showDropdown2_2 = ref(false);
    const showDropdown5 = ref(false);
    const showDropdown6 = ref(false);
    const showDropdown7 = ref(false);

    // 引用下拉選單的 DOM 元素
    const userRecord = ref(null);
    // const bedTimeHourDropdown = ref(null);
    // const bedTimeMinuteDropdown = ref(null);
    // const getupTimeHourDropdown = ref(null);
    // const getupTimeMinuteDropdown = ref(null);

    const hours = Array.from({ length: 24 }, (_, i) =>
      String(i).padStart(2, "0")
    );
    const minutes = Array.from({ length: 4 }, (_, i) =>
      String(i * 15).padStart(2, "0")
    );

    const sleepBreaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // const peeTimes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const specialDiets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const medhelps = [0, 1, 2, 3, 4, 5, 6, 7];

    watch([bedTimeHour, bedTimeMinute], ([newHour, newMinute]) => {
      if (newHour !== undefined && newMinute !== undefined) {
        const bedTime = `${String(newHour).padStart(2, "0")}:${String(
          newMinute
        ).padStart(2, "0")}`;
        useSleepRecordData.bedTime = bedTime;
      }
    });

    watch([getupTimeHour, getupTimeMinute], ([newHour, newMinute]) => {
      if (newHour !== undefined && newMinute !== undefined) {
        const getupTime = `${String(newHour).padStart(2, "0")}:${String(
          newMinute
        ).padStart(2, "0")}`;
        useSleepRecordData.getupTime = getupTime;
      }
    });

    const closeAllSelect = (currentDropdown) => {
      showDropdown1.value =
        currentDropdown === "1" ? !showDropdown1.value : false;
      showDropdown1_2.value =
        currentDropdown === "1_2" ? !showDropdown1_2.value : false;
      showDropdown2.value =
        currentDropdown === "2" ? !showDropdown2.value : false;
      showDropdown2_2.value =
        currentDropdown === "2_2" ? !showDropdown2_2.value : false;
      showDropdown5.value =
        currentDropdown === "5" ? !showDropdown5.value : false;
      showDropdown6.value =
        currentDropdown === "6" ? !showDropdown6.value : false;
      showDropdown7.value =
        currentDropdown === "7" ? !showDropdown7.value : false;
    };

    // 選擇時間
    const selectTime = (type, value) => {
      const timeMappings = {
        bedTimeHour: () => {
          bedTimeHour.value = value;
          showDropdown1.value = false;
        },
        bedTimeMinute: () => {
          bedTimeMinute.value = value;
          showDropdown1_2.value = false;
        },
        getupTimeHour: () => {
          getupTimeHour.value = value;
          showDropdown2.value = false;
        },
        getupTimeMinute: () => {
          getupTimeMinute.value = value;
          showDropdown2_2.value = false;
        },
        sleepBreak: () => {
          useSleepRecordData.sleepBreak = value;
        },
        peeTime: () => {
          useSleepRecordData.peeTime = value;
        },
        specialDiet: () => {
          useSleepRecordData.specialDiet = value;
        },
        medhelp: () => {
          useSleepRecordData.medhelp = value;
        },
      };

      // 如果存在對應的函數，則執行它
      if (timeMappings[type]) {
        timeMappings[type]();
      }
    };

    // 切換下拉選單顯示狀態
    const toggleDropdown = (dropdown) => {
      switch (dropdown) {
        case "1": {
          closeAllSelect("1");
          break;
        }
        case "1_2": {
          closeAllSelect("1_2");
          break;
        }
        case "2": {
          closeAllSelect("2");
          break;
        }
        case "2_2": {
          closeAllSelect("2_2");
          break;
        }
        case "5": {
          closeAllSelect("5");
          break;
        }
        case "6": {
          closeAllSelect("6");
          break;
        }
        case "7": {
          closeAllSelect("7");
          break;
        }
      }
    };

    // 點擊外部關閉所有下拉選單
    const handleClickOutside = (event) => {
      if (userRecord.value && !userRecord.value.contains(event.target)) {
        // 點擊在 userRecord 之外
        showDropdown1.value = false;
        showDropdown1_2.value = false;
        showDropdown2.value = false;
        showDropdown2_2.value = false;
      }
    };

    // 添加和移除全局點擊事件監聽器
    onMounted(() => {
      document.addEventListener("click", handleClickOutside);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", handleClickOutside);
    });

    // 完成測試
    const firstTest = async () => {
      if (isSubmitting.value) return;
      isSubmitting.value = true;
      try {
        await useSleepRecordData.saveSleepRecord();

        // 在儲存成功後直接重整頁面
        location.reload();
      } catch (err) {
        console.error(err);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      useSleepRecordData,
      toggleDropdown,
      selectTime,
      bedTimeHour,
      bedTimeMinute,
      getupTimeHour,
      getupTimeMinute,
      showDropdown1,
      showDropdown1_2,
      showDropdown2,
      showDropdown2_2,
      showDropdown5,
      showDropdown6,
      showDropdown7,
      firstTest,
      closeAllSelect,
      hours,
      minutes,
      sleepBreaks,
      specialDiets,
      medhelps,
      isSubmitting,
    };
  },
};
</script>

<style lang="scss">
.sleepRecordWrap {
  margin-top: 0.75rem;
  .sleepRecord {
    background-color: #fff;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;

    &>h4{
      font-size: 20px;
      font-weight: 500;
      color: #1e1e1e;
      letter-spacing: 0.15px;
      line-height: 32.36px;
    }

    .selectGroup1 {
      display: flex;
      align-items: center;
      position: relative;

      .timeIcon {
        position: absolute;
        left: 0;
      }
      .dropListGroup {
        width: 50%;
        position: relative;
        border-bottom:1px solid #eee;

        .dropListText {
          position: relative;
          text-align: right;
          color: #b3b3b3;
          margin: 12px 0;
          cursor: pointer;

          .dropListHour,
          .dropListMinute {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translate(-50%, 0);
            color: #74bc1f;
            font-weight: bold;
          }
        }
        .dropListActive {
        }
        width: 100%;
        .dropList {
          position: absolute;
          display: flex;
          flex-direction: column;
          width: 70%;
          font-size: 1.125rem;
          left: 12.5%;
          z-index: 2;
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(6px);
          border-radius: 8px;
          color: $raphael-gray-500;
          padding: 0.25rem 0;
          max-height: 200px;
          box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
          overflow-y: scroll;

          .list {
            padding: 0.75rem;
            cursor: pointer;
          }
        }
      }
      .dropListGroupTimes {
        width: 100%;
        .dropListText {
          text-align: left;
          margin-left: 1.25rem;
        }
        .dropListTextActive {
          color: #74bc1f !important;
          letter-spacing: 1.25px;
          font-weight: bold;
        }
        .dropList {
          width: 100%;
          left: 0;
          .list {
            text-align-last: left;
          }
        }
      }
    }

    textarea {
      width: 100%;
      border: none;
      outline: none;
      border: 1px solid #666;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      margin-top: 0.85rem;
      font-size: 1rem;
    }
    .timeInput {
      padding-left: 1.5rem;
    }
    .icon1 {
      position: absolute;
      top: 5%;
      left: 2px;
    }
  }
}
</style>
