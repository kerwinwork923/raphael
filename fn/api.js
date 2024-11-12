import { useRouter } from "vue-router";
import axios from "axios";

export const useUserData = async () => {
  const router = useRouter();
  const loading = ref(true);
  const getUserData = async () => {
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile, Name } = localData
      ? JSON.parse(localData)
      : {};

    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
      return;
    }
    try {
      const response = await axios.post(
        "https://23700999.com:8081/HMA/API_AA6.jsp",
        { MID, Token, MAID, Mobile }
      );

      if (response.status === 200) {
        const data = response.data;
        if (data.Result === "OK" && data.Member) {
          const existingData = localData ? JSON.parse(localData) : {};
          const newUserInfo = { ...existingData, ...data.Member };
          localStorage.setItem("userData", JSON.stringify(newUserInfo));
        } else {
          alert("取得會員資料失敗");
        }
      } else {
        alert("取得會員資料失敗");
      }
    } catch (err) {
      alert("取得會員資料失敗");
    } finally {
      loading.value = false;
    }
  };

  await getUserData();
  return { loading };
};
