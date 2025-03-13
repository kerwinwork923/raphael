<template>
  <div class="babyRecordGroup">
    <div class="babyInfoGroup">
      <h4>新增寶貝基本資料</h4>
      <div class="babyInfo" v-for="(baby, index) in babyInfos" :key="index">
        <div class="babyInfoOption">
          <small>#{{ index + 1 }}</small>
          <img src="/assets/imgs/trash.svg" alt="刪除" @click="remove(index)" />
        </div>

        <div class="babyRecordInfoInput">
          <img
            class="icon1"
            src="/assets/imgs/babyRecordMember.svg"
            alt="姓名"
          />
          <input type="text" v-model="baby.name" placeholder="請輸入寶貝姓名" />
        </div>

        <div class="babyRecordInfoInput">
          <img class="icon1" src="/assets/imgs/babyRecordS.svg" alt="性別" />
          <select v-model="baby.gender">
            <option value="" disabled hidden>請選擇性別</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </div>

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
            class="date-picker"
          />
        </div>
      </div>
    </div>

    <!-- 底下按鈕（繼續新增 或送出）可放這裡，也可放在外層 -->
    <div class="babyInfoAdd" @click="addOneMoreBaby">
      繼續新增寶貝基本資料
      <span><img src="/assets/imgs/babyInfoAdd.svg" alt="新增" /></span>
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
/* 新增寶貝表單 */
.babyRecordGroup {
  width: 100%;
}
.babyInfoGroup {
  h4 {
    color: #666666; /* #666 or $raphael-gray-500, 看需求 */
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

/* 右下角「繼續新增寶貝」 */
.babyInfoAdd {
  display: flex;
  align-items: center;
  color: #ec4f4f;
  gap: 2px;
  cursor: pointer;
  img {
    width: 0.85rem;
  }
}

/* 輸入框 */
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
    font-size: 1.2rem;
    width: 100%;
    padding-left: 36px;
    padding-bottom: 12px;
    padding-top: 16px;
    color: #000000;
    &::placeholder {
      color: #cccccc;
      font-family: Inter, sans-serif;
      font-size: 1.2rem;
      font-weight: 400;
    }
  }
}


</style>
