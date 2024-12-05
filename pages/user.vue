<template>
  <QRCodeScanner v-if="qrcodeShow" />
  <div class="raphaelUser">
    <RaphaelLoading v-if="loading" />

    <Navbar />
    <div class="userGroup">
      <div class="userInfo">
        <div class="imgGroup">
          <img src="../assets/imgs/sticker.svg" alt="" />
        </div>
        <div class="infoTextGroup">
          <div class="topText">
            {{ userInfo?.Name }} <span v-if="userInfo?.Name">，</span>您好
          </div>
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
      <div class="itemsGroup">
        <div class="item item1">
          <div class="topTitle">領取</div>
          <div class="bottomTitle">積分</div>
        </div>

        <div class="item item2" @click="goHRVHistory">
          <div class="topTitle">檢測</div>
          <div class="bottomTitle">HRV</div>
          <img src="../assets/imgs/faceIcon.svg" alt="" />
        </div>

        <router-link to="/weekly" class="item3_link">
          <div class="item item3">
            <div class="topTitle">健康</div>
            <div class="bottomTitle">紀錄</div>
            <img src="../assets/imgs/noteIcon.svg" alt="" />
          </div>
        </router-link>

        <router-link to="/UsageHistory" class="item4_link">
          <div class="item item4">
            <div class="topTitle">使用</div>
            <div class="bottomTitle">紀錄</div>
            <img src="../assets/imgs/clothIcon.svg" alt="" />
          </div>
        </router-link>

        <div class="item item5">
          <div class="topTitle">積分</div>
          <div class="bottomTitle">兌換</div>
          <img src="../assets/imgs/exchange.svg" alt="" />
        </div>

        <div class="item item6">
          <div class="topTitle">推薦</div>
          <div class="bottomTitle">親友</div>
          <img src="../assets/imgs/relationshopIcon.svg" alt="" />
        </div>
      </div>
      <footer class="copyrights">
        <!-- <a href="/usageHistory"></a> -->
        © 2024 智平衡健康事業股份有限公司 all rights reserved.
      </footer>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar";
import RaphaelLoading from "../components/RaphaelLoading";
import DSPRSelect from "../components/DSPRSelect.vue";
import HRVAlert from "~/components/HRVAlert.vue";
import axios from "axios";
import { useCommon } from "../stores/common";
//圖片
import banner1 from "@/assets/imgs/banner-1.png";
import banner2 from "@/assets/imgs/banner-2.png";

import QRCodeScanner from "~/components/QRCodeScanner.vue";

export default {
  components: { Navbar, RaphaelLoading, HRVAlert, DSPRSelect, QRCodeScanner },
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

    const getUserData = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name } = localData
        ? JSON.parse(localData)
        : {};

      if (!MID || !Token || !MAID || !Mobile) {
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
            };
            localStorage.setItem("userData", JSON.stringify(newUserInfo));
            userInfo.value = newUserInfo;
          } else {
            alert("取得會員資料失敗");
          }
        } else {
          alert("取得會員資料失敗");
        }
      } catch (err) {
        alert("取得會員資料失敗");
      } finally {
        setTimeout(() => {
          loading.value = false;
        }, 300);
      }
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

    const clearFormCookie = (cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    const goHRVHistory = async () => {
      clearFormCookie("form");
      router.push("/HRVHistory");
    };

    // Helper function to calculate age based on Birthday
    const calculateAge = (birthday) => {
      const [year, month, day] = birthday.split("/").map(Number);
      const currentYear = new Date().getFullYear();
      return currentYear - (1911 + year); // Adjust for ROC year format
    };

    return {
      loading,
      userInfo,
      currentSlide,
      slides,
      goHRVHistory,
      store,
      toggleQrcodeShow,
      qrcodeShow,
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
        width: 70px;
      }

      .infoTextGroup {
        width: 100%;

        .topText {
          font-size: 1.5rem;
          color: #1e1e1e;
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
    }

    .bannerGroup {
      margin-top: 0.75rem;
      position: relative;
      width: 100%;

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

    .itemsGroup {
      display: grid;
      margin-top: 1.25rem;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      //暫時的樣式
      grid-template-rows: repeat(3, 84px);

      .item {
        background-color: #999;
        position: relative;
        border-radius: 0.75rem;
        padding: 0.75rem;
        color: #fff;
        //暫時的樣式
        overflow: hidden;
        //暫時的樣式 end

        a {
          color: #fff;
        }
        transition: 0.15s all ease;

        .topTitle {
          font-weight: 400;
          font-size: 1.25rem;
          color: #fefefe;
          letter-spacing: 0.09px;
          margin-bottom: 4px;
        }

        .bottomTitle {
          font-size: 2.25rem;
          font-weight: bold;
          letter-spacing: 0.09px;

          @include respond-to("tablet") {
            font-size: 3rem;
          }
        }

        img {
          position: absolute;
          width: 100%;
          opacity: 0.1;
          filter: blur(2px);

          @include respond-to("tablet") {
          }
        }
      }

      .item1 {
        background-color: $raphael-green-400;
        filter: blur(2px);
      }
      .item2 {
        background-color: $raphael-purple-200;
        opacity: 1;
        cursor: pointer;
        &:hover {
          filter: brightness(0.95);
        }
      }
      .item3 {
        background-color: $raphael-cyan-400;
        opacity: 1;
        cursor: pointer;
        &:hover {
          filter: brightness(0.95);
        }
      }
      .item4 {
        background-color: $raphael-orange-400;
      }
      .item5 {
        background-color: $raphael-brown-400;
      }
      .item6 {
        background-color: $raphael-gray-300;
      }
      //暫時隱藏
      .item1,
      .item5,
      .item6 {
        display: none;
      }

      //暫時的樣式

      .item2 {
        display: grid;
        grid-row: 1 / 4;
        place-items: center;
        align-content: center;

        @include respond-to("tablet") {
        }
      }
      .item3_link {
        @include respond-to("tablet") {
        }

        .item3 {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          align-content: center;
        }
      }

      .item4_link {
        grid-row: 2/4;

        @include respond-to("tablet") {
        }

        .item4 {
          display: grid;
          width: 100%;
          height: 100%;
          place-items: center;
          align-content: center;
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
