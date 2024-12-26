<template>
  <div class="healthData">
    <TitleMenu Text="健康數據" link="/user" />
    <div class="healthDataContent">
      <h3>請輸入手環上的健康數據</h3>
      <div class="healthDataForm">
        <div class="ageGroup">
          <img class="icon1" src="../../assets/imgs/group.svg" alt="" />
          <select v-model="age" class="custom-select">
            <option value="" disabled selected hidden>請選擇生理年齡</option>
            <option value="1~5">1~5歲</option>
            <option value="6~10">6~10歲</option>
            <option value="11~15">11~15歲</option>
            <option value="16~20">16~20歲</option>
            <option value="21~25">21~25歲</option>
            <option value="26~30">26~30歲</option>
            <option value="31~35">31~35歲</option>
            <option value="36~40">36~40歲</option>
            <option value="41~45">41~45歲</option>
            <option value="46~50">46~50歲</option>
            <option value="51~55">51~55歲</option>
            <option value="56~60">56~60歲</option>
            <option value="61~65">61~65歲</option>
            <option value="66~70">66~70歲</option>
            <option value="71~75">71~75歲</option>
            <option value="76~80">76~80歲</option>
            <option value="81~85">81~85歲</option>
            <option value="86~90">86~90歲</option>
            <option value="91~95">91~95歲</option>
            <option value="96~100">96~100歲</option>
          </select>
          <img class="icon2" src="../../assets/imgs/arrowDown.svg" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.healthData {
  background-color: $raphael-gray-100;
  height: 100vh;
  padding: 0 1rem;
  .healthDataContent {
    background-color: $raphael-white;
    border-radius: 1rem;
    padding: 1rem;
  }
  .custom-select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: url("../assets/imgs/arrow-down.svg") no-repeat right 10px center;
    background-size: 12px;
    color: $raphael-gray-300;
    font-size: 1.2rem;
  }
  .custom-select.selected {
    color: $raphael-black;
  }
  .ageGroup {
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
      border-bottom: 1px solid $raphael-gray-300;
      appearance: none;
      color: $raphael-gray-300;
      font-family: Inter;
      font-size: 1.2rem;

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
}
</style>
<script>
export default {
  setup() {
    const age = ref("");
    return {
      age,
    };
  },
};
</script>
