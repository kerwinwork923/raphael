<template>
    <div v-if="visible" class="modal">
      <div class="cover" @click="closeComponent"></div>
      <div class="DSPRSelect">
        <img src="../assets/imgs/selectClose.svg" class="closeBtn" alt="" @click="closeComponent" />
        <h3>請選擇您的日常收縮壓</h3>
        <hr />
        <div class="inputGroup">
          <input type="radio" name="DSPR" id="DSPR1" value="normal" v-model="selectedDSPR" />
          <label for="DSPR1">正常(120mmHg)</label>
        </div>
        <div class="inputGroup">
          <input type="radio" name="DSPR" id="DSPR2" value="prehypertension" v-model="selectedDSPR" />
          <label for="DSPR2">高血壓前期(120~139mmHg)</label>
        </div>
        <div class="inputGroup">
          <input type="radio" name="DSPR" id="DSPR3" value="hypertension" v-model="selectedDSPR" />
          <label for="DSPR3">高血壓(>=140mmHg)</label>
        </div>
        <div class="selectSendBtn" @click="submitData">送出</div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['close'],
    data() {
      return {
        selectedDSPR: null, // 儲存選中的血壓狀態
      };
    },
    methods: {
      closeComponent() {
        this.$emit('close');
      },
      submitData() {
        if (this.selectedDSPR) {
          // 取得 localStorage 中的 userData 並解析為物件
          const userData = JSON.parse(localStorage.getItem('userData')) || {};
          // 更新 DSPR 為選中的狀態值
          userData.DSPR = this.selectedDSPR;
          // 儲存更新後的資料到 localStorage
          localStorage.setItem('userData', JSON.stringify(userData));
          // 關閉元件
          this.closeComponent();
        } else {
          alert("請選擇一個血壓範圍！");
        }
      },
    },
  };
  </script>
  
<style lang="scss">
.cover {
  position: absolute;
  left: 0;
  top: 0;

  width: 100%;
  height: 100%;
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
  border-radius: 12px;
  width: 80%;
  .closeBtn {
    position: absolute;
    top: 3.25%;
    right: 3%;
    width: 26px;
    height: 26px;
  }
  h3 {
    margin-top: 1rem;
    text-align: center;
    font-size: 24px;
    font-weight: 400;

    font-style: normal;
    line-height: 100%;
    margin-bottom: 1rem;
  }
  .inputGroup {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    label {
      color: #666;
      font-size: 1.5rem;
      font-weight: 400;
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
    text-align: center;
    border-radius: 8px;
    padding: 12px;
    margin-top: 0.75rem;
    letter-spacing: 0.5px;
    font-size: 18px;
  }
}
</style>

