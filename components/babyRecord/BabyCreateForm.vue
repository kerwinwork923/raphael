<template>
  <div class="babyRecordGroup">
    <div class="babyInfoGroup">
      <h4>新增寶貝基本資料</h4>
      <div class="babyInfo" v-for="(baby, index) in babyInfos" :key="index">
        <div class="babyInfoOption">
          <small>#{{ existingOffset + index + 1 }}</small>
          <img src="/assets/imgs/trash.svg" alt="刪除" @click="remove(index)" />
        </div>

        <!-- 姓名 -->
        <div class="babyRecordInfoInput">
          <img
            class="icon1"
            src="/assets/imgs/babyRecordMember.svg"
            alt="姓名"
          />
          <input type="text" v-model="baby.name" placeholder="請輸入寶貝姓名" />
        </div>

        <!-- 性別 -->
        <div class="babyRecordInfoInput">
          <img class="icon1" src="/assets/imgs/babyRecordS.svg" alt="性別" />
          <select v-model="baby.gender" required>
            <option value="" disabled hidden>請選擇性別</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </div>

        <!-- 生日 -->
        <div class="babyRecordInfoInput">
          <img class="icon1" src="/assets/imgs/babyRecordFace.png" alt="生日" />
          <VueDatePicker
            v-model="baby.birthDate"
            :format="formatDate"
            :locale="'zh-TW'"
            :enable-time-picker="false"
            cancel-text="取消"
            select-text="確定"
            :max-date="new Date()"
            :placeholder="'請選擇寶貝的生日'"
            no-today
            class="date-picker no-icon"
          />
        </div>
      </div>
    </div>

    <!-- 繼續新增 -->
    <div class="babyInfoAdd" @click="addOneMoreBaby">
      繼續新增寶貝
      <img src="/assets/imgs/babyInfoAdd.svg" alt="新增" />
    </div>
  </div>
</template>

<script>
import VueDatePicker from "@vuepic/vue-datepicker";

export default {
  name: "BabyCreateForm",
  components: {
    VueDatePicker,
  },
  props: {
    babyInfos: {
      type: Array,
      default: () => [],
    },
    existingOffset: {
      type: Number,
      default: 0, // 表示目前已有幾位寶貝
    },
  },
  emits: ["addBaby", "removeBaby"],
  setup(props, { emit }) {
    function addOneMoreBaby() {
      emit("addBaby");
    }
    function remove(idx) {
      emit("removeBaby", idx);
    }

    function formatDate(date) {
      if (!date) return "";
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    return {
      addOneMoreBaby,
      remove,
      formatDate,
    };
  },
};
</script>

<style lang="scss">
.babyCreateForm{  
  position: relative;
  width: 100%;
  border-radius: 0.5rem;
  margin-top: 0.5rem;
  padding: 1rem;
  box-shadow: inset 0px 4px 8px rgba(0, 0, 0, .25);
}

/* === 主容器 === */
.babyRecordGroup {
  width: 100%;
}

.babyInfoGroup {
  max-height: 500px;
  overflow: auto;
  @include scrollbarStyle();
  h4 {
    color: #666666;
    font-size: 1rem;
    letter-spacing: 0.5px;
    font-weight: 400;
    margin-bottom: 0.6rem;
    margin-top: 0.25rem;
  }
  .babyInfo {
    padding: 12px;
    border-radius: 12px;
    background-color: #ffffff;
    margin-bottom: 0.75rem;
  }
  .babyInfoOption {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    small {
      color: #b3b3b3;
    }
    img {
      cursor: pointer;
    }
  }
}

/* === 繼續新增按鈕 === */
.babyInfoAdd {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ec4f4f;
  gap: 4px;
  cursor: pointer;
  img {
    width: 1.25rem;
  }
}

/* === 輸入框樣式 === */
.babyRecordInfoInput {
  position: relative;
  margin-bottom: 0.5rem;

  .icon1 {
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translateY(-50%);
    z-index: 2;
    width: 24px;
    height: 24px;
  }

  input[type="text"],
  select {
    outline: none;
    border: none;
    border-bottom: 1px solid #cccccc;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 12px;
    padding-top: 16px;
    color: #000000;
    background: transparent;
    &::placeholder {
      color: #cccccc;
      font-family: Inter, sans-serif;
      font-size: 1.2rem;
      font-weight: 400;
    }
  }

  /* 預設 select 顏色為淺灰 */
  select {
    color: #cccccc;
  }

  /* 當選擇性別後，文字變黑 */
  select:valid {
    color: #000000;
  }
}

/* === 日期選擇器樣式 === */
.date-picker {
  width: 100%;
  border: none;
  border-bottom: 1px solid #cccccc;
  background: transparent;
  font-size: 1.2rem;
  color: #000000;
  padding-left: 36px;
  padding-bottom: 12px;
  padding-top: 16px;

  /* 隱藏 VueDatePicker 內建 icon */
  .dp__input_icon {
    display: none !important;
  }

  /* 清除 VueDatePicker 預設邊框、陰影 */
  .dp__input_wrap {
    border: none !important;
    background: none !important;
    padding: 0 !important;
    box-shadow: none !important;
  }

  /* 設置與一般輸入框相同的樣式 */
  .dp__input {
    border: none !important;
    font-size: 1.2rem;
    width: 100%;
    padding: 0;
    color: #000000;
    background: none !important;
    box-shadow: none !important;
  }

  /* placeholder 樣式 */
  .dp__input::placeholder {
    color: #cccccc !important;
  }

  /* 隱藏選擇器的額外樣式 */
  .dp__menu {
    box-shadow: none !important;
    border: none !important;
  }
}
</style>
