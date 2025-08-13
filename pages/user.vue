<template>
  <QRCodeScanner v-if="qrcodeShow" />
  <div class="raphaelUser">
    <RaphaelLoading v-if="loading" />
    <HealthRecordAlert
      v-if="isHealthRecordAlertActive"
      :HealthRecordAlertActive="isHealthRecordAlertActive"
      @update:HealthRecordAlertActive="hideHealthRecordAlert"
    />

    <Navbar />
    <div class="userGroup">
      <div class="userInfo">
        <div class="imgGroup">
          <img src="../assets/imgs/sticker.png" alt="" @click="goToSticker" />
        </div>
        <div class="infoTextGroup">
          <div class="topText">{{ userInfo?.Name }} 您好</div>
          <div class="score">
            <div class="circle"></div>
            <div class="scoreText">
              目前積分 <span>{{ userInfo?.Score || 0 }}</span> 分
            </div>
          </div>
        </div>
        <div class="qrCode">
          <img
            @click="toggleQrcodeShow"
            src="../assets/imgs/qrcode.svg"
            alt=""
          />
        </div>
      </div>
      <div class="bannerGroup">
        <img class="imgHide" src="../assets//imgs/banner-1.png" alt="" />
        <img
          v-for="(slide, index) in slides"
          :key="index"
          :class="{ active: currentSlide === index }"
          :src="slide"
          alt=""
        />
      </div>
      <!-- <div class="bannerGroup2">
        <img @click="goCart" src="../assets/imgs/shoppingMall.png" alt="" />
      </div> -->
      <div class="itemsGroup">
        <!-- 
        <div class="item item2" @click="goHRVHistory">
          <div class="topTitle">檢測</div>
          <div class="bottomTitle">HRV</div>
          <img src="../assets/imgs/faceIcon.svg" alt="" />
        </div> -->

        <router-link to="/UsageHistory" class="item">
          <img src="../assets/imgs/clothIcon.svg" alt="" />
          <div class="title">穿衣紀錄</div>
        </router-link>

        <div @click="showHealthRecordAlert" class="item">
          <img src="../assets/imgs/noteIcon.svg" alt="" />
          <div class="title">健康自評</div>
        </div>

        <router-link to="/point" class="item">
          <img src="../assets/imgs/ticket.svg" alt="" />
          <div class="title">我的積分</div>
        </router-link>

        <!-- <router-link to="/cart" class="item">
          <img src="../assets/imgs/ecommerce.svg" alt="" />
          <div class="title">健康好物</div>
        </router-link> -->

        <!-- <router-link to="/survey" class="item">
          <img src="../assets/imgs/magicIcon.svg" alt="" />
          <div class="title">專屬推薦</div>
        </router-link> -->

        <router-link to="/package" class="item">
          <img src="../assets/imgs/logistics.svg" alt="" />
          <div class="title">診所寄貨</div>
        </router-link>

        <router-link to="/contract" class="item">
          <img src="../assets/imgs/contract.svg" alt="" />
          <div class="title">合約|請假</div>
        </router-link>

        <!-- <router-link class="item">
          <img src="../assets/imgs/serviceIcon.svg" alt="" />
          <div class="title">線上客服</div>
        </router-link> -->

        <!-- <router-link class="item">
          <img src="../assets/imgs/relationshopIcon.svg" alt="" />
          <div class="title">推薦親友</div>
        </router-link> -->
      </div>
      <footer class="copyrights">
        <!-- <a href="/usageHistory"></a> -->
        © 2024 智平衡健康事業股份有限公司 all rights reserved.
      </footer>
    </div>
  </div>
</template>

<script>
import { useSeo } from "~/composables/useSeo";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});
import { onMounted, ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar";
import RaphaelLoading from "../components/RaphaelLoading";
import DSPRSelect from "../components/DSPRSelect.vue";
import HRVAlert from "~/components/HRVAlert.vue";
import HealthRecordAlert from "~/components/HealthRecordAlert.vue";
import axios from "axios";
import { useCommon } from "../stores/common";

//圖片
import banner1 from "@/assets/imgs/banner-1.png";
import banner2 from "@/assets/imgs/banner-2.png";

import QRCodeScanner from "~/components/QRCodeScanner.vue";

export default {
  components: {
    Navbar,
    RaphaelLoading,
    HRVAlert,
    DSPRSelect,
    QRCodeScanner,
    HealthRecordAlert,
  },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const userInfo = ref(null);
    const currentSlide = ref(0);
    const slides = ref([banner1, banner2]);

    const qrcodeShow = ref(false);
    const store = useCommon();

    const toggleQrcodeShow = () => {
      qrcodeShow.value = !qrcodeShow.value;
    };

    const isHealthRecordAlertActive = ref(false);

    const showHealthRecordAlert = () => {
      isHealthRecordAlertActive.value = true;
    };

    const hideHealthRecordAlert = () => {
      isHealthRecordAlertActive.value = false;
    };

    const goToSticker = () => {
      router.push("/robot");
    };

    const getUserData = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name } = localData
        ? JSON.parse(localData)
        : {};

      if (!MID || !Token || !MAID || !Mobile) {
        localStorage.removeItem("userData");
        router.push("/");
        return;
      } else if (Name === "") {
        router.push("/changeMember");
        return;
      }
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_AA6.jsp",
          {
            MID,
            Token,
            MAID,
            Mobile,
          }
        );

        if (response.status === 200) {
          const data = response.data;
          if (data.Result === "OK" && data.Member) {
            const existingData = localData ? JSON.parse(localData) : {};
            const newUserInfo = {
              ...existingData,
              ...data.Member,
              ChildInfo: data.ChildInfo || [],
            };
            localStorage.setItem("userData", JSON.stringify(newUserInfo));
            userInfo.value = newUserInfo;
          } else {
            localStorage.removeItem("userData");
            router.push("/");
          }
        } else {
          localStorage.removeItem("userData");
          router.push("/");
        }
      } catch (err) {
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 300);
      }
    };

    const goCart = () => {
      router.push("/cart");
    };

    getUserData();

    const changeSlide = () => {
      currentSlide.value = (currentSlide.value + 1) % slides.value.length;
    };

    let slideInterval;

    onMounted(() => {
      // 開始幻燈片循環
      slideInterval = setInterval(() => {
        changeSlide();
      }, 3000);
    });

    onBeforeUnmount(() => {
      clearInterval(slideInterval);
    });

    //   const goHRVHistory = async () => {
    //   const localData = JSON.parse(localStorage.getItem("userData"));

    //   if (!localData) {
    //     alert("本地存儲中沒有用戶數據。");
    //     return;
    //   }

    //   const isInteger = (value) => Number.isInteger(parseInt(value, 10));

    //   if (!isInteger(localData.Height) || parseInt(localData.Height) <= 0) {
    //     alert("您的身高格式不正確，請修改會員資料");
    //     window.location.href = "/changeMember";
    //     return;
    //   }

    //   if (!isInteger(localData.Weight) || parseInt(localData.Weight) <= 0) {
    //     alert("您的體重格式不正確，請修改會員資料");
    //     window.location.href = "/changeMember";
    //     return;
    //   }

    //   const birthdayParts = localData.Birthday.split("/");
    //   if (
    //     birthdayParts.length !== 3 ||
    //     parseInt(birthdayParts[0]) <= 0 || // 年份檢查
    //     parseInt(birthdayParts[1]) < 1 || // 月份檢查
    //     parseInt(birthdayParts[1]) > 12 || // 月份上限檢查
    //     parseInt(birthdayParts[2]) < 1 || // 日期下限檢查
    //     parseInt(birthdayParts[2]) > 31 || // 日期上限檢查
    //     isNaN(calculateAge(localData.Birthday)) // 年齡計算有效性檢查
    //   ) {
    //     alert("生日格式不正確或包含無效日期，請修改會員資料。");
    //     window.location.href = "/changeMember";
    //     return;
    //   }

    //   let scanAge = parseInt(localData.Sex);
    //   if (scanAge !== 1 && scanAge !== 2) {
    //     alert("性別格式不正確，請修改會員資料。");
    //     window.location.href = "/changeMember";
    //     return;
    //   }

    //   // DSPR 檢查 - 判斷是否為預期的三個值之一
    //   const validDSPRValues = ["normal", "prehypertension", "hypertension"];
    //   if (!validDSPRValues.includes(localData.DSPR)) {
    //     // alert("請選擇有效的血壓範圍。");
    //     showDSPRSelect.value = true; // 顯示選擇彈窗
    //     return;
    //   }

    //   const convertedData = {
    //     age: calculateAge(localData.Birthday),
    //     bp_group: localData.DSPR,
    //     bp_mode: "ternary",
    //     facing_mode: "user",
    //     height: parseInt(localData.Height),
    //     sex: scanAge,
    //     weight: parseInt(localData.Weight),
    //   };

    //   sessionStorage.setItem("data", JSON.stringify(convertedData));
    //   window.location.href = "/vital/scan.html";
    // };

    const goHRVHistory = async () => {
      localStorage.removeItem("form");
      router.push("/HRVHistory");
    };

    // Helper function to calculate age based on Birthday
    const calculateAge = (birthday) => {
      const [year, month, day] = birthday.split("/").map(Number);
      const currentYear = new Date().getFullYear();
      return currentYear - (1911 + year); // Adjust for ROC year format
    };

    useSeo({
      title: "會員中心",
      description:
        "NeuroPlus會員中心，查看您的健康數據、檢測記錄和個人資訊，隨時掌握自律神經狀態。",
      url: "https://neuroplus.com.tw/user",
    });

    return {
      loading,
      userInfo,
      currentSlide,
      slides,
      goHRVHistory,
      store,
      toggleQrcodeShow,
      qrcodeShow,
      isHealthRecordAlertActive,
      showHealthRecordAlert,
      hideHealthRecordAlert,
      goCart,
      goToSticker,
    };
  },
};
</script>

<style lang="scss" scoped>
.raphaelUser {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  place-items: center;

  .userGroup {
    width: 100%;
    max-width: 768px;
    padding: 0 1rem;
    padding-top: 0.75rem;

    .userInfo {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .imgGroup {
        width: 60px;
        & > img {
          width: 100%;
          height: 100%;
        }
      }

      .infoTextGroup {
        width: 100%;

        .topText {
          font-size: 1.5rem;
          color: $raphael-black;
        }

        .score {
          display: flex;
          align-items: center;
          margin-top: 12px;
          gap: 0.25rem;
          display: none; //暫時隱藏

          .circle {
            width: 12px;
            height: 12px;
            background-color: $raphael-purple-200;
            border-radius: 50%;
          }

          .scoreText {
            font-size: 20px;
            color: $raphael-gray-500;

            span {
              color: $raphael-green-400;
              font-size: 1.5rem;
              font-weight: bold;
            }
          }
        }
      }
      // 移除qrcode
      .qrCode {
        display: none;
      }
    }

    .bannerGroup {
      position: relative;
      border-radius: 0.75rem;
      width: 100%;
      margin-top: 0.75rem;
      overflow: hidden;

      img {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        opacity: 0;
        transition: opacity 1s ease-in-out;
      }
      .imgHide {
        position: relative;
        opacity: 0;
      }
      .active {
        opacity: 1;
      }
    }

    .bannerGroup2 {
      width: 100%;
      margin-top: 0.75rem;
      img {
        width: 100%;
        max-width: 100%;
        height: auto;
      }
      cursor: pointer;
    }

    .itemsGroup {
      display: grid;
      margin-top: 1.5rem;
      grid-template-columns: repeat(3, 1fr);
      place-items: center;
      gap: 0.5rem;

      .item {
        background: rgba(255, 255, 255, 0.75);
        border-radius: 20px;
        box-shadow: inset 0px 0px 3px $raphael-green-400;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
        width: 100%;
        padding: 0.75rem 0.25rem;
        transition: all ease 0.2s;

        &:hover {
          box-shadow: inset 0px 0px 0px $raphael-green-400,
            0px 0px 10px $raphael-green-400;
        }

        & > img {
          background: $raphael-orange-400;
          border-radius: 50%;
          padding: 0.5rem;
        }

        & > .title {
          color: $raphael-black;
          font-size: 1.25rem;
          font-weight: bold;
        }
        &:nth-child(n + 4):nth-child(-n + 6) {
          & > img {
            background: $raphael-purple-200;
          }
        }
        &:nth-child(n + 7) {
          & > img {
            background: $raphael-cyan-400;
          }
        }
      }
    }

    .copyrights {
      font-size: 13px;
      color: $raphael-gray-500;
      text-align: center;
      padding: 1.5rem 0;
    }
  }
}
</style>
