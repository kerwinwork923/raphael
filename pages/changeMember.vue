<template>
  <div class="changeMemberWrap">
    <Navbar />
    <div class="changeMemberGroup">
      <div class="raphaelIconImgGroup">
        <img class="raphaelIcon" src="../assets/imgs/raphael.svg" alt="" />
      </div>
      <h1>輸入基本資料</h1>
      <UserInfoForm />
    </div>
  </div>
</template>

<script>
import Navbar from "../components/Navbar.vue";
import UserInfoForm from "../components/UserInfoWrap.vue";

export default {
  components: { Navbar, UserInfoForm },
  setup() {},
};
</script>

<style lang="scss">
h1 {
  font-family: "Noto Sans";
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.5px;
  margin-top: 8px;
  text-align: center;
  color: $raphael-purple-200;
}
.changeMemberWrap {
  width: 100%;
  min-height: 100vh;
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  .changeMemberGroup {
    width: 90%;
    margin: 0 auto;
    max-width: 576px;
    padding-top: 100px;
    text-align: center;
  }
}
</style>
