import { defineStore } from "pinia";
import { ref, reactive, watch } from "vue";
import axios from "axios";

export const useBabyStore = defineStore("babyStore", () => {
  /**
   * childRecords[cid] = {
   *   isFetched: false,             // 是否已抓過成長紀錄
   *   flowStage: "",                // 畫面階段 chooseVersion / indicator / qa / times / priority / result / ...
   *   version: "tracking" | "full", // 指標的問卷模式
   *   growthRec: null,              // API_GrowthRec 回傳
   *   selectedAnsTypes: new Set(),  // 使用者勾選的指標
   *   childQuestions: [],           // QA 題目
   *   childTimesQues: [],           // 次數 題目
   *   selectedPriority: new Set(),  // 最想解決
   *   reportData: null,            // API_GrowthCompare 的結果 (顯示檢測結果)
   *   AID: null,                   // 後端指派的檢測批次 ID
   * }
   */
  const babyAPIData = ref([]);           // API_Growth 回傳的寶貝清單
  const selectedChildID = ref("");       // 當前操作中的寶貝
  const childRecords = reactive({});     // 以 CID 為 key，存各寶貝的流程/資料

  // ★★★ STEP1: 嘗試從 localStorage 先載入 childRecords ★★★
  const localChildRecords = localStorage.getItem("babyStore_childRecords");
  if (localChildRecords) {
    try {
      const parsed = JSON.parse(localChildRecords);
      // 反序列化「Set」類型資料
      // 因為 JSON.parse 會把 Set 變成陣列
      // 這裡以 key: selectedAnsTypes / selectedPriority 做為示例
      Object.keys(parsed).forEach((cid) => {
        const obj = parsed[cid];
        // 反序列化 selectedAnsTypes
        if (Array.isArray(obj.selectedAnsTypes)) {
          obj.selectedAnsTypes = new Set(obj.selectedAnsTypes);
        }
        // 反序列化 selectedPriority
        if (Array.isArray(obj.selectedPriority)) {
          obj.selectedPriority = new Set(obj.selectedPriority);
        }
      });
      Object.assign(childRecords, parsed);
    } catch (e) {
      console.error("LocalStorage parse error:", e);
    }
  }

  // 嘗試從 localStorage 拿 MID/Token/MAID/Mobile
  let MID, Token, MAID, Mobile;
  const localData = localStorage.getItem("userData");
  if (localData) {
    try {
      ({ MID, Token, MAID, Mobile } = JSON.parse(localData));
    } catch (err) {
      console.error("parse userData fail:", err);
    }
  }

  // 指標文字 -> 後端所需數字 (若後端需要對應)
  const indicatorMap = {
    注意力指標: "1",
    好動指標: "2",
    情緒指標: "3",
    粗大動作指標: "4",
    精細動作指標: "5",
    語言認知指標: "6",
  };

  // =========== (1) API_Growth ===========
  // 拿到寶貝清單 (ChildInfo)，初始化 childRecords
  async function fetchGrowth() {
    if (!MID || !Token || !MAID || !Mobile) return;
    try {
      const req = { MID, MAID, Token, Mobile };
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_Growth.jsp",
        req
      );
      if (data.Result === "OK") {
        babyAPIData.value = data.ChildInfo || [];
        babyAPIData.value.forEach((child) => {
          if (!childRecords[child.CID]) {
            // 建立初始狀態
            childRecords[child.CID] = {
              isFetched: false,
              flowStage: "",
              version: "tracking",
              growthRec: null,
              selectedAnsTypes: new Set(),
              childQuestions: [],
              childTimesQues: [],
              selectedPriority: new Set(),
              reportData: null,
              AID: null,
            };
          }
        });
        // 預設選擇第一位寶貝
        if (babyAPIData.value.length > 0) {
          selectedChildID.value = babyAPIData.value[0].CID;
        }
      } else {
        console.warn("API_Growth fail:", data.Message);
      }
    } catch (err) {
      console.error("fetchGrowth error:", err);
    }
  }

  // =========== (2) API_GrowthFirst ===========
  async function fetchGrowthFirst(cid) {
    if (!cid) return;
    try {
      const req = { MID, MAID, Token, Mobile, CID: cid };
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthFirst.jsp",
        req
      );
      if (data.Result === "OK") {
        childRecords[cid].reportData = {
          Data: data.Recent?.CurData || null,
          PreData: data.Recent?.PreData || null,
          History: data.ChildHistoryScore || [],
        };
        childRecords[cid].isFetched = true;
      } else {
        console.warn("API_GrowthFirst fail:", data.Message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // =========== (3) API_GrowthCompare ===========
  async function fetchGrowthCompare(cid, AID, preAID = "") {
    if (!cid || !AID) return;
    try {
      const req = { MID, MAID, Token, Mobile, CID: cid, AID, preAID };
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthCompare.jsp",
        req
      );
      if (data.Result === "OK") {
        childRecords[cid].reportData = {
          Data: data.ChildScore || null,
          PreData: data.preChildScore || null,
          History: data.ChildHistoryScore || [],
        };
      } else {
        console.warn("API_GrowthCompare fail:", data.Message);
      }
    } catch (err) {
      console.error("fetchGrowthCompare error:", err);
    }
  }

  // =========== (4) API_GrowthRec ===========
  async function fetchGrowthRecord(cid) {
    if (!cid) return;
    try {
      if (!childRecords[cid]) {
        childRecords[cid] = {
          isFetched: false,
          flowStage: "",
          version: "tracking",
          growthRec: null,
          selectedAnsTypes: new Set(),
          childQuestions: [],
          childTimesQues: [],
          selectedPriority: new Set(),
          reportData: null,
          AID: null,
        };
      }
      const req = { MID, MAID, Token, Mobile, CID: cid };
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRec.jsp",
        req
      );
      if (data.Result === "OK") {
        childRecords[cid].isFetched = true;
        childRecords[cid].growthRec = data;
      } else {
        console.warn("API_GrowthRec fail:", data.Message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // =========== (5) 勾選指標 =============
  function toggleAnsType(cid, typeName) {
    if (!childRecords[cid]) return;
    const set = childRecords[cid].selectedAnsTypes;
    if (set.has(typeName)) {
      set.delete(typeName);
    } else {
      set.add(typeName);
    }
  }

  // =========== (6) API_GrowthRec2 ===========
  // 拿「QA問卷」（依照使用者勾的指標 + version=Short or Complete）
  async function fetchChildQuestions(cid) {
    if (!cid) return;
    const rec = childRecords[cid];
    const AID = rec.growthRec?.CIDChildAnsLast?.AID || "";
    const FirstSecond = AID ? "Second" : "First";
    const ShortComplete = rec.version === "tracking" ? "Short" : "Complete";

    const selectedNumbers = [...rec.selectedAnsTypes]
      .map((n) => indicatorMap[n] || "")
      .filter(Boolean)
      .join(",");
    const ALLType = selectedNumbers ? `,${selectedNumbers},` : "";

    try {
      const req = {
        MID,
        MAID,
        Token,
        Mobile,
        CID: cid,
        AID,
        FirstSecond,
        ShortComplete,
        ALLType,
      };
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRec2.jsp",
        req
      );
      if (data.Result === "OK" && data.ChildQues) {
        rec.childQuestions = data.ChildQues.map((q) => ({
          id: q.QueSeq,
          question: q.Question,
          selectScore: q.QAns ?? "",
          answers: [
            q.AnswerName_0,
            q.AnswerName_1,
            q.AnswerName_2,
            q.AnswerName_3,
          ],
          Type: q.Type,
          TypeName: q.TypeName,
        }));
        rec.flowStage = "qa";
      } else {
        console.warn("API_GrowthRec2 fail:", data.Message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // =========== (7) API_GrowthRecTimes ===========
  async function fetchGrowthRecTimes(cid, AID) {
    if (!cid) return;
    try {
      const req = { MID, MAID, Token, Mobile, CID: cid, AID };
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRecTimes.jsp",
        req
      );
      if (data.Result === "OK" && data.ChildAns) {
        if (!childRecords[cid]) {
          childRecords[cid] = {
            isFetched: false,
            flowStage: "",
            version: "tracking",
            growthRec: null,
            selectedAnsTypes: new Set(),
            childQuestions: [],
            childTimesQues: [],
            selectedPriority: new Set(),
            reportData: null,
            AID: null,
          };
        }
        childRecords[cid].childTimesQues = data.ChildAns.map((q) => ({
          id: q.QueSeq,
          question: q.Question,
          selectScore: "",
          answers: [
            q.AnswerName_0 || "未提供",
            q.AnswerName_1 || "未提供",
            q.AnswerName_2 || "未提供",
            q.AnswerName_3 || "未提供",
          ],
          Type: q.Type,
          TypeName: q.TypeName,
        }));
        childRecords[cid].flowStage = "times";
      } else {
        console.warn("API_GrowthRecTimes fail:", data.Message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // ★★★ STEP2: 監聽 childRecords，有變動就存到 localStorage ★★★
  watch(
    () => childRecords,
    (val) => {
      // 需要將 Set 轉為 Array 以便 JSON.stringify
      const objToStore = {};
      Object.keys(val).forEach((cid) => {
        const copy = { ...val[cid] };
        copy.selectedAnsTypes = Array.from(copy.selectedAnsTypes || []);
        copy.selectedPriority = Array.from(copy.selectedPriority || []);
        objToStore[cid] = copy;
      });
      localStorage.setItem("babyStore_childRecords", JSON.stringify(objToStore));
    },
    { deep: true }
  );

  return {
    babyAPIData,
    selectedChildID,
    childRecords,

    // actions
    fetchGrowth,
    fetchGrowthFirst,
    fetchGrowthCompare,
    fetchGrowthRecord,
    toggleAnsType,
    fetchChildQuestions,
    fetchGrowthRecTimes,
  };
});
