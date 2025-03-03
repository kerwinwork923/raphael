import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import axios from "axios";

export const useBabyStore = defineStore("babyStore", () => {
  /**
   * @typedef ChildRecord
   * @property {boolean} isFetched - 是否已載入 GrowthRec
   * @property {Object}  growthRec  - 後端返回的詳細資料 (API_GrowthRec)
   * @property {Set<string>} selectedAnsTypes - 勾選的指標 (值為名稱，如「注意力指標」)
   * @property {Array} childQuestions - API_GrowthRec2 回傳的題目資料
   */

  const babyAPIData = ref([]);   // 取得所有寶貝清單 (API_Growth)
  const selectedChildID = ref("");
  const childRecords = reactive({});

  let MID, Token, MAID, Mobile;
  const localData = localStorage.getItem("userData");
  try {
    if (localData) {
      ({ MID, Token, MAID, Mobile } = JSON.parse(localData));
    }
  } catch (e) {
    console.error("Error parsing localStorage data", e);
  }

  // 指標名稱 => 後端數字ID 對照
  const indicatorMapping = {
    "注意力指標": "1",
    "好動指標": "2",
    "情緒指標": "3",
    "粗大動作指標": "4",
    "精細動作指標": "5",
    "語言認知指標": "6",
  };

  /** ❶ 取得所有寶貝列表 (API_Growth.jsp) */
  async function fetchGrowth() {
    if (!MID || !MAID || !Token || !Mobile) {
      console.warn("❌ 缺少用戶驗證資訊");
      return;
    }
    const requestData = { MID, MAID, Token, Mobile };
    try {
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_Growth.jsp",
        requestData
      );
      if (data.Result === "OK") {
        babyAPIData.value = data.ChildInfo || [];
        if (babyAPIData.value.length > 0) {
          // 預設選第一個
          selectedChildID.value = babyAPIData.value[0].CID;

          // 初始化 childRecords
          babyAPIData.value.forEach((child) => {
            childRecords[child.CID] = {
              isFetched: false,
              growthRec: null,
              selectedAnsTypes: new Set(),
              childQuestions: [],
            };
          });

          // 順便撈第一個
          fetchGrowthRecord(selectedChildID.value);
        }
      } else {
        console.warn("獲取寶貝資料失敗：" + data.Message);
      }
    } catch (err) {
      console.error("❌ API 錯誤:", err);
    }
  }

  /** ❷ 取得單一小孩詳細資料 (API_GrowthRec.jsp) */
  async function fetchGrowthRecord(cid) {
    if (!cid) return;
    if (!childRecords[cid]) {
      childRecords[cid] = {
        isFetched: false,
        growthRec: null,
        selectedAnsTypes: new Set(),
        childQuestions: [],
      };
    }
    if (childRecords[cid].isFetched) {
      console.log(`小孩 ${cid} 已載入過 => 跳過`);
      return;
    }

    const requestData = { MID, MAID, Token, Mobile, CID: cid };
    try {
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRec.jsp",
        requestData
      );
      if (data.Result === "OK") {
        childRecords[cid].isFetched = true;
        childRecords[cid].growthRec = data;
      } else {
        console.warn("獲取成長記錄失敗：" + data.Message);
      }
    } catch (err) {
      console.error("❌ API 錯誤:", err);
    }
  }

  /** ❸ 選擇/取消 指標（存的是「指標名稱」） */
  function toggleAnsType(cid, typeName) {
    if (!childRecords[cid]) return;
    const set = childRecords[cid].selectedAnsTypes;
    if (set.has(typeName)) {
      set.delete(typeName);
    } else {
      set.add(typeName);
    }
    childRecords[cid].selectedAnsTypes = new Set([...set]);
  }

  /**
   * ❹ 取得問題 (API_GrowthRec2.jsp)
   * 要把「指標名稱」轉成後端要的 ,1,2,3,4,5,6,
   */
  async function fetchChildQuestions(cid) {
    if (!cid || !childRecords[cid]) return;
    const AID = childRecords[cid].growthRec?.CIDChildAnsLast?.AID || "";
    const FirstSecond = AID ? "Second" : "First";
    const ShortComplete = "Complete";

    // 從 selectedAnsTypes (名稱) -> indicatorMapping -> 數字
    const selectedNumbers = [...childRecords[cid].selectedAnsTypes]
      .map(name => indicatorMapping[name])
      .filter(num => num !== undefined)
      .join(",");

    const ALLType = selectedNumbers ? `,${selectedNumbers},` : "";
    console.log("🚀 送出的 ALLType:", ALLType);

    const requestData = {
      MID,
      Token,
      MAID,
      Mobile,
      CID: cid,
      AID,
      FirstSecond,
      ShortComplete,
      ALLType
    };

    try {
      const { data } = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRec2.jsp",
        requestData
      );
      if (data.ChildQues) {
        // 映射成 QAList 要的格式
        const mappedQues = data.ChildQues.map((q) => ({
          id: q.QueSeq,
          question: q.Question,
          selectScore: undefined,
          answers: [
            q.AnswerName_0,
            q.AnswerName_1,
            q.AnswerName_2,
            q.AnswerName_3
          ],
          Type: q.Type,
          TypeName: q.TypeName
        }));
        childRecords[cid].childQuestions = mappedQues;
        console.log("✅ 問題資料(轉換後):", mappedQues);
      }
    } catch (err) {
      console.error("❌ API 錯誤:", err);
    }
  }

  return {
    babyAPIData,
    selectedChildID,
    childRecords,
    fetchGrowth,
    fetchGrowthRecord,
    toggleAnsType,
    fetchChildQuestions
  };
});
