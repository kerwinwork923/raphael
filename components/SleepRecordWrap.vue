<template>
  <div class="sleepRecordWrap">
    <h5 class="pleaseWrite">請填寫以下問題</h5>
    <div class="sleepRecordList">
      <div class="sleepRecord">
        <h4>1.您通常幾點上床睡覺？</h4>
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
        <h4>2.您需要多長時間才能入睡？</h4>
        <div class="sleepInputGroup">
          <TimePicker currentTimeMode="layTime" placeholder="請選擇入睡時間" />
        </div>
      </div>

      <div class="sleepRecord">
        <h4>3.您通常幾點醒來？</h4>
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
        <h4>4.您通常幾點離開床</h4>
        <div class="sleepInputGroup">
          <div class="selectGroup1">
            <img class="timeIcon" src="../assets/imgs/time.svg" alt="" />
            <div class="dropListGroup">
              <div class="dropListText" @click="toggleDropdown('3')">
                點
                <div class="dropListHour">{{ leaveBedTimeHour || "" }}</div>
              </div>

              <div class="dropList" v-if="showDropdown3">
                <div
                  class="list"
                  v-for="(hour, index) in hours"
                  :key="index"
                  @click="selectTime('leaveBedTimeHour', hour)"
                >
                  {{ hour }}
                </div>
              </div>
            </div>
            <div class="dropListGroup">
              <div class="dropListText" @click="toggleDropdown('3_2')">
                分
                <div class="dropListMinute">{{ leaveBedTimeMinute || "" }}</div>
              </div>
              <div class="dropList" v-if="showDropdown3_2">
                <div
                  class="list"
                  v-for="(minute, index) in minutes"
                  :key="index"
                  @click="selectTime('leaveBedTimeMinute', minute)"
                >
                  {{ minute }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sleepRecord">
        <h4>5.一晚醒來幾次？</h4>
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
        <h4>7.近兩週，您有幾次聚餐或應酬?</h4>
        <div class="sleepInputGroup">
          <div class="sleepInputGroup">
            <div class="selectGroup1" @click="toggleDropdown('6')">
              <img class="timeIcon" src="../assets/imgs/time.svg" alt="" />
              <div class="dropListGroup dropListGroupTimes">
                <div class="dropListText">
                  <div
                    :class="{
                      dropListTextActive:
                        useSleepRecordData.specialDiet != null,
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
        <h4>8.近兩週，您有使用助眠藥物嗎？</h4>
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
        <h4>9.近兩週，您覺得睡眠品質如何？</h4>
        <ScoreBar
          :options="useSleepRecordData.sleepQualityOptions"
          property="sleepProperty"
        />
      </div>

      <div class="sleepRecord">
        <h4>10.白天心情如何?</h4>
        <ScoreBar
          :options="useSleepRecordData.dayEmotionOptions"
          property="emotionalState"
        />
      </div>

      <div class="sleepRecord">
        <h4>11.白天感覺體力、專注力、記憶力如何?</h4>
        <ScoreBar
          :options="useSleepRecordData.dayStateOptions"
          property="physicalStrength"
        />
      </div>

      <div class="sleepRecord">
        <h4>12.白天會不會想睡覺?</h4>
        <ScoreBar
          :options="useSleepRecordData.daySleepOptions"
          property="dayTimeSleepiness"
        />
      </div>

      <div class="sleepRecord">
        <h4>13.近兩週,您覺得工作有受到影響嗎？</h4>
        <ScoreBar
          :options="useSleepRecordData.defaultOptions"
          property="workStress"
        />
      </div>

      <div class="sleepRecord">
        <h4>14.近兩週,您與身邊重要的人相處時還順利嗎？</h4>
        <ScoreBar
          :options="useSleepRecordData.defaultOptions"
          property="relationshipStress"
        />
      </div>

      <div class="sleepRecord">
        <h4>15.近兩週,您或家人的健康狀況對您的生活影響如何？</h4>
        <ScoreBar
          :options="useSleepRecordData.defaultOptions"
          property="healthStress"
        />
      </div>

      <div class="sleepRecord">
        <h4>16.近兩週,您的生活習慣調整（如飲食、運動）您適應得如何？</h4>
        <ScoreBar
          :options="useSleepRecordData.defaultOptions"
          property="lifestyleChangeStress"
        />
      </div>

      <div class="sleepRecord">
        <h4>17.近兩週,您的經濟狀況有壓力嗎？</h4>
        <ScoreBar
          :options="useSleepRecordData.defaultOptions"
          property="financialStress"
        />
      </div>

      <div class="sleepRecord">
        <h4>18.最近有讓您壓力大的事件嗎？</h4>
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
    const leaveBedTimeHour = ref();
    const leaveBedTimeMinute = ref();

    const showDropdown1 = ref(false);
    const showDropdown1_2 = ref(false);
    const showDropdown2 = ref(false);
    const showDropdown2_2 = ref(false);
    const showDropdown3 = ref(false);
    const showDropdown3_2 = ref(false);

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

    const sleepBreaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,">10"];
    // const peeTimes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const specialDiets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,">10"];
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

    watch([leaveBedTimeHour, leaveBedTimeMinute], ([newHour, newMinute]) => {
      if (newHour !== undefined && newMinute !== undefined) {
        const leaveTime = `${String(newHour).padStart(2, "0")}:${String(
          newMinute
        ).padStart(2, "0")}`;
        useSleepRecordData.leaveTime = leaveTime;
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
      showDropdown3.value =
        currentDropdown === "3" ? !showDropdown3.value : false;
      showDropdown3_2.value =
        currentDropdown === "3_2" ? !showDropdown3_2.value : false;
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
        leaveBedTimeHour: () => {
          leaveBedTimeHour.value = value;
          showDropdown3.value = false;
        },
        leaveBedTimeMinute: () => {
          leaveBedTimeMinute.value = value;
          showDropdown3_2.value = false;
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
        case "1":
          closeAllSelect("1");
          break;
        case "1_2":
          closeAllSelect("1_2");
          break;
        case "2":
          closeAllSelect("2");
          break;
        case "2_2":
          closeAllSelect("2_2");
          break;
        case "3":
          closeAllSelect("3");
          break;
        case "3_2":
          closeAllSelect("3_2");
          break;
        case "5":
          closeAllSelect("5");
          break;
        case "6":
          closeAllSelect("6");
          break;
        case "7":
          closeAllSelect("7");
          break;
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
      showDropdown3,
      showDropdown3_2,
      firstTest,
      closeAllSelect,
      hours,
      minutes,
      sleepBreaks,
      specialDiets,
      medhelps,
      isSubmitting,
      leaveBedTimeHour,
      leaveBedTimeMinute,
    };
  },
};
</script>

<style lang="scss" scoped>
.sleepRecordWrap {
  margin-top: 0.75rem;

  .pleaseWrite {
    margin: 1rem 0 0.75rem 0;
    color: $raphael-gray-500;
    font-size: 1rem;
  }
  .sleepRecordList {
    height: calc(100vh - 267px);
    overflow-y: auto;
    margin-bottom: 0.75rem;
    @include scrollbarStyle();

    @include respond-to("phone-landscape") {
      height: calc(100vh - 100px);
    }

    .sleepRecord {
      background-color: $raphael-white;
      margin-bottom: 0.75rem;
      padding: 0.75rem;
      border-radius: 12px;

      & > h4 {
        font-size: 20px;
        font-weight: 500;
        color: $raphael-black;
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
          border-bottom: 1px solid $raphael-gray-200;

          .dropListText {
            position: relative;
            text-align: right;
            color: $raphael-gray-300;
            margin: 12px 0;
            cursor: pointer;

            .dropListHour,
            .dropListMinute {
              position: absolute;
              left: 50%;
              top: 0;
              transform: translate(-50%, 0);
              color: $raphael-green-400;
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
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16),
              0 3px 6px rgba(0, 0, 0, 0.23);
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
            color: $raphael-green-400 !important;
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
        border: 1px solid $raphael-gray-500;
        border-radius: 8px;
        padding: 0.5rem 1rem;
        margin-top: 0.85rem;
        font-size: 1rem;
        resize: none;
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
  .submitBtn,
  .backToUserBtn {
    @include btnStyle($raphael-green-400, $raphael-white);
  }
}
</style>
