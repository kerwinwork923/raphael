<template>
  <div class="addAddressWrap">
    <CartTitleBar title="新增地址" backPath="/cart/payMethod" />
    <h5>收件人</h5>
    <div class="addAddressGroup1">
      <div class="nameGroup">
        <img class="icon1" src="/assets/imgs/user.svg" alt="" />
        <input
          type="text"
          placeholder="請輸入您的姓名(暱稱)"
          v-model="localName"
        />
      </div>
      <div class="phoneGroup">
        <img class="icon1" src="/assets/imgs/phone.svg" alt="" />
        <input type="text" v-model="phone" />
      </div>
    </div>
    <h5>寄送地址</h5>
    <div class="addAddressGroup2">
      <div class="addressGroup">
        <div class="city">
          <select
            v-model="selectedCity"
            :class="{ selected: selectedCity }"
            @change="updateAreas"
          >
            <option value="" disabled selected hidden>縣市</option>
            <option
              v-for="city in citiesData"
              :key="city.CityName"
              :value="city.CityName"
            >
              {{ city.CityName }}
            </option>
          </select>
          <img class="icon2" src="/assets/imgs/arrowDown.svg" />
        </div>
        <div class="area">
          <select v-model="selectedArea" :class="{ selected: selectedArea }">
            <option value="" disabled selected hidden>鄉鎮地區</option>
            <option
              v-for="area in filteredAreas"
              :key="area.AreaName"
              :value="area.AreaName"
            >
              {{ area.AreaName }}
            </option>
          </select>
          <img class="icon2" src="/assets/imgs/arrowDown.svg" />
        </div>
        <div class="address">
          <input type="text" placeholder="輸入地址" v-model="inputAddress" />
        </div>
      </div>
    </div>
    <div class="btnGroup">
      <button @click="addresseeAddress">確認</button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
const router = useRouter();

const userData = JSON.parse(localStorage.getItem("userData"));
// 地址相關資料
const citiesData = ref([]);
const selectedCity = ref("");
const selectedArea = ref("");
const filteredAreas = ref([]);
const inputAddress = ref("");
const localName = ref(userData.Name);
const phone = ref(userData.Mobile);

const addressee = async function () {
  const res = await useFetch(
    "https://23700999.com:8081/HMA/api/fr/maNewCName",
    {
      method: "POST",
      body: {
        MID: userData.MID,
        Token: userData.Token,
        MAID: userData.MAID,
        Mobile: userData.Mobile,
        RName: localName.value,
        RMobile: phone.value,
        Address: selectedCity.value + selectedArea.value + inputAddress.value,
      },
    }
  );
};

const addresseeAddress = async function () {
  if (!selectedCity.value) {
    alert("請選擇縣市");
    return;
  }
  if (!selectedArea.value) {
    alert("請選擇鄉鎮地區");
    return;
  }
  if (!inputAddress.value) {
    alert("請輸入地址");
    return;
  }
  await addressee();
  router.push("/cart/payMethod");
};

// 載入城市資料
onMounted(async () => {
  try {
    const response = await fetch("/AllData.json");
    if (response.ok) {
      citiesData.value = await response.json();
    } else {
      console.error("Failed to load city data:", response.status);
    }
  } catch (error) {
    console.error("Error loading city data:", error);
  }
});

// 切換縣市時更新地區
function updateAreas() {
  const city = citiesData.value.find((c) => c.CityName === selectedCity.value);
  filteredAreas.value = city ? city.AreaList : [];
  if (
    !filteredAreas.value.some((area) => area.AreaName === selectedArea.value)
  ) {
    selectedArea.value = "";
  }
}
</script>
<style lang="scss" scoped>
.addAddressWrap {
  background-color: #f6f6f6;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;

  padding: 0 2.5% 72px;

  input[type="text"],
  input[type="password"],
  input[type="number"],
  input[type="email"] {
    outline: none;
    border: none;
    border-bottom: 1px solid $raphael-gray-300;
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 16px;
    padding-top: 16px;
    color: $raphael-black;
    &::placeholder {
      color: $raphael-gray-300;
      font-family: Inter;
      font-size: 1.2rem;
      font-weight: 400;
    }
  }
  h5 {
    color: $raphael-gray-500;

    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 100%; /* 16px */
    letter-spacing: 0.5px;
    margin-bottom: 0.75rem;
    margin-top: 1rem;
  }
  .addAddressGroup1,
  .addAddressGroup2 {
    width: 100%;
    background-color: #fff;
    padding: 12px;
    border-radius: 8px;
  }
  .nameGroup,
  .phoneGroup {
    position: relative;
    margin-bottom: 1rem;
    z-index: 1000;
    .icon1 {
      position: absolute;
      top: 50%;
      left: 2px;
      transform: translateY(-50%);
      z-index: 2;
    }

    .icon2 {
      position: absolute;
      top: 50%;
      right: 2px;
      transform: translateY(-50%);
      width: 18px;
      z-index: 1;
    }
  }
  .addressGroup {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    justify-content: space-between;
    .city,
    .area {
      width: 48%;
      position: relative;
      select {
        outline: none;
        border: none;
        padding-left: 0;
        padding-bottom: 16px;
        padding-top: 16px;
        font-size: 1.2rem;
        width: 100%;
        border-bottom: 1px solid $raphael-gray-300;
        appearance: none;
        background-color: transparent;
        color: $raphael-gray-500;
        font-family: Inter;
        font-size: 1.2rem;
        font-weight: 400;
        padding-left: 0.5rem;

        option {
        }
        &::placeholder {
          color: $raphael-gray-300;
          font-family: Inter;
          font-size: 1.2rem;
          font-weight: 400;
        }

        &::-ms-expand {
          display: none;
        }
      }

      .selected {
        color: $raphael-black;
      }

      .icon2 {
        position: absolute;
        top: 50%;
        right: 2px;
        transform: translateY(-50%);
        z-index: 1;
        width: 18px;
      }
    }
    .address {
      width: 100%;
      input[type="text"] {
        padding-left: 0.5rem;
      }
    }
  }
  .btnGroup {
    width: 100%;
    display: flex;
    justify-content: center;
    position: fixed;
    bottom: 5%;
    left: 0;
    button {
      width: 95%;

      border: none;
      color: #fff;
      padding: 8px 12px;
      border-radius: 8px;

      background: var(--Primary-default, #74bc1f);
      cursor: pointer;
    }
  }
}
</style>
