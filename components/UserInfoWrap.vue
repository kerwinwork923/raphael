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
          <option value="正常">正常(120mmHg)</option>
          <option value="高血壓前期">高血壓前期(120~139mmHg)</option>
          <option value="高血壓">高血壓(>=140mmHg)</option>
        </select>
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
import { ref, watch, computed } from "vue";
import { zhTW } from "date-fns/locale";

export default {
  props: {
    name: String,
    height: String,
    weight: String,
    sex: String,
    DSPR: String,
    date: String,
  },
  setup(props, { emit }) {
    const localName = ref(props.name);
    const localHeight = ref(props.height);
    const localWeight = ref(props.weight);
    const localSex = ref(props.sex || ""); // 設置初始值為空字符串
    const localDate = ref(null);
    const localDSPR = ref(props.DSPR || ""); // 設置初始值為空字符串

    // 自訂民國日期格式
    const formatDate = (date) => {
      if (!date) return ""; // 如果沒有日期，返回空字符串
      const rocYear = date.getFullYear() - 1911;
      return `${rocYear}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    const zhTWLocale = zhTW;

    // Watchers to emit changes to parent
    watch(localName, (newValue) => emit("update:name", newValue));
    watch(localHeight, (newValue) => emit("update:height", newValue));
    watch(localWeight, (newValue) => emit("update:weight", newValue));
    watch(localSex, (newValue) => emit("update:sex", newValue));
    watch(localDate, (newValue) => emit("update:date", newValue));
    watch(localDSPR, (newValue) => emit("update:DSPR", newValue));

    // 計算屬性判斷送出按鈕是否禁用
    const isSubmitDisabled = computed(() => {
      return (
        !localName.value ||
        !localHeight.value ||
        !localWeight.value ||
        !localSex.value ||
        !localDate.value
      );
    });

    // 送出表單
    const submitForm = () => {
      emit("submit");
    };

    return {
      localName,
      localHeight,
      localWeight,
      localSex,
      localDate,
      localDSPR,
      formatDate,
      zhTWLocale,
      submitForm,
      isSubmitDisabled, // 返回計算屬性
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
    -webkit-appearance: none; /* Chrome 和 Safari */
    -moz-appearance: none; /* Firefox */
    appearance: none; /* 標準 */
    background: url("../assets/imgs/arrow-down.svg") no-repeat right 10px center; /* 添加下拉箭頭 */
    background-size: 12px;
    color: #999; /* 預設顏色 */
    font-size: 1.2rem;
  }

  .custom-select.selected {
    color: black; /* 選擇後變為黑色 */
  }
  
  .nameGroup,
  .heightGroup,
  .weightGroup,
  .dateGroup {
    position: relative;
    margin-bottom: 1rem;

    .icon1 {
      position: absolute;
      top: 50%;
      left: 2px;
      transform: translateY(-50%);
      z-index: 2;
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
  input[type="number"] {
    outline: none;
    border: none;
    border-bottom: 1px solid #ccc;
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 16px;
    padding-top: 16px;

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
