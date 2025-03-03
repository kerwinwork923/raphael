import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useBabyStore = defineStore("babyStore", () => {
  const babyAPIData = ref([]);
  const selectedChildID = ref(""); 
  const growthRecord = ref(null);
  const selectedAnsTypes = ref(new Set()); 
  const childQuestions = ref([]); 

  // 讀取 localStorage 取得用戶資料
  const localData = localStorage.getItem("userData");
  let MID, Token, MAID, Mobile;
  try {
    if (localData) {
      ({ MID, Token, MAID, Mobile } = JSON.parse(localData));
    }
  } catch (e) {
    console.error("Error parsing localStorage data", e);
  }

  // 🔹 確保 fetchGrowth 方法存在
  const fetchGrowth = async () => {
    if (!MID || !MAID || !Token || !Mobile) {
      console.warn("❌ 缺少用戶驗證資訊");
      return;
    }

    const requestData = { MID, MAID, Token, Mobile };

    try {
      const response = await axios.post(
        "https://23700999.com:8081/HMA/API_Growth.jsp",
        requestData
      );

      if (response.data.Result === "OK") {
        babyAPIData.value = response.data.ChildInfo || [];

        if (babyAPIData.value.length > 0) {
          selectedChildID.value = babyAPIData.value[0].CID;
          fetchGrowthRecord();
        }
      } else {
        console.warn("獲取寶貝資料失敗：" + response.data.Message);
      }
    } catch (err) {
      console.error("❌ API 錯誤:", err);
    }
  };

  // 確保 fetchGrowthRecord 方法存在
  const fetchGrowthRecord = async () => {
    if (!selectedChildID.value) {
      console.warn("尚未選擇寶貝，無法獲取成長記錄！");
      return;
    }

    const requestData = {
      MID,
      MAID,
      Token,
      Mobile,
      CID: selectedChildID.value,
    };

    try {
      const response = await axios.post(
        "https://23700999.com:8081/HMA/API_GrowthRec.jsp",
        requestData
      );

      if (response.data.Result === "OK") {
        growthRecord.value = response.data;
        console.log("✅ 成長記錄:", growthRecord.value);
      } else {
        console.warn("獲取成長記錄失敗：" + response.data.Message);
      }
    } catch (err) {
      console.error("❌ API 錯誤:", err);
    }
  };

  const toggleAnsType = (key) => {
    if (selectedAnsTypes.value.has(key)) {
      selectedAnsTypes.value.delete(key);
    } else {
      selectedAnsTypes.value.add(key);
    }
    // Vue 需要新的 Set 來觸發畫面更新
    selectedAnsTypes.value = new Set([...selectedAnsTypes.value]);
  };

  return {
    babyAPIData,
    selectedChildID,
    growthRecord,
    selectedAnsTypes,
    childQuestions,
    fetchGrowth, // ✅ 確保 return 了 fetchGrowth
    fetchGrowthRecord,
    toggleAnsType
  };
});
