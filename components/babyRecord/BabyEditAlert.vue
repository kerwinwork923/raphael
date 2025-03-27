<template>
  <div v-if="show" class="babyEditAlertCover" @click.self="onClose"></div>
  <div v-if="show" class="babyEditAlert">
    <div class="babyEditAlertCloseWrap">
      <img
        class="babyEditAlertClose"
        src="../../assets/imgs/selectClose.svg"
        alt="關閉"
        @click="onClose"
      />
    </div>

    <h4>編輯寶貝基本資料</h4>

    <!-- 姓名 -->
    <div class="babyRecordInfoInput">
      <img class="icon1" src="/assets/imgs/babyRecordMember.svg" alt="姓名" />
      <input v-model="tempName" type="text" placeholder="請輸入寶貝姓名" />
    </div>

    <!-- 性別 -->
    <div class="babyRecordInfoInput">
      <img class="icon1" src="/assets/imgs/babyRecordS.svg" alt="性別" />
      <select v-model="tempGender">
        <option value="" disabled hidden>請選擇性別</option>
        <option value="male">男性</option>
        <option value="female">女性</option>
      </select>
    </div>

    <!-- 生日 -->
    <div class="babyRecordInfoInput">
      <img class="icon1" src="/assets/imgs/babyRecordFace.png" alt="生日" />
      <VueDatePicker
        v-model="tempBirthDate"
        :format="formatDate"
        locale="zh-TW"
        :max-date="new Date()"
        :enable-time-picker="false"
        placeholder="請選擇寶貝的生日"
        class="date-picker no-icon"
      />
    </div>

    <!-- 送出按鈕 -->
    <div class="babyEditAlertBtn" @click="onSubmitEdit">送出</div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { useBabyStore } from "@/stores/useBabyStore";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default {
  name: "BabyEditAlert",
  components: {
    VueDatePicker,
  },
  props: {
    show: { type: Boolean, default: false },
    cid: { type: String, default: "" },
    name: { type: String, default: "" },
    gender: { type: String, default: "" },
    birthDate: { type: Date, default: null },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const babyStore = useBabyStore();

    // 暫存表單
    const tempName = ref(props.name);
    const tempGender = ref(props.gender);
    const tempBirthDate = ref(props.birthDate);

    watch(
      () => [props.name, props.gender, props.birthDate],
      ([newName, newGender, newDate]) => {
        tempName.value = newName;
        tempGender.value = newGender;
        tempBirthDate.value = newDate;
      }
    );

    function formatDate(date) {
      if (!date) return "";
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}/${m}/${d}`;
    }

    function onClose() {
      emit("close");
    }

    async function onSubmitEdit() {
      if (!tempName.value || !tempGender.value || !tempBirthDate.value) {
        alert("請填寫完整資料");
        return;
      }
      const sexCode = tempGender.value === "male" ? "1" : "2";
      const y = tempBirthDate.value.getFullYear();
      const m = String(tempBirthDate.value.getMonth() + 1).padStart(2, "0");
      const d = String(tempBirthDate.value.getDate()).padStart(2, "0");
      const birthDay = `${y}${m}${d}`;

      const resp = await babyStore.modifyChild(
        props.cid,
        tempName.value.trim(),
        sexCode,
        birthDay
      );
      if (resp.success) {
        alert("寶貝資料已更新！");
        onClose();
      } else {
        alert(`修改失敗：${resp.message || "請稍後再試"}`);
      }
    }

    return {
      tempName,
      tempGender,
      tempBirthDate,
      formatDate,
      onClose,
      onSubmitEdit,
    };
  },
};
</script>

<style lang="scss">
.babyEditAlertCover {
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 11;
  top: 0;
  left: 0;
}
.babyEditAlert {
  position: fixed;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
  padding: 12px 1rem;
  border-radius: 12px;
  background: var(--shade-white, #fff);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(50px);
  width: 90%;
  max-width: 400px;
  z-index: 99;
    
  .babyEditAlertCloseWrap {
    text-align: right;

    .babyEditAlertClose {
      cursor: pointer;
      width: 24px;
      height: 24px;
    }
  }

  h4 {
    color: var(--brand-green-400, #74bc1f);
    font-size: 24px;
    font-weight: 400;
    margin-bottom: 1rem;
    text-align: center;
  }
  .babyRecordInfoInput {
    display: flex;
    align-items: center;

    border-radius: 8px;

    margin-bottom: 12px;
    .icon1 {
      width: 20px;
      height: 20px;
      margin-right: 6px;
    }

  }
  .babyEditAlertBtn {
    width: 100%;
    text-align: center;
    background: var(--brand-green-400, #74bc1f);
    color: #fff;
    padding: 10px 0;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
