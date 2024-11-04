<template>
  <div class="register">
    <RaphaelLoading v-if="loading" />
    <!-- <Navbar/> -->
    <div class="registerGroup">
      <div class="raphaelIconImgGroup">
        <img class="raphaelIcon" src="../assets/imgs/raphael.svg" alt="" />
      </div>
      <h1>{{ verificationTitle }}</h1>

      <div class="registerWrap" v-if="currentStep === 'register'">
        <div class="registerBox">
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
        <div class="privacyGroup">
          <input type="checkbox" v-model="isPrivacy" id="privacyInput" />
          <router-link to="/privacy">
            <label >我已詳細閱讀隱私權政策</label>
          </router-link>
        
        </div>

        <button class="vertificationBtn" :disabled="!isPrivacy" @click="getVerificationCode">
          取得驗證碼
        </button>

        <div class="bottomHintGroup">
          <!-- 分隔線 -->
          <div class="separate">or</div>
          <router-link to="/">
            <img class="icon" src="../assets/imgs/change.svg" alt="" />
            <h5>已有會員</h5>
          </router-link>
        
        </div>
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
          <button class="reSendText" :disabled="!isReSend" @click="reSend">重新發送</button>
        </div>
       
    
      </div>
      <div v-if="currentStep === 'info'">
        <UserInfoForm
          :name="name"
          :height="height"
          :weight="weight"
          :sex="sex"
          :DSPR="DSPR"
          :date="date"
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
</template>



<script>
import { ref, onMounted, nextTick, watch } from "vue";
import RaphaelLoading from "../components/RaphaelLoading";
import eyesCloseGreen from "../assets/imgs/eyesCloseGreen.svg";
import eyesOpenGreen from "../assets/imgs/eyesOpenGreen.svg";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useRouter } from 'vue-router';

import UserInfoForm from '../components/UserInfoWrap.vue';


export default {
  components: { Navbar,UserInfoForm },
  setup() {
    const router = useRouter();
    const passwordVisible = ref(false);
    const passwordAgainVisible = ref(false);
    const loading = ref(false);

    const mobile = ref("");
    const password = ref("");
    const passwordAgain = ref("");
    const passwordError = ref("");
    const passwordAgainError = ref("");
    const isPrivacy = ref(false)
    const isReSend = ref(false)
    const sexSelect = ref(null)

    const isDisabled = ref(true); 


    const name = ref("");
    const height = ref("");
    const weight = ref("");
    const sex = ref("");
    const date = ref("");
    const DSPR = ref("");


    const currentStep = ref("register");
    const verificationCodes = ref(["", "", "", "", ""]);
    const verificationInput = ref([]);
    const verificationTitle = ref("註冊會員");

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
        verifyCode(); 
      }
    });


    const getVerificationCode = async () => {
      if(password.value.length<8) {alert("密碼小於8位數") ; return}
      if(password.value !== passwordAgain.value){ alert("密碼不一致"); return}
      loading.value = true;
      await new Promise((resolve) => setTimeout(resolve, 750));
      loading.value = false;

      verificationTitle.value = "輸入驗證碼";
      startCountdown();
      
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
          if (data.Token.trim()!==""&&data.MID.trim()!=="") {
            currentStep.value = "verify";
            verificationTitle.value = "輸入驗證碼";
       
            localStorage.setItem('userData', JSON.stringify({
              Token: data.Token,
              MAID: data.MAID,
              MID: data.MID,
              A5Digit: data.A5Digit,
              Mobile: data.Mobile,
              startTime: data.startTime,
            }));
          }
          else {
          alert(`註冊失敗 : ${data.Result}`);
        }
        } 
      } catch (err) {
        alert("註冊失敗");
      } finally {
        loading.value = false;
      }
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

    const verifyCode = async () => {
    loading.value = true;
    const enteredCode = verificationCodes.value.join("");
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile, A5Digit } = localData ? JSON.parse(localData) : {};

    if(countdownTime.value > 0)
    {
      if (enteredCode == A5Digit  ) {
      await API_doExamAuth();
       verificationTitle.value = "輸入基本資料"
      currentStep.value = "info";
      verificationCodes.value = ["", "", "", "", ""];
    } else {
      verificationCodes.value = ["", "", "", "", ""];
      nextTick(() => {
      verificationInput.value[0]?.focus(); 
      });
      alert("驗證碼錯誤");
    }

    }
    else{
      verificationCodes.value = ["", "", "", "", ""];
      nextTick(() => {
      verificationInput.value[0]?.focus(); 
      });
      alert("驗證碼時間已過")
    }
   
    loading.value = false;
  };

  const API_doExamAuth = async() =>{
    loading.value = true;
    const enteredCode = verificationCodes.value.join("");
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

     try {
      const response = await axios.post("https://23700999.com:8081/HMA/API_doExamAuth.jsp", {
          Token: Token,
          MAID: MAID,
          Mobile: Mobile,
          MID: MID,
          D1: enteredCode[0],
          D2: enteredCode[1],
          D3: enteredCode[2],
          D4: enteredCode[3],
          D5: enteredCode[4],
        }, 
      );

      if (response.status === 200) {
        const data = response.data;
        if (data.Result === true) {
          const localData = localStorage.getItem("userData");
          const updatedData = {
            ...JSON.parse(localData),
          };
          localStorage.setItem('userData', JSON.stringify(updatedData));
          verificationCodes.value = ["", "", "", "", ""]; 
          verificationTitle.value = "輸入基本資料"
          currentStep.value = "info"; 
      
        } else {
          verificationCodes.value = ["", "", "", "", ""];
          verificationInputs.value[0].focus();
        }
      }
    } catch (error) {

    } finally {
      loading.value = false;
    }

  }

  const handleInput = (index, event) => {
  const key = event?.key;

  // 如果按下退格鍵並且當前輸入框為空，將焦點移到上一個輸入框
  if (key === "Backspace" && verificationCodes.value[index] === "" && index > 0) {
    verificationInput.value[index - 1]?.focus();
    return; // 返回以避免繼續執行其他邏輯
  }

  // 如果當前輸入的數字不在範圍內，則清空該輸入框
  if (verificationCodes.value[index] < 0 || verificationCodes.value[index] > 9) {
    verificationCodes.value[index] = '';
  }

  // 將焦點移到下一個輸入框
  if (verificationCodes.value[index] !== '' && index < verificationCodes.value.length - 1) {
    verificationInput.value[index + 1]?.focus();
  }

  // 當5個數字都填寫完成時，進行驗證
  if (verificationCodes.value.every(code => code !== '')) {
    verifyCode(); // 調用驗證方法
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
    isDisabled.value = true; 
    countdownInterval.value = setInterval(() => {
    if (countdownTime.value > 0) {
      countdownTime.value--;
    } else {
      clearInterval(countdownInterval.value);
      countdownTime.value = "驗證碼已失效，請重新發送";  
      isReSend.value = true;  
      isDisabled.value = false;  
    }
  }, 1000);
};


    onMounted(() => {
      nextTick(() => {
        verificationInput.value = verificationInput.value.slice(
          0,
          verificationCodes.value.length
        );
      });

    });


    const isFormValid = computed(() => {
    return (
      mobile.value.trim() !== "" && 
      password.value.length >= 8 && 
      password.value === passwordAgain.value && 
      isPrivacy.value
    );
    });

    const reSend = async () => {
  try {
    // 從 localStorage 獲取用戶資料
    const localData = localStorage.getItem("userData");
    const { MID, Token, MAID, Mobile } = localData ? JSON.parse(localData) : {};

    // 檢查必需的資料是否存在
    if (!MID || !Token || !MAID || !Mobile) {
      alert("資料不完整，無法重新發送驗證碼");
      return;
    }

    // 發送請求以重新發送驗證碼
    const response = await axios.post(
      "https://23700999.com:8081/HMA/API_AA4.jsp",
      {
        MID: MID,
        Token: Token,
        MAID: MAID,
        Mobile: Mobile,
      }
    );

    // 檢查回應是否成功
    if (response.status === 200) {
      const { startTime, A5Digit, Result } = response.data;
      
      // 更新 localStorage 中的資料
      localStorage.setItem(
        "userData", 
        JSON.stringify({
          ...JSON.parse(localData), 
          startTime, 
          A5Digit,   
          Result,    
        })
      );

      // 提示用戶簡訊已重新發送
      alert("簡訊已重新發送");
      
      // 開始倒計時
      startCountdown();
    } else {
      alert("重新發送失敗，請稍後再試");
    }
  } catch (err) {
    // 捕捉任何錯誤並顯示錯誤信息
    alert("重新發送失敗，請稍後再試");
  } finally {
    loading.value = false; // 結束加載狀態
  }
}

    const addUser = async () => {
      try {
        const localData = localStorage.getItem("userData");
        const { MID, Token, MAID, Mobile } = localData
          ? JSON.parse(localData)
          : {};

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
          const rocYear = birthDate.getFullYear() - 1911; // 西元年轉民國年
          birthday = `${rocYear}/${
            birthDate.getMonth() + 1
          }/${birthDate.getDate()}`;
        }

        const response = await axios.post(
          "https://23700999.com:8081/HMA/API_AA5.jsp",
          {
            MID: MID,
            Token: Token,
            MAID: MAID,
            Mobile: Mobile,
            Name: name.value,
            Height: height.value,
            Weight: weight.value,
            Sex: sex.value,
            Birthday: birthday,
            DSPR: DSPR.value || "",
          }
        );

        if (response.status === 200) {
          router.push("/user");
          console.log(response.data);
        }
      } catch (err) {
        alert(err.message || "資料不完整");
        console.error(err);
      } finally {
      }
    };


    return {
      passwordVisible,
      passwordAgainVisible,
      mobile,
      password,
      passwordAgain,
      passwordError,
      passwordAgainError,
      togglePasswordVisibility,
      togglePasswordAgainVisibility,
      validatePassword,
      validatePasswordAgain,
      eyesCloseGreen,
      eyesOpenGreen,
      loading,
      getVerificationCode,
      currentStep,
      verificationCodes,
      handleInput,
      allowOnlyNumbers,
      verificationInput,
      verificationTitle,
      startCountdown,
      countdownTime,
      isPrivacy,
      isReSend,
      reSend,
      addUser,
      name,
      height,
      weight,
      sex,
      sexSelect,
      isFormValid,
      date,
      DSPR
    };
  },
};
</script>




<style lang="scss" scoped>
.register {
  background: url("../assets/imgs/gradient-bg.png");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  height: 100vh;
  width: 100%;
  .registerGroup {
    padding-top: 4.25rem;
    width: 90%;
    height: 100%;
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

    .registerBox {
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

      .passwordAgainHintText,
      .passwordHintText {
        color: #f00;
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
        width: 100%;
            gap: 3.5%;
        .vertifyCode {
          background-color: #eee;
       
          height: 3rem;
        
          padding-left: 7%;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
      
          
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

      .reSendTextGroup{
        text-align: center;
        .reSendText {
          outline: none;
          background-color: transparent;
          border: none;
          margin-top: 44px;
          color: #222;
          font-weight: bold;
          text-decoration: underline;
          transition: .15s all ease;
          &:disabled{
            color: $raphael-gray-500;
            text-decoration:none;
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

      a{
        text-decoration: none;
        color: #666;
        font-size: 1.125rem;
        letter-spacing: 0.09px;
        font-weight: 400;
   
       label{
        cursor: pointer;
       }
      }
    
    }

    .vertificationBtn,
    .infoSendBtn {
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

    .bottomHintGroup {
      display: grid;   
      gap: 1.5rem;
      margin-top: 60px;
      .separate{
        position: relative;
        display: flex;    
        align-items: center;
        justify-content: center;
        color: $raphael-gray-300;

        &::before,&::after{
          content:"";
          position: absolute;
          background: $raphael-gray-300;
          width: 45%;
          height: 1px;
        }

        &::before{
          left: 0;
        }
        
        &::after{
          right: 0;
        }
      }
      a {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        margin: 0 auto;
        width: 100%;
        text-align: center;
        text-decoration: none;
        border-radius: 8px;
        border: 1px solid #1e1e1e;
        padding: 9px;
        color: #666;
        transition: all .2s ease;

        &:hover {
          color: $raphael-green-400;
          border: 1px solid $raphael-green-400;
        }
      }
    }   
  }
}
</style>
