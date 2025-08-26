<template>
  <div class="loginAndRegister">
    <Privacy
      :visible="showPolicy"
      @update:visible="showPolicy = $event"
      @closed="handleClosed"
    />

    <RaphaelLoading v-if="loading" />
    <div class="loginGroup">
      <div class="raphaelIconImgGroup">
        <img class="raphaelIcon" src="../assets/imgs/raphael.svg" alt="" />
      </div>

      <!-- 登入/註冊切換 -->
      <div class="loginRegisterWrap" v-if="currentMode === 'login' || currentMode === 'register' && currentStep !== 'info'">
        <div
          class="loginRegisterItem"
          :class="{ loginRegisterItemActive: currentMode === 'login' }"
          @click="switchMode('login')"
        >
          登入
        </div>
        <div
          class="loginRegisterItem"
          :class="{ loginRegisterItemActive: currentMode === 'register' }"
          @click="switchMode('register')"
        >
          註冊
        </div>
      </div>

      <!-- 登入表單 -->
      <div class="loginWrap" v-if="currentMode === 'login'">
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

        <div class="forgetPasswordGroup">
          <router-link to="/forgetPassword">忘記密碼?</router-link>
        </div>

        <button
          class="loginBtn"
          @click="login"
          :disabled="!mobile || !password"
        >
          送出
        </button>
      </div>

      <!-- 註冊表單 -->
      <div class="registerWrap" v-if="currentMode === 'register'">
        <!-- 註冊第一步：基本資料 -->
        <div class="registerBox" v-if="currentStep === 'register'">
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
          <div class="passwordHintText" v-if="passwordError">
            {{ passwordError }}
          </div>

          <div class="passwordAgainGroup">
            <input
              :type="passwordAgainVisible ? 'text' : 'password'"
              v-model="passwordAgain"
              placeholder="再次輸入您的密碼(至少8位)"
              @input="validatePasswordAgain"
            />
            <img class="icon1" src="../assets/imgs/passwordGreen.svg" alt="" />
            <img
              class="icon2"
              :src="passwordAgainVisible ? eyesOpenGreen : eyesCloseGreen"
              @click="togglePasswordAgainVisibility"
              alt=""
            />
          </div>
          <div class="passwordAgainHintText" v-if="passwordAgainError">
            {{ passwordAgainError }}
          </div>
        </div>

        <div class="privacyGroup" v-if="currentStep === 'register'">
          <input
            @click="handleShowPolicy"
            type="checkbox"
            v-model="isPrivacy"
            id="privacyInput"
          />
          <label @click="handleShowPolicy">我已詳細閱讀隱私權政策</label>
        </div>

        <button
          class="vertificationBtn"
          v-if="currentStep === 'register'"
          :disabled="!isPrivacy"
          @click="getVerificationCode"
        >
          取得驗證碼
        </button>

        <!-- 驗證碼輸入 -->
        <div class="verfifyWrap" v-if="currentStep === 'verify'">
          <div class="verificationCodeGroup">
            <input
              v-for="(code, index) in verificationCodes"
              :key="index"
              ref="verificationInput"
              type="text"
              maxlength="1"
              class="vertifyCode"
              v-model="verificationCodes[index]"
              @input="handleInput(index)"
              @keydown="handleInput(index, $event)"
              @keypress="allowOnlyNumbers"
              :disabled="isDisabled"
              inputmode="numeric"
            />
          </div>
          <div  class="verificationCodeHintText">
            <template v-if="typeof countdownTime === 'number'">
              驗證碼已傳送至您的裝置，請輸入驗證碼
              <br />
              ({{ countdownTime }}秒後失效)
            </template>
            <template v-else>
              {{ countdownTime }}
            </template>
          </div>

          <div class="reSendTextGroup">
            <button class="reSendText" :disabled="!isReSend" @click="reSend">
              重新發送
            </button>
          </div>
        </div>

        <!-- 基本資料表單 -->
        <div class="UserInfoFormWrap" v-if="currentStep === 'info'">
          <h2>請輸入基本資料</h2>
          <div class="mtDIv"></div>
          <UserInfoForm
            @update:name="name = $event"
            @update:height="height = $event"
            @update:weight="weight = $event"
            @update:sex="sex = $event"
            @update:date="date = $event"
            @update:DSPR="DSPR = $event"
            @submit="addUser"
          />
         
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loginAndRegister {
  background: url("../assets/imgs/background.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  display: flex;
  flex-direction: column;
  place-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 1rem;

  .loginRegisterWrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: 50px;
    background: #f5f7fa;
    box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.7);
    color: #74bc1f;
    font-family: "Noto Sans";
    font-size: 18px;
    font-style: normal;
    font-weight: 400;
    letter-spacing: 2.7px;
    margin-top: 1.25rem;
    padding: 0.5rem 0.75rem;

    .loginRegisterItem {
      width: 100%;
      text-align: center;
      padding: 0.5rem 0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .loginRegisterItemActive {
      border-radius: 50px;
      background: #f5f7fa;
      box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.7) inset;
    }
  }

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
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    max-width: 768px;
    padding-top: 10vh;
  }

  .loginWrap {
    width: 100%;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .loginBox {
      margin-top: 1.25rem;
    }

    .phoneGroup,
    .passwordGroup,
    .passwordAgainGroup {
      position: relative;
      margin-bottom: 1rem;
      border-radius: 50px;
      background: #f5f7fa;
      box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.4);

      .icon1 {
        position: absolute;
        top: 50%;
        left: 16px;
        transform: translateY(-51%);
      }

      .icon2 {
        position: absolute;
        top: 50%;
        right: 16px;
        transform: translateY(-51%);
        cursor: pointer;
      }
    }

    input[type="text"],
    input[type="tel"],
    input[type="password"] {
      outline: none;
      border: none;
      background-color: transparent;
      color: #74bc1f;
      font-family: "Noto Sans";
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 18px */
      letter-spacing: 2.7px;
      padding: 1rem;
      padding-left: 2.75rem;
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
      color: $raphael-white;
      padding: 0.5rem 0.75rem;
      width: 100%;
      border: none;
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: 0.25s ease;
      margin-top: 1.5rem;
      cursor: pointer;
      border-radius: 50px;
      background: #f5f7fa;
      box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.7);
      color: #74bc1f;

      &:disabled {
        color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  // 註冊相關樣式
  .registerWrap {
    width: 100%;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .registerBox {
      margin-top: 1.25rem;

      .phoneGroup,
      .passwordGroup,
      .passwordAgainGroup {
        position: relative;
        margin-bottom: 1rem;
        border-radius: var(--Radius-r-50, 50px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));

        .icon1 {
          position: absolute;
          top: 50%;
          left: 16px;
          transform: translateY(-51%);
        }

        .icon2 {
          position: absolute;
          top: 50%;
          right: 16px;
          transform: translateY(-51%);
          cursor: pointer;
        }
      }

      .passwordAgainHintText,
      .passwordHintText {
        color: $raphael-red-300;
        font-size: 14px;
        margin: 0;
        margin-bottom: 8px;
        text-align: center;
      }
    }

    .verfifyWrap {
      margin-top: 1.5rem;
      padding: 0.25rem;

      .verificationCodeGroup {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        border-radius: var(--Radius-r-50, 50px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));
        width: 100%;

        .vertifyCode {
          height: 3rem;
          padding: 0;
          border-radius: 0.5rem;
          border: none;
          cursor: text;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          outline: none;
          width: 100%;
        }
      }

      .verificationCodeHintText {
        font-size: 14px;
        color: $raphael-red-300;
        text-align: center;
        font-weight: 400;
        letter-spacing: 0.1px;
        margin-top: 12px;
        line-height: 22.652px;
        margin-bottom: 12px;
      }

      .reSendTextGroup {
        text-align: center;

        .reSendText {
          outline: none;
          background-color: transparent;
          border: none;
          margin-top: 44px;

          color: var(--Primary-default, #74BC1F);

font-size: var(--Text-font-size-18, 18px);
font-style: normal;
font-weight: 400;

letter-spacing: 2.7px;

          transition: 0.15s all ease;
          cursor: pointer;
       
          width: 100%;
          text-align: center;
          padding: 0.5rem 0;
          border-radius: var(--Radius-r-50, 50px);
background: var(--Secondary-100, #F5F7FA);
box-shadow: 2px 4px 12px 0 var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.70));
color: #74bc1f;
text-decoration: none;


          &:disabled {
            color: $raphael-gray-500;
            text-decoration: none;
            cursor: not-allowed;
          }
        }
      }
    }

    input[type="text"],
    input[type="tel"],
    input[type="password"],
    input[type="number"] {
      outline: none;
      border: none;
      background-color: transparent;
      color: #74bc1f;
      font-family: "Noto Sans";
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%;
      letter-spacing: 2.7px;
      padding: 1rem;
      padding-left: 2.75rem;
      width: 100%;

      &::placeholder {
        font-family: "Noto Sans";
        font-size: 18px;
        font-weight: 400;
      }
    }

    .privacyGroup {
      display: flex;
      align-items: center;
      color: var(--Neutral-500, #666);

      font-size: var(--Text-font-size-18, 18px);
      font-style: normal;
      font-weight: 400;

      letter-spacing: 2.7px;
      position: relative;
      margin-top: 0.5rem;
      margin-bottom: 0.25rem;

      input {
        appearance: none;
        display: flex;
        width: 32px;
        height: 32px;
        padding: var(--Padding-p-12, 12px);
        justify-content: center;
        align-items: center;
        gap: 4px;
        border-radius: 8px;
        border: none;
        border-radius: var(--Radius-r-8, 8px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-70, rgba(177, 192, 216, 0.7));
        position: absolute;
        top: 50%;
        left: 0%;
        transform: translate(0%, -55%);
        &:checked {
          background-color: $raphael-green-400;
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          border-radius: 8px;
          border: none;
          border-radius: var(--Radius-r-8, 8px);
          background: #74bc1f;
          box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.7);
          //打勾
          content: "✓";

          color: $raphael-white;
          font-size: 0.75rem;
          font-weight: bold;
          font-family: "Arial", sans-serif;
        }

        &:checked::before {
          content: "✓";

          color: $raphael-white;
          font-size: 0.75rem;
          font-weight: bold;
          font-family: "Arial", sans-serif;
        }
      }

      label {
        text-decoration: none;
        color: $raphael-gray-500;
        font-size: 1.125rem;
        letter-spacing: 0.09px;
        font-weight: 400;
        cursor: pointer;
        margin-left: 8px;
        padding-left: 2.25rem;
      }
    }

    .vertificationBtn {
      @include btnStyle($raphael-green-400, $raphael-white);
      margin-top: 2rem;
      cursor: pointer;
      width: 100%;
      border-radius: 50px;

      border-radius: var(--Radius-r-50, 50px);
      background: #f5f7fa;
      box-shadow: 2px 4px 12px 0 rgba(177, 192, 216, 0.7);
      color: #74bc1f;
      padding: 1rem 0.75rem;
      width: 100%;
      border: none;
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: 0.25s ease;
      margin-top: 1.5rem;
      cursor: pointer;
      border-radius: 50px;
      &:disabled {
        color: #ccc;
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }
}

.mbDiv {
  margin-bottom: 1rem;
}

.mtDIv {
  margin-top: 0.5rem;
}

.UserInfoFormWrap {
  padding-top: 0;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  h2{
    color: var(--Primary-default, #74BC1F);
    text-align: center;
    font-size: var(--Text-h2, 24px);
    font-style: normal;
    font-weight: 700;

    letter-spacing: 3.6px;
    margin-top: 1rem;

  }
}
</style>

<script setup>
import { useSeo } from "~/composables/useSeo";
import { ref, onMounted, nextTick, watch, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import RaphaelLoading from "../components/RaphaelLoading";
import Privacy from "../components/Privacy.vue";
import UserInfoForm from "../components/UserInfoWrap.vue";
import eyesCloseGreen from "../assets/imgs/eyesCloseGreen.svg";
import eyesOpenGreen from "../assets/imgs/eyesOpenGreen.svg";
import { requestPermission, messagingToken } from "../fn/firebaseMessaging";

useSeo({
  title: "",
  description:
    "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
  url: "https://neuroplus.com.tw",
});

// 基本狀態
const loading = ref(false);
const router = useRouter();
const localMessagingToken = ref("");

// 登入/註冊切換
const currentMode = ref("login");

// 登入相關
const mobile = ref("");
const password = ref("");
const passwordVisible = ref(false);

// 註冊相關
const passwordAgain = ref("");
const passwordAgainVisible = ref(false);
const passwordError = ref("");
const passwordAgainError = ref("");
const isPrivacy = ref(false);
const showPolicy = ref(false);
const currentStep = ref("register");
const verificationCodes = ref(["", "", "", "", ""]);
const verificationInput = ref([]);
const countdownTime = ref(60);
const countdownInterval = ref(null);
const isReSend = ref(false);
const isDisabled = ref(false);

// 基本資料
const name = ref("");
const height = ref("");
const weight = ref("");
const sex = ref("");
const date = ref("");
const DSPR = ref("");

// iOS 和 PWA 相關
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
const isStandalone =
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone;
let deferredPrompt = null;

// 切換登入/註冊模式
const switchMode = (mode) => {
  currentMode.value = mode;
  currentStep.value = "register";
  // 清空表單
  mobile.value = "";
  password.value = "";
  passwordAgain.value = "";
  passwordError.value = "";
  passwordAgainError.value = "";
  isPrivacy.value = false;
  verificationCodes.value = ["", "", "", "", ""];
  countdownTime.value = 60;
  isDisabled.value = false;
  isReSend.value = false;
};

// 密碼可見性切換
const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const togglePasswordAgainVisibility = () => {
  passwordAgainVisible.value = !passwordAgainVisible.value;
};

// 密碼驗證
const validatePassword = () => {
  if (password.value.length < 8) {
    passwordError.value = "密碼長度必須至少 8 位";
  } else {
    passwordError.value = "";
  }
};

const validatePasswordAgain = () => {
  if (passwordAgain.value !== password.value) {
    passwordAgainError.value = "兩次輸入的密碼不一致";
  } else {
    passwordAgainError.value = "";
  }
};

// 隱私政策
const handleShowPolicy = () => {
  showPolicy.value = true;
  isPrivacy.value = true;
};

const handleClosed = () => {
  showPolicy.value = false;
};

// 登入功能
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
      try {
        await requestPermission();
        localMessagingToken.value = messagingToken.value;
      } catch (e) {
        console.warn("Firebase 推播權限失敗", e);
      }

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

// 註冊功能
const getVerificationCode = async () => {
  if (password.value.length < 8) {
    alert("密碼小於8位數");
    return;
  }
  if (password.value !== passwordAgain.value) {
    alert("密碼不一致");
    return;
  }

  loading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 750));
  loading.value = false;

  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_AA3.jsp",
      {
        Mobile: mobile.value,
        Password: password.value,
      }
    );

    if (response.status === 200) {
      const data = response.data;
      if (data.Token.trim() !== "" && data.MID.trim() !== "") {
        currentStep.value = "verify";
        startCountdown();

        localStorage.setItem(
          "userData",
          JSON.stringify({
            Token: data.Token,
            MAID: data.MAID,
            MID: data.MID,
            A5Digit: data.A5Digit,
            Mobile: data.Mobile,
            startTime: data.startTime,
          })
        );

        // 初始化驗證碼輸入框並聚焦到第一個輸入框
        nextTick(() => {
          verificationInput.value = verificationInput.value.slice(
            0,
            verificationCodes.value.length
          );
          verificationInput.value[0]?.focus();
        });
      } else {
        alert(`註冊失敗 : ${data.Result}`);
      }
    }
  } catch (err) {
    alert("註冊失敗");
  } finally {
    loading.value = false;
  }
};

// 驗證碼相關
watch(verificationCodes, (newCodes) => {
  if (newCodes.every((code) => code !== "")) {
    verifyCode();
  }
});

const verifyCode = async () => {
  loading.value = true;
  const enteredCode = verificationCodes.value.join("");
  const localData = localStorage.getItem("userData");
  const { MID, Token, MAID, Mobile, A5Digit } = localData
    ? JSON.parse(localData)
    : {};

  if (countdownTime.value > 0) {
    await API_doExamAuth();
  } else {
    verificationCodes.value = ["", "", "", "", ""];
    nextTick(() => {
      verificationInput.value[0]?.focus();
    });
    alert("驗證碼時間已過");
  }

  loading.value = false;
};

const API_doExamAuth = async () => {
  loading.value = true;
  const enteredCode = verificationCodes.value.join("");
  const localData = localStorage.getItem("userData");
  const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

  try {
    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_doExamAuth.jsp",
      {
        Token: Token,
        MAID: MAID,
        Mobile: Mobile,
        MID: MID,
        D1: enteredCode[0],
        D2: enteredCode[1],
        D3: enteredCode[2],
        D4: enteredCode[3],
        D5: enteredCode[4],
      }
    );

    if (response.status === 200) {
      const data = response.data;
      if (data.PASS === "OK") {
        const localData = localStorage.getItem("userData");
        const updatedData = {
          ...JSON.parse(localData),
        };
        localStorage.setItem("userData", JSON.stringify(updatedData));
        verificationCodes.value = ["", "", "", "", ""];
        currentStep.value = "info";
      } else {
        alert("驗證碼錯誤");
        verificationInput.value[0]?.focus();
        verificationCodes.value = ["", "", "", "", ""];
      }
    }
  } catch (error) {
    console.error("驗證碼驗證失敗:", error);
  } finally {
    loading.value = false;
  }
};

const handleInput = (index, event) => {
  const key = event?.key;

  // 如果按下退格鍵並且當前輸入框為空，將焦點移到上一個輸入框
  if (
    key === "Backspace" &&
    verificationCodes.value[index] === "" &&
    index > 0
  ) {
    verificationInput.value[index - 1]?.focus();
    return;
  }

  // 如果當前輸入的數字不在範圍內，則清空該輸入框
  if (
    verificationCodes.value[index] < 0 ||
    verificationCodes.value[index] > 9
  ) {
    verificationCodes.value[index] = "";
  }

  // 將焦點移到下一個輸入框
  if (
    verificationCodes.value[index] !== "" &&
    index < verificationCodes.value.length - 1
  ) {
    nextTick(() => {
      verificationInput.value[index + 1]?.focus();
    });
  }

  // 當5個數字都填寫完成時，進行驗證
  if (verificationCodes.value.every((code) => code !== "")) {
    verifyCode();
  }
};

const allowOnlyNumbers = (event) => {
  const char = String.fromCharCode(event.which);
  if (!/[0-9]/.test(char)) {
    event.preventDefault();
  }
};

const startCountdown = () => {
  countdownTime.value = 60;
  isReSend.value = false;
  isDisabled.value = false;
  countdownInterval.value = setInterval(() => {
    if (countdownTime.value > 0) {
      countdownTime.value--;
    } else {
      clearInterval(countdownInterval.value);
      countdownTime.value = "驗證碼已失效，請重新發送";
      isReSend.value = true;
      isDisabled.value = true;
    }
  }, 1000);
};

const reSend = async () => {
  try {
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    if (!MID || !Token || !MAID || !Mobile) {
      alert("資料不完整，無法重新發送驗證碼");
      return;
    }

    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_AA4.jsp",
      {
        MID: MID,
        Token: Token,
        MAID: MAID,
        Mobile: Mobile,
      }
    );

    if (response.status === 200) {
      const { startTime, A5Digit, Result } = response.data;

      localStorage.setItem(
        "userData",
        JSON.stringify({
          ...JSON.parse(localData),
          startTime,
          A5Digit,
          Result,
        })
      );

      alert("簡訊已重新發送");
      startCountdown();
    } else {
      alert("重新發送失敗，請稍後再試");
    }
  } catch (err) {
    alert("重新發送失敗，請稍後再試");
  } finally {
    loading.value = false;
  }
};

const addUser = async () => {
  try {
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    if (
      !MID ||
      !Token ||
      !MAID ||
      !Mobile ||
      !name.value ||
      !height.value ||
      !sex.value
    ) {
      throw new Error("資料不完整");
    }

    // 日期轉換成民國格式
    let birthday = "";
    if (date.value) {
      const birthDate = new Date(date.value);
      const rocYear = birthDate.getFullYear() - 1911;
      birthday = `${rocYear}/${
        birthDate.getMonth() + 1
      }/${birthDate.getDate()}`;
    }

    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_AA5.jsp",
      {
        MID,
        Token,
        MAID,
        Mobile,
        Name: name.value,
        Height: height.value,
        Weight: weight.value,
        Sex: sex.value,
        Birthday: birthday,
        DSPR: DSPR.value || "",
        HRVCalTime: "1",
      }
    );

    if (response.status === 200) {
      router.push("/user");
      console.log(response.data);
    }
  } catch (err) {
    alert(err.message || "資料不完整");
    console.error(err);
  }
};

// PWA 安裝相關
const installPWA = async () => {
  if (isIOS && !isStandalone) {
    alert("在瀏覽器中點擊分享按鈕，然後選擇『加入主畫面』以安裝 APP。");
  } else if (deferredPrompt) {
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
  try {
    if (
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator?.standalone
    ) {
      console.log("App 是以 PWA 模式執行");
    }

    // 檢查用戶資料並進行路由跳轉
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    if (MID || Token || MAID || Mobile) {
      router.push("/user");
    }

    // 初始化驗證碼輸入框
    nextTick(() => {
      verificationInput.value = verificationInput.value.slice(
        0,
        verificationCodes.value.length
      );
    });
  } catch (e) {
    console.warn("PWA 檢查錯誤", e);
  }
});
</script>
