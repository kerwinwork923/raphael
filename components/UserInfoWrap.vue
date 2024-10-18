<template>
  <div class="infoWrap">
    <div class="infoBox">
      <div class="nameGroup">
        <img class="icon1" src="../assets/imgs/user.svg" alt="" />
        <input
          type="text"
          placeholder="請輸入您的姓名(暱稱)"
          :value="name"
          @input="(event) => updateName(event.target.value)"
        />
      </div>
      <div class="heightGroup">
        <img class="icon1" src="../assets/imgs/height.svg" alt="" />
        <input
          type="text"
          placeholder="請輸入您的身高"
          :value="height"
          @input="(event) => updateHeight(event.target.value)"
        />
      </div>
      <div class="weightGroup">
        <img class="icon1" src="../assets/imgs/weight.svg" alt="" />
        <input
          type="text"
          placeholder="請輸入您的體重"
          :value="weight"
          @input="(event) => updateWeight(event.target.value)"
        />
      </div>
      <div class="groupGroup">
        <img class="icon1" src="../assets/imgs/group.svg" alt="" />
        <select
          ref="sexSelect"
          :value="sex"
          @change="(event) => updateSex(event.target.value)"
        >
          <option class="placeholder" value="" disabled selected hidden>
            請選擇您的性別
          </option>
          <option value="1">男生</option>
          <option value="2">女生</option>
        </select>
        <img class="icon2" src="../assets/imgs/arrowDown.svg" alt="" />
      </div>
      <div class="dateGroup">
        <img class="icon1" src="../assets/imgs/date.svg" alt="" />

        <VueDatePicker
          v-model="selectedDate"
          :format="formatDate"
          :locale="zhTWLocale"
          :enable-time-picker="false"
          cancel-text="取消"
          select-text="確定"
          :max-date="new Date()"
        />
      </div>
    </div>
    <button class="infoSendBtn" @click="submitForm">送出</button>
  </div>
</template>

<script>
import { ref } from "vue";
import { zhTW } from "date-fns/locale";

export default {
  props: {
    name: String,
    height: String,
    weight: String,
    sex: String,
  },
  setup(props, { emit }) {
    const selectedDate = ref(null);

    // 自訂民國日期格式
    const formatDate = (date) => {
      if (!date) return ""; // 如果沒有日期，則返回空字符串
      const rocYear = date.getFullYear() - 1911; // 將西元年轉為民國年
      return `${rocYear}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    const zhTWLocale = zhTW;

    const updateName = (value) => {
      emit("update:name", value);
    };

    const updateHeight = (value) => {
      emit("update:height", value);
    };

    const updateWeight = (value) => {
      emit("update:weight", value);
    };

    const updateSex = (value) => {
      emit("update:sex", value);
    };

    const submitForm = () => {
      if (!selectedDate.value) return;

   
      const rocYear = selectedDate.value.getFullYear() - 1911; // 转换为民国年
      const month = (selectedDate.value.getMonth() + 1)
        .toString()
        .padStart(2, "0"); 
      const day = selectedDate.value.getDate().toString().padStart(2, "0"); // 日期需补零


      const formattedDate = `${rocYear
        .toString()
        .padStart(3, "0")}${month}${day}`;

    
      emit("submit", {
        name: props.name,
        height: props.height,
        weight: props.weight,
        sex: props.sex,
        date: formattedDate, // 提交格式化后的日期
      });
    };

    return {
      selectedDate,
      formatDate,
      zhTWLocale,
      updateName,
      updateHeight,
      updateWeight,
      updateSex,
      submitForm,
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
    .icon2 {
      position: absolute;
      top: 50%;
      right: 2px;
      transform: translateY(-50%);
    }
  }

  .dateGroup {
    display: flex;
  }

  .groupGroup {
    display: flex;
    position: relative;
    width: 100%;
    select {
      outline: none;
      border: none;
      padding-left: 16px;
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
    background-color: #28a745;
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
  }
}

// 覆蓋 VueDatePicker 樣式
.vue-datepicker {
  width: 100%;
  border: none;
  border-bottom: 1px solid #ccc;
  padding: 16px;
  font-size: 1.2rem;
  color: #666;
  font-family: Inter, sans-serif;

  // 類似 input 的樣式
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
  }
  svg {
    display: none;
  }
}
</style>
