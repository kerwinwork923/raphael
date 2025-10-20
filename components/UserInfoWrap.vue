<template>
  <div class="infoWrap">
    <div class="infoBox">
      <!-- 姓名輸入 -->
      <label for="name">姓名</label>
      <div class="nameGroup">
        <input
          type="text"
          placeholder="請輸入您的姓名(暱稱)"
          v-model="localName"
        />
      </div>

      <!-- 電話欄位 不可選 -->
      <label for="phone" v-if="phoneShow">電話</label>
      <div class="phoneGroup" v-if="phoneShow">
        <input type="text" :value="phone" disabled />
        <img class="icon2" src="../assets/imgs/noWrap.svg" alt="" />
      </div>

      <!-- 信箱輸入 -->
      <label for="email" v-if="emailShow">信箱</label>
      <div class="emailGroup" v-if="emailShow">
        <input type="email" placeholder="請輸入您的信箱" />
      </div>

      <!-- 身高輸入 -->
      <label for="height">身高</label>
      <div class="heightGroup">
        <input type="text" placeholder="請輸入您的身高" v-model="localHeight" />
      </div>

      <!-- 體重輸入 -->
      <label for="weight">體重</label>
      <div class="weightGroup">
        <input type="text" placeholder="請輸入您的體重" v-model="localWeight" />
      </div>

      <!-- 性別選擇 -->
      <label for="sex">性別</label>
      <div class="groupGroup">
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
      <label for="date">生日</label>
      <div class="dateGroup">
        <VueDatePicker
          v-model="localDate"
          :format="formatDate"
          :locale="'zh-TW'"
          :enable-time-picker="false"
          cancel-text="取消"
          select-text="確定"
          :max-date="new Date()"
          :placeholder="'請選擇您的生日'"
          teleport="body"
          no-today
        />
      </div>

      <!-- HRV量測時間 -->
      <label for="detectTime" v-if="timeShow">HRV量測時間</label>
      <div class="detectTime" v-if="timeShow">
        <select
          v-model="localTime"
          class="custom-select"
          :class="{ selected: localTime }"
        >
          <option value="" disabled selected hidden>選擇HRV量測時間</option>

          <option value="1">1分鐘</option>
          <option value="2">2分鐘</option>
          <option value="3">3分鐘</option>
        </select>
        <img class="icon2" src="../assets/imgs/arrowDown.svg" />
      </div>

      <!-- 日常收縮壓選擇 -->
      <label for="DSPR">血壓</label>
      <div class="DSPR">
        <select
          v-model="localDSPR"
          class="custom-select"
          :class="{ selected: localDSPR }"
        >
          <option value="" disabled selected hidden>請選擇血壓(選填)</option>
          <option value="normal">正常(120mmHg)</option>
          <option value="prehypertension">高血壓前期(120~139mmHg)</option>
          <option value="hypertension">高血壓(>=140mmHg)</option>
        </select>
        <img class="icon2" src="../assets/imgs/arrowDown.svg" />
      </div>

      <!-- 地址 -->
      <label for="address" v-if="addressShow">地址</label>
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
      {{ addressShow ? "儲存" : "確認" }}
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
    city: String,
    area: String,
    address: String,
    phoneShow: {
      type: Boolean,
      default: false
    },
    addressShow: {
      type: Boolean,
      default: false
    },
    emailShow: {
      type: Boolean,
      default: false
    },
    timeShow: {
      type: Boolean,
      default: false
    },
    HRVCalTime: String,
  },
  setup(props, { emit }) {
    const localName = ref(props.name || "");
    const localHeight = ref(props.height || "");
    const localWeight = ref(props.weight || "");
    const localSex = ref(props.sex || "");
    const localDate = ref(null);
    const localDSPR = ref(props.DSPR || ""); 
    const localTime = ref(props.HRVCalTime || "");

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
      
      console.log("載入的 userData:", userData);

      // 檢查資料結構，優先使用 Member 物件內的資料，如果沒有則使用根層級的資料
      const memberData = userData.Member || userData;
      
      console.log("使用的 memberData:", memberData);

      // 載入所有用戶資料欄位
      localName.value = memberData.Name || "";
      localHeight.value = memberData.Height || "";
      localWeight.value = memberData.Weight || "";
      localSex.value = memberData.Sex || "";
      
      // 處理生日資料
      if (memberData.Birthday) {
        try {
          // 支援民國年格式 (如: 114/8/14) 或西元年格式
          if (memberData.Birthday.includes("/")) {
            const parts = memberData.Birthday.split("/");
            if (parts.length === 3) {
              // 判斷是民國年還是西元年
              const year = parseInt(parts[0]);
              const month = parseInt(parts[1]) - 1; // JavaScript 月份從 0 開始
              const day = parseInt(parts[2]);
              
              // 如果年份小於 200，假設是民國年
              const fullYear = year < 200 ? year + 1911 : year;
              localDate.value = new Date(fullYear, month, day);
              console.log("解析的生日:", localDate.value);
            }
          }
        } catch (error) {
          console.error("生日格式解析錯誤:", error);
          localDate.value = null;
        }
      } else {
        localDate.value = null;
      }
      
      localDSPR.value = memberData.DSPR || "";
      localTime.value = memberData.HRVCalTime || "";
      selectedCity.value = memberData.City || "";
      selectedArea.value = memberData.Zone || "";
      inputAddress.value = memberData.Address || "";
      phone.value = memberData.Mobile || "";
      
      // 調試信息
      console.log("載入的欄位值:", {
        name: localName.value,
        height: localHeight.value,
        weight: localWeight.value,
        sex: localSex.value,
        date: localDate.value,
        DSPR: localDSPR.value,
        time: localTime.value,
        city: selectedCity.value,
        area: selectedArea.value,
        address: inputAddress.value,
        phone: phone.value
      });
      
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
        HRVCalTime: localTime.value,
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
    watch(localTime, (newValue) => emit("update:HRVCalTime", newValue));

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
      localTime,
    };
  },
};
</script>

<style lang="scss">
.infoWrap {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;

  .infoBox {
    padding-bottom: 16px;
    overflow: hidden;
    overflow-y: scroll;
  }

  .custom-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: url("../assets/imgs/arrow-down.svg") no-repeat right 10px center;
    background-size: 12px;
    color: $raphael-gray-300;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
    line-height: 22px;
    flex: 1;
    width: 100%;
  }

  .custom-select.selected {
    color: $raphael-green-400;
  }
  .dp__instance_calendar {
    z-index: 1000;
  }
  label {
    color: $raphael-gray-500;

    font-size: 16px;
    font-style: normal;
    font-weight: 400;

    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 0.5rem;
    margin-left: 0.25rem;
  }
  .nameGroup,
  .heightGroup,
  .weightGroup,
  .dateGroup,
  .phoneGroup,
  .emailGroup {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
    margin-bottom: 16px;
    @include neumorphismOuter($radius: 50px, $padding: 10px 12px);
    z-index: 10;

    .icon1,
    .icon2 {
      width: 24px;
      height: 24px;
    }

    .icon2 {
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover,
      &:active {
        transform: scale(1.1);
      }
    }
  }

  .addressGroup {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    gap: 16px;
    .city,
    .area {
      width: calc(100% / 2 - 8px);
      position: relative;
      select {
        outline: none;
        border: none;
        @include neumorphismOuter($radius: 50px, $padding: 10px 12px);
        width: 100%;
        appearance: none;
        color: $raphael-gray-300;
        font-size: 18px;

        &::placeholder {
          color: $raphael-gray-300;
          font-size: 18px;
          font-weight: 400;
        }

        &::-ms-expand {
          display: none;
        }
      }

      .selected {
        color: $raphael-green-400;
      }

      .icon1,
      .icon2 {
        width: 24px;
        height: 24px;
      }

      .icon2 {
        position: absolute;
        top: 50%;
        right: 16px;
        transform: translateY(-50%);
        z-index: 1;
      }
    }
    .address {
      width: 100%;
      input[type="text"] {
        outline: none;
        border: none;
        @include neumorphismOuter($radius: 50px, $padding: 10px 12px);

        color: #74bc1f;

        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 2.7px;
        line-height: 22px;
        flex: 1;
        width: 100%;

        &::placeholder {
          font-size: 18px;
          color: $raphael-gray-300;
        }
      }
    }
  }

  .dateGroup {
    display: flex;
  }

  .groupGroup,
  .DSPR,
  .detectTime {
    display: flex;
    align-items: center;
    gap: 4px;
    position: relative;
    margin-bottom: 16px;
    @include neumorphismOuter($radius: 50px, $padding: 10px 12px);
    .icon1,
    .icon2 {
      width: 24px;
      height: 24px;
    }
    .icon2 {
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover,
      &:active {
        transform: scale(1.1);
      }
    }

    select {
      outline: none;
      border: none;
      width: 100%;
      appearance: none;
      color: $raphael-gray-300;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 2.7px;
      line-height: 22px;
      flex: 1;
      width: 100%;

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
  }

  .detectTime {
    margin-top: 0.5rem;
    .icon1 {
      width: 22px;
    }
  }

  input[type="text"],
  input[type="password"],
  input[type="number"],
  input[type="email"] {
    outline: none;
    border: none;
    background-color: transparent;
    color: #74bc1f;

    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
    line-height: 22px;
    flex: 1;
    width: 100%;

    &::placeholder {
      font-size: 18px;
      color: $raphael-gray-300;
    }
  }

  .infoSendBtn {
    color: $raphael-green-400;
    width: 100%;
    border: none;
    font-size: 1.125rem;
    font-weight: 400;
    letter-spacing: 0.5px;
    transition: 0.25s ease;
    cursor: pointer;
    @include neumorphismOuter($radius: 50px, $padding: 8px 12px);

    &:hover,
    &:active {
      @include neumorphismOuter(
        $radius: 50px,
        $padding: 8px 12px,
        $x: 0,
        $y: 0,
        $blur: 6px
      );
    }

    &:disabled {
      @include neumorphismOuter($radius: 50px, $padding: 8px 12px);
      color: $raphael-gray-300;
      cursor: not-allowed;
      opacity: 0.6;
    }
  }
}

.vue-datepicker {
  width: 100%;
  border: none;
  border-bottom: 1px solid $raphael-gray-300;
  padding: 16px;
  font-size: 1.5rem;
  color: $raphael-gray-500;

  &::placeholder {
    color: $raphael-gray-300;
    font-weight: 400;
  }

  .vue-datepicker-input {
    padding-left: 2.75rem;
  }
}

.dp__input_wrap {
  .dp__pointer {
    border: none;
    background-color: none;
    width: 100%;
    font-size: 18px;
    background: #f5f7fa;
    color: $raphael-green-400;
    padding: 0;

    &::placeholder {
      color: $raphael-gray-400;
      font-weight: 400;
    }
  }
  svg {
    display: none;
  }
}
</style>
