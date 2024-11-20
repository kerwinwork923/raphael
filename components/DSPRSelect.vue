<template>
  <div v-if="store.showDSPRSelect" class="modal">
    <div class="cover"></div>
    <div class="DSPRSelect">
      <img
        src="../assets/imgs/selectClose.svg"
        class="closeBtn"
        alt=""
        @click="closeComponent"
      />
      <h3>請選擇您的日常收縮壓</h3>
      <hr />
      <div class="inputGroup">
        <input
          type="radio"
          name="DSPR"
          id="DSPR1"
          value="normal"
          v-model="selectedDSPR"
        />
        <label for="DSPR1">正常(120mmHg)</label>
      </div>
      <div class="inputGroup">
        <input
          type="radio"
          name="DSPR"
          id="DSPR2"
          value="prehypertension"
          v-model="selectedDSPR"
        />
        <label for="DSPR2">高血壓前期(120~139mmHg)</label>
      </div>
      <div class="inputGroup">
        <input
          type="radio"
          name="DSPR"
          id="DSPR3"
          value="hypertension"
          v-model="selectedDSPR"
        />
        <label for="DSPR3">高血壓(>=140mmHg)</label>
      </div>
      <div class="selectSendBtn" @click="submitData">送出</div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useCommon } from "@/stores/common";

export default {
  setup() {
    const store = useCommon();
    const selectedDSPR = ref("");
    const closeComponent = () => {
      store.showDSPRSelect = false;
    };

    const submitData = () => {
      const validDSPRValues = ["normal", "prehypertension", "hypertension"];

      if (selectedDSPR.value && validDSPRValues.includes(selectedDSPR.value)) {
        const userData = JSON.parse(localStorage.getItem("userData")) || {};
        userData.DSPR = selectedDSPR.value;

        if (!isUserDataValid(userData)) {
          alert("會員資料格式有誤，請修改您的資料！");
          return;
        }

        const convertedData = {
          age: calculateAge(userData.Birthday),
          bp_group: userData.DSPR,
          bp_mode: "ternary",
          facing_mode: "user",
          height: parseInt(userData.Height),
          sex: parseInt(userData.Sex),
          weight: parseInt(userData.Weight),
        };
        sessionStorage.setItem("data", JSON.stringify(convertedData));
        localStorage.setItem("userData", JSON.stringify(userData));

        closeComponent();
        window.location.href = "/vital/scan.html";
      } else {
        alert("請選擇一個有效的血壓範圍！");
      }
    };

    const isUserDataValid = (userData) => {
      const isInteger = (value) => Number.isInteger(parseInt(value, 10));

      return (
        isInteger(userData.Height) &&
        parseInt(userData.Height) > 0 &&
        isInteger(userData.Weight) &&
        parseInt(userData.Weight) > 0 &&
        isValidBirthday(userData.Birthday) &&
        (userData.Sex === "1" || userData.Sex === "2")
      );
    };

    const isValidBirthday = (birthday) => {
      const parts = birthday.split("/");
      return (
        parts.length === 3 &&
        parseInt(parts[0]) > 0 &&
        parseInt(parts[1]) >= 1 &&
        parseInt(parts[1]) <= 12 &&
        parseInt(parts[2]) >= 1 &&
        parseInt(parts[2]) <= 31
      );
    };

    const calculateAge = (birthday) => {
      const [year, month, day] = birthday.split("/").map(Number);
      const birthDate = new Date(year + 1911, month - 1, day);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    return {
      store,
      closeComponent,
      submitData,
      selectedDSPR,
    };
  },
};
</script>

<style lang="scss">
.cover {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 9;
  background: rgba(217, 217, 217, 0.5);
  backdrop-filter: blur(2.5px);
}
.DSPRSelect {
  background-color: #fff;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;
  padding: 12px;
  padding-top: 32px;
  border-radius: 12px;
  width: 80%;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);

  .closeBtn {
    position: absolute;
    top: 3.25%;
    right: 3%;
    width: 26px;
    height: 26px;
    cursor: pointer;
  }
  h3 {
    text-align: left;
    font-size: 24px;
    font-weight: 400;
    line-height: 100%;
    margin-bottom: 1rem;
  }
  .inputGroup {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    label {
      color: #666;
      font-size: 1.25rem;
      letter-spacing: 0.15px;
      margin-left: 0.15rem;
    }
    input[type="radio"] {
      width: 24px;
      height: 24px;
      appearance: none;
      background-color: #fff;
      border: 1px solid #666;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      transition: background-color 0.2s;
      &:checked {
        background-color: $raphael-green-400;
        border-color: $raphael-green-400;
      }
    }
  }
  .selectSendBtn {
    background-color: $raphael-green-400;
    color: #fff;
    cursor: pointer;
    text-align: center;
    border-radius: 8px;
    padding: 12px;
    margin-top: 0.75rem;
    letter-spacing: 0.5px;
    font-size: 18px;
    transition: all .3s ease;
    &:hover{
      background-color: $raphael-green-500;
    }
  }
}
</style>
