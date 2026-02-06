<template>
  <div class="accountManage">
    <TitleMenu Text="帳號管理" link="/member" />
    <div class="accountManageTopGroup">
      <div class="accountManageTopItem">
        <h4>帳號名稱</h4>
        <h5>{{ userDataObj.Member?.Name }}</h5>
      </div>
      <div class="accountManageTopItem">
        <h4>註冊日期</h4>
        <!-- 20250826115303轉換為 2025/08/01 15:00-->
        <h5>{{ formatDate(userDataObj.Member?.CheckTime) }}</h5>
      </div>
      <div class="accountManageTopItem">
        <h4>手機是否已驗證</h4>
        <h5>缺</h5>
      </div>
      <div class="accountManageTopItem">
        <h4>最近登入時間</h4>
        <h5>缺</h5>
      </div>
    </div>
    <div class="accountManageBottomGroup">
      <h3><img src="/assets/imgs/member/warningRed.svg" alt="" /> 刪除帳號</h3>
      <div class="accountManageBottomItem">
        <p>您的所有個人資料與紀錄將永久刪除，無法恢復</p>
      </div>
      <div class="accountManageBottomItem">
        <p>您將失去登入權限，無法再使用本服務</p>
      </div>
      <div class="accountManageBottomItem">
        <p>既有的內容將無法再存取</p>
      </div>
      <button class="accountManageBottomBtn" @click="deleteAccount">
        刪除帳號
      </button>
    </div>
  </div>
</template>

<script setup>
const router = useRouter();
const userData = localStorage.getItem("userData");
const userDataObj = JSON.parse(userData);

const deleteAccount = () => {
  router.push("/deleteConfirm");
};

// 轉換日期格式的函式
const formatDate = (dateString) => {
  if (!dateString) return "";

  // 假設字串格式固定為 YYYYMMDDHHmmss
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  const hour = dateString.slice(8, 10);
  const minute = dateString.slice(10, 12);
  // const second = dateString.slice(12, 14); // 如果要顯示秒可以用

  return `${year}/${month}/${day} ${hour}:${minute}`;
};

useHead({
  title: "拉菲爾人本診所",
  meta: [{ name: "description", content: "是透過相應神經調節療法，以無藥、無副作用、非侵入性的治療方式治療自律神經失調、神經痛、弱視、耳鳴、眩暈、胃食道逆流、顏面神經麻痺、失眠、過敏性鼻炎、焦慶憂鬱、胃食道逆流、三叉神經痛、帶狀皰疹神經痛等疾病。" }],
});

</script>

<style scoped lang="scss">
.accountManage {
  @include gradientBg();
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom:84px;
}
.titleMenu {
  max-width: 768px;
  width: 100%;
  padding: 0.75rem 1rem;

  &:deep > div {
    left: 1rem;
  }
}
.accountManageTopGroup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 768px;
  padding: 0 1rem;
  margin-top:1rem;
  .accountManageTopItem {
    @include neumorphismOuter();
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 8px;
    h4 {
      color: $raphael-black;
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.1px;
    }
    h5 {
      color: $raphael-gray-500;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.072px;
    }
  }
}
.accountManageBottomGroup {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.75rem;
  width: 100%;
  max-width: 768px;
  padding: 0 1rem;

  h3 {
    color: $raphael-red-300;
    font-size: 20px;
    font-style: normal;
    font-weight: 700;
    letter-spacing: 3px;
  }
  .accountManageBottomItem {
    @include neumorphismOuter($bgColor: $raphael-red-100);

    p {
      color: $raphael-black;
      font-size: 20px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.1px;
      line-height: 24px;
    }
  }
}
.accountManageBottomBtn {
  @include neumorphismOuter(
    $bgColor: $raphael-gray-300,
    $radius: 50px,
    $padding: 0.5rem
  );
  color: $raphael-black;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
  border: none;
  letter-spacing: 2.7px;
  cursor: pointer;
  margin-top: 1.75rem;
  transition: all 0.2s ease;

  &:hover,
  &:active {
    @include neumorphismOuter(
      $bgColor: $raphael-gray-300,
      $radius: 50px,
      $padding: 0.5rem,
      $x: 0,
      $y: 0,
      $blur: 6px
    );
  }
}
</style>
