import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import axios from "axios";

export const useBabyStore = defineStore("babyStore", () => {
  /**
   * childRecords[cid] = {
   *   isFetched: false,
   *   flowStage: "",
   *   version: "tracking" | "full",
   *   growthRec: null,
   *   selectedAnsTypes: new Set(),
   *   childQuestions: [],
   *   childTimesQues: [],
   *   selectedPriority: new Set(),
   *   reportData: null,
   * }
   */
  const babyAPIData = ref([]);
  const selectedChildID = ref("");
  const childRecords = reactive({});

  let MID, Token, MAID, Mobile;
  const localData = localStorage.getItem("userData");
  if (localData) {
    try {
      ({ MID, Token, MAID, Mobile } = JSON.parse(localData));
    } catch (err) {
      console.error("parse userData fail:", err);
    }
  }

  // 對應
  const indicatorMap = {
    注意力指標: "1",
    好動指標: "2",
    情緒指標: "3",
    粗大動作指標: "4",
    精細動作指標: "5",
    語言認知指標: "6",
  };

  // =========== API_Growth ===========
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
            };
          }
        });
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

  // =========== API_GrowthFirst ===========
  async function fetchGrowthFirst(cid) {
    if (!cid) return;
    try {
      const req = { MID, MAID, Token, Mobile, CID: cid };
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthFirst.jsp",
        req
      );
      if (data.Result === "OK") {
        childRecords[cid].isFetched = true;
        console.log("API_GrowthFirst =>", data);
      } else {
        console.warn("API_GrowthFirst fail:", data.Message);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // =========== API_GrowthCompare (比對結果) ===========
  async function fetchGrowthCompare(cid, AID) {
    if (!cid) return;
    try {
      const req = { MID, MAID, Token, Mobile, CID: cid, AID };
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthCompare.jsp",
        req
      );
      if (data.Result === "OK") {
        childRecords[cid].reportData = {
          Data: data.CurData || null,
          PreData: data.PreData || null,
          History: data.ChildHistoryScore || [],
        };
      } else {
        console.warn("API_GrowthCompare fail:", data.Message);
      }
    } catch (err) {
      console.error("fetchGrowthCompare error:", err);
    }
  }

  // =========== API_GrowthRec (拿指標) ===========
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

  // toggle指標
  function toggleAnsType(cid, typeName) {
    if (!childRecords[cid]) return;
    const set = childRecords[cid].selectedAnsTypes;
    if (set.has(typeName)) set.delete(typeName);
    else set.add(typeName);
  }

  // =========== API_GrowthRec2 (拿問卷) ===========
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

  // =========== API_GrowthRecTimes (拿次數題) ===========
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

  return {
    babyAPIData,
    selectedChildID,
    childRecords,

    fetchGrowth,
    fetchGrowthFirst,
    fetchGrowthCompare,
    fetchGrowthRecord,
    toggleAnsType,
    fetchChildQuestions,
    fetchGrowthRecTimes,
  };
});
