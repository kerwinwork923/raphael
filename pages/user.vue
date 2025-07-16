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
          <img src="../assets/imgs/sticker.png" alt="" />
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
      <!-- <div class="bannerGroup">
        <img class="imgHide" src="../assets//imgs/banner-1.png" alt="" />
        <img
          v-for="(slide, index) in slides"
          :key="index"
          :class="{ active: currentSlide === index }"
          :src="slide"
          alt=""
        />
      </div> -->
      <div class="bannerGroup2">
        <img @click="goCart" src="../assets/imgs/shoppingMall.png" alt="" />
      </div>
      <div class="itemsGroup">
        <!-- 
        <div class="item item2" @click="goHRVHistory">
          <div class="topTitle">檢測</div>
          <div class="bottomTitle">HRV</div>
          <img src="../assets/imgs/faceIcon.svg" alt="" />
        </div> -->

        <router-link to="/UsageHistory" class="item">
          <div class="topTitle">穿衣</div>
          <div class="bottomTitle">紀錄</div>
          <img src="../assets/imgs/clothIcon.svg" alt="" />
        </router-link>

        <div @click="showHealthRecordAlert" class="item">
          <div class="topTitle">健康</div>
          <div class="bottomTitle">紀錄</div>
          <img src="../assets/imgs/noteIcon.svg" alt="" />
        </div>

        <router-link to="/contract" class="item">
          <div class="topTitle">合約</div>
          <div class="bottomTitle">|請假</div>
          <img src="../assets/imgs/contract.svg" alt="" />
        </router-link>

        <router-link to="/orderQuery" class="item">
          <div class="topTitle">診所</div>
          <div class="bottomTitle">訂單</div>
          <img src="../assets/imgs/logistics.svg" alt="" />
        </router-link>
        <!-- <div class="item item6">
          <div class="topTitle">推薦</div>
          <div class="bottomTitle">親友</div>
          <img src="../assets/imgs/relationshopIcon.svg" alt="" />
        </div> -->

        <router-link to="/point" class="item">
          <div class="topTitle">獎勵</div>
          <div class="bottomTitle">積分</div>
          <img src="../assets/imgs/ticket.svg" alt="" />
        </router-link>
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
        max-width: 100%;
        height: auto;
      }
    }

    .itemsGroup {
      display: grid;
      margin-top: 0.75rem;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 84px);
      gap: 0.75rem;

      .item {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        position: relative;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 0.75rem;
        color: $raphael-gray-500;
        cursor: pointer;
        font-size: 2rem;
        padding: 0.75rem;
        overflow: hidden;
        transition: 0.15s all ease;
        box-shadow: 0px 2px 12px #afddc0;
        img {
          position: absolute;
          transition: 0.15s all ease;
        }
        &:first-child {
          border: 2px solid rgba(254, 172, 74, 0.7);
          color: $raphael-orange-400;
          grid-row: 1 / 3;
          align-items: end;
          font-size: 1.75rem;

          .topTitle,
          .bottomTitle {
            margin-bottom: 2.5rem;
          }

          img {
            background: rgba(254, 172, 74, 0.7);
            width: 50%;
            height: 60px;
            border-radius: 0 0 8px 8px;
            padding: 0.5rem;
            top: 0;
            box-shadow: inset 0 -4px 8px rgba(254, 172, 74, 1);
          }

          &:hover {
            border: 2px solid rgba(254, 172, 74, 1);
            color: $raphael-orange-500;

            & > img {
              background: rgba(254, 172, 74, 1);
            }
          }
        }
        &:nth-child(2) {
          border: 2px solid rgba(31, 188, 179, 0.7);
          color: $raphael-cyan-400;
          grid-column: 2;
          grid-row: 2/3;
          justify-content: end;
          font-size: 1.25rem;

          .bottomTitle {
            margin-right: 1.25rem;
          }

          img {
            background: rgba(31, 188, 179, 0.7);
            width: 50px;
            height: 55%;
            border-radius: 0 8px 8px 0;
            padding: 0.5rem;
            top: 16px;
            left: 0;
            box-shadow: inset 0 -4px 8px rgba(31, 188, 179, 1);
          }

          &:hover {
            border: 2px solid rgba(31, 188, 179, 1);
            color: $raphael-cyan-500;

            & > img {
              background: rgba(31, 188, 179, 1);
            }
          }
        }
        &:nth-child(3) {
          border: 2px solid rgba(188, 88, 31, 0.7);
          color: $raphael-brown-400;
          font-size: 1.25rem;
          justify-content: end;
          grid-column: 2 / 3;
          grid-row: 1;

          .bottomTitle {
            margin-right: 1.25rem;
          }

          img {
            background: rgba(188, 88, 31, 0.7);
            width: 50px;
            height: 55%;
            border-radius: 0 8px 8px 0;
            padding: 0.5rem;
            top: 16px;
            left: 0;
            box-shadow: inset 0 -4px 8px rgba(188, 88, 31, 1);
          }

          &:hover {
            border: 2px solid rgba(188, 88, 31, 1);
            color: $raphael-brown-500;

            & > img {
              background: rgba(188, 88, 31, 1);
            }
          }
        }
        &:nth-child(4) {
          border: 2px solid rgba(101, 85, 143, 0.7);
          color: $raphael-purple-200;
          font-size: 1.25rem;
          justify-content: end;

          .bottomTitle {
            margin-right: 1.25rem;
          }

          img {
            background: rgba(101, 85, 143, 0.7);
            width: 50px;
            height: 55%;
            border-radius: 0 8px 8px 0;
            padding: 0.5rem;
            top: 16px;
            left: 0;
            box-shadow: inset 0 -4px 8px rgba(101, 85, 143, 1);
          }

          &:hover {
            border: 2px solid rgba(101, 85, 143, 1);
            color: $raphael-purple-200;

            & > img {
              background: rgba(101, 85, 143, 1);
            }
          }
        }
        &:nth-child(5) {
          border: 2px solid rgba(116, 188, 31, 0.7);
          color: $raphael-green-400;
          font-size: 1.25rem;
          justify-content: end;

          .bottomTitle {
            margin-right: 1.25rem;
          }

          img {
            background: rgba(116, 188, 31, 0.7);
            width: 50px;
            height: 55%;
            border-radius: 0 8px 8px 0;
            padding: 0.5rem;
            top: 16px;
            left: 0;
            box-shadow: inset 0 -4px 8px rgba(116, 188, 31, 1);
          }

          &:hover {
            border: 2px solid rgba(116, 188, 31, 1);
            color: rgba(116, 188, 31, 0.7);

            & > img {
              background: rgba(116, 188, 31, 1);
            }
          }
        }
      }
    }

    .copyrights {
      font-size: 13px;
      color: $raphael-gray-500;
      text-align: center;
      padding: 0.75rem 0;
    }
  }
}
</style>
