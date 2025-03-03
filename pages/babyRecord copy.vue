<template>
  <div class="babyRecord">
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

    <!-- 小孩數量小於1 => 新增寶貝資料 -->
    <div class="ANSGroup" v-if="babyStore.babyAPIData?.length < 1">
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

    <!-- 寶貝資料填寫區 (若 babyAPIData 長度小於 1) -->
    <div class="babyRecordGroup" v-if="babyStore.babyAPIData?.length < 1">
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
          <!-- 寶貝姓名 -->
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
          <!-- 性別 -->
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
          <!-- 生日 -->
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
        <span>
          <img src="/assets/imgs/babyInfoAdd.svg" alt="新增" />
        </span>
      </div>

      <!-- 一次儲存所有寶貝資料 -->
      <button class="saveAllBtn" @click="checkAndShowBabyAlert">
        前往檢測
      </button>
    </div>

    <!-- 若後端已有寶貝資料 => 顯示問卷進度 -->
    <div class="babyRecordQAGroup" v-if="babyStore.babyAPIData.length > 0">
      <div class="babyProgressGroup">
        <div
          class="babyProgressCard"
          v-for="child in babyStore.babyAPIData"
          :key="child.CID"
          :class="{ active: child.CID === babyStore.selectedChildID }"
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
    </div>

    <!-- 指標選擇區（選好指標後，按「開始測驗」）-->
    <div class="babyAnsTypeGroup" v-if="hasSelectedChild">
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

      <!-- 如果已有題目則顯示 QAList -->
      <div v-if="curChildData && curChildData.childQuestions.length > 0">
        <p>以下問題的困擾程度</p>
        <QAList :questions="curChildData.childQuestions" />
      </div>
    </div>

    <!-- 共有按鈕(示範) -->
    <div class="babyRerordBtnGroup">
      <!-- 按下開始測驗 => onFetchQuestions -->
      <button class="babyRerordCommonBtn" @click="onFetchQuestions">
        開始測驗
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import TitleMenu from "~/components/TitleMenu.vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import { useRouter } from "vue-router";
import { useBabyStore } from "~/stores/useBabyStore";
import QAList from "~/components/QAList.vue";

// 圖示(對/加)請自行確定路徑
import babyTypeCheck from "@/assets/imgs/babyRecord/babyTypeCheck.svg";
import babyTypePlus from "@/assets/imgs/babyRecord/babyTypePlus.svg";

export default {
  name: "babyRecord",
  components: {
    TitleMenu,
    VueDatePicker,
    QAList
  },
  setup() {
    const router = useRouter();
    const babyStore = useBabyStore();

    // 從 localStorage 驗證
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    if (!MID || !Token || !MAID || !Mobile) {
      localStorage.removeItem("userData");
      router.push("/");
      return;
    }

    // 新增寶貝相關 State
    const babyInfos = ref([{ name: "", gender: "", birthDate: null }]);
    const showBabyCover = ref(false);
    const showBabyAlert = ref(false);

    // 進頁面後先取寶貝清單
    onMounted(() => {
      babyStore.fetchGrowth();
    });

    /** 新增 baby 資料表單 */
    function addBabyInfo() {
      babyInfos.value.push({ name: "", gender: "", birthDate: null });
    }

    /** 刪除 baby 資料表單 */
    function removeBaby(index) {
      if (babyInfos.value.length > 1) {
        babyInfos.value.splice(index, 1);
      }
    }

    /** 檢查必填 => show Alert */
    function checkAndShowBabyAlert() {
      for (const baby of babyInfos.value) {
        if (!baby.name || !baby.gender || !baby.birthDate) {
          alert("請完整填寫所有寶貝資料！");
          return;
        }
      }
      showBabyCover.value = true;
      showBabyAlert.value = true;
    }

    /** 關閉提示 */
    function closeBabyAlert() {
      showBabyAlert.value = false;
      showBabyCover.value = false;
    }

    /** 送資料給 API_ChildSave.jsp */
    async function submitBabyData() {
      try {
        if (babyInfos.value.length === 0) {
          alert("請至少新增一筆寶貝資料！");
          return;
        }
        const requestData = {
          MID,
          Token,
          MAID,
          Mobile,
          Child: babyInfos.value.map((baby) => ({
            Name: baby.name,
            Sex: baby.gender === "male" ? "1" : "2", // 後端：1=男, 2=女
            BirthDay: formatDateToYYYYMMDD(baby.birthDate),
          })),
        };
        console.log("🚀 送出 API 請求:", requestData);
        const res = await axios.post(
          "https://23700999.com:8081/HMA/API_ChildSave.jsp",
          requestData
        );
        if (res.data.Result === "OK") {
          showBabyAlert.value = false;
          showBabyCover.value = false;
          // 重新撈
          babyStore.fetchGrowth();
        } else {
          alert("❌ 儲存失敗：" + res.data.Message);
        }
      } catch (err) {
        console.error("❌ API 錯誤:", err);
        alert("發生錯誤，請稍後再試！");
      }
    }

    /** 取得當前 selectedChildID 的資料 */
    const curChildData = computed(() => {
      const cid = babyStore.selectedChildID;
      return babyStore.childRecords[cid];
    });

    /** 取指標對應資料 */
    const ansTypes = computed(() => {
      if (!curChildData.value?.growthRec) return null;
      return curChildData.value.growthRec.ChildAnsAllType || null;
    });

    /** 是否已選 child */
    const hasSelectedChild = computed(() => !!babyStore.selectedChildID);

    /** 檢查指標是否選取 */
    function isTypeSelected(key) {
      if (!curChildData.value) return false;
      return curChildData.value.selectedAnsTypes.has(key);
    }

    /** 點小孩卡 => 選擇寶貝 & 拉詳細資訊 */
    function onClickChild(cid) {
      babyStore.selectedChildID = cid;
      babyStore.fetchGrowthRecord(cid);
    }

    /** 點指標 */
    function onToggleAnsType(key) {
      if (!babyStore.selectedChildID) return;
      babyStore.toggleAnsType(babyStore.selectedChildID, key);
    }

    /** 送參數給 API_GrowthRec2.jsp */
    async function onFetchQuestions() {
      const cid = babyStore.selectedChildID;
      if (!cid) {
        alert("請先選擇要測驗的寶貝");
        return;
      }
      // 檢查是否至少選一個指標
      const selectedSet = babyStore.childRecords[cid].selectedAnsTypes;
      if (!selectedSet || selectedSet.size === 0) {
        alert("請至少選擇一個大項目以繼續");
        return;
      }
      // 呼叫 store
      await babyStore.fetchChildQuestions(cid);
    }

    /** 格式化日期：YYYY-MM-DD */
    function formatDateToYYYYMMDD(date) {
      if (!date) return "";
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    /** VueDatePicker 的顯示格式 */
    function formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    return {
      babyStore,
      // state
      showBabyCover,
      showBabyAlert,
      babyInfos,
      // icons
      babyTypeCheck,
      babyTypePlus,

      // computed
      curChildData,
      ansTypes,
      hasSelectedChild,

      // methods
      addBabyInfo,
      removeBaby,
      checkAndShowBabyAlert,
      closeBabyAlert,
      submitBabyData,
      isTypeSelected,
      onClickChild,
      onToggleAnsType,
      onFetchQuestions,
      // utils
      formatDate,
    };
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

  .dp__input_wrap {
    border-bottom: 1px solid $raphael-gray-300;
    padding: 0.6rem 0;

    .dp__pointer {
      border: none;
      background-color: none;
      width: 100%;

      outline: none;
      border: none;

      font-size: 1.2rem;

      &::placeholder {
        color: #aaa;
        font-family: Inter;
        font-size: 1.2rem;
        font-weight: 400;
      }
    }

    svg {
      display: none;
    }
  }

  .saveAllBtn {
    border-radius: var(--sds-size-radius-200);
    background: var(--brand-green-400, #74bc1f);
    display: flex;
    width: 361px;
    padding: var(--sds-size-space-200) var(--sds-size-space-300);
    justify-content: center;
    align-items: center;
    border: none;
    color: #fff;
    padding: 0.5rem;
    border-radius: 8px;
    font-size: 1rem;
    letter-spacing: 0.5px;
    cursor: pointer;
    margin-top: 1rem;
  }
  .babyAlert {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    background-color: #fff;
    width: 60%;
    text-align: center;
    border-radius: 14px;
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
    h5 {
      line-height: 1.5;
      padding: 1.25rem;
    }
    .babyAlertBtnGroup {
      display: flex;
      justify-content: center;

      border-top: 1px solid var(--shade-gray-300, #ccc);

      .babyAlertBtn {
        background-color: transparent;
        border: none;
        width: 50%;
        padding: 0.75rem;
        cursor: pointer;
        color: var(--shade-gray-300, #ccc);
        text-align: center;
        font-family: "Noto Sans";
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 100%; /* 16px */
        letter-spacing: 0.5px;
      }
      .babyAlertBtnRight {
        color: var(--brand-green-400, #74bc1f);
        border-left: 1px solid var(--shade-gray-300, #ccc);
      }
    }
  }
  .babyCover {
    width: 100%;
    height: 100%;
    position: fixed;
    background: rgba(217, 217, 217, 0.5);
    backdrop-filter: blur(2.5px);
    z-index: 99;
  }
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
  cursor: pointer;
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
  input[type="email"],
  input[type="date"] {
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
.babyProgressGroup {
  display: flex;
  gap: 12px;
  max-width: 400px;
  overflow-x: auto;
  padding-bottom: 2px; // 增加滑動區域，避免 scrollbar 遮擋
  scroll-snap-type: x mandatory; // 讓每個 card 吸附對齊
  scrollbar-width: thin; // Firefox 滑動條變細
  scrollbar-color: #ccc transparent; // Firefox 設定顏色

  &::-webkit-scrollbar {
    height: 6px; // 控制高度
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  .babyProgressCard {
    background-color: #fff;
    border-radius: 8px;
    min-width: 160px;
    padding: 12px;
    cursor: pointer;
    scroll-snap-align: start; // 讓 item 對齊

    &:hover {
      transform: scale(1.05); // 滑鼠移上去放大一點
      transition: 0.2s ease-in-out;
    }

    .babyProgressTitle {
      display: flex;
      align-items: center;
      gap: 4px;

      h4 {
        color: var(--shade-black, #1e1e1e);
        font-size: 20px;
        letter-spacing: var(--Title-Medium-Tracking, 0.15px);
      }

      .babyProgressState {
        width: 12px;
        height: 12px;
        background-color: #eee;
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

.babyAnsTypeGroup {
  p {
    color: var(--shade-gray-500, #666);
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 16px */
    letter-spacing: 0.5px;
  }
  .babyAnsTypeInfoGroup {
    display: flex;
    flex-wrap: wrap;
    gap: 2%;

    justify-content: space-between;
    margin-top: 0.5rem;
    .babyAnsTypeCard {
      width: 48%;
      background-color: #fff;
      border-radius: 0.5rem;
      padding: 8px 12px;
      border: 1px solid var(--shade-gray-300, #ccc);
      background: var(--shade-white, #fff);
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      margin-bottom: 0.75rem;
      cursor: pointer;
      h3 {
        font-weight: bold;
        margin-top: 0.15rem;
      }
      p {
        margin-top: 0.5rem;
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

.babyRerordBtnGroup {
    background-color: $raphael-gray-100;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    max-width: 768px;
    width: 100%;
    padding: 0.75rem 0 3.125rem 0;
    touch-action: manipulation;
   
    .babyRerordCommonBtn {
      background-color: $raphael-green-400;
      width: 100%;
      color: #fff;
      border: none;
      border-radius: 8px;
      box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
      p12
      &:disabled {
        opacity: 0.5;
      }
    }
  }
</style>
