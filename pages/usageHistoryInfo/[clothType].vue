<template>
  <HRVAlert />
  <DSPRSelect />
  <RaphaelLoading v-if="loading" />
  <div class="usageHistoryInfoWrap">
    <TitleMenu Text="穿衣紀錄" link="/usageHistory" />
    <div class="usageHistoryWrap">
      <h3>產品使用說明</h3>
      <video
        v-if="videoShow"
        class="usageHistoryVideo"
        src="/assets/video/useInfo.mp4"
        controls
        autoplay
        playsinline
      ></video>
      <ul class="usageHistoryInfoList">
        <li v-for="(item, key) in usageHistoryInfoList" :key="key">
          {{ item }}
        </li>
        <!-- <li>請裸身穿著穿戴調節衣 Neuro-Plus+。</li>
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
        </li> -->
      </ul>

      <h3 class="precautionsText" v-if="precautionsList.length > 0">
        注意事項
      </h3>
      <ul class="precautionsList">
        <li v-for="(item, key) in precautionsList" :key="key">
          {{ item }}
        </li>
        <!-- <li>勿在高溫下使用</li>
        <li>勿於陽光下曝曬</li>
        <li>勿於充電時使用</li>
        <li>勿自行拆卸修理</li>
        <li>勿清洗控制器及皮套</li>
        <li>勿將控制器及皮套分離</li>
        <li>清洗衣服前，請務必拆卸銀色集線盒</li>
        <li>避免潮濕環境</li>
        <li>請小心輕放</li> -->
      </ul>
    </div>
  </div>
  <div class="usageHistoryInfoBtnGroup">
    <!-- <button class="preBtn" @click="goPre">上一步</button> -->
    <button class="nextBtn" @click="goNext">{{ nextText }}</button>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import axios from "axios";
import { ref } from "vue";
import { useSeo } from "~/composables/useSeo";
import { useCommon } from "../stores/common";
export default {
  setup() {
    useSeo({
      title: "",
      description:
        "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
      url: "https://neuroplus.com.tw",
    });
    const router = useRouter();
    const route = router.currentRoute.value;
    const productName = decodeURIComponent(route.params.clothType);
    const store = useCommon();
    const validName = [
      "三效深眠衣",
      "雙效紅光活力衣",
      "全效調節衣",
      "居家治療儀",
    ];
    const nextText = ref("下一步");
    if (!validName.includes(productName)) {
      window.location.href = "/usageHistory"; // If needed, you can also use router.push here
    }

    const usageHistoryInfoList = ref([]);
    const precautionsList = ref([]);
    const videoShow = ref(false);
    const loading = ref(false);

    const goPre = () => {
      router.push("/usageHistory");
    };

    const goNext = () => {
      router.push(`/usage/${productName}`);
      // localStorage.setItem("form", productName);
      // store.detectFlag = "1";
      // store.detectUID = "";
      // store.detectForm = productName;
      // store.showHRVAlert = true;
    };

    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile, Name } = localData
      ? JSON.parse(localData)
      : {};

    // Redirect if required data is missing
    if (!MID || !Token || !MAID || !Mobile) {
      router.push("/");
      return;
    }

    const getProductsInfo = async () => {
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_Use2.jsp",
          {
            MID,
            Token,
            MAID,
            Mobile,
            ProductName: productName,
          }
        );

        if (response.status === 200) {
          console.log(response.data);
          if (productName === "雙效紅光活力衣") {
            videoShow.value = true;
          }
          usageHistoryInfoList.value = response.data.Product.Desc1List;
          precautionsList.value = response.data.Product.Desc2List;

          // Redirect if both lists are empty
          if (
            usageHistoryInfoList.value.length === 0 &&
            precautionsList.value.length === 0
          ) {
            window.location.href = "/usageHistory";
          }
        } else {
          console.error("Unexpected response status:", response.status);
        }
      } catch (error) {
        console.error("API request failed:", error);
      }
    };

    const init = async () => {
      loading.value = true;
      await getProductsInfo();
      loading.value = false;
    };

    init();

    return {
      goPre,
      goNext,
      productName,
      usageHistoryInfoList,
      precautionsList,
      videoShow,
      loading,
      nextText,
    };
  },
};
</script>

<style lang="scss" scoped>
.usageHistoryInfoWrap {
  display: flex;
  flex-direction: column;
  place-items: center;
  background-color: $raphael-gray-100;
  min-height: 100vh;
  width: 100%;
  padding: 0 1rem;
  padding-bottom: 116px;
  .usageHistoryWrap {
    width: 100%;
    max-width: 768px;
    
    & > h3 {
      font-size: 20px;
    }
    .usageHistoryVideo {
      width: 100%;
      height: auto;
      max-height: 80vh;
      object-fit: contain;
      margin-top: 0.75rem;
    }
    .usageHistoryInfoList {
      counter-reset: list-counter;
      margin-top: 0.5rem;
      li {
        display: flex;
        line-height: 29.1px;
        color: $raphael-gray-500;
        font-size: 18px;
        font-style: normal;
        font-weight: 400;
        letter-spacing: 0.09px;
        counter-increment: list-counter;
        &::before {
          content: counter(list-counter) ". ";
        }
      }
    }
  }
}

.usageHistoryInfoBtnGroup {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: $raphael-gray-100;
  z-index: 99;
  display: grid;
  grid-auto-flow: column;
  place-items: center;
  gap: 0.75rem;
  padding: 1rem 1rem 3.125rem 1rem;

  button {
    @include btnStyle($raphael-green-400, $raphael-white);
    max-width: 768px;
  }
  .preBtn {
    background-color: $raphael-gray-200;
    color: $raphael-gray-500;
  }
  .nextBtn {
    background-color: $raphael-green-400;
  }
}
.precautionsText {
  color: $raphael-black;
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.15px;
  margin-top: 0.75rem;
}
.precautionsList {
  list-style-type: disc;
  margin-top: 0.5rem;
  counter-reset: list-counter;

  li {
    display: flex;
    color: $raphael-red-300;
    font-size: 18px;
    line-height: 29.1px;
    letter-spacing: 0.09px;
    counter-increment: list-counter;
    &::before {
      content: "•";
    }
  }
}
</style>
