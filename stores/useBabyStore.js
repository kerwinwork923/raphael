import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import axios from "axios";

export const useBabyStore = defineStore("babyStore", () => {
  /**
   * 每位小孩的記錄結構，例如 childRecords[cid]：
   * {
   *   isFetched: false,         // 是否已取過 API_GrowthRec
   *   growthRec: null,          // 後端返回的詳細資料
   *   selectedAnsTypes: new Set(), // 用戶勾選的指標
   *   childQuestions: [],       // 從 API_GrowthRec2 取得的題目
   *   childTimesQues: [],       // 從 API_GrowthRecTimes 取得的「次數」題目
   *   flowStage: "indicator" | "qa" | "times", // 代表此寶貝目前在何階段
   * }
   */
  const babyAPIData = ref([]);         // 後端「寶貝清單」的原始陣列
  const selectedChildID = ref("");     // 目前選擇中的寶貝 CID
  const childRecords = reactive({});   // 以 CID 為 key，存放每個寶貝的詳細資訊

  // 從 localStorage 取出會員資訊 (MID, Token, MAID, Mobile)
  let MID, Token, MAID, Mobile;
  const localData = localStorage.getItem("userData");
  if (localData) {
    try {
      ({ MID, Token, MAID, Mobile } = JSON.parse(localData));
    } catch (err) {
      console.error("parse localStorage fail:", err);
    }
  }

  // 後端「指標」對應 map
  const indicatorMapping = {
    "注意力指標": "1",
    "好動指標":   "2",
    "情緒指標":   "3",
    "粗大動作指標": "4",
    "精細動作指標": "5",
    "語言認知指標": "6",
  };

  // ========== (1) 取得寶貝清單：API_Growth ==========
  async function fetchGrowth() {
    if (!MID || !Token || !MAID || !Mobile) {
      console.warn("缺少用戶登入資訊");
      return;
    }
    // 向後端帶參數
    const req = { MID, MAID, Token, Mobile };
    try {
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_Growth.jsp",
        req
      );
      if (data.Result === "OK") {
        // 存入 babyAPIData (最原始的寶貝清單)
        babyAPIData.value = data.ChildInfo || [];

        // 依照每個寶貝，初始化 childRecords
        babyAPIData.value.forEach((child) => {
          if (!childRecords[child.CID]) {
            childRecords[child.CID] = {
              isFetched: false,
              growthRec: null,
              selectedAnsTypes: new Set(),
              childQuestions: [],
              childTimesQues: [],
              flowStage: "indicator", // 初始階段
            };
          }
        });

        // 預設選擇第一位寶貝
        if (babyAPIData.value.length > 0) {
          selectedChildID.value = babyAPIData.value[0].CID;
          // 預先取第一位寶貝的詳細
          fetchGrowthRecord(selectedChildID.value);
        }
      } else {
        console.warn("fetchGrowth fail:", data.Message);
      }
    } catch (err) {
      console.error("fetchGrowth error:", err);
    }
  }

  // ========== (2) 取得單一寶貝詳細：API_GrowthRec ==========
  async function fetchGrowthRecord(cid) {
    if (!cid) return;
    // 如果 childRecords[cid] 還沒初始化，就先建一個
    if (!childRecords[cid]) {
      childRecords[cid] = {
        isFetched: false,
        growthRec: null,
        selectedAnsTypes: new Set(),
        childQuestions: [],
        childTimesQues: [],
        flowStage: "indicator",
      };
    }

    // 若已經抓過，就不重抓
    if (childRecords[cid].isFetched) {
      return;
    }

    const req = { MID, MAID, Token, Mobile, CID: cid };
    try {
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRec.jsp",
        req
      );
      if (data.Result === "OK") {
        childRecords[cid].isFetched = true;
        childRecords[cid].growthRec = data;

        // 如果後端有告訴你，這孩子已完成 QA，或已進入 Times，可在這裡改 flowStage
        // 例如： if (data.Something === 'QA_DONE') childRecords[cid].flowStage = 'times';
      } else {
        console.warn("fetchGrowthRecord fail:", data.Message);
      }
    } catch (err) {
      console.error("fetchGrowthRecord error:", err);
    }
  }

  // ========== (3) 指標勾選 ==========
  function toggleAnsType(cid, typeName) {
    if (!childRecords[cid]) return;
    const set = childRecords[cid].selectedAnsTypes;
    if (set.has(typeName)) {
      set.delete(typeName);
    } else {
      set.add(typeName);
    }
  }

  // ========== (4) 取得題目：API_GrowthRec2 (進入 QA) ==========
  async function fetchChildQuestions(cid) {
    if (!cid) return;
    const record = childRecords[cid];
    if (!record) return;

    // 後端需要 AID、FirstSecond、ShortComplete、ALLType
    const AID = record.growthRec?.CIDChildAnsLast?.AID || "";
    const FirstSecond = AID ? "Second" : "First";
    const ShortComplete = "Complete";

    // 將指標轉換成後端的數字
    const selectedNumbers = [...record.selectedAnsTypes]
      .map((n) => indicatorMapping[n])
      .filter(Boolean)
      .join(",");
    const ALLType = selectedNumbers ? `,${selectedNumbers},` : "";

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
    try {
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRec2.jsp",
        req
      );
      if (data.Result === "OK") {
        // 取題目
        if (data.ChildQues && Array.isArray(data.ChildQues)) {
          record.childQuestions = data.ChildQues.map((q) => ({
            id: q.QueSeq,
            question: q.Question,
            selectScore: q.QAns !== undefined ? q.QAns : "",
            answers: [
              q.AnswerName_0,
              q.AnswerName_1,
              q.AnswerName_2,
              q.AnswerName_3,
            ],
            Type: q.Type,
            TypeName: q.TypeName,
          }));
        }
        // 進入 QA 階段
        record.flowStage = "qa";
      } else {
        console.warn("API_GrowthRec2 fail:", data.Message);
      }
    } catch (err) {
      console.error("fetchChildQuestions error:", err);
    }
  }

  // ========== (5) 取得次數題目：API_GrowthRecTimes (進入 Times) ==========
  async function fetchGrowthRecTimes(cid, AID) {
    if (!cid) return;

    const req = { MID, MAID, Token, Mobile, CID: cid, AID };
    console.log("🔍 fetchGrowthRecTimes API Request:", req);

    try {
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRecTimes.jsp",
        req
      );

      console.log("📩 API_GrowthRecTimes Response:", data);

      if (data.Result === "OK" && data.ChildAns && Array.isArray(data.ChildAns)) {
        if (!childRecords[cid]) {
          childRecords[cid] = {
            isFetched: false,
            growthRec: null,
            selectedAnsTypes: new Set(),
            childQuestions: [],
            childTimesQues: [],
            flowStage: "indicator",
          };
        }

        // ✅ 解析 `ChildAns` 來匹配 `QAns`
        childRecords[cid].childTimesQues = data.ChildAns.map(q => {
          const answerMap = {
            "0": q.AnswerName_0 || "未提供",
            "1": q.AnswerName_1 || "未提供",
            "2": q.AnswerName_2 || "未提供",
            "3": q.AnswerName_3 || "未提供",
          };

          return {
            id: q.QueSeq,
            question: q.Question,
            selectScore: q.QAns !== undefined ? q.QAns : "",
            selectedAnswer: answerMap[q.QAns] || "未知答案",  // ✅ 依 `QAns` 找到對應的答案名稱
            answers: Object.values(answerMap),  // ✅ 傳遞完整的選項
            Type: q.Type,
            TypeName: q.TypeName,
          };
        });

        // 切換到次數填寫階段
        childRecords[cid].flowStage = "times";

        console.log("✅ childTimesQues 更新成功:", childRecords[cid].childTimesQues);
      } else {
        console.warn("⚠️ API_GrowthRecTimes 返回的 ChildAns 為空或格式不對");
      }
    } catch (err) {
      console.error("❌ fetchGrowthRecTimes error:", err);
    }
  }

  return {
    // state
    babyAPIData,
    selectedChildID,
    childRecords,

    // actions
    fetchGrowth,
    fetchGrowthRecord,
    toggleAnsType,
    fetchChildQuestions,
    fetchGrowthRecTimes,
  };
});
