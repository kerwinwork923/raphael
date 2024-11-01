<template>
  <div class="raphaelUser">
    <RaphaelLoading v-if="loading" />
    <DSPRSelect :visible="showDSPRSelect" @close="showDSPRSelect = false" />
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
          <!-- <img src="../assets/imgs/qrcode.svg" alt="" /> -->
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

        <div class="item item2" @click="convertAndSaveUserData">
          <div class="topTitle">檢測</div>
          <div class="bottomTitle">HRV</div>
          <img src="../assets/imgs/faceIcon.svg" alt="" />
        </div>

        <router-link to="/weekly">
          <div class="item item3">
            <div class="topTitle">每周</div>
            <div class="bottomTitle">評估</div>
            <img src="../assets/imgs/noteIcon.svg" alt="" />
          </div>
        </router-link>

        <div class="item item4">
          <div class="topTitle">使用</div>
          <div class="bottomTitle">紀錄</div>
          <img src="../assets/imgs/clothIcon.svg" alt="" />
        </div>

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
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import Navbar from "../components/Navbar";
import RaphaelLoading from "../components/RaphaelLoading";
import DSPRSelect from "../components/DSPRSelect.vue";
import axios from "axios";
//圖片
import banner1 from "@/assets/imgs/banner-1.png";
import banner2 from "@/assets/imgs/banner-2.png";

export default {
  components: { Navbar, RaphaelLoading },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const userInfo = ref(null);
    const currentSlide = ref(0);
    const slides = ref([banner1, banner2]);
    const showDSPRSelect = ref(false);

    const getUserData = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name } = localData
        ? JSON.parse(localData)
        : {};

      if (!MID || !Token || !MAID || !Mobile) {
        router.push("/login");
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

    const convertAndSaveUserData = async () => {
  const localData = JSON.parse(localStorage.getItem("userData"));

  if (!localData) {
    alert("本地存儲中沒有用戶數據。");
    return;
  }

  const isInteger = (value) => Number.isInteger(parseInt(value, 10));

  if (!isInteger(localData.Height) || parseInt(localData.Height) <= 0) {
    alert("您的身高格式不正確，請修改會員資料");
     window.location.href = "/changeMember"
    return;
  }

  if (!isInteger(localData.Weight) || parseInt(localData.Weight) <= 0) {
    alert("您的體重格式不正確，請修改會員資料");
     window.location.href = "/changeMember"
    return;
  }

  const birthdayParts = localData.Birthday.split("/");
  if (
    birthdayParts.length !== 3 ||
    parseInt(birthdayParts[0]) <= 0 ||  // 年份檢查
    parseInt(birthdayParts[1]) < 1 ||   // 月份檢查
    parseInt(birthdayParts[1]) > 12 ||  // 月份上限檢查
    parseInt(birthdayParts[2]) < 1 ||   // 日期下限檢查
    parseInt(birthdayParts[2]) > 31 ||  // 日期上限檢查
    isNaN(calculateAge(localData.Birthday))  // 年齡計算有效性檢查
  ) {
    alert("生日格式不正確或包含無效日期，請修改會員資料。");
    window.location.href = "/changeMember"
    return;
  }

  let scanAge = parseInt(localData.Sex);
  if (scanAge !== 1 && scanAge !== 2) {
    alert("性別格式不正確，請修改會員資料。");
     window.location.href = "/changeMember"
    return;
  }

  // DSPR 檢查 - 判斷是否為預期的三個值之一
  const validDSPRValues = ["normal", "prehypertension", "hypertension"];
  if (!validDSPRValues.includes(localData.DSPR)) {
    // alert("請選擇有效的血壓範圍。");
    showDSPRSelect.value = true; // 顯示選擇彈窗
    return;
  }

  const convertedData = {
    age: calculateAge(localData.Birthday),
    bp_group: localData.DSPR,
    bp_mode: "ternary",
    facing_mode: "user",
    height: parseInt(localData.Height),
    sex: scanAge,
    weight: parseInt(localData.Weight),
  };

  sessionStorage.setItem("data", JSON.stringify(convertedData));
  window.location.href = "/vital/scan.html";
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
      convertAndSaveUserData,
      showDSPRSelect,
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

  .userGroup {
    padding-top: 4.25rem;
    max-width: 90%;
    margin: 0 auto;
    width: 90%;
    max-width: 768px;

    .userInfo {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .imgGroup {
        width: auto;
      }

      .infoTextGroup {
        width: 100%;

        .topText {
          font-size: 1.5rem;
          color: #1e1e1e;
          font-weight: bold;
        }

        .score {
          display: flex;
          align-items: center;
          margin-top: 12px;
          gap: 0.25rem;

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
      margin-top: 30px;
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

      .item {
        height: 100px;
        border-radius: 0.5rem;
        background-color: #999;
        position: relative;

        opacity: 0.15;
        color: #fff;
        a {
          color: #fff;
        }
        transition: 0.15s all ease;

        .topTitle {
          position: absolute;
          top: 1.2rem;
          left: 0.75rem;
          font-weight: 400;
          font-size: 1.25rem;
          color: #fefefe;
          letter-spacing: 0.09px;
        }

        .bottomTitle {
          position: absolute;
          bottom: 1.2rem;
          left: 0.75rem;
          font-size: 2.25rem;
          font-weight: bold;
          letter-spacing: 0.09px;
        }

        img {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
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
        filter: blur(2px);
      }
      .item5 {
        background-color: $raphael-brown-400;
        filter: blur(2px);
      }
      .item6 {
        background-color: $raphael-gray-300;
        filter: blur(2px);
      }
    }
  }
}
</style>
