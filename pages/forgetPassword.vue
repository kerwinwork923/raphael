<template>
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
              type="text"
              v-model="mobile"
              placeholder="請輸入您的手機號碼"
            />
            <img class="icon1" src="../assets/imgs/phoneGreen.svg" alt="" />
          </div>
        </div>
        <button class="vertificationBtn" @click="getVerificationCode">
          取得驗證碼
        </button>
      </div>

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
            @keypress="allowOnlyNumbers"
          />
        </div>
        <div class="verificationCodeHintText">
          驗證碼已傳送至您的裝置，請輸入驗證碼
          <br />
          ({{ countdownTime }}秒後失效)
        </div>

        <div class="reSendText">重新發送</div>
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
              alt=""
              @click="togglePasswordAgainVisibility"
            />
          </div>
          <div class="passwordAgainHintText" v-if="passwordAgainError">
            {{ passwordAgainError }}
          </div>
        </div>
        <div class="privacyGroup">
          <input type="checkbox" id="privacyInput" />
          <label for="privacyInput">我已詳細閱讀隱私權政策</label>
        </div>
        <button class="resetPasswordBtn" @click="resetPassword">確定</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.forgetPassword {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  min-height: 100vh;
  width: 100%;
  .forgetPasswordGroup {
    padding-top: 100px;
    width: 90%;
    margin: 0 auto;
    max-width: 576px;

    .raphaelIconImgGroup {
      text-align: center;
      .raphaelIcon {
        width: 50px;
        height: 50px;
      }
    }

    h1 {
      font-family: "Noto Sans";
      font-size: 1.5rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      margin-top: 8px;
      text-align: center;
      color: $raphael-purple-200;
    }

    .forgetPasswordBox {
      background-color: #fff;
      border-radius: 12px;
      padding: 1rem 1rem 0.2rem 1rem;
      margin-top: 2.25rem;
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
      input[type="password"] {
        outline: none;
        border: none;
        border-bottom: 1px solid $raphael-gray-400;
        font-size: 1.2rem;
        width: 90%;
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
    }

    .vertificationBtn,
    .resetPasswordBtn {
      background-color: $raphael-green-400;
      color: #fff;
      padding: 12px;
      width: 100%;
      border-radius: 8px;
      border: none;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: 0.5px;
      transition: 0.25s ease;
      margin-top: 1.5rem;
      cursor: pointer;
      &:hover {
        background-color: $raphael-green-500;
      }
    }
  }

  .verfifyWrap {
    padding: 1rem;

    .verificationCodeGroup {
      display: flex;
      justify-content: space-between;
      align-items: center;

      padding: 1rem;
      border-radius: 12px;
      background-color: #fff;

      .vertifyCode {
        background-color: #eee;
        width: 2.75rem;
        height: 2.75rem;
        border-radius: 0.5rem;
        text-align: center;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
      }
    }
    .verificationCodeHintText {
      font-size: 14px;
      color: #f00;
      text-align: center;
      font-weight: 400;
      letter-spacing: 0.1px;
      margin-top: 12px;
      line-height: 22.652px;
    }

    .reSendText {
      text-align: center;
      margin-top: 44px;
      color: $raphael-gray-500;
    }
  }

  .resetPasswordWrap {
    .resetPasswordBox {
      background-color: #fff;
      border-radius: 12px;
      padding: 1rem;
      margin-top: 2.25rem;

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
      input[type="password"] {
        outline: none;
        border: none;
        border-bottom: 1px solid $raphael-gray-400;
        font-size: 1.2rem;
        width: 90%;
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
        border: 1px solid #b3b3b3;
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
          color: #fff;
          font-size: 0.75rem;
          font-weight: bold;
          font-family: "Arial", sans-serif;
        }
      }
      label {
        color: #666;
        font-size: 1.25rem;
        letter-spacing: 0.09px;
        font-weight: 400;
        cursor: pointer;
      }
    }
  }
}
</style>

<script>
import { ref, watch } from "vue";
import axios from "axios";
import RaphaelLoading from "../components/RaphaelLoading";
import { useRouter } from "vue-router";
import eyesCloseGreen from "../assets/imgs/eyesCloseGreen.svg";
import eyesOpenGreen from "../assets/imgs/eyesOpenGreen.svg";
export default {
  setup() {
    const loading = ref(false);
    const router = useRouter();

    const passwordVisible = ref(false);
    const passwordAgainVisible = ref(false);
    const verificationTitle = ref("忘記密碼");
    const currentStep = ref("forgetPassword");
    const verificationCodes = ref(["", "", "", "", ""]);
    const verificationInput = ref([]);

    const countdownTime = ref(60);
    const countdownInterval = ref(null);

    const togglePasswordVisibility = () => {
      passwordVisible.value = !passwordVisible.value;
    };

    const togglePasswordAgainVisibility = () => {
      passwordAgainVisible.value = !passwordAgainVisible.value;
    };

    watch(verificationCodes, (newCodes) => {
      if (newCodes.every((code) => code !== "")) {
        currentStep.value = "info";
      }
    });

    const getVerificationCode = async () => {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 750));
      loading.value = false;
      currentStep.value = "verify";
      verificationTitle.value = "輸入驗證碼";
      startCountdown();
    };

    const handleInput = async (index) => {
      const currentValue = verificationCodes.value[index];

      if (currentValue.length === 1) {
        if (index < verificationCodes.value.length - 1) {
          verificationInput.value[index + 1]?.focus();
        } else {
          currentStep.value = "resetPassword";
          verificationTitle.value = "重新設定密碼";
          loading.value = true;

          await new Promise((resolve) => setTimeout(resolve, 750));

          loading.value = false;
        }
      } else if (currentValue === "" && index > 0) {
        verificationInput.value[index - 1]?.focus();
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
      countdownInterval.value = setInterval(() => {
        if (countdownTime.value > 0) {
          countdownTime.value--;
        } else {
          clearInterval(countdownInterval.value);
        }
      }, 1000);
    };

    const resetPassword = async () => {
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 750));
      loading.value = false;
      alert("密碼重新設定完成，請用心密碼登入");
      router.push({ name: "login" });
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
      verificationTitle,
      loading,
      verificationInput,
      currentStep,
      getVerificationCode,
      countdownTime,
      handleInput,
      allowOnlyNumbers,
      verificationCodes,
      passwordVisible,
      passwordAgainVisible,
      togglePasswordVisibility,
      togglePasswordAgainVisibility,
      eyesCloseGreen,
      eyesOpenGreen,
      resetPassword,
    };
  },
};
</script>
