<template>
  <div class="babyRecord">
    <!-- 頁面標題 -->
    <TitleMenu Text="健康紀錄" link="/user" />

    <!-- 視覺上的標題（可自行調整） -->
    <div class="babyRecordTitle"></div>

    <!-- 遮罩 & Alert -->
    <div class="babyCover" v-if="showBabyCover"></div>
    <div class="babyAlert" v-if="showBabyAlert">
      <h5>
        寶貝基本資料<br />
        確認填寫正確?
      </h5>
      <div class="babyAlertBtnGroup">
        <button class="babyAlertBtn babyAlertBtnNot" @click="closeBabyAlert">
          不確定
        </button>
        <button class="babyAlertBtn babyAlertBtnRight" @click="submitBabyData">
          確定
        </button>
      </div>
    </div>

    <!-- (1) 尚無小孩：顯示量表簡介 or 新增寶貝表單 -->
    <div v-if="babyStore.babyAPIData.length < 1">
      <!-- 量表簡介（若尚未點擊「前往檢測」 => showAddBabyForm 為 false） -->
      <div class="ANSGroup" v-if="!showAddBabyForm">
        <h4>寶貝紀錄量表</h4>
        <div class="desCard">
          <div class="slogan">
            寶貝紀錄幫助醫師了解孩子的成長以利做最有效率的調整，
            涵蓋專注力、情緒、動作與語言發展等指標
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

      <!-- 新增寶貝資料表單：showAddBabyForm === true 時顯示 -->
      <div class="babyRecordGroup" v-if="showAddBabyForm">
        <div class="babyInfoGroup">
          <h4>新增寶貝基本資料</h4>
          <div class="babyInfo" v-for="(baby, index) in babyInfos" :key="index">
            <div class="babyInfoOption">
              <small>#{{ index + 1 }}</small>
              <img
                src="/assets/imgs/trash.svg"
                alt="刪除"
                @click="removeBaby(index)"
              />
            </div>
            <div class="babyRecordInfoInput">
              <img
                class="icon1"
                src="../assets/imgs/babyRecordMember.svg"
                alt="寶貝姓名"
              />
              <input
                type="text"
                v-model="baby.name"
                placeholder="請輸入寶貝姓名"
              />
            </div>
            <div class="babyRecordInfoInput">
              <img
                class="icon1"
                src="../assets/imgs/babyRecordS.svg"
                alt="性別"
              />
              <select
                v-model="baby.gender"
                class="custom-select"
                :class="{ selected: baby.gender }"
              >
                <option value="" disabled hidden>請選擇性別</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            <div class="babyRecordInfoInput">
              <img
                class="icon1"
                src="../assets/imgs/babyRecordFace.png"
                alt="生日"
              />
              <VueDatePicker
                v-model="baby.birthDate"
                :format="formatDate"
                :locale="'zh-TW'"
                :enable-time-picker="false"
                cancel-text="取消"
                select-text="確定"
                :max-date="new Date()"
                :placeholder="'請選擇寶貝的生日'"
                no-today
                class="date-picker"
              />
            </div>
          </div>
        </div>
        <div class="babyInfoAdd" @click="addBabyInfo">
          繼續新增寶貝基本資料
          <span><img src="/assets/imgs/babyInfoAdd.svg" alt="新增" /></span>
        </div>
      </div>

      <!-- (最後) 按鈕：前往檢測 (第一次 => 開表單, 第二次 => 送資料) -->
      <div class="babyRerordBtnGroup">
        <button class="babyRerordCommonBtn" @click="onNoChildBtnClick">
          前往檢測
        </button>
      </div>
    </div>

    <!-- (2) 若後端已有寶貝資料 => 顯示問卷進度 + 指標 + QA + 次數 -->
    <div class="babyRecordQAGroup" v-else>
      <!-- 寶貝進度清單 (可切換) -->
      <div class="babyProgressGroup">
        <div
          v-for="child in babyStore.babyAPIData"
          :key="child.CID"
          :class="{ active: child.CID === babyStore.selectedChildID }"
          class="babyProgressCard"
          @click="onClickChild(child.CID)"
        >
          <div class="babyProgressTitle">
            <div
              class="babyProgressState"
              :class="{
                babyProgressStateActive:
                  child.CID === babyStore.selectedChildID,
              }"
            ></div>
            <h4>{{ child.Name }}</h4>
          </div>
          <div class="babyProgressText">
            <h5>問卷進度</h5>
            <h6>{{ child.ratioComplete }}%</h6>
          </div>
          <div class="babyProgress"></div>
        </div>
      </div>

      <!-- 指標選擇：在「尚未進 QA」且「尚未顯示次數」時顯示 -->
      <div
        class="babyAnsTypeGroup"
        v-if="curChildData && curChildData.flowStage === 'indicator'"
      >
        <p>請挑選幾個指標，讓我們更了解您的需求。</p>

        <div
          class="babyAnsTypeInfoGroup"
          v-if="ansTypes && Object.keys(ansTypes).length > 0"
        >
          <div
            v-for="(description, key) in ansTypes"
            :key="key"
            class="babyAnsTypeCard"
            :class="{ babyAnsTypeCardSelected: isTypeSelected(key) }"
            @click="onToggleAnsType(key)"
          >
            <img
              :src="isTypeSelected(key) ? babyTypeCheck : babyTypePlus"
              alt="選擇圖示"
            />
            <h3>{{ key }}</h3>
            <p>{{ description }}</p>
          </div>
        </div>
        <p v-else>載入中...</p>

        <!-- 顯示「前往檢測」按鈕 -->
        <div class="babyRerordBtnGroup">
          <button class="babyRerordCommonBtn" @click="onFetchQuestions">
            前往檢測
          </button>
        </div>
      </div>

      <!-- (A) 已進入答題階段 => QAList (一頁7題) -->
      <div v-if="curChildData && curChildData.flowStage === 'qa'">
        <p>以下問題的困擾程度</p>
        <!-- 顯示 QAList (請自行確認 QAList 裡也要有對應 canGoNext 的邏輯) -->
        <QAList ref="qaListRef" :questions="curChildData.childQuestions" />

        <!-- 按鈕：下一頁 or 提交 -->
        <div class="babyRerordBtnGroup">
          <button
            class="babyRerordCommonBtn"
            :disabled="!canClickNext"
            :style="{ backgroundColor: canClickNext ? '#74bc1f' : 'gray' }"
            @click="onCommonBtnClick"
          >
            {{ commonBtnLabel }}
          </button>
        </div>
      </div>

      <!-- (B) 進入「次數」階段 => TimesSelect -->
      <TimesSelect
        v-if="curChildData && curChildData.flowStage === 'times'"
        :childTimesQues="curChildData?.childTimesQues || []"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

// 自行替換你自己專案的路徑
import TitleMenu from "~/components/TitleMenu.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import QAList from "~/components/QAList.vue";
import TimesSelect from "~/components/TimesSelect.vue";

// 選擇/勾選圖示
import babyTypeCheck from "@/assets/imgs/babyRecord/babyTypeCheck.svg";
import babyTypePlus from "@/assets/imgs/babyRecord/babyTypePlus.svg";

// Pinia store
import { useBabyStore } from "~/stores/useBabyStore";

export default {
  name: "babyRecord",
  components: {
    TitleMenu,
    VueDatePicker,
    QAList,
    TimesSelect,
  },
  setup() {
    const router = useRouter();
    const babyStore = useBabyStore();

    // 從 localStorage 取會員資料
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    // 未登入 => 導回首頁
    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
    }

    // UI 狀態
    const showBabyCover = ref(false);
    const showBabyAlert = ref(false);
    const showAddBabyForm = ref(false);
    const showTimesStage = ref(false); // 是否顯示「次數」頁

    // 新增寶貝的暫存
    const babyInfos = ref([{ name: "", gender: "", birthDate: null }]);

    // 取得 QAList ref
    const qaListRef = ref(null);

    // 進入頁面 => 取得所有寶貝資料
    onMounted(() => {
      babyStore.fetchGrowth();
    });

    // 目前所選寶貝詳細
    const curChildData = computed(() => {
      const cid = babyStore.selectedChildID;
      return babyStore.childRecords[cid];
    });
    const hasSelectedChild = computed(() => !!babyStore.selectedChildID);

    // 後端返回的指標
    const ansTypes = computed(() => {
      if (!curChildData.value?.growthRec) return null;
      return curChildData.value.growthRec.ChildAnsAllType || null;
    });

    // 是否已經在 QA 階段
    const isQAStage = computed(() => {
      return (curChildData.value?.childQuestions?.length || 0) > 0;
    });

    // 分頁
    const currentPage = computed(() => qaListRef.value?.currentPage || 1);
    const totalPages = computed(() => qaListRef.value?.totalPages || 1);

    // 按鈕文字
    const commonBtnLabel = computed(() => {
      if (!isQAStage.value && !showTimesStage.value) {
        return "前往檢測";
      } else if (showTimesStage.value) {
        return "次數填寫中";
      } else {
        // 已在 QA
        if (currentPage.value < totalPages.value) {
          return `下一頁 (${currentPage.value}/${totalPages.value})`;
        } else {
          return `下一步 (${currentPage.value}/${totalPages.value})`;
        }
      }
    });

    // 是否可點下一頁
    const canClickNext = computed(() => {
      if (!qaListRef.value) return false;
      return qaListRef.value.canGoNext; // QAList 裏頭自行管理
    });

    // ─────────────────────────────────────────────
    // (A) 沒有小孩 => 新增寶貝
    // ─────────────────────────────────────────────
    function onNoChildBtnClick() {
      // 第一次點 => 顯示表單
      if (!showAddBabyForm.value) {
        showAddBabyForm.value = true;
        return;
      }
      // 第二次 => 檢查並送資料
      checkAndShowBabyAlert();
    }

    function addBabyInfo() {
      babyInfos.value.push({ name: "", gender: "", birthDate: null });
    }
    function removeBaby(i) {
      if (babyInfos.value.length > 1) {
        babyInfos.value.splice(i, 1);
      }
    }
    function checkAndShowBabyAlert() {
      for (const b of babyInfos.value) {
        if (!b.name || !b.gender || !b.birthDate) {
          alert("請完整填寫所有寶貝資料！");
          return;
        }
      }
      showBabyCover.value = true;
      showBabyAlert.value = true;
    }
    function closeBabyAlert() {
      showBabyCover.value = false;
      showBabyAlert.value = false;
    }
    async function submitBabyData() {
      // 送新增寶貝 API
      try {
        if (babyInfos.value.length === 0) {
          alert("請至少新增一筆寶貝資料");
          return;
        }
        const req = {
          MID,
          Token,
          MAID,
          Mobile,
          Child: babyInfos.value.map((b) => ({
            Name: b.name,
            Sex: b.gender === "male" ? "1" : "2",
            BirthDay: formatDateToYYYYMMDD(b.birthDate),
          })),
        };
        console.log("API_ChildSave.jsp =>", req);

        // 這裡替換成自己的後端API
        const res = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildSave.jsp",
          req
        );
        if (res.data.Result === "OK") {
          showBabyCover.value = false;
          showBabyAlert.value = false;
          // 重新取得寶貝清單 => 就能顯示新寶貝
          await babyStore.fetchGrowth();
        } else {
          alert("❌ 新增寶貝失敗：" + res.data.Message);
        }
      } catch (err) {
        console.error("submitBabyData error:", err);
      }
    }

    // ─────────────────────────────────────────────
    // (B) 有小孩 => 指標 / QA / 次數
    // ─────────────────────────────────────────────
    function onClickChild(cid) {
      showTimesStage.value = false; // 每次切換時，都先回到普通狀態
      babyStore.selectedChildID = cid;
      babyStore.fetchGrowthRecord(cid);
    }

    // 指標選擇
    function isTypeSelected(key) {
      if (!curChildData.value) return false;
      return curChildData.value.selectedAnsTypes.has(key);
    }
    function onToggleAnsType(key) {
      const cid = babyStore.selectedChildID;
      if (!cid) return;
      babyStore.toggleAnsType(cid, key);
    }

    // 進入 QA
    async function onFetchQuestions() {
      const cid = babyStore.selectedChildID;
      if (!cid) {
        alert("尚未選擇寶貝");
        return;
      }
      const set = babyStore.childRecords[cid]?.selectedAnsTypes;
      if (!set || set.size === 0) {
        alert("請至少選擇一個指標");
        return;
      }
      await babyStore.fetchChildQuestions(cid);
    }

    // QA 裏的按鈕(下一頁 or 提交)
    async function onCommonBtnClick() {
      // 若還沒 QA => 先進QA
      if (!isQAStage.value) {
        onFetchQuestions();
      } else {
        // QA中 => 分頁 or 最後一頁 => 提交
        if (currentPage.value < totalPages.value) {
          qaListRef.value.goNextPage();
        } else {
          // 最後一頁 => 提交
          await submitChildAnswers();
          // 再取次數 => showTimesStage
          const cid = babyStore.selectedChildID;
          const AID = curChildData.value?.growthRec?.CIDChildAnsLast?.AID || "";
          if (cid) {
            await babyStore.fetchGrowthRecTimes(cid, AID);
            showTimesStage.value = true;
          }
        }
      }
    }

    async function submitChildAnswers() {
      const cid = babyStore.selectedChildID;
      const record = babyStore.childRecords[cid];
      if (!record) return;

      // 組裝 API 需要的 ChildAns 格式
      const ChildAns = record.childQuestions.map((q) => ({
        QueSeq: q.id,
        QueAns: String(q.selectScore),
      }));

      const AID = record.growthRec?.CIDChildAnsLast?.AID || "";
      const FirstSecond = AID ? "Second" : "First";

      const req = {
        MID,
        Token,
        MAID,
        Mobile,
        CID: cid,
        AID,
        FirstSecond,
        ChildAns,
      };

      console.log("API_ChildAnsSave.jsp =>", req);

      try {
        const { data } = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildAnsSave.jsp",
          req
        );

        if (data.Result === "OK") {
          alert("✅ 完成提交！");

          // 取得「次數填寫」數據並存入 Pinia
          await babyStore.fetchGrowthRecTimes(cid, AID);

          // 顯示次數填寫畫面
          showTimesStage.value = true;
        } else {
          alert("❌ 提交失敗：" + data.Message);
        }
      } catch (err) {
        console.error("submitChildAnswers error:", err);
      }
    }

    // 日期格式 => YYYYMMDD
    function formatDateToYYYYMMDD(d) {
      if (!d) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}${mm}${dd}`;
    }

    // VueDatePicker 的顯示格式
    const formatDate = (date) => {
      if (!date) return "";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    return {
      babyStore,

      showBabyCover,
      showBabyAlert,
      showAddBabyForm,
      showTimesStage,
      babyInfos,
      qaListRef,

      curChildData,
      hasSelectedChild,
      ansTypes,
      isQAStage,
      currentPage,
      totalPages,
      commonBtnLabel,
      canClickNext,

      onNoChildBtnClick,
      closeBabyAlert,
      submitBabyData,
      addBabyInfo,
      removeBaby,
      onClickChild,
      isTypeSelected,
      onToggleAnsType,
      onFetchQuestions,
      onCommonBtnClick,
      submitChildAnswers,

      formatDateToYYYYMMDD,
      formatDate,
      babyTypeCheck,
      babyTypePlus,
    };
  },
};
</script>


<style lang="scss">
.babyRecord {
  background-color: #f5f5f5; /* 原本 $raphael-gray-100 */
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 0 1rem;
  position: relative; /* 讓 .babyAlert 可以絕對定位在中間 */

  .dp__input_wrap {
    border-bottom: 1px solid #cccccc; /* 原 $raphael-gray-300 */
    padding: 0.6rem 0;

    .dp__pointer {
      border: none;
      background-color: transparent;
      width: 100%;
      outline: none;
      font-size: 1.2rem;

      &::placeholder {
        color: #aaa;
        font-family: Inter, sans-serif;
        font-size: 1.2rem;
        font-weight: 400;
      }
    }
    svg {
      display: none;
    }
  }

  .babyCover {
    width: 100%;
    height: 100%;
    position: fixed;
    background: rgba(217, 217, 217, 0.5);
    backdrop-filter: blur(2.5px);
    top: 0;
    left: 0;
    z-index: 99;
  }

  .babyAlert {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    background-color: #ffffff; /* 原 $raphael-white */
    width: 60%;
    text-align: center;
    border-radius: 14px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

    h5 {
      line-height: 1.5;
      padding: 1.25rem;
      margin: 0;
    }
    .babyAlertBtnGroup {
      display: flex;
      justify-content: center;
      border-top: 1px solid #ccc;
      .babyAlertBtn {
        background-color: transparent;
        border: none;
        width: 50%;
        padding: 0.75rem;
        cursor: pointer;
        color: #ccc;
        text-align: center;
        font-family: "Noto Sans", sans-serif;
        font-size: 16px;
        font-weight: 400;
        line-height: 100%; /* 16px */
        letter-spacing: 0.5px;
      }
      .babyAlertBtnRight {
        color: #74bc1f; /* 原 var(--brand-green-400) */
        border-left: 1px solid #ccc;
      }
    }
  }
}

/* 量表簡介 (ANSGroup) */
.ANSGroup {
  height: calc(100vh - 207px);
  margin-top: 1rem;
  padding-bottom: 0.75rem;
  overflow-y: auto;

  h4 {
    color: #000000; /* 原 $raphael-black */
    font-size: 20px;
    font-weight: bold;
    line-height: 1;
    letter-spacing: 0.15px;
    margin: 0;
  }
  .desCard {
    display: grid;
    gap: 0.5rem;
    background: #ffffff; /* $raphael-white */
    color: #666666; /* $raphael-gray-500 */
    border-radius: 0.5rem;
    margin: 0.75rem 0;
    padding: 0.75rem;
    font-size: 1.125rem;
    line-height: 1.4;
    letter-spacing: 0.05em;
  }
  .stepCard {
    position: relative;
    display: grid;
    gap: 0.75rem;
    font-size: 1.125rem;
    color: #666666; /* $raphael-gray-500 */
    line-height: 1.4;
    letter-spacing: 0.05em;

    &::after {
      content: "";
      position: absolute;
      background: #ffffff; /* $raphael-white */
      width: 4px;
      height: 100%;
      border-radius: 0.5rem;
      box-shadow: inset 0px 0px 2px 0px rgba(0, 0, 0, 0.25);
      left: 15px;
    }
    .item {
      display: flex;
      gap: 0.5rem;
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #00bcd4; /* $raphael-cyan-400 */
        border-radius: 50%;
        padding: 4px;
        height: 32px;
        min-width: 32px;
        z-index: 1;
        img {
          width: 24px;
          height: 24px;
        }
      }
      .content {
        display: grid;
        background: #ffffff;
        border-radius: 0.5rem;
        width: 100%;
        gap: 0.5rem;
        padding: 0.75rem;
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      }
    }
  }
}

/* 新增寶貝表單 */
.babyRecordGroup {
  width: 100%;
}

.babyInfoGroup {
  h4 {
    color: #666666; /* #666 or $raphael-gray-500, 看需求 */
    font-size: 1rem;
    letter-spacing: 0.5px;
    font-weight: 400;
    margin-bottom: 0.6rem;
    margin-top: 0.25rem;
  }
  .babyInfo {
    padding: 12px;
    border-radius: 12px;
    background-color: #ffffff;
    margin-bottom: 0.75rem;
  }
  .babyInfoOption {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    small {
      color: #b3b3b3;
    }
    img {
      cursor: pointer;
    }
  }
}

/* 右下角「繼續新增寶貝」 */
.babyInfoAdd {
  display: flex;
  align-items: center;
  color: #ec4f4f;
  gap: 2px;
  cursor: pointer;
  img {
    width: 0.85rem;
  }
}

/* 輸入框 */
.babyRecordInfoInput {
  position: relative;
  margin-bottom: 0.5rem;

  .icon1 {
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);
    z-index: 2;
    width: 24px;
    height: 24px;
  }
  input[type="text"],
  select {
    outline: none;
    border: none;
    border-bottom: 1px solid #cccccc;
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 12px;
    padding-top: 16px;
    color: #000000;
    &::placeholder {
      color: #cccccc;
      font-family: Inter, sans-serif;
      font-size: 1.2rem;
      font-weight: 400;
    }
  }
}

/* 問卷區塊 */
.babyRecordQAGroup {
  width: 100%;
}

/* 寶貝進度清單 (水平捲) */
.babyProgressGroup {
  display: flex;
  gap: 12px;
  max-width: 400px;
  overflow-x: auto;
  padding-bottom: 2px;
  scroll-snap-type: x mandatory;

  .babyProgressCard {
    background-color: #ffffff;
    border-radius: 8px;
    min-width: 160px;
    padding: 12px;
    cursor: pointer;
    scroll-snap-align: start;
    &:hover {
      transform: scale(1.05);
      transition: 0.2s ease-in-out;
    }

    .babyProgressTitle {
      display: flex;
      align-items: center;
      gap: 4px;
      h4 {
        color: #1e1e1e; /* var(--shade-black) */
        font-size: 20px;
        letter-spacing: 0.15px;
        margin: 0;
      }
      .babyProgressState {
        width: 12px;
        height: 12px;
        background-color: #eeeeee;
        border-radius: 999px;
      }
      .babyProgressStateActive {
        background-color: #74bc1f;
      }
    }
    .babyProgressText {
      margin-top: 0.5rem;
      display: flex;
      justify-content: space-between;
      h5,
      h6 {
        margin: 0;
      }
    }
    .babyProgress {
      width: 100%;
      height: 4px;
      background-color: #e0e0e0;
      border-radius: 4px;
      margin-top: 8px;
      position: relative;
      overflow: hidden;
      &::before {
        content: "";
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: #65558f;
        border-radius: 4px;
      }
    }
  }
}

/* 指標選擇區 */
.babyAnsTypeGroup {
  p {
    color: #666666; /* 原 var(--shade-gray-500) */
    font-size: 16px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: 0.5px;
    margin: 0;
    margin-top: 1rem;
  }
  .babyAnsTypeInfoGroup {
    display: flex;
    flex-wrap: wrap;
    gap: 2%;
    justify-content: space-between;
    margin-top: 0.5rem;

    .babyAnsTypeCard {
      width: 48%;
      background-color: #ffffff;
      border-radius: 0.5rem;
      padding: 8px 12px;
      border: 1px solid #cccccc;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      margin-bottom: 0.75rem;
      cursor: pointer;
      h3 {
        font-weight: bold;
        margin: 0.25rem 0 0 0;
      }
      p {
        margin-top: 0.5rem;
        margin-bottom: 0;
        line-height: 1.3;
      }
    }
    .babyAnsTypeCardSelected {
      color: #74bc1f;
      p {
        color: #74bc1f;
      }
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    }
  }
}

/* 下方按鈕 */
.babyRerordBtnGroup {
  background-color: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  max-width: 768px;
  width: 100%;
  padding: 0.75rem 0 3.125rem 0;
  touch-action: manipulation;

  .babyRerordCommonBtn {
    background-color: #74bc1f;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border: none;
    border-radius: 0.5rem;
    color: #ffffff;
    cursor: pointer;
    font-size: 1.125rem;
    font-weight: 400;
    padding: 0.5rem 0.75rem;
    line-height: 1;
    letter-spacing: 0.5px;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
    }
  }
}
</style>
