<template>
  <div class="infoWrap">
    <div class="infoBox">
      <!-- 姓名輸入 -->
      <div class="nameGroup">
        <img class="icon1" src="../assets/imgs/user.svg" alt="" />
        <input
          type="text"
          placeholder="請輸入您的姓名(暱稱)"
          v-model="localName"
        />
      </div>

      <!-- 電話欄位 不可選 -->
      <div class="phoneGroup" v-if="phoneShow">
        <img class="icon1" src="../assets/imgs/phone.svg" alt="" />
        <input type="text" :value="phone" disabled />
        <img class="icon2" src="../assets/imgs/noWrap.svg" alt="" />
      </div>

      <!-- 信箱輸入 -->
      <div class="emailGroup" v-if="emailShow">
        <img class="icon1" src="../assets/imgs/mail.svg" alt="" />
        <input type="email" placeholder="請輸入您的信箱" />
      </div>

      <!-- 身高輸入 -->
      <div class="heightGroup">
        <img class="icon1" src="../assets/imgs/height.svg" alt="" />
        <input type="text" placeholder="請輸入您的身高" v-model="localHeight" />
      </div>

      <!-- 體重輸入 -->
      <div class="weightGroup">
        <img class="icon1" src="../assets/imgs/weight.svg" alt="" />
        <input type="text" placeholder="請輸入您的體重" v-model="localWeight" />
      </div>

      <!-- 性別選擇 -->
      <div class="groupGroup">
        <img class="icon1" src="../assets/imgs/group.svg" alt="" />
        <select
          v-model="localSex"
          class="custom-select"
          :class="{ selected: localSex }"
        >
          <option value="" disabled selected hidden>請選擇您的性別</option>
          <option value="1">男生</option>
          <option value="2">女生</option>
        </select>
        <img class="icon2" src="../assets/imgs/arrowDown.svg" />
      </div>

      <!-- 生日選擇 -->
      <div class="dateGroup">
        <img class="icon1" src="../assets/imgs/date.svg" alt="" />
        <VueDatePicker
          v-model="localDate"
          :format="formatDate"
          :locale="'zh-TW'"
          :enable-time-picker="false"
          cancel-text="取消"
          select-text="確定"
          :max-date="new Date()"
          :placeholder="'請選擇您的生日'"
          no-today
        />
      </div>

      <!-- 日常收縮壓選擇 -->
      <div class="DSPR">
        <img class="icon1" src="../assets/imgs/DSPR.svg" alt="" />
        <select
          v-model="localDSPR"
          class="custom-select"
          :class="{ selected: localDSPR }"
        >
          <option value="" disabled selected hidden>
            請選擇日常收縮壓(選填)
          </option>
          <option value="normal">正常(120mmHg)</option>
          <option value="prehypertension">高血壓前期(120~139mmHg)</option>
          <option value="hypertension">高血壓(>=140mmHg)</option>
        </select>
        <img class="icon2" src="../assets/imgs/arrowDown.svg" />
      </div>

      <!-- 地址 -->
      <div class="addressGroup" v-if="addressShow">
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
          <img class="icon2" src="../assets/imgs/arrowDown.svg" />
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
          <img class="icon2" src="../assets/imgs/arrowDown.svg" />
        </div>
        <div class="address">
          <input type="text" placeholder="輸入地址" v-model="inputAddress" />
        </div>
      </div>
    </div>

    <!-- 送出按鈕 -->
    <button
      class="infoSendBtn"
      @click="submitForm"
      :disabled="isSubmitDisabled"
    >
      送出
    </button>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted } from "vue";
import { zhTW } from "date-fns/locale";

export default {
  props: {
    name: String,
    height: String,
    weight: String,
    sex: String,
    DSPR: String,
    date: String,
    phoneShow: false,
    addressShow: false,
    emailShow: false,
  },
  setup(props, { emit }) {
    const localName = ref(props.name || "");
    const localHeight = ref(props.height || "");
    const localWeight = ref(props.weight || "");
    const localSex = ref(props.sex || "");
    const localDate = ref(null);
    const localDSPR = ref(props.DSPR || "");

    const inputAddress = ref("");
    const citiesData = ref([]);
    const selectedCity = ref("");
    const selectedArea = ref("");
    const filteredAreas = ref([]);
    const phone = ref("");

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

      const userData = JSON.parse(localStorage.getItem("userData") || "{}");

      localName.value = userData.Name || "";
      localHeight.value = userData.Height || "";
      localWeight.value = userData.Weight || "";
      localSex.value = userData.Sex || "";
      localDate.value = userData.Birthday
        ? new Date(
            parseInt(userData.Birthday.split("/")[0]) + 1911,
            parseInt(userData.Birthday.split("/")[1]) - 1,
            parseInt(userData.Birthday.split("/")[2])
          )
        : null;
      localDSPR.value = userData.DSPR || "";
      selectedCity.value = userData.City || "";
      selectedArea.value = userData.Zone || "";
      inputAddress.value = userData.Address || "";
      phone.value = userData.Mobile || "";
      if (selectedCity.value) {
        updateAreas(true);
      }
    });

    const updateAreas = (initial = false) => {
      const city = citiesData.value.find(
        (c) => c.CityName === selectedCity.value
      );
      filteredAreas.value = city ? city.AreaList : [];

      if (
        !initial ||
        !filteredAreas.value.some(
          (area) => area.AreaName === selectedArea.value
        )
      ) {
        selectedArea.value = "";
      }
    };

    // 民國年轉換
    const formatDate = (date) => {
      if (!date) return "";
      const rocYear = date.getFullYear() - 1911; // Convert to ROC year
      return `${rocYear}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    const zhTWLocale = zhTW;

    const isSubmitDisabled = computed(() => {
      return (
        !localName.value ||
        !localHeight.value ||
        !localWeight.value ||
        !localSex.value ||
        !localDate.value
      );
    });

    const submitForm = () => {
      emit("submit", {
        name: localName.value,
        height: localHeight.value,
        weight: localWeight.value,
        sex: localSex.value,
        date: localDate.value,
        DSPR: localDSPR.value,
        city: selectedCity.value,
        area: selectedArea.value,
        address: inputAddress.value,
      });
    };

    watch(localName, (newValue) => emit("update:name", newValue));
    watch(localHeight, (newValue) => emit("update:height", newValue));
    watch(localWeight, (newValue) => emit("update:weight", newValue));
    watch(localSex, (newValue) => emit("update:sex", newValue));
    watch(localDate, (newValue) => emit("update:date", newValue));
    watch(localDSPR, (newValue) => emit("update:DSPR", newValue));
    watch(selectedCity, (newValue) => emit("update:city", newValue));
    watch(selectedArea, (newValue) => emit("update:area", newValue));
    watch(inputAddress, (newValue) => emit("update:address", newValue));

    return {
      localName,
      localHeight,
      localWeight,
      localSex,
      localDate,
      localDSPR,
      inputAddress,
      citiesData,
      selectedCity,
      selectedArea,
      filteredAreas,
      updateAreas,
      submitForm,
      isSubmitDisabled,
      formatDate,
      phone,
    };
  },
};
</script>

<style lang="scss">
.infoWrap {
  .infoBox {
    background-color: #fff;
    border-radius: 1rem;
    padding: 1rem;
    margin-top: 1.5rem;
  }

  .custom-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: url("../assets/imgs/arrow-down.svg") no-repeat right 10px center;
    background-size: 12px;
    color: #999;
    font-size: 1.2rem;
  }

  .custom-select.selected {
    color: #1e1e1e;
  }

  .nameGroup,
  .heightGroup,
  .weightGroup,
  .dateGroup,
  .phoneGroup,
  .emailGroup {
    position: relative;
    margin-bottom: 1rem;

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
      z-index: 1;
      width: 18px;
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
        border-bottom: 1px solid #ccc;
        appearance: none;
        background-color: transparent;
        color: #999;
        font-family: Inter;
        font-size: 1.2rem;
        font-weight: 400;
        padding-left: 0.5rem;

        option {
        }
        &::placeholder {
          color: #ccc;
          font-family: Inter;
          font-size: 1.2rem;
          font-weight: 400;
        }

        &::-ms-expand {
          display: none;
        }
      }

      .selected {
        color: #1e1e1e;
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

  .dateGroup {
    display: flex;
  }

  .groupGroup,
  .DSPR {
    display: flex;
    position: relative;
    width: 100%;
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
      z-index: 1;
      width: 18px;
    }
    select {
      outline: none;
      border: none;
      padding-left: 36px;
      padding-bottom: 16px;
      padding-top: 16px;
      font-size: 1.2rem;
      width: 100%;
      border-bottom: 1px solid #ccc;
      appearance: none;
      color: #999;
      font-family: Inter;
      font-size: 1.2rem;
      font-weight: 400;

      &::placeholder {
        color: #ccc;
        font-family: Inter;
        font-size: 1.2rem;
        font-weight: 400;
      }

      &::-ms-expand {
        display: none;
      }
    }
  }

  input[type="text"],
  input[type="password"],
  input[type="number"],
  input[type="email"] {
    outline: none;
    border: none;
    border-bottom: 1px solid #ccc;
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 16px;
    padding-top: 16px;
    color: #1e1e1e;
    &::placeholder {
      color: #999;
      font-family: Inter;
      font-size: 1.2rem;
      font-weight: 400;
    }
  }

  .infoSendBtn {
    background-color: $raphael-green-400;
    border: none;
    display: flex;
    margin-top: 30px;
    padding: 12px;
    width: 100%;
    border-radius: 8px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;
    letter-spacing: 0.5px;
    font-weight: 400;

    &:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  }
}

.vue-datepicker {
  width: 100%;
  border: none;
  border-bottom: 1px solid #ccc;
  padding: 16px;
  font-size: 1.5rem;
  color: #666;
  font-family: Inter, sans-serif;

  &::placeholder {
    color: #999;
    font-weight: 400;
  }

  .vue-datepicker-input {
    padding-left: 36px;
  }
}

.dp__input_wrap {
  border-bottom: 1px solid #ccc;

  padding-bottom: 16px;
  padding-top: 16px;
  .dp__pointer {
    border: none;
    background-color: none;
    width: 100%;
    font-size: 1.25rem;
  }
  svg {
    display: none;
  }
}
</style>
