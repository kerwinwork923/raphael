<template>
  <Alert
    :showRedirectButton="false"
    :redirectTarget="handleRedirect"
    @close="handleClose"
    v-if="alertVisable === true"
  >
    <!-- v-if="alertVisable === true" -->
    <span>{{ alertContent }}</span>
  </Alert>
  <div class="forgetPassword">
    <RaphaelLoading v-if="loading" />
    <div class="forgetPasswordGroup">
      <div class="raphaelIconImgGroup">
        <img class="raphaelIcon" src="../assets/imgs/raphael.svg" alt="" />
      </div>
      <h1>{{ verificationTitle }}</h1>
      <div class="forgetPasswordWrap" v-if="currentStep === 'forgetPassword'">
        <div class="forgetPasswordBox">
          <div class="phoneGroup">
            <input
              type="tel"
              v-model="mobile"
              placeholder="請輸入您的手機號碼"
            />
            <img class="icon1" src="../assets/imgs/phoneGreen.svg" alt="" />
          </div>
        </div>
        <button
          class="vertificationBtn"
          @click="API_ForgetPassword"
          :disabled="!mobile"
        >
          取得驗證碼
        </button>
        <div class="returnLogin">
          <router-link to="/">返回</router-link>
        </div>
      </div>

      <div class="verfifyWrap" v-if="currentStep === 'verify'" >
        <div class="verificationCodeGroup">
          <input
            v-for="(code, index) in verificationCodes"
            :key="index"
            ref="verificationInput"
            type="number"
            maxlength="1"
            class="vertifyCode"
            v-model="verificationCodes[index]"
            @input="handleInput(index)"
            @keydown="handleInput(index, $event)"
            @keypress="allowOnlyNumbers"
            :disabled="isDisabled"
          />
        </div>
        <div class="verificationCodeHintText">
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
          <button
            class="reSendText"
            :disabled="!isReSend"
            @click="API_ForgetPassword"
          >
            重新發送
          </button>
        </div>
      </div>
      <div class="resetPasswordWrap" v-if="currentStep === 'resetPassword'">
        <div class="resetPasswordBox">
          <div class="passwordGroup">
            <input
              :type="passwordVisible ? 'text' : 'password'"
              v-model="password"
              placeholder="請輸入密碼"
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
              placeholder="再次輸入您的密碼"
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
        <button class="resetPasswordBtn" @click="API_reset">確定</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import RaphaelLoading from "../components/RaphaelLoading";
import eyesCloseGreen from "../assets/imgs/eyesCloseGreen.svg";
import eyesOpenGreen from "../assets/imgs/eyesOpenGreen.svg";
import axios from "axios";
import { useSeo } from "~/composables/useSeo";

import Alert from "../components/Alert.vue";
export default {
  components: {
    Alert,
    useSeo,
  },
  setup() {
    const loading = ref(false);
    const router = useRouter();
    const verificationTitle = ref("請輸入手機號碼");
    const passwordAgainVisible = ref(false);
    const alertVisable = ref(false);
    const alertContent = ref("");

    const mobile = ref("");
    const passwordVisible = ref(false);
    const currentStep = ref("forgetPassword");
    const isReSend = ref(false);
    const isDisabled = ref(false);

    const verificationCodes = ref(["", "", "", "", ""]);
    const verificationInput = ref([]);
    const countdownTime = ref(60);
    const countdownInterval = ref(null);

    const password = ref("");
    const passwordAgain = ref("");
    const passwordError = ref("");
    const passwordAgainError = ref("");

    useSeo({
      title: "",
      description:
        "NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據，幫助您了解自律神經狀態。",
      url: "https://neuroplus.com.tw",
    });

    watch(verificationCodes, (newCodes) => {
      if (newCodes.every((code) => code !== "")) {
        API_doExamAuthPassword();
      }
    });

    const handleClose = () => {
      alertVisable.value = false;
    };

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value;
    };

    const togglePasswordAgainVisibility = () => {
      passwordAgainVisible.value = !passwordAgainVisible.value;
    };

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

    const startCountdown = () => {
      countdownTime.value = 60;
      isReSend.value = false;

      countdownInterval.value = setInterval(() => {
        if (countdownTime.value > 0) {
          countdownTime.value--;
          isDisabled.value = false;
        } else {
          clearInterval(countdownInterval.value);
          countdownTime.value = "驗證碼已失效，請重新發送";
          isReSend.value = true;
          isDisabled.value = true;
          verificationCodes.value = ["", "", "", "", ""];
        }
      }, 1000);
    };

    const API_ForgetPassword = async () => {
      loading.value = true;
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ForgetPassword.jsp",
          {
            Mobile: mobile.value,
          }
        );

        if (response.status === 200) {
          console.log(response.data);

          loading.value = false;

          if (response.data) {
            localStorage.setItem(
              "userData",
              JSON.stringify({
                MID: response.data.MID,
                Mobile: mobile.value,
              })
            );
            startCountdown();

            if (currentStep.value != "verify") {
              currentStep.value = "verify";
              verificationTitle.value = "輸入驗證碼";
            }
          } else {
            loading.value = false;
          }
        }
      } catch (err) {
        alertVisable.value = true;
        alertContent.value = "無此手機號碼";
      } finally {
        loading.value = false;
      }
    };

    const API_doExamAuthPassword = async () => {
      loading.value = true;
      const enteredCode = verificationCodes.value.join("");
      const localData = localStorage.getItem("userData");
      const { MID, Mobile } = localData ? JSON.parse(localData) : {};

      if (countdownTime.value > 0) {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_doExamAuthPassword.jsp",
          {
            Mobile: Mobile,
            MID: MID,
            D1: enteredCode[0],
            D2: enteredCode[1],
            D3: enteredCode[2],
            D4: enteredCode[3],
            D5: enteredCode[4],
          }
        );
        if (response.data.PASS === "OK") {
          currentStep.value = "resetPassword";
          verificationTitle.value = "重新設定密碼";
        } else {
          verificationCodes.value = ["", "", "", "", ""];
          nextTick(() => {
            verificationInput.value[0]?.focus();
          });
          alertVisable.value = true;
          alertContent.value = "驗證碼輸入錯誤";
        }
      } else {
        verificationCodes.value = ["", "", "", "", ""];
        nextTick(() => {
          verificationInput.value[0]?.focus();
        });
        alertVisable.value = true;
        alertContent.value = "驗證碼時間已過";
      }

      loading.value = false;
    };

    const API_reset = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Mobile } = localData ? JSON.parse(localData) : {};

      if (password.value.length < 8) {
        alertVisable.value = true;
        alertContent.value = "密碼小於8位數";
        return;
      }
      if (password.value !== passwordAgain.value) {
        alertVisable.value = true;
        alertContent.value = "密碼不一致";
        return;
      }
      loading.value = true;
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ChangePassword.jsp",
          {
            MID: MID,
            Mobile: Mobile,
            Password: password.value,
          }
        );

        if (response.status === 200) {
          console.log(response.data);

          loading.value = false;
          if (response.data.Result == "OK") {
            alertVisable.value = true;
            alertContent.value = "密碼重新設定完成，請用新密碼登入";
            router.push("/");
          }
        }
      } catch (err) {
        alert(err);
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

      // 檢查輸入的數字是否在範圍內
      if (
        verificationCodes.value[index] < 0 ||
        verificationCodes.value[index] > 9
      ) {
        verificationCodes.value[index] = "";
      }

      // 移動到下一個輸入框
      if (
        verificationCodes.value[index] !== "" &&
        index < verificationCodes.value.length - 1
      ) {
        verificationInput.value[index + 1]?.focus();
      }

      // 當5個數字都填寫完成時，進行驗證
      if (verificationCodes.value.every((code) => code !== "")) {
        API_doExamAuthPassword();
      }
    };

    const allowOnlyNumbers = (event) => {
      const char = String.fromCharCode(event.which);
      if (!/[0-9]/.test(char)) {
        event.preventDefault();
      }
    };

    onMounted(() => {
      nextTick(() => {
        verificationInput.value = verificationInput.value.slice(
          0,
          verificationCodes.value.length
        );
      });
    });

    return {
      loading,
      router,
      mobile,
      passwordVisible,
      currentStep,
      verificationTitle,
      API_ForgetPassword,
      API_doExamAuthPassword,
      handleClose,
      alertVisable,
      verificationCodes,
      verificationInput,
      countdownTime,
      countdownInterval,
      handleInput,
      allowOnlyNumbers,
      startCountdown,
      isReSend,
      isDisabled,
      passwordAgainVisible,
      RaphaelLoading,
      eyesCloseGreen,
      eyesOpenGreen,
      togglePasswordVisibility,
      togglePasswordAgainVisibility,
      validatePassword,
      validatePasswordAgain,
      password,
      passwordAgain,
      passwordError,
      passwordAgainError,
      API_reset,
      alertContent,
    };
  },
};
</script>

<style lang="scss">
.forgetPassword {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-items: stretch;
  width: 100%;
  height: 100dvh;


  overflow: hidden;
  @include gradientBg();

  .forgetPasswordGroup {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 90%;
    margin: 0 auto;
    height: 100%;
   

    .raphaelIconImgGroup {
      text-align: center;
      .raphaelIcon {
        width: 50px;
        height: 50px;
      }
    }

    h1 {
      color: var(--Primary-default, #74bc1f);

      font-size: var(--Text-h2, 24px);
      font-style: normal;
      font-weight: 700;
      line-height: 100%; /* 24px */
      letter-spacing: 3.6px;
      margin-top: 0.75rem;
    }
    .forgetPasswordWrap {
      width: 100%;
      min-height: 509px;
      
    }
    .forgetPasswordBox {
      border-radius: 12px;
    
      margin-top: 2.25rem;
      .phoneGroup,
      .passwordGroup,
      .passwordAgainGroup {
        position: relative;
        margin-bottom: 1rem;
        width: 100%;
        .icon1 {
          position: absolute;
          top: 50%;
          left: 16px;
          transform: translateY(-50%);
        }
        .icon2 {
          position: absolute;
          top: 50%;
          right: 16px;
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
        padding-left: 48px;
        padding-bottom: 16px;
        padding-top: 16px;

        border-radius: var(--Radius-r-50, 50px);
        background: var(--Secondary-100, #f5f7fa);
        box-shadow: 2px 4px 12px 0
          var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.4));

        &::placeholder {
          color: $raphael-gray-500;
          font-family: Inter;
          font-size: 1.2rem;
          font-weight: 400;
          color: $raphael-gray-400;
        }
      }
    }

    .vertificationBtn,
    .resetPasswordBtn {
      color: $raphael-white;
      width: 100%;
      border: none;
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: 0.25s ease;
      cursor: pointer;

      
      @include neumorphismOuter($radius: 50px, $padding: 8px 12px);
      color: #74bc1f;

      &:disabled {
        color: $raphael-gray-300;
        cursor: not-allowed;
        opacity: 0.6;
      }
      &:hover,
      &:active {
        @include neumorphismOuter(
          $radius: 50px,
          $padding: 8px 12px,
          $x: 0,
          $y: 0,
          $blur: 6px
        );
      }
    }
    .returnLogin {
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
  }

  .verfifyWrap {
      display: flex;
      flex-direction: column;
      gap: 16px;
      .verificationCodeGroup {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-top: 1.5rem;
        @include neumorphismOuter($radius: 50px, $padding: 10px 16px);
        width: 100%;

        .vertifyCode {
          padding: 2px 0;
          border: none;
          border-bottom: 1px solid #b1c0d8;
          cursor: text;
          text-align: center;
          font-size: 20px;
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
        line-height: 22.652px;
      }

      .reSendTextGroup {
        text-align: center;

        .reSendText {
          outline: none;
          border: none;
          font-size: 18px;
          font-style: normal;
          font-weight: 400;
          letter-spacing: 2.7px;
          transition: 0.15s all ease;
          cursor: pointer;
          width: 100%;
          text-align: center;
          @include neumorphismOuter($radius: 50px, $padding: 0.5rem 0);
          color: #74bc1f;
          text-decoration: none;

          &:disabled {
            color: $raphael-gray-300;
            cursor: not-allowed;
            opacity: 0.6;
          }
          &:hover,
          &:active {
            @include neumorphismOuter(
              $radius: 50px,
              $padding: 0.5rem 0,
              $x: 0,
              $y: 0,
              $blur: 6px
            );
          }
        }
      }
    }
    .resetPasswordWrap{
      width: 100%;
      max-width: 768px;
      padding: 0 1.5rem;
    }
  .resetPasswordBox {

    border-radius: 12px;
   width: 100%;
    margin-top: 2.25rem;
    margin-bottom: 1.5rem;
    
    .phoneGroup,
    .passwordGroup,
    .passwordAgainGroup {
      position: relative;
      margin-bottom: 1rem;
      .icon1 {
        position: absolute;
        top: 50%;
        left: 16px;
        transform: translateY(-50%);
      }
      .icon2 {
        position: absolute;
        top: 50%;
        right: 16px;
        transform: translateY(-50%);
        cursor: pointer;
      }
    }
    input[type="text"],
    input[type="password"],
    input[type="number"] {
      outline: none;
      border: none;
      background-color: #fff;
      padding: 1rem;
      border-radius: 50px;
      color: #74bc1f;
      font-size: 18px;
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
      letter-spacing: 2.7px;
      width: 100%;
      padding-left: 48px;

      border-radius: var(--Radius-r-50, 50px);
background: var(--Secondary-100, #F5F7FA);
box-shadow: 2px 4px 12px 0 var(--secondary-300-opacity-40, rgba(177, 192, 216, 0.40));

      &::placeholder {
        font-size: 18px;
        font-weight: 400;
      }
    }
    .passwordAgainHintText,
    .passwordHintText {
      color: $raphael-red-300;
      margin-bottom: .5rem;
      text-align: center;
    }
  }
  .resetPasswordBtn {
  }
}
</style>
