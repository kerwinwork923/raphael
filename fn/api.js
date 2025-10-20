import { useRouter } from "vue-router";
import { ref } from "vue";
import axios from "axios";

export const useUserData = async () => {
  const router = useRouter();
  const loading = ref(true);
  
  const getUserData = async () => {
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData
      ? JSON.parse(localData)
      : {};

    if (!MID || !Token || !MAID || !Mobile) {
      console.warn("用戶資料不完整，跳回登入");
      router.push("/");
      return null;
    }
    
    try {
      console.log("調用 API_AA6 獲取最新用戶資料");
      const response = await axios.post(
        "https://23700999.com:8081/HMA/API_AA6.jsp",
        { MID, Token, MAID, Mobile }
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("API_AA6 回應:", data);
        
        if (data.Result === "OK" && data.Member) {
          const existingData = localData ? JSON.parse(localData) : {};
          const newUserInfo = { ...existingData, ...data };
          localStorage.setItem("userData", JSON.stringify(newUserInfo));
          console.log("用戶資料已更新:", newUserInfo);
          return newUserInfo;
        } else {
          console.error("API_AA6 回應錯誤:", data);
          alert("取得會員資料失敗");
          return null;
        }
      } else {
        console.error("API_AA6 HTTP 錯誤:", response.status);
        alert("取得會員資料失敗");
        return null;
      }
    } catch (err) {
      console.error("API_AA6 調用失敗:", err);
      alert("取得會員資料失敗");
      return null;
    } finally {
      loading.value = false;
    }
  };

  const result = await getUserData();
  return { loading, userData: result };
};
