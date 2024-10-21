<template>
  <div class="changeMemberWrap">
    <Navbar />
    <div class="changeMemberGroup">
      <div class="raphaelIconImgGroup">
        <img class="raphaelIcon" src="../assets/imgs/raphael.svg" alt="" />
      </div>
      <h1>輸入基本資料</h1>
      <UserInfoForm
        @update:name="name = $event"
        @update:height="height = $event"
        @update:weight="weight = $event"
        @update:sex="sex = $event"
        @update:date="date = $event"
        @update:DSPR="DSPR = $event"
        @submit="addUser"
      />
    </div>
  </div>
</template>

<script>
import Navbar from "../components/Navbar.vue";
import UserInfoForm from "../components/UserInfoWrap.vue";
import axios from "axios";
import { useRouter } from "vue-router";
export default {
  components: { Navbar, UserInfoForm },
  setup() {
    const name = ref("");
    const height = ref("");
    const weight = ref("");
    const sex = ref("");
    const date = ref("");
    const DSPR = ref("");
    const router = useRouter();
    const addUser = async () => {
      try {
        const localData = localStorage.getItem("userData");
        const { MID, Token, MAID, Mobile } = localData
          ? JSON.parse(localData)
          : {};

        if (
          !MID ||
          !Token ||
          !MAID ||
          !Mobile ||
          !name.value ||
          !height.value ||
          !sex.value
        ) {
          throw new Error("資料不完整");
        }

        // 日期轉換成民國格式
        let birthday = "";
        if (date.value) {
          const birthDate = new Date(date.value); 
          const rocYear = birthDate.getFullYear() - 1911; // 西元年轉民國年
          birthday = `${rocYear}/${
            birthDate.getMonth() + 1
          }/${birthDate.getDate()}`;
        }

        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_AA5.jsp",
          {
            MID: MID,
            Token: Token,
            MAID: MAID,
            Mobile: Mobile,
            Name: name.value,
            Height: height.value,
            Weight: weight.value,
            Sex: sex.value,
            Birthday: birthday,
            DSPR: DSPR.value || "",
          }
        );

        if (response.status === 200) {
          router.push("/user");
          console.log(response.data);
        }
      } catch (err) {
        alert(err.message || "資料不完整");
        console.error(err);
      } finally {
      }
    };

    return {
      name,
      height,
      weight,
      sex,
      date,
      DSPR,
      addUser,
    };
  },
};
</script>

<style lang="scss">
h1 {
  font-family: "Noto Sans";
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  margin-top: 8px;
  text-align: center;
  color: $raphael-purple-200;
}
.changeMemberWrap {
  width: 100%;
  min-height: 100vh;
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  .changeMemberGroup {
    width: 90%;
    margin: 0 auto;
    max-width: 576px;
    padding-top: 100px;
    text-align: center;
  }
}
</style>
