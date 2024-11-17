<template>
  <div class="changeMemberWrap">
    <TitleMenu Text="基本資料設定" link="./user" />
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
        phoneShow="true"
        addressShow="true"
        @submit="addUser"
      />
    </div>
    <button class="logoutBtn" @click="logout">登出</button>
  </div>
</template>

<script>
import TitleMenu from "~/components/TitleMenu.vue";
import UserInfoForm from "../components/UserInfoWrap.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { ref } from "vue";

export default {
  components: { UserInfoForm, TitleMenu },
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
          !weight.value ||
          !sex.value ||
          !date.value
        ) {
          throw new Error("資料不完整");
        }

        let birthday = "";
        if (date.value) {
          const birthDate = new Date(date.value);
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
            Name: name.value,
            Height: height.value,
            Weight: weight.value,
            Sex: sex.value,
            Birthday: birthday,
            DSPR: DSPR.value || "",
            City: city.value,
            Zone: area.value,
            Address: address.value,
          }
        );

        if (response.status === 200) {
          router.push("/user");
          console.log(response.data);
        }
      } catch (err) {
        alert(err.message || "資料不完整");
        console.error(err);
      }
    };

    const logout = () => {
      localStorage.removeItem("userData");
      router.push("/");
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
      logout,
    };
  },
};
</script>

<style lang="scss">

.changeMemberWrap {
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  background: $raphael-gray-100;
  padding: 0 1rem;
  padding-bottom: 66px;
  .changeMemberGroup {
    padding: 0.75rem 0;
    width: 100%;
    max-width: 768px;
  }

  .logoutBtn {
    background-color: #ec4f4f;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    width: 100%;
    max-width: 768px;
    border-radius: 8px;
    color: #fff;
    cursor: pointer;
    font-size: 1rem;
    letter-spacing: 0.5px;
    margin-top: 32px;
    padding: 12px;
  }
}
</style>
