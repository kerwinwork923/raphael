<template>
  <TitleMenu Text="使用紀錄" link="/usageHistory" />
  <div class="usageHistoryInfoWrap">
    <h3>產品使用說明</h3>
    <video
      class="usageHistoryVideo"
      src="/assets/video/useInfo.mp4"
      controls
      autoplay
      muted
    ></video>
    <ul class="usageHistoryInfoList">
      <li>請裸身穿著穿戴調節衣 Neuro-Plus+。</li>
      <li>拉上拉鍊，整頓衣服，使穿戴調節衣 Neuro-Plus+ 完整服貼於身體。</li>
      <li>領子蓋住鎖骨、胸骨位於拉鍊正下方。</li>
      <li>確認穿戴調節衣 Neuro-Plus+ 肩線與側身中線上。</li>
      <li>將穿戴調節衣 Neuro-Plus+ 下擺紮進內褲裡，使本產品確實與皮膚接觸。</li>
      <li>
        將控制器連同背袋背於身體側身、將穿戴調節衣
        Neuro-Plus+上銀色插座插入控制器中。
      </li>
      <li>
        按下控制上的綠色開關鍵以啟動電源、控制器會自動記錄使用的時間與日期。
      </li>
    </ul>
  </div>
  <div class="usageHistoryInfoBtnGroup">
    <button class="preBtn" @click="goPre">上一步</button>
    <button class="nextBtn" @click="goNext">下一步</button>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
export default {
  setup() {
    const router = useRouter();
    const goPre = () => {
      router.push("/usageHistory");
    };

    const goNext = () => {};

    return {
      goPre,
      goNext,
    };
  },
};
</script>

<style lang="scss">
.usageHistoryInfoWrap {
  background-color: rgba(246, 246, 246, 1);
  min-height: 100vh;
  width: 100%;
  padding: 0 5%;
  .usageHistoryVideo {
    width: 100%;
    height: auto;
    max-height: 80vh;
    object-fit: contain;
    margin-top: 0.75rem;
  }
  .usageHistoryInfoList {
    list-style: desc;
    margin-left: 1.5rem;
    margin-top: 1rem;
    li {
      line-height: 1.5;
      color: #666;
      font-family: "Noto Sans";
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      letter-spacing: 0.09px;
    }
  }
}

.usageHistoryInfoBtnGroup {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #f6f6f6;
  z-index: 99;
  display: flex;
  gap: 10px;
  padding: 24px 5%;
  button {
    width: 50%;
    background-color: $raphael-green-400;
    color: #fff;
    border: none;
    padding: 8px;
    border-radius: 8px;
    color: #fff;
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.09px;
  }
  .preBtn {
    background-color: #eee;
    color: #666;
  }
  .nextBtn {
    background-color: $raphael-green-400;
  }
}
</style>
