<template>
  <div class="login">
    <RaphaelLoading v-if="loading" />
    <div class="loginGroup">
      <div class="raphaelIconImgGroup">
        <img class="raphaelIcon" src="../assets/imgs/raphael.svg" alt="" />
        <h1>{{ verificationTitle }}</h1>
      </div>
      <div class="loginWrap">
        <div class="loginBox">
          <div class="phoneGroup">
            <input
              type="tel"
              v-model="mobile"
              placeholder="請輸入您的手機號碼"
            />
            <img class="icon1" src="../assets/imgs/phoneGreen.svg" alt="" />
          </div>
          <div class="passwordGroup">
            <input
              :type="passwordVisible ? 'text' : 'password'"
              v-model="password"
              placeholder="請輸入密碼(至少8位)"
              @input="validatePassword"
            />
            <img class="icon1" src="../assets/imgs/passwordGreen.svg" alt="" />
            <img
              class="icon2"
              :src="passwordVisible ? eyesOpenGreen : eyesCloseGreen"
              @click="togglePasswordVisibility"
              alt=""
            />
          </div>
        </div>
        <!-- <div class="privacyGroup">
          <input type="checkbox" v-model="isPrivacy" id="privacyInput" />
          <router-link to="#">
            <label >我已詳細閱讀隱私權政策</label>
          </router-link>
        
        </div> -->

        <button
          class="loginBtn"
          @click="login"
          :disabled="!mobile || !password"
        >
          登入
        </button>
        <div class="forgetPasswordGroup">
          <router-link to="/forgetPassword">忘記密碼?</router-link>
        </div>

        <div class="bottomHintGroup">
          <!-- 分隔線 -->
          <div class="separate">or</div>
          <router-link to="/register">
            <img class="icon" src="../assets/imgs/register.svg" alt="" />
            <h5>註冊會員</h5>
          </router-link>
          <!-- PWA 安裝按鈕 -->
          <button type="button" class="downloadBtn" @click="installPWA">
            <img src="../assets/imgs/download.svg" />
            <h5>下載APP</h5>
          </button>
        </div>
        <!-- <br>   <br>   <br>
        <div class="testBtn" style="display: flex; justify-content: space-between;">
          <a href="/test">測試鏡頭</a>
          <a href="/test.html">測試鏡頭2</a>
        </div> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  height: 100vh;
  padding: 1rem;

  .raphaelIconImgGroup {
    text-align: center;

    .raphaelIcon {
      width: 50px;
      height: 50px;
    }
  }

  h1 {
    
    font-size: 1.5rem;
    font-weight: 400;
    letter-spacing: 0.5px;
    margin-top: 8px;
    text-align: center;
    color: $raphael-purple-200;
  }

  .loginGroup {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-width: 768px;
  }

  .loginWrap {
    width: 100%;
    min-height: 509px;
    .loginBox {
      background-color: $raphael-white;
      border-radius: 12px;
      padding: 1rem;
      margin-top: 2.25rem;
    }

    .phoneGroup,
    .passwordGroup,
    .passwordAgainGroup {
      position: relative;
      margin-bottom: 1rem;

      .icon1 {
        position: absolute;
        top: 50%;
        left: 2px;
        transform: translateY(-50%);
      }

      .icon2 {
        position: absolute;
        top: 50%;
        right: 2px;
        transform: translateY(-50%);
        cursor: pointer;
      }
    }

    input[type="text"],
    input[type="tel"],
    input[type="password"] {
      outline: none;
      border: none;
      border-bottom: 1px solid $raphael-gray-400;
      font-size: 1.2rem;
      width: 100%;
      padding-left: 36px;
      padding-bottom: 16px;
      padding-top: 16px;

      &::placeholder {
        color: $raphael-gray-500;
        font-family: Inter;
        font-size: 1.2rem;
        font-weight: 400;
        color: $raphael-gray-400;
      }
    }

    .privacyGroup {
      display: flex;
      align-items: center;
      gap: 3px;
      margin-top: 1rem;

      input {
        appearance: none;
        width: 1.5rem;
        height: 1.5rem;
        border: 1px solid $raphael-gray-400;
        border-radius: 4px;
        cursor: pointer;
        position: relative;

        &:checked {
          background-color: $raphael-green-400;
          border: none;
        }

        &:checked::before {
          content: "✓";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -55%);
          color: $raphael-white;
          font-size: 0.75rem;
          font-weight: bold;
          font-family: "Arial", sans-serif;
        }
      }

      a {
        text-decoration: none;
        color: $raphael-gray-500;
        font-size: 1.25rem;
        letter-spacing: 0.09px;
        font-weight: 400;
        transform: translateY(10%);

        label {
          cursor: pointer;
        }
      }
    }

    .forgetPasswordGroup {
      text-align: center;
      margin-top: 1.25rem;

      a {
        color: $raphael-gray-500;
        font-size: 1.125rem;
        font-weight: 400;
        letter-spacing: 0.5px;
        text-decoration: none;
      }
    }

    .loginBtn {
      background-color: $raphael-green-400;
      color: $raphael-white;
      padding: 0.5rem 0.75rem;
      width: 100%;
      border-radius: 8px;
      border: none;
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: 0.25s ease;
      margin-top: 1.5rem;
      cursor: pointer;

      &:hover {
        background-color: $raphael-green-500;
      }

      &:disabled {
        background-color: $raphael-gray-400;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }

    .bottomHintGroup {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      gap: 1.5rem;
      margin-top: 44px;
      .separate {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        color: $raphael-gray-300;
        grid-column: 1 / 3;

        &::before,
        &::after {
          content: "";
          position: absolute;
          background: $raphael-gray-300;
          width: 45%;
          height: 1px;
        }

        &::before {
          left: 0;
        }

        &::after {
          right: 0;
        }
      }
      .downloadBtn {
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        border: 0;
        color: $raphael-gray-500;
        font-size: 1.125rem;
        border-radius: 8px;
        border: 1px solid $raphael-black;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          color: $raphael-green-400;
          border: 1px solid $raphael-green-400;
        }
      }

      a {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        font-size: 1.125rem;
        margin: 0 auto;
        width: 100%;
        text-align: center;
        text-decoration: none;
        border-radius: 8px;
        border: 1px solid $raphael-black;
        padding: 0.5rem 0.75rem;
        color: $raphael-gray-500;
        transition: all 0.2s ease;

        &:hover {
          color: $raphael-green-400;
          border: 1px solid $raphael-green-400;
        }
      }
    }
  }
}
</style>

<script>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import RaphaelLoading from "../components/RaphaelLoading";
import eyesCloseGreen from "../assets/imgs/eyesCloseGreen.svg";
import eyesOpenGreen from "../assets/imgs/eyesOpenGreen.svg";
import { requestPermission, messagingToken } from "../fn/firebaseMessaging"; //firebase
 

export default {
  setup() {
    const verificationTitle = ref("會員登入");
    const loading = ref(false);
    const mobile = ref("");
    const password = ref("");
    const passwordVisible = ref(false);
    const router = useRouter();
    const localMessagingToken = ref(""); // firebase 儲存取得的推播 token

    window.location.href="https://google.com"
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;
    let deferredPrompt = null;

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value;
    };

    const login = async () => {
      loading.value = true;
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_AA1.jsp",
          {
            Mobile: mobile.value,
            Password: password.value,
          }
        );

        if (
          response.status === 200 &&
          response.data.Token.trim() &&
          response.data.MAID.trim()
        ) {
          console.log("登入成功:", response.data);
          localStorage.setItem("userData", JSON.stringify(response.data));

          // 取得firebase推播 token
          await requestPermission();
          localMessagingToken.value = messagingToken.value;
          //alert(localMessagingToken.value);
          console.log("取得的推播 Token:", localMessagingToken.value);
          console.log("取得的MAID:", response.data.MAID.trim());

          savePushKey(response.data.MAID.trim(), messagingToken.value);

          router.push({ name: "user" });
        } else {
          alert(`登入失敗 : ${response.data.Result}`);
        }
      } catch (err) {
        alert("登入失敗，請檢查手機號碼和密碼。");
      } finally {
        loading.value = false;
      }
    };

    const savePushKey = async (loadMAID, loadPushkey) => {
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_PushKey.jsp",
          {
            MAID: loadMAID,
            PushKey: loadPushkey,
          }
        );

        if (response.status === 200) {
          console.log("存儲Pushkey成功:", response.data);
        } else {
          alert(`存儲Pushkey失敗 : ${response.data.Result}`);
        }
      } catch (err) {
        alert("存儲Pushkey失敗");
      }
    };

    const installPWA = async () => {
      if (isIOS && !isStandalone) {
        // 提示 iOS 用戶如何安裝 PWA
        alert("在瀏覽器中點擊分享按鈕，然後選擇『加入主畫面』以安裝 APP。");
      } else if (deferredPrompt) {
        // 顯示 Android 和桌機瀏覽器的安裝提示
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          console.log("用戶已安裝");
        } else {
          console.log("用戶取消安裝");
        }
        deferredPrompt = null;
      } else {
        alert("您的裝置已支援安裝或已安裝，若無法安裝請檢查瀏覽器設置。");
      }
    };

    onMounted(() => {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
      });

      window.addEventListener("appinstalled", () => {
        console.log("PWA 已成功安裝");
      });
    });

    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile, Name } = localData
      ? JSON.parse(localData)
      : {};

    if (MID || Token || MAID || Mobile) {
      router.push("/user");
      return;
    }

    return {
      verificationTitle,
      passwordVisible,
      togglePasswordVisibility,
      eyesCloseGreen,
      eyesOpenGreen,
      loading,
      mobile,
      password,
      login,
      installPWA,
      localMessagingToken, // 用於顯示推播 token
    
    };
  },
};
</script>
