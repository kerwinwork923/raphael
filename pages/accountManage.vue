<template>
  <div class="accountManage">
    <TitleMenu Text="帳號管理" link="/member" positionType="absolute" />
    <div class="accountManageTopGroup">
      <div class="accountManageTopItem">
        <h4>帳號名稱</h4>
        <h5>{{userDataObj.Member?.Name}}</h5>
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
      <button class="accountManageBottomBtn" @click="deleteAccount">刪除帳號</button>
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
</script>

<style scoped lang="scss">
.accountManage {
  background: url("../assets/imgs/background.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  padding: 3.25rem 3% 7rem;
}
.accountManageTopGroup {
  display: flex;
  flex-direction: column;
  gap: 12px;
  .accountManageTopItem {
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Secondary-100, #f5f7fa);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    gap: 6px;
    h4 {
      color: var(--Neutral-black, #1e1e1e);
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.1px;
    }
    h5 {
      color: var(--Neutral-500, #666);
      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.072px;
    }
  }
}
.accountManageBottomGroup {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 1.75rem;
  h3 {
    color: var(--Warning-default, #ec4f4f);
    font-size: var(--Text-font-size-20, 20px);
    font-style: normal;
    font-weight: 700;
    letter-spacing: 3px;
  }
  .accountManageBottomItem {
    border-radius: var(--Radius-r-20, 20px);
    background: var(--Warning-100, #fff5f5);
    box-shadow: 2px 4px 12px 0
      var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
    p {
      color: var(--Neutral-black, #1e1e1e);
      font-size: var(--Text-font-size-20, 20px);
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.1px;
    }

    padding: 0.75rem 1rem;
  }
}
.accountManageBottomBtn {
  border-radius: var(--Radius-r-50, 50px);
  background: var(--Warning-default, #ec4f4f);
  box-shadow: 2px 4px 12px 0
    var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
  color: var(--Neutral-white, #fff);
  font-size: var(--Text-font-size-18, 18px);
  font-style: normal;
  font-weight: 400;
  border: none;
  letter-spacing: 2.7px;
  padding: .5rem;
  cursor: pointer;
  margin-top: 0.5rem;
}
</style>
