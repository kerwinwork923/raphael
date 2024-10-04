<template>
  <div class="userRecord">
    <RaphaelLoading v-if="loading" />
    <Navbar />
    <div class="userRecoreWrap">
      <div class="tagList">
        <div class="listItem">總覽</div>
        <div class="listItem">每周量表</div>
        <div class="listItem listActive">睡眠紀錄</div>
        <div class="listItem">兒童成長紀錄</div>
      </div>

      <div class="sleepRecordWrap" v-if="sleepState === 'firstTest'">
        <div class="subList">
          <span class="subListActive">填寫問卷</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="33"
            height="9"
            viewBox="0 0 33 9"
            fill="none"
          >
            <path
              d="M32.3536 4.85355C32.5488 4.65829 32.5488 4.34171 32.3536 4.14645L29.1716 0.964466C28.9763 0.769204 28.6597 0.769204 28.4645 0.964466C28.2692 1.15973 28.2692 1.47631 28.4645 1.67157L31.2929 4.5L28.4645 7.32843C28.2692 7.52369 28.2692 7.84027 28.4645 8.03553C28.6597 8.2308 28.9763 8.2308 29.1716 8.03553L32.3536 4.85355ZM0 5H32V4H0V5Z"
              fill="#CCCCCC"
            />
          </svg>
          <span>結果分析</span>
        </div>

        <h5 class="pleaseWrite">請填寫以下問題</h5>
        <div class="sleepRecord">
          <h4>1.幾點上床</h4>
          <div class="sleepInputGroup">
            <!-- <input class="timeInput" placeholder="請選擇上床時間" /> -->
            <!-- <TimePicker2 v-model="bedTimeHour" label="請選擇上床時間" /> -->
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
            <TimePicker
              currentTimeMode="layTime"
              placeholder="請選擇入睡時間"
            />
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
                        dropListTextActive:
                          useFirstSleepRecordData.sleepBreak != null,
                      }"
                    >
                      {{
                        useFirstSleepRecordData.sleepBreak != null
                          ? useFirstSleepRecordData.sleepBreak
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

        <!-- <div class="sleepRecord">
          <h4>6.夜尿次數</h4>
          <div class="sleepInputGroup">
            <div class="sleepInputGroup">
              <div class="selectGroup1" @click="toggleDropdown('6')">
                <img class="timeIcon" src="../assets/imgs/time.svg" alt="" />
                <div class="dropListGroup dropListGroupTimes">
                  <div class="dropListText">
                    <div
                      :class="{
                        dropListTextActive:
                          useFirstSleepRecordData.peeTime >= 0,
                      }"
                    >
                      {{
                        useFirstSleepRecordData.peeTime >= 0
                          ? useFirstSleepRecordData.peeTime
                          : "請選擇夜尿次數"
                      }}
                    </div>
                  </div>

                  <div class="dropList" v-if="showDropdown6">
                    <div
                      class="list"
                      v-for="(peeTime, index) in peeTimes"
                      :key="index"
                      @click="selectTime('peeTime', peeTime)"
                    >
                      {{ peeTime }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> -->

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
                        dropListTextActive:
                          useFirstSleepRecordData.specialDiet != null,
                      }"
                    >
                      {{
                        useFirstSleepRecordData.specialDiet != null
                          ? useFirstSleepRecordData.specialDiet
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
                        dropListTextActive:
                          useFirstSleepRecordData.medhelp != null,
                      }"
                    >
                      {{
                        useFirstSleepRecordData.medhelp != null
                          ? useFirstSleepRecordData.medhelp
                          : "請選擇每週使用藥物幫助睡眠天數"
                      }}
                      天
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
            :options="useFirstSleepRecordData.sleepQualityOptions"
            property="sleepProperty"
          />
        </div>

        <div class="sleepRecord">
          <h4>9.白天情緒狀態</h4>
          <ScoreBar
            :options="useFirstSleepRecordData.dayEmotionOptions"
            property="emotionalState"
          />
        </div>

        <div class="sleepRecord">
          <h4>10.白天體力、專注力、記憶力</h4>
          <ScoreBar
            :options="useFirstSleepRecordData.dayStateOptions"
            property="physicalStrength"
          />
        </div>

        <div class="sleepRecord">
          <h4>11.白天嗜睡程度</h4>
          <ScoreBar
            :options="useFirstSleepRecordData.daySleepOptions"
            property="dayTimeSleepiness"
          />
        </div>

        <div class="sleepRecord">
          <h4>12.工作壓力、變動 (含升遷、離職、工作轉換)</h4>
          <ScoreBar
            :options="useFirstSleepRecordData.defaultOptions"
            property="workStress"
          />
        </div>

        <div class="sleepRecord">
          <h4>13.親密關係壓力 (含結婚、爭吵、離婚等)</h4>
          <ScoreBar
            :options="useFirstSleepRecordData.defaultOptions"
            property="relationshipStress"
          />
        </div>

        <div class="sleepRecord">
          <h4>14.自身或家人健康狀況壓力</h4>
          <ScoreBar
            :options="useFirstSleepRecordData.defaultOptions"
            property="healthStress"
          />
        </div>

        <div class="sleepRecord">
          <h4>15.生活型態變動壓力 (含飲食習慣調整、強迫運動等)</h4>
          <ScoreBar
            :options="useFirstSleepRecordData.defaultOptions"
            property="lifestyleChangeStress"
          />
        </div>

        <div class="sleepRecord">
          <h4>16.經濟壓力 (含常態性支出或突發性支出)</h4>
          <ScoreBar
            :options="useFirstSleepRecordData.defaultOptions"
            property="financialStress"
          />
        </div>

        <div class="sleepRecord">
          <h4>17.其他壓力來源</h4>
          <div class="sleepInputGroup">
            <textarea
              name=""
              rows="5"
              placeholder="請簡短講述近期壓力事件"
              id=""
              v-model="useFirstSleepRecordData.otherPressureEventt"
            ></textarea>
          </div>
        </div>
        <button class="submitBtn" @click="firstTest" :disabled="isSubmitting">
          完成
        </button>
      </div>

      <div class="sleepIndex1" v-if="sleepState === 'sleepRecord1'">
        <div class="floatGroup">
          <div v-html="SleepText" class="floatLeft"></div>

          <img src="../assets/imgs/doctor.png" alt="" />
        </div>
        <div class="firstSleepRecord">
          <h2>檢測紀錄</h2>
          <div class="emojiGroup">
            <div class="firstScore">
              <div class="firstScoreTitle">
                <h3>第一次檢測分數</h3>
              </div>
              <div class="emojiBox">
                <img src="../assets/imgs/smile.png" alt="" />
                <div class="score">80</div>
              </div>
            </div>
            <div class="secScore">
              <div class="firstScoreTitle">
                <h3>第二次檢測分數</h3>
              </div>
              <div class="emojiBox">
                <img src="../assets/imgs/unSmile.png" alt="" />
                <div class="score">---</div>
              </div>
            </div>
          </div>
          <div class="sleepRecordListGroup">
            <h5 class="sleepRecordListDate">
              {{
                sleepRecData.SleepRec.length > 0
                  ? formatCheckTime(sleepRecData?.SleepRec[0].CheckTime)
                  : ""
              }}
            </h5>
            <div class="sleepRecordList">
              <div class="sleepRecordItem">
                <h4>上床時間</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.bedTime || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>入睡時間</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.LayTimeToSleep || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>起床時間</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.getupTime || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>深層睡眠時間</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.SleepTime || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>睡眠中斷次數</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.SleepBreak || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>特殊飲食次數</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.SpecialDiet || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>藥物輔助天數</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.MedHelp || "-" }}</h5>
              </div>

              <div class="sleepRecordItem">
                <h4>自覺睡覺品質</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.SleepProperty || "-" }}</h5>
              </div>

              <div class="sleepRecordItem">
                <h4>白天情緒狀態</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.emotionalState || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>白天體力、專注力、記憶力</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.SpecialDiet || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>白天嗜睡程度</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[0]?.daytimeSleepiness || "-" }}
                </h5>
              </div>
              <div class="sleepRecordItem">
                <h4>工作壓力、變動</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.workStress || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>輕密關係壓力</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[0]?.relationshipStress || "-" }}
                </h5>
              </div>
              <div class="sleepRecordItem">
                <h4>自身或家人健康狀況壓力</h4>
                <h5>{{ sleepRecData?.SleepRec[0]?.healthStress || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>生活型態變動壓力</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[0]?.lifestyleChangeStress || "-" }}
                </h5>
              </div>
              <div class="sleepRecordItem">
                <h4>經濟壓力</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[0]?.physicalStrength || "-" }}
                </h5>
              </div>
              <div class="sleepRecordItem">
                <h4>壓力事件紀錄</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[0]?.OtherPressureEvent || "-" }}
                </h5>
              </div>
            </div>
          </div>
        </div>

        <div class="firstSleepRecord" v-if="sleepRecData?.SleepRec[1]">
          <div class="sleepRecordListGroup">
            <h5 class="sleepRecordListDate">
              {{
                sleepRecData
                  ? formatCheckTime(sleepRecData?.SleepRec[1].CheckTime)
                  : ""
              }}
            </h5>
            <div class="sleepRecordList">
              <div class="sleepRecordItem">
                <h4>上床時間</h4>
                <h5>{{ sleepRecData?.SleepRec[1].bedTime || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>入睡時間</h4>
                <h5>{{ sleepRecData?.SleepRec[1].LayTimeToSleep || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>起床時間</h4>
                <h5>{{ sleepRecData?.SleepRec[1].getupTime || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>深層睡眠時間</h4>
                <h5>{{ sleepRecData?.SleepRec[1].SleepTime || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>睡眠中斷次數</h4>
                <h5>{{ sleepRecData?.SleepRec[1].SleepBreak || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>特殊飲食次數</h4>
                <h5>{{ sleepRecData?.SleepRec[1].SpecialDiet || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>藥物輔助天數</h4>
                <h5>{{ sleepRecData?.SleepRec[1].MedHelp || "-" }}</h5>
              </div>

              <div class="sleepRecordItem">
                <h4>自覺睡覺品質</h4>
                <h5>{{ sleepRecData?.SleepRec[1].SleepProperty || "-" }}</h5>
              </div>

              <div class="sleepRecordItem">
                <h4>白天情緒狀態</h4>
                <h5>{{ sleepRecData?.SleepRec[1].emotionalState || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>白天體力、專注力、記憶力</h4>
                <h5>{{ sleepRecData?.SleepRec[1].SpecialDiet || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>白天嗜睡程度</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[1].daytimeSleepiness || "-" }}
                </h5>
              </div>
              <div class="sleepRecordItem">
                <h4>工作壓力、變動</h4>
                <h5>{{ sleepRecData?.SleepRec[1].workStress || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>輕密關係壓力</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[1].relationshipStress || "-" }}
                </h5>
              </div>
              <div class="sleepRecordItem">
                <h4>自身或家人健康狀況壓力</h4>
                <h5>{{ sleepRecData?.SleepRec[1].healthStress || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>生活型態變動壓力</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[1].lifestyleChangeStress || "-" }}
                </h5>
              </div>
              <div class="sleepRecordItem">
                <h4>經濟壓力</h4>
                <h5>{{ sleepRecData?.SleepRec[1].physicalStrength || "-" }}</h5>
              </div>
              <div class="sleepRecordItem">
                <h4>壓力事件紀錄</h4>
                <h5>
                  {{ sleepRecData?.SleepRec[1].OtherPressureEvent || "-" }}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from "~/components/Navbar.vue";
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import ScoreBar from "~/components/ScoreBar.vue";
import TimePicker from "../components/TimePicker.vue";
import TimePicker2 from "../components/TimePicker2.vue";
import TimesOption from "../components/TimesOption.vue";
import { useFirstSleepRecordStore } from "~/stores/firstSleepRecord";
import axios from "axios";
import { useRouter } from "vue-router";

import RaphaelLoading from "../components/RaphaelLoading";

const isSubmitting = ref(false);

export default {
  components: {
    Navbar,
    ScoreBar,
    TimePicker,
    TimePicker2,
    TimesOption,
    RaphaelLoading,
  },
  setup() {
    const useFirstSleepRecordData = useFirstSleepRecordStore();

    const router = useRouter();

    const sleepState = ref();
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
    const bedTimeHourDropdown = ref(null);
    const bedTimeMinuteDropdown = ref(null);
    const getupTimeHourDropdown = ref(null);
    const getupTimeMinuteDropdown = ref(null);

    const sleepRecData = ref(null);
    const sleepRecIndexData = ref(null);

    const SleepRecCond = ref(null);
    const loading = ref(false);

    const SleepText = ref(`
    感謝您使用我們的系統請等待<span>${SleepRecCond.value}天</span>後再進行第二次檢測
    `);

    watch([bedTimeHour, bedTimeMinute], ([newHour, newMinute]) => {
      if (newHour !== undefined && newMinute !== undefined) {
        // 格式化為 "xx:xx"
        const bedTime = `${String(newHour).padStart(2, "0")}:${String(
          newMinute
        ).padStart(2, "0")}`;
        useFirstSleepRecordData.bedTime = bedTime; // 更新 Pinia 狀態
      }
    });

    watch([getupTimeHour, getupTimeMinute], ([newHour, newMinute]) => {
      if (newHour !== undefined && newMinute !== undefined) {
        // 格式化為 "xx:xx"
        const getupTime = `${String(newHour).padStart(2, "0")}:${String(
          newMinute
        ).padStart(2, "0")}`;
        useFirstSleepRecordData.getupTime = getupTime; // 更新 Pinia 狀態
      }
    });

    // 時間選項
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
          useFirstSleepRecordData.sleepBreak = value;
        },
        peeTime: () => {
          useFirstSleepRecordData.peeTime = value;
        },
        specialDiet: () => {
          useFirstSleepRecordData.specialDiet = value;
        },
        medhelp: () => {
          useFirstSleepRecordData.medhelp = value;
        },
      };

      // 如果存在對應的函數，則執行它
      if (timeMappings[type]) {
        timeMappings[type]();
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

    const getSleepRecData = async () => {
  

      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      if (!MID || !Token || !MAID || !Mobile) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_SleepRecDetail.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
          }
        );
        if (response.status === 200) {
          response.data.SleepRec.reverse();
          sleepRecData.value = response.data;

          SleepRecCond.value = sleepRecIndexData.value.SleepRecCond;
          if (sleepRecData.value.SleepRec.length >= 2) {
            SleepText.value = `
          感謝您使用我們的系統恭喜您已完成了兩次測驗 !
          `;
          } else {
        
            SleepText.value = `
          感謝您使用我們的系統請等待<span>${SleepRecCond.value}天</span>後再進行第二次檢測
          `;
          }

          if (
            sleepRecData.value.SleepRec.length < 2 &&
            SleepRecCond.value == "-1"
          ) {
            sleepState.value = "firstTest";
          } else if (
            sleepRecData.value.SleepRec.length < 1 &&
            SleepRecCond.value == "-1"
          ) {
            sleepState.value = "firstTest";
          } else {
            sleepState.value = "sleepRecord1";
          }
        }
      } catch (err) {
        console.log(err);
      } 
    };

    const getIndexSleepRecData = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile } = localData
        ? JSON.parse(localData)
        : {};

      if (!MID || !Token || !MAID || !Mobile) {
        router.push("/login");
        return;
      }

      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_SleepRec.jsp",
          {
            MID: String(MID),
            Token: String(Token),
            MAID: String(MAID),
            Mobile: String(Mobile),
          }
        );

        if (response.status === 200) {
          sleepRecIndexData.value = response.data;
        }
      } catch (err) {
        console.log(err);
      }
    };
    const cc = async () => {
      try {
        loading.value = true;
        await getIndexSleepRecData();
        await getSleepRecData();
      } catch (err) {
        console.log("Error in cc function:", err);
      }
      loading.value = false;
    };

    watch(SleepRecCond, (newVal) => {
      console.log("SleepRecCond updated:", newVal);
    });

    cc();

    // getSleepRecData();
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
        const sleepStore = useFirstSleepRecordStore();
        await sleepStore.saveSleepRecord();
        await getSleepRecData();
        await getIndexSleepRecData();
        sleepState.value = "sleepRecord1";
        window.scrollTo(0, 0);
      } catch (err) {
        console.error(err);
      } finally {
        isSubmitting.value = false;
      }
    };

    const formatCheckTime = (timeString) => {
      const year = timeString.substring(0, 4);
      const month = timeString.substring(4, 6);
      const day = timeString.substring(6, 8);

      // Return formatted date as MM/DD (remove leading zeros from month and day)
      return `${parseInt(month)}/${parseInt(day)}`;
    };

    return {
      sleepState,
      firstTest,
      loading,
      useFirstSleepRecordData,
      hours,
      minutes,
      showDropdown1,
      showDropdown1_2,
      showDropdown2,
      showDropdown2_2,
      showDropdown5,
      showDropdown6,
      showDropdown7,
      sleepBreaks,
      toggleDropdown,
      selectTime,
      bedTimeHour,
      bedTimeMinute,
      getupTimeHour,
      getupTimeMinute,
      userRecord,
      medhelps,
      bedTimeHourDropdown,
      bedTimeMinuteDropdown,
      getupTimeHourDropdown,
      getupTimeMinuteDropdown,
      useFirstSleepRecordData,
      specialDiets,
      sleepRecData,
      formatCheckTime,
      SleepText,
      isSubmitting,
    };
  },
};
</script>

<style lang="scss">
.userRecord {
  min-height: 100vh;
  width: 100%;
  background-color: $raphael-gray-200;
  margin-bottom: 50px;
  padding-bottom: 2rem;
}
.userRecoreWrap {
  padding: 0 5%;
}
.tagList {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75%;
  padding-top: 4.5rem;
  .listItem {
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.1px;
    padding: 10px 12px;
    border-radius: 6px;
    color: $raphael-gray-500;
    cursor: pointer;
  }
  .listActive {
    background-color: $raphael-green-400;
    color: #fff;
  }
}
.subList {
  color: #666;
  font-family: 14px;
  margin-top: 1rem;
  svg {
    margin-left: 8px;
    margin-right: 4px;
  }
  .subListActive {
    color: $raphael-red-500;
  }
}
.pleaseWrite {
  margin: 1rem 0 0.75rem 0;
  color: $raphael-gray-500;
  font-size: 1rem;
}
.sleepRecordWrap {
  margin-top: 0.75rem;
  .sleepRecord {
    background-color: #fff;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border-radius: 12px;

    .selectGroup1 {
      display: flex;
      position: relative;

      .timeIcon {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-5%);
      }
      .dropListGroup {
        width: 50%;
        padding-top: 0.75rem;

        position: relative;
        .dropListText {
          text-align: right;
          color: #b3b3b3;
          padding: 12px 0;
          cursor: pointer;

          .dropListHour,
          .dropListMinute {
            position: absolute;
            left: 50%;
            top: 60%;

            transform: translate(-50%, -50%);
            color: #1e1e1e;
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
          left: 12.5%;
          z-index: 2;
          background-color: #fff;
          border: 1px solid #666;
          border-radius: 8px;
          padding: 0.25rem 0;
          max-height: 200px;
          overflow-y: scroll;

          .list {
            padding: 0.5rem 0.75rem;
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
          color: #1e1e1e;
          font-weight: bold;
          color: #1e1e1e;
          font-size: 1.075rem;
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
.submitBtn {
  background-color: $raphael-green-400;
  color: #fff;
  padding: 12px;
  width: 100%;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  transition: 0.25s ease;

  cursor: pointer;
  &:hover {
    background-color: $raphael-green-500;
  }
}

.sleepIndex1 {
  max-width: 768px;
  margin: 0 auto;

  @keyframes fade {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
      z-index: 2;
    }
  }

  .floatGroup {
    display: flex;
    margin-top: 20px;
    opacity: 0;
    animation: fade 0.5s forwards ease;
    animation-delay: 0.25s;
    position: relative;

    z-index: 2;
    .floatLeft {
      width: 50%;
      height: 40%;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0px -2px 4px 0px rgba(0, 0, 0, 0.25) inset;
      padding: 12px;

      font-size: 1rem;
      color: #666;
      letter-spacing: 0.5px;
      font-weight: 400;
      line-height: 1.5;
      @include respond-to("tablet") {
        width: 100%;
      }
      span {
        color: $raphael-green-400;
        font-weight: bold;
        font-size: 1.5rem;
      }
    }
    img {
      z-index: 2;
      @include respond-to("tablet") {
        display: none;
      }
    }
  }

  .firstSleepRecord {
    background-color: #fff;
    border-radius: 12px;
    padding: 1rem 1rem 2rem 1rem;
    transform: translateY(-3%);
    animation: fade 0.5s forwards ease;
    animation-delay: 0.5s;
    opacity: 0;
    margin-bottom: 0.5rem;
    @include respond-to("tablet") {
      width: 100%;
      transform: translateY(0%);
      margin-top: 2rem;
    }
    h2 {
      color: #1e1e1e;
      font-size: 1.5rem;
      letter-spacing: 0.5px;

      text-align: center;
    }
    .emojiGroup {
      display: flex;
      justify-content: center;
      gap: 10%;
      .emojiBox {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 3%;
      }
      h3 {
        color: $raphael-gray-500;
      }
      .firstScore,
      .secScore {
        margin-top: 1rem;
        .emojiBox {
          margin-top: 0.5rem;
        }
      }
      .firstScore {
        .score {
          font-size: 2rem;
          font-weight: bold;
          letter-spacing: 0.09px;
          color: $raphael-purple-200;
        }
      }
      .secScore {
        .score {
          font-size: 2.25rem;
          font-weight: bold;
          color: $raphael-cyan-400;
          letter-spacing: 0.09px;
          white-space: nowrap;
        }
      }
    }

    .sleepRecordListGroup {
      margin-top: 0.5rem;
      .sleepRecordListDate {
        text-align: center;
        color: #1e1e1e;
        font-size: 20px;
        font-weight: 400;
        letter-spacing: 0.15px;
      }
      .sleepRecordList {
        margin-top: 0.75rem;
        .sleepRecordItem {
          margin-top: 0.5rem;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #b3b3b3;
          padding-bottom: 0.75rem;
          h4 {
            color: $raphael-gray-500;
            font-size: 1rem;
            font-weight: 400;
            letter-spacing: 0.5px;
            width: 40%;
            white-space: nowrap;
          }
          h5 {
            color: $raphael-green-400;
            width: 60%;
            display: flex;
            justify-content: end;
          }
        }
      }
    }
  }
}
</style>
