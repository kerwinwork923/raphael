<template>
  <RaphaelLoading v-if="loading" />
  <div class="changeMemberWrap">
    <TitleMenu Text="基本資料設定" link="/member" />
    <div class="changeMemberGroup">
      <UserInfoForm
        @update:name="name = $event"
        @update:height="height = $event"
        @update:weight="weight = $event"
        @update:sex="sex = $event"
        @update:date="date = $event"
        @update:DSPR="DSPR = $event"
        @update:city="city = $event"
        @update:area="area = $event"
        @update:address="address = $event"
        @update:HRVCalTime="HRVCalTime = $event"
        phoneShow="true"
        addressShow="true"
        timeShow="true"
        @submit="addUser"
      />
    </div>
    
  </div>
</template>

<script>
import TitleMenu from "~/components/TitleMenu.vue";
import UserInfoForm from "../components/UserInfoWrap.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { useSeo } from "~/composables/useSeo";
import { useUserData } from "~/fn/api";
export default {
  components: { UserInfoForm, TitleMenu, useSeo },
  setup() {
    const name = ref("");
    const height = ref("");
    const weight = ref("");
    const sex = ref("");
    const date = ref("");
    const DSPR = ref("");
    const city = ref("");
    const area = ref("");
    const address = ref("");
    const HRVCalTime = ref("");
    const router = useRouter();

    const loading = ref(false);

    useSeo({
      title: "",
      description:
        "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
      url: "https://neuroplus.com.tw",
    });

    const addUser = async (formData) => {
      try {
        loading.value = true;
        const localData = localStorage.getItem("userData");
        const { MID, Token, MAID, Mobile } = localData
          ? JSON.parse(localData)
          : {};

        // 使用傳入的 formData 或 fallback 到 ref 值
        const userData = formData || {
          name: name.value,
          height: height.value,
          weight: weight.value,
          sex: sex.value,
          date: date.value,
          DSPR: DSPR.value,
          city: city.value,
          area: area.value,
          address: address.value,
          HRVCalTime: HRVCalTime.value,
        };

        if (
          !MID ||
          !Token ||
          !MAID ||
          !Mobile ||
          !userData.name ||
          !userData.height ||
          !userData.weight ||
          !userData.sex ||
          !userData.date
        ) {
          throw new Error("資料不完整");
        }

        let birthday = "";
        if (userData.date) {
          const birthDate = new Date(userData.date);
          const rocYear = birthDate.getFullYear() - 1911;
          birthday = `${rocYear}/${
            birthDate.getMonth() + 1
          }/${birthDate.getDate()}`;
        }



        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_AA5.jsp",
          {
            MID,
            Token,
            MAID,
            Mobile,
            Name: userData.name,
            Height: userData.height,
            Weight: userData.weight,
            Sex: userData.sex,
            Birthday: birthday,
            DSPR: userData.DSPR || "",
            City: userData.city,
            Zone: userData.area,
            Address: userData.address,
            HRVCalTime: userData.HRVCalTime,
          }
        );

        if (response.status === 200) {
          console.log("API_AA5 回應:", response.data);
          
          // 直接使用 API 回應更新 localStorage
          if (response.data && response.data.Result === "OK") {
            const existingUserData = JSON.parse(localData);
            const updatedUserData = {
              ...existingUserData,
              ...response.data
            };
            localStorage.setItem("userData", JSON.stringify(updatedUserData));
            console.log("localStorage 已更新:", updatedUserData);
          }
          
          console.log("資料更新成功:", response.data);
          
          // 更新用戶資料後，重新獲取最新的用戶資料
          try {
            const { userData: updatedUserData } = await useUserData();
            if (updatedUserData) {
              console.log("用戶資料已同步更新");
            }
          } catch (error) {
            console.error("同步用戶資料失敗:", error);
          }
          
          alert("資料更新成功");
          router.push("/member");
        }
      } catch (err) {
        alert(err.message || "資料不完整");
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

 

    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
    }

    return {
      name,
      height,
      weight,
      sex,
      date,
      DSPR,
      city,
      area,
      address,
      addUser,
   
      HRVCalTime,
      loading,
    };
  },
};
</script>

<style lang="scss">
.changeMemberWrap {
    position: relative;
    display: flex;
    flex-direction: column;
    place-items: center;
    width: 100%;
    padding: 0.5rem 1rem 56px 1rem;
    height: 100vh;
    overflow: hidden;
  @include gradientBg();

  .changeMemberGroup {
    flex: 1;
    min-height: 0;
    width: 100%;
    max-width: 768px;
    margin-top:1rem;
  }


}
</style>
