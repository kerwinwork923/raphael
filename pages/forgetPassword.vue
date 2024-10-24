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
      </div>
      <div class="verfifyWrap" v-if="currentStep === 'verify'">
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
export default {
  setup() {
    const loading = ref(false);
    const router = useRouter();
    const verificationTitle = ref("忘記密碼");
    const passwordAgainVisible = ref(false);

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

    watch(verificationCodes, (newCodes) => {
      if (newCodes.every((code) => code !== "")) {
        API_doExamAuthPassword();
      }
    });

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
        alert("發送失敗");
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
          alert("驗證碼輸入錯誤");
        }
      } else {
        verificationCodes.value = ["", "", "", "", ""];
        nextTick(() => {
          verificationInput.value[0]?.focus();
        });
        alert("驗證碼時間已過");
      }

      loading.value = false;
    };

    const API_reset = async () => {
      const localData = localStorage.getItem("userData");
      const { MID, Mobile } = localData ? JSON.parse(localData) : {};

      if (password.value.length < 8) {
        alert("密碼小於8位數");
        return;
      }
      if (password.value !== passwordAgain.value) {
        alert("密碼不一致");
        return;
      }
      loading.value = true;
      try {
        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_ChangePassword.jsp",
          {
       
            MID: MID,
            Mobile: Mobile,
            Password:password.value
          }
        );

        if (response.status === 200) {
          console.log(response.data);

          loading.value = false;
          if (response.data.Result == "OK") {
            alert("密碼重新設定完成，請用新密碼登入");
            router.push("/login");
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
      API_reset
    };
  },
};
</script>

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
      &:disabled {
        background-color: $raphael-gray-400;
        cursor: not-allowed;
        opacity: 0.6;
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

    .reSendTextGroup {
      text-align: center;
      .reSendText {
        outline: none;
        background-color: transparent;
        border: none;
        margin-top: 44px;
        color: #222;
        font-weight: bold;
        text-decoration: underline;
        transition: 0.15s all ease;
        &:disabled {
          color: $raphael-gray-500;
          text-decoration: none;
        }
      }
    }
  }
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
    input[type="password"],
    input[type="number"] {
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
    .passwordAgainHintText,
    .passwordHintText {
      color: #f00;
    }
  }
  .resetPasswordBtn {
  }
}
</style>
