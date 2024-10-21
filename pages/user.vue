<template>
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
          <img src="../assets/imgs/qrcode.svg" alt="" />
        </div>
      </div>
      <div class="bannerGroup">
        <img src="../assets/imgs/banner-1.png" alt="" />
      </div>

      <div class="itemsGroup">
        <div class="item item1">
          <div class="topTitle">領取</div>
          <div class="bottomTitle">積分</div>
        </div>

        <div class="item item2">
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

<style lang="scss" scoped>
.raphaelUser {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;

  .userGroup {
    padding-top: 90px;
    max-width: 90%;
    margin: 0 auto;
    width: 90%;
    max-width: 768px;

    .userInfo {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .imgGroup {
        width: 20%;
      }

      .infoTextGroup {
        width: 60%;

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

      img {
        width: 100%;
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
          top: 1rem;
          left: 0.75rem;
          font-weight: 400;
          font-family: Roboto;
          color: #fefefe;
          letter-spacing: 0.09px;
        }

        .bottomTitle {
          position: absolute;
          bottom: 1rem;
          left: 0.75rem;
          font-size: 2rem;
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
        filter: blur(2px);
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

<script>
import { onMounted, ref } from "vue"; // Import necessary functions
import { useRouter } from "vue-router"; // Import useRouter
import Navbar from "../components/Navbar";
import RaphaelLoading from "../components/RaphaelLoading";
import axios from "axios";

export default {
  components: { Navbar },
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const userInfo = ref(null);

    const getUserData = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Token, MAID, Mobile, Name } = localData
        ? JSON.parse(localData)
        : {};

      if (!MID || !Token || !MAID || !Mobile) {
        router.push("/login");
        return;
      } else if (Name == "") {
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
          console.log(data);

          if (data.Result === "OK" && data.Member) {
            // 獲取原有的用戶資料
            const existingData = localData ? JSON.parse(localData) : {};

            // 合併新資料，保留 Token
            const newUserInfo = {
              ...existingData,
              ...data.Member, // 將新資料合併進來
            };

            localStorage.setItem("userData", JSON.stringify(newUserInfo)); // 儲存合併後的用戶資料
            userInfo.value = newUserInfo; // 更新用戶資訊
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

    onMounted(() => {
      getUserData();
    });

    return {
      loading,
      userInfo,
    };
  },
};
</script>
